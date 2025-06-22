import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Tv,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Home,
  Menu,
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  VolumeX,
  Volume1,
  Volume2,
  Mic,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FireTVRemoteControlProps {
  roomId: string;
  isHost: boolean;
  isPlaying: boolean;
  currentPosition: number;
  onSendSyncEvent: (event: string, data: any) => void;
}

export const FireTVRemoteControl = ({ 
  roomId, 
  isHost, 
  isPlaying, 
  currentPosition, 
  onSendSyncEvent 
}: FireTVRemoteControlProps) => {
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [lastActionTime, setLastActionTime] = useState<Date | null>(null);

  const handleRemoteAction = (action: string) => {
    console.log(`Remote action: ${action}`);
    onSendSyncEvent('remote_action', { action });
    setLastActionTime(new Date());
  };

  const handlePlaybackAction = (action: string) => {
    console.log(`Playback action: ${action}`);
    
    switch (action) {
      case 'play':
        onSendSyncEvent('play', {});
        break;
      case 'pause':
        onSendSyncEvent('pause', {});
        break;
      case 'stop':
        onSendSyncEvent('stop', {});
        break;
      case 'rewind-10':
        onSendSyncEvent('seek', { position: currentPosition - 10 });
        break;
      case 'forward-30':
        onSendSyncEvent('seek', { position: currentPosition + 30 });
        break;
      default:
        console.warn(`Unsupported playback action: ${action}`);
    }

    setLastActionTime(new Date());
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (isMuted && vol > 0) setIsMuted(false);
    onSendSyncEvent('volume_change', { volume: vol, isMuted: false });
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onSendSyncEvent('volume_change', { volume, isMuted: newMuted });
  };

  const RemoteButton = ({ action, children, className }: { action: string, children: React.ReactNode, className?: string }) => (
    <Button variant="outline" size="icon" className={cn("w-16 h-16 rounded-full", className)} onClick={() => handleRemoteAction(action)}>
      {children}
    </Button>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Tv /> Navigation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          <div className="grid grid-cols-3 gap-2 w-48">
            <div></div>
            <RemoteButton action="up"><ChevronUp /></RemoteButton>
            <div></div>
            <RemoteButton action="left"><ChevronLeft /></RemoteButton>
            <Button className="w-16 h-16 rounded-full" onClick={() => handleRemoteAction('select')}>OK</Button>
            <RemoteButton action="right"><ChevronRight /></RemoteButton>
            <div></div>
            <RemoteButton action="down"><ChevronDown /></RemoteButton>
            <div></div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" onClick={() => handleRemoteAction('back')}><ArrowLeft className="mr-2 h-4 w-4"/> Back</Button>
            <Button variant="secondary" onClick={() => handleRemoteAction('home')}><Home className="mr-2 h-4 w-4"/> Home</Button>
            <Button variant="secondary" onClick={() => handleRemoteAction('menu')}><Menu className="mr-2 h-4 w-4"/> Menu</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Play /> Playback</CardTitle></CardHeader>
          <CardContent className="flex justify-center items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handlePlaybackAction('rewind')}><RotateCcw /></Button>
            <Button 
              size="lg" 
              className="w-20 h-20 rounded-full"
              onClick={() => handlePlaybackAction(isPlaying ? 'pause' : 'play')}
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => handlePlaybackAction('forward')}><RotateCw /></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Volume2 /> Volume</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={toggleMute}>
              {isMuted || volume === 0 ? <VolumeX /> : <Volume1 />}
            </Button>
            <Slider
              value={isMuted ? [0] : [volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
            />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-6">
           <Button variant="secondary" className="w-full">
            <Mic className="mr-2 h-4 w-4" /> Voice Search (Host only)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
