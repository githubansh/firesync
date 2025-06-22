import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, MessageSquare, QrCode } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface RoomSharingProps {
  roomCode: string;
  roomName: string;
  participantCount: number;
}

export const RoomSharing = ({ roomCode, roomName }: RoomSharingProps) => {
  const [shareUrl] = useState(`${window.location.origin}?join=${roomCode}`);
  const { toast } = useToast();

  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: successMessage,
    });
  };

  const shareRoom = async () => {
    const shareText = `🎬 Join our family watch party!\n\nRoom: ${roomName}\nCode: ${roomCode}\nLink: ${shareUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FireSync Watch Party',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        copyToClipboard(shareText, "Share text copied to clipboard.");
      }
    } else {
      copyToClipboard(shareText, "Share text copied to clipboard.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Invite Family
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="room-code">Room Code</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="room-code"
              value={roomCode}
              readOnly
              className="font-mono text-lg text-center"
            />
            <Button
              onClick={() => copyToClipboard(roomCode, "Room code copied to clipboard.")}
              variant="outline"
              size="icon"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="share-link">Direct Link</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="share-link"
              value={shareUrl}
              readOnly
            />
            <Button
              onClick={() => copyToClipboard(shareUrl, "Share link copied to clipboard.")}
              variant="outline"
              size="icon"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button onClick={shareRoom}>
            <Share2 className="w-4 h-4 mr-2" />
            Share via...
          </Button>
          <Button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join our watch party: ${shareUrl}`)}`)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
