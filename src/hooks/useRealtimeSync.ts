import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SyncEvent {
  id: string;
  room_id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  timestamp_ms: number;
  created_at: string;
}

interface Room {
  id: string;
  code: string;
  name: string;
  status: string;
  current_position: number;
  is_playing: boolean;
  current_content_url?: string;
  host_id: string;
}

export const useRealtimeSync = (roomId: string | null) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const fetchInitialData = async () => {
      try {
        const [roomResult, participantsResult, chatResult] = await Promise.all([
          supabase.from('rooms').select('*').eq('id', roomId).single(),
          supabase.from('participants').select('*').eq('room_id', roomId).order('joined_at', { ascending: true }),
          supabase.from('chat_messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true }),
        ]);

        if (roomResult.data) setRoom(roomResult.data);
        if (participantsResult.data) setParticipants(participantsResult.data);
        if (chatResult.data) {
          const typedMessages: ChatMessage[] = chatResult.data.map(msg => ({
            ...msg,
            message_type: msg.message_type as ChatMessage['message_type'] || 'text'
          }));
          setChatMessages(typedMessages);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setConnectionStatus('error');
      }
    };

    fetchInitialData();
    
    const channel = supabase.channel(`room-${roomId}`, {
      config: {
        presence: {
          key: localStorage.getItem(`room_${roomId}_username`) || `user-${Date.now()}`
        },
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const newParticipants = Object.values(presenceState).map((p: any) => p[0]);
        setParticipants(newParticipants);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, 
        (payload) => {
          setRoom(payload.new as Room);
        }
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, 
        (payload) => {
          const newMessage = payload.new as any;
          const typedMessage: ChatMessage = {
            ...newMessage,
            message_type: newMessage.message_type as ChatMessage['message_type'] || 'text'
          };
          setChatMessages(prev => [...prev, typedMessage]);
        }
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sync_events', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setSyncEvents(prev => [...prev, payload.new as SyncEvent]);
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          // This is the fix: track presence only after successful subscription
          const user_id = (await supabase.auth.getUser()).data.user?.id || 'anonymous';
          const username = localStorage.getItem(`room_${roomId}_username`) || 'Anonymous';
          
          await channel.track({
            user_id,
            username,
            online_at: new Date().toISOString(),
          });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('error');
        } else {
          setConnectionStatus('connecting');
        }
      });
      
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomId]);

  const sendSyncEvent = async (eventType: string, eventData: any) => {
    if (!roomId) return;

    try {
      console.log('Sending sync event:', { eventType, eventData });
      
      const { data, error } = await supabase.functions.invoke('sync-playback', {
        body: {
          roomId,
          eventType,
          eventData,
          timestampMs: Date.now(),
        },
      });

      if (error) {
        console.error('Sync event error:', error);
        throw error;
      }

      console.log('Sync event sent successfully:', data);
    } catch (error) {
      console.error('Failed to send sync event:', error);
    }
  };

  const leaveRoom = async () => {
    if (!roomId) return;

    try {
      console.log('Leaving room:', roomId);
      
      // Get current user information
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare the request body
      const requestBody: any = {
        roomId,
        action: 'leave',
      };

      // If no authenticated user, try to get user info from localStorage
      if (!user) {
        const storedUserId = localStorage.getItem(`room_${roomId}_userid`);
        if (storedUserId) {
          requestBody.userId = storedUserId;
        }
      }
      
      const { data, error } = await supabase.functions.invoke('leave-room', {
        body: requestBody,
      });

      if (error) {
        console.error('Leave room error:', error);
        throw error;
      }

      console.log('Left room successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  };

  const endParty = async () => {
    if (!roomId) return;

    try {
      console.log('Ending party:', roomId);
      
      // Get current user information
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare the request body
      const requestBody: any = {
        roomId,
        action: 'end_party',
      };

      // If no authenticated user, try to get user info from localStorage
      if (!user) {
        const storedUserId = localStorage.getItem(`room_${roomId}_userid`);
        if (storedUserId) {
          requestBody.userId = storedUserId;
        }
      }
      
      const { data, error } = await supabase.functions.invoke('leave-room', {
        body: requestBody,
      });

      if (error) {
        console.error('End party error:', error);
        throw error;
      }

      console.log('Party ended successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to end party:', error);
      throw error;
    }
  };

  return {
    room,
    participants,
    syncEvents,
    chatMessages,
    sendSyncEvent,
    leaveRoom,
    endParty,
    connectionStatus,
  };
};
