import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Tv, 
  Users, 
  Copy, 
  CheckCircle, 
  Wifi, 
  Settings,
  Zap,
  Crown,
  Bell,
  Timer,
  ArrowLeft,
  MessageCircle,
  Video
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { EnhancedChatSystem } from '@/components/EnhancedChatSystem';
import { ChatMessage } from '@/types/chat';

export const FireTVApp1 = () => {
  const [currentView, setCurrentView] = useState<'home' | 'room'>('home');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = () => {
    // In a real app, this would call a backend to create a room
    const newRoomId = `mock-${Math.random().toString(36).substr(2, 9)}`;
    const newRoomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    setRoomId(newRoomId);
    setRoomCode(newRoomCode);
    setCurrentView('room');
  };

  const handleJoinRoom = () => {
    // For simplicity, we'll just join the created room. 
    // A real app would have an input for the room code.
    if(roomId) {
      setCurrentView('room');
    } else {
      // If no room is created, we can't join. Let's create one.
      handleCreateRoom();
    }
  };

  const handleLeaveRoom = () => {
    setCurrentView('home');
    setRoomId(null);
  };

  if (currentView === 'room' && roomId) {
    return <FireTVPartyScreen roomId={roomId} roomCode={roomCode} onLeave={handleLeaveRoom} />;
  }

  return <FireTVHomeScreen onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />;
};

const FireTVHomeScreen = ({ onCreateRoom, onJoinRoom }: { onCreateRoom: () => void, onJoinRoom: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111184] via-[#1a1a9a] to-[#222299] grid-pattern flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-[#00e6e6] to-[#00cccc] rounded-xl flex items-center justify-center">
            <Tv className="w-10 h-10 text-[#111184]" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-[#00e6e6] to-[#00cccc] bg-clip-text text-transparent">
            FireSync
          </h1>
        </div>
        <p className="text-2xl text-gray-300">The ultimate Fire TV watch party experience.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Button
          className="h-32 text-2xl font-semibold bg-gradient-to-r from-[#00e6e6] to-[#00cccc] hover:from-[#00cccc] hover:to-[#009999] text-[#111184]"
          onClick={onCreateRoom}
        >
          Create a New Party
        </Button>
        <Button
          className="h-32 text-2xl font-semibold bg-[#222299]/50 border-2 border-[#00e6e6]/30 text-[#00e6e6] hover:bg-[#00e6e6]/10"
          onClick={onJoinRoom}
        >
          Join a Party
        </Button>
      </div>
    </div>
  );
};

interface FireTVPartyScreenProps {
  roomId: string;
  roomCode: string;
  onLeave: () => void;
}

const FireTVPartyScreen = ({ roomId, roomCode, onLeave }: FireTVPartyScreenProps) => {
  const { room, participants, chatMessages, connectionStatus } = useRealtimeSync(roomId);
  const [showChat, setShowChat] = useState(false);
  const currentUsername = "FireTV Host"; // Example username

  const isHost = true; // For FireTV, it's always the host
  const unreadMessages = useRef(0);
  const prevMessagesLength = useRef(chatMessages.length);

  useEffect(() => {
    if (chatMessages.length > prevMessagesLength.current) {
      if (!showChat) {
        unreadMessages.current += chatMessages.length - prevMessagesLength.current;
      }
    }
    prevMessagesLength.current = chatMessages.length;
  }, [chatMessages, showChat]);

  const handleToggleChat = () => {
    setShowChat(prev => {
      if (!prev) {
        unreadMessages.current = 0;
      }
      return !prev;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111184] via-[#1a1a9a] to-[#222299] grid-pattern p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onLeave}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            End Party
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{room?.name || 'Watch Party'}</h1>
            <p className="text-gray-400">Room Code: <span className="font-mono text-[#00e6e6]">{roomCode}</span></p>
          </div>
        </div>
        <Badge className={
          room?.status === 'active' ? 'bg-[#00e6e6]/20 text-[#00e6e6] border-[#00e6e6]/30' :
          'bg-orange-500/20 text-orange-400 border-orange-500/30'
        }>
          {room?.status === 'active' ? 'Live' : 'Waiting'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="flex-grow bg-[#222299]/30 backdrop-blur-sm border-[#00e6e6]/20 flex items-center justify-center">
            {room?.status === 'waiting' && (
              <div className="text-center text-white">
                <Crown className="w-16 h-16 mx-auto mb-4 text-[#00e6e6]" />
                <h2 className="text-3xl font-bold mb-2">Ready to start?</h2>
                <p className="text-gray-300 mb-6">{participants.length} participant{participants.length !== 1 ? 's' : ''} ready</p>
                <Button className="bg-gradient-to-r from-[#00e6e6] to-[#00cccc] hover:from-[#00cccc] hover:to-[#009999] text-[#111184]">
                  Start Party
                </Button>
              </div>
            )}
             {room?.status !== 'waiting' && (
                <div className="text-center text-gray-300">
                    <Video size={64} className="mx-auto mb-4 text-[#00e6e6]" />
                    <p>Video Player Area</p>
                    <p className="text-sm">Sync Status: {connectionStatus}</p>
                </div>
            )}
          </Card>
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6">
             <Button 
                onClick={handleToggleChat} 
                className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-transform"
              >
                <MessageCircle className="w-6 h-6 mr-3" />
                {showChat ? 'Close Chat' : `Open Chat ${unreadMessages.current > 0 ? `(${unreadMessages.current})` : ''}`}
              </Button>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
            <Card className="bg-[#222299]/30 backdrop-blur-sm border-[#00e6e6]/20 p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00e6e6]" />
                Participants ({participants.length})
              </h3>
              <div className="space-y-3">
                {participants.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm text-white">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${p.is_connected ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span>{p.username}</span>
                      {p.role === 'host' && <Crown className="w-4 h-4 text-[#00e6e6]" />}
                    </div>
                    <Badge variant="outline" className="border-[#00e6e6]/30 text-[#00e6e6]">{p.device_type}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-[#222299]/30 backdrop-blur-sm border-[#00e6e6]/20 p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#00e6e6]" />
                Playback Status
              </h3>
              <div className="space-y-2 text-sm text-white">
                 <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <Badge>{room?.is_playing ? 'Playing' : 'Paused'}</Badge>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Position:</span>
                    <span>{new Date((room?.current_position || 0) * 1000).toISOString().substr(14, 5)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Content:</span>
                    <span className="truncate max-w-[150px]">{room?.current_content_url || 'No content'}</span>
                </div>
              </div>
            </Card>

            {showChat && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
                <Card className="w-[90vw] h-[90vh] max-w-2xl bg-[#111184]/80 border-[#00e6e6]/30 flex flex-col">
                    <EnhancedChatSystem roomId={roomId} messages={chatMessages} currentUsername={currentUsername} />
                </Card>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
