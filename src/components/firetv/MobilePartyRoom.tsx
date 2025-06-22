import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, Users, MessageCircle, Send } from 'lucide-react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useChatManagement } from '@/hooks/useChatManagement';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MobilePartyRoomProps {
  roomId: string;
  onLeaveRoom: () => void;
}

export const MobilePartyRoom = ({ roomId, onLeaveRoom }: MobilePartyRoomProps) => {
  const { room, participants, chatMessages, sendSyncEvent, leaveRoom, endParty } = useRealtimeSync(roomId);
  const { sendMessage, isLoading: chatLoading } = useChatManagement();
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  // Correctly identify the current user and host status
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || localStorage.getItem(`room_${roomId}_userid`));
    };
    getUserId();
  }, [roomId]);

  const isHost = room?.host_id === currentUserId;

  // Auto-leave when party is ended
  useEffect(() => {
    if (room?.status === 'ended') {
      console.log('Party ended, leaving room automatically');
      onLeaveRoom();
    }
  }, [room?.status, onLeaveRoom]);

  const handlePlayPause = () => {
    const eventType = room?.is_playing ? 'pause' : 'play';
    sendSyncEvent(eventType, { position: room?.current_position || 0 });
  };

  const handleSeek = (direction: 'forward' | 'back') => {
    const currentPos = room?.current_position || 0;
    const newPosition = direction === 'forward' ? currentPos + 30000 : Math.max(0, currentPos - 30000);
    sendSyncEvent('seek', { position: newPosition });
  };

  const handleStartParty = () => {
    if (isHost && room?.status === 'waiting') {
      sendSyncEvent('start_party', {});
    }
  };

  const handleEndParty = async () => {
    if (isHost) {
      try {
        await endParty();
        // After ending party, leave the room
        onLeaveRoom();
      } catch (error) {
        console.error('Failed to end party:', error);
      }
    }
  };

  const handleLeaveParty = async () => {
    try {
      await leaveRoom();
      // After leaving room, call the parent callback
      onLeaveRoom();
    } catch (error) {
      console.error('Failed to leave room:', error);
      // Even if the API call fails, still leave the room UI
      onLeaveRoom();
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const success = await sendMessage(roomId, chatMessage);
    if (success) {
      setChatMessage('');
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#111184] via-[#1a1a9a] to-[#222299] grid-pattern flex items-center justify-center p-4">
        <div className="text-white">Loading room...</div>
      </div>
    );
  }

  if (showChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#111184] via-[#1a1a9a] to-[#222299] grid-pattern">
        {/* Chat Header */}
        <div className="bg-[#222299]/30 backdrop-blur-lg border-b border-[#00e6e6]/20 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-white hover:bg-[#00e6e6]/10"
              onClick={() => setShowChat(false)}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Room
            </Button>
            <h1 className="text-white font-bold">Chat</h1>
            <div />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex flex-col h-[calc(100vh-80px)]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="bg-[#222299]/30 border border-[#00e6e6]/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#00e6e6]">{msg.username}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-white text-sm">{msg.message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 bg-[#222299]/30 backdrop-blur-lg border-t border-[#00e6e6]/20">
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="bg-[#222299]/50 border-[#00e6e6]/30 text-white placeholder:text-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                disabled={chatLoading || !chatMessage.trim()}
                className="bg-gradient-to-r from-[#00e6e6] to-[#00cccc] text-[#111184] hover:from-[#00cccc] hover:to-[#009999]"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111184] via-[#1a1a9a] to-[#222299] grid-pattern">
      {/* Header */}
      <div className="bg-[#222299]/30 backdrop-blur-lg border-b border-[#00e6e6]/20 p-4">
        <div className="flex items-center justify-between">
          {isHost ? (
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={handleEndParty}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              End Party
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="text-white hover:bg-[#00e6e6]/10"
              onClick={handleLeaveParty}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Leave Party
            </Button>
          )}
          <div className="text-center">
            <h1 className="text-white font-bold">{room.name}</h1>
            <p className="text-gray-400 text-sm">Room {room.code}</p>
          </div>
          <Badge className={
            room.status === 'active' ? 'bg-[#00e6e6]/20 text-[#00e6e6] border-[#00e6e6]/30' :
            room.status === 'waiting' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
            'bg-red-500/20 text-red-400 border-red-500/30'
          }>
            {room.status === 'active' ? 'Live' : room.status === 'waiting' ? 'Waiting' : 'Ended'}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Host Controls */}
        {isHost && room.status === 'waiting' && (
          <Card className="bg-[#00e6e6]/10 border-[#00e6e6]/20 p-4">
            <div className="text-center">
              <h3 className="font-semibold text-white mb-2">Ready to start?</h3>
              <p className="text-gray-400 text-sm mb-4">
                {participants.length} participant{participants.length !== 1 ? 's' : ''} ready
              </p>
              <Button
                onClick={handleStartParty}
                className="bg-gradient-to-r from-[#00e6e6] to-[#00cccc] hover:from-[#00cccc] hover:to-[#009999] text-[#111184]"
              >
                Start Party
              </Button>
            </div>
          </Card>
        )}

        {/* Participants */}
        <Card className="bg-[#222299]/30 backdrop-blur-sm border-[#00e6e6]/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-[#00e6e6]" />
            <span className="font-semibold text-white">Participants ({participants.length})</span>
          </div>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.user_id || participant.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${participant.online_at ? 'bg-green-400' : 'bg-gray-500'}`} />
                  <span className="text-white text-sm">{participant.username}</span>
                  {room?.host_id === participant.user_id && (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                      Host
                    </Badge>
                  )}
                </div>
                <Badge className="bg-[#00e6e6]/20 text-[#00e6e6] border-[#00e6e6]/30 text-xs">
                  {participant.device_type || 'mobile'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Remote Control - Only show if party is active */}
        {room.status === 'active' && (
          <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
            <h3 className="font-semibold text-white mb-4 text-center">Remote Control</h3>
            
            {/* Play/Pause Button */}
            <div className="flex justify-center mb-6">
              <Button
                className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                onClick={handlePlayPause}
              >
                {room.is_playing ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </Button>
            </div>

            {/* Skip Controls */}
            <div className="flex justify-center gap-4 mb-6">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => handleSeek('back')}
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => handleSeek('forward')}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <div className="flex-1 h-2 bg-white/10 rounded-full">
                <div className="w-3/4 h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full" />
              </div>
            </div>
          </Card>
        )}

        {/* Current Status */}
        <Card className="bg-[#222299]/30 backdrop-blur-sm border-[#00e6e6]/20 p-4">
          <h3 className="font-semibold text-white mb-3">Playback Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <Badge className={room.is_playing ? 
                "bg-green-500/20 text-green-400" : 
                "bg-red-500/20 text-red-400"
              }>
                {room.is_playing ? 'Playing' : 'Paused'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Position:</span>
              <span className="text-white">
                {Math.floor((room.current_position || 0) / 60000)}:
                {String(Math.floor(((room.current_position || 0) % 60000) / 1000)).padStart(2, '0')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Content:</span>
              <span className="text-white">
                {room.current_content_url ? 'Streaming' : 'No content'}
              </span>
            </div>
          </div>
        </Card>

        {/* Chat Button */}
        <Button 
          onClick={() => setShowChat(true)}
          className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Open Chat ({chatMessages.length})
        </Button>
      </div>
    </div>
  );
};
