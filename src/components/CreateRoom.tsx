import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Tv, Users, Copy, CheckCircle, Share2, Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { useRoomManagement } from '@/hooks/useRoomManagement';
import { supabase } from '@/integrations/supabase/client';

interface CreateRoomProps {
  onRoomCreated: (roomId: string) => void;
  onBack: () => void;
}

export const CreateRoom = ({ onRoomCreated, onBack }: CreateRoomProps) => {
  const [roomName, setRoomName] = useState('');
  const [allowRemoteControl, setAllowRemoteControl] = useState(true);
  const [autoDiscovery, setAutoDiscovery] = useState(true);
  
  const [step, setStep] = useState<'setup' | 'created'>('setup');
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState('');

  const { createRoom, isLoading } = useRoomManagement();

  const handleCreateRoom = async () => {
    try {
      const room = await createRoom({
        name: roomName || 'Watch Party',
        allowRemoteControl,
        autoDiscovery,
      });

      const hostUsername = 'Host';
      localStorage.setItem(`room_${room.id}_username`, hostUsername);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem(`room_${room.id}_userid`, user.id);
      } else {
        const anonymousUserId = crypto.randomUUID();
        localStorage.setItem(`room_${room.id}_userid`, anonymousUserId);
      }

      setRoomCode(room.code);
      setRoomId(room.id);
      setStep('created');
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${type} has been copied.`,
    });
  };

  if (step === 'created') {
    const shareableLink = `${window.location.origin}/join/${roomCode}`;
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Room Created!</CardTitle>
            <CardDescription>Your watch party is ready to go.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <Label htmlFor="roomCode">Room Code</Label>
              <div className="relative">
                <Input id="roomCode" value={roomCode} readOnly className="text-center text-2xl font-mono h-12" />
                <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-10 w-10" onClick={() => copyToClipboard(roomCode, 'Room code')}>
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shareLink">Shareable Link</Label>
              <div className="relative">
                <Input id="shareLink" value={shareableLink} readOnly className="pr-12 truncate" />
                <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8" onClick={() => copyToClipboard(shareableLink, 'Share link')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button className="w-full" onClick={() => onRoomCreated(roomId)}>
              <Share2 className="mr-2 h-4 w-4" />
              Proceed to Party Room
            </Button>
            <Button variant="outline" className="w-full" onClick={onBack}>
              Go to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Watch Party</CardTitle>
          <CardDescription>
            Customize your room settings and invite your friends to join.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input 
              id="room-name" 
              placeholder="e.g., Family Movie Night" 
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Allow Remote Control</Label>
                <p className="text-sm text-muted-foreground">
                  Let participants control playback.
                </p>
              </div>
              <Switch
                checked={allowRemoteControl}
                onCheckedChange={setAllowRemoteControl}
              />
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Enable Auto-Discovery</Label>
                <p className="text-sm text-muted-foreground">
                  Allow nearby devices to find this room.
                </p>
              </div>
              <Switch
                checked={autoDiscovery}
                onCheckedChange={setAutoDiscovery}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleCreateRoom} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Creating...' : 'Create Room'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
