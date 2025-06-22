import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Smartphone, Users, Wifi, Tv, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useRoomManagement } from '@/hooks/useRoomManagement';
import { supabase } from '@/integrations/supabase/client';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface JoinRoomProps {
  onRoomJoined: (roomId: string) => void;
  onBack: () => void;
}

export const JoinRoom = ({ onRoomJoined, onBack }: JoinRoomProps) => {
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [step, setStep] = useState<'join' | 'connecting'>('join');
  const [discoveredTVs] = useState([
    { id: '1', name: 'Living Room Fire TV', status: 'connected' },
    { id: '2', name: 'Bedroom Fire TV', status: 'available' }
  ]);

  const { toast } = useToast();
  const { joinRoom } = useRoomManagement();

  const handleJoinRoom = async () => {
    if (roomCode.length < 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-character room code.",
        variant: "destructive",
      });
      return;
    }
    if (!username.trim()) {
      toast({
        title: "Name Required", 
        description: "Please enter your name to join.",
        variant: "destructive",
      });
      return;
    }
    
    setStep('connecting');
    
    try {
      const room = await joinRoom({
        roomCode: roomCode.toUpperCase(),
        username,
        deviceType: 'mobile',
        deviceName: 'Mobile Device',
      });

      localStorage.setItem(`room_${room.id}_username`, username);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem(`room_${room.id}_userid`, user.id);
      } else {
        const anonymousUserId = crypto.randomUUID();
        localStorage.setItem(`room_${room.id}_userid`, anonymousUserId);
      }

      toast({
        title: "Success!",
        description: `You have joined "${room.name}".`,
      });
      onRoomJoined(room.id);
    } catch (error) {
      setStep('join');
    }
  };

  const formatRoomCode = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  };

  if (step === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="mb-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Joining Party...</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Please wait while we connect you to <span className="font-semibold text-primary">{roomCode}</span>. This shouldn't take long.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Join a Watch Party</CardTitle>
          <CardDescription>
            Enter your name and the 6-character code from the host.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Your Name</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., Jane Doe"
            />
          </div>
          <div className="space-y-2 text-center">
            <Label htmlFor="room-code">Room Code</Label>
            <InputOTP 
              maxLength={6} 
              value={roomCode} 
              onChange={setRoomCode}
            >
              <InputOTPGroup className="mx-auto">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleJoinRoom}>
            Join Room
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
