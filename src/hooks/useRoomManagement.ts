
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { lookupRoom } from './useRoomLookup';
import { v4 as uuidv4 } from 'uuid';

// Utility function to generate a room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  
  // Generate 3 random uppercase letters
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Append 3 random digits
  for (let i = 0; i < 3; i++) {
    code += Math.floor(Math.random() * 10);
  }
  
  return code;
};

// Anonymous user management system
// These UUIDs should be manually added to your auth.users table
const ANONYMOUS_USER_IDS = [
  '11111111-1111-1111-1111-111111111111', // Anonymous User 1
  '22222222-2222-2222-2222-222222222222', // Anonymous User 2
  '33333333-3333-3333-3333-333333333333', // Anonymous User 3
  '44444444-4444-4444-4444-444444444444', // Anonymous User 4
  '55555555-5555-5555-5555-555555555555', // Anonymous User 5
];

const ROOM_LIMIT_PER_ANONYMOUS_USER = 1000;

// Get an available anonymous user ID with load balancing
const getAnonymousUserId = async (): Promise<string> => {
  // Import supabase client
  const { supabase } = await import('@/integrations/supabase/client');
  
  // Try to find an anonymous user with less than 1000 rooms
  for (const userId of ANONYMOUS_USER_IDS) {
    const { count, error } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('host_id', userId);
    
    if (error) {
      console.error('Error checking room count for user:', userId, error);
      continue;
    }
    
    if (count === null || count < ROOM_LIMIT_PER_ANONYMOUS_USER) {
      console.log(`Using anonymous user ${userId} (current rooms: ${count || 0})`);
      return userId;
    }
  }
  
  // If all users are at capacity, use the first one (fallback)
  console.warn('All anonymous users are at capacity, using first user as fallback');
  return ANONYMOUS_USER_IDS[0];
};

interface CreateRoomData {
  name?: string;
  allowRemoteControl?: boolean;
  autoDiscovery?: boolean;
}

interface JoinRoomData {
  roomCode: string;
  username: string;
  deviceType: 'firetv' | 'mobile';
  deviceName?: string;
}

export const useRoomManagement = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createRoom = async (data: CreateRoomData) => {
    setIsLoading(true);
    try {
      console.log('Creating room with data:', data);
      
      // First check if user is authenticated
      const { data: user } = await supabase.auth.getUser();
      
      // Use a direct database approach for anonymous users
      if (!user.user) {
        // Get an available anonymous user ID
        const anonymousUserId = await getAnonymousUserId();
        
        // Generate a unique code
        const roomCode = generateRoomCode();
        
        // Create room directly with anonymous user ID
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .insert({
            code: roomCode,
            name: data.name || 'Family Movie Night',
            host_id: anonymousUserId,
            status: 'waiting',
            allow_remote_control: data.allowRemoteControl !== undefined ? data.allowRemoteControl : true,
            auto_discovery: data.autoDiscovery !== undefined ? data.autoDiscovery : true,
          })
          .select()
          .single();
          
        if (roomError) {
          console.error('Room creation error:', roomError);
          throw new Error('Failed to create room: ' + roomError.message);
        }
        
        toast({
          title: "Room Created!",
          description: `Your party room ${room.code} is ready`,
        });

        return room;
      }
      
      // For authenticated users, use the edge function
      const { data: result, error } = await supabase.functions.invoke('create-room', {
        body: data,
      });

      if (error) {
        console.error('Create room error:', error);
        throw error;
      }

      console.log('Room created successfully:', result);
      
      toast({
        title: "Room Created!",
        description: `Your party room ${result.room.code} is ready`,
      });

      return result.room;
    } catch (error: any) {
      console.error('Create room failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (data: JoinRoomData) => {
    setIsLoading(true);
    try {
      console.log('Joining room with data:', data);
      
      // 1. Use our specialized lookup function
      const room = await lookupRoom(data.roomCode);
      console.log('Found room:', room);

      if (!room) {
        console.error('Room not found error: No matching room found');
        throw new Error('Room not found or inactive');
      }

      // 2. Get current user if available, or create an anonymous session
      const { data: user } = await supabase.auth.getUser();
      let userId = user.user?.id;
      
      if (!user.user) {
        // For anonymous users, generate a UUID that we'll use locally
        // but won't store as a user in auth.users
        userId = uuidv4();
      }
      
      // For anonymous users, we won't check for existing participants
      let existingParticipant = null;
      
      if (user.user) {
        // Only check for existing participants if user is logged in
        const { data: participant } = await supabase
          .from('participants')
          .select('*')
          .eq('room_id', room.id)
          .eq('user_id', user.user.id)
          .maybeSingle();
          
        existingParticipant = participant;
      }

      // 3. Update or create participant
      if (existingParticipant) {
        await supabase
          .from('participants')
          .update({
            username: data.username,
            device_type: data.deviceType,
            device_name: data.deviceName || 'Unknown Device',
            is_connected: true,
            last_seen: new Date().toISOString()
          })
          .eq('id', existingParticipant.id);
      } else {
        // For both authenticated and anonymous users
        await supabase
          .from('participants')
          .insert({
            room_id: room.id,
            user_id: userId, // Use the proper user ID (authenticated or anonymous)
            username: data.username,
            role: 'member',
            device_type: data.deviceType,
            device_name: data.deviceName || 'Unknown Device',
            is_connected: true
          });
      }
      
      console.log('Joined room successfully via direct DB access:', room);
      
      toast({
        title: "Connected!",
        description: `Joined room ${data.roomCode} successfully`,
      });

      return room;
    } catch (error: any) {
      console.error('Join room failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join room",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createRoom,
    joinRoom,
    isLoading,
  };
};