import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Mic, Send, Play, Pause, Smile } from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage } from "@/types/chat";
import { useChatManagement } from "@/hooks/useChatManagement";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EnhancedChatSystemProps {
  roomId: string;
  messages: ChatMessage[];
  currentUsername: string;
}

const quickEmojis = ["👍", "🔥", "💯", "👏", "😂", "🎉"];

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const EnhancedChatSystem = ({
  roomId,
  messages,
  currentUsername,
}: EnhancedChatSystemProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [playingStates, setPlayingStates] = useState<{ [key: string]: boolean }>({});
  const [playbackProgress, setPlaybackProgress] = useState<{ [key: string]: number }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const { toast } = useToast();
  const { sendMessage, isLoading } = useChatManagement();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;
    const success = await sendMessage(roomId, newMessage, "text");
    if (success) setNewMessage("");
  };

  const sendQuickEmoji = async (emoji: string) => {
    if (isLoading) return;
    await sendMessage(roomId, emoji, "emoji");
  };

  const handleVoiceMessage = async (audioBlob: Blob, duration: number) => {
    setShowVoiceRecorder(false);
    if (isLoading) return;

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = reader.result as string;
        const success = await sendMessage(roomId, base64Audio, "voice", duration);
        if (success) {
          toast({ title: "Voice Message Sent" });
        } else {
          toast({ title: "Error", description: "Failed to send voice message", variant: "destructive" });
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      toast({ title: "Error", description: "Failed to send voice message", variant: "destructive" });
    }
  };

  const togglePlayback = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (!message || !message.message) return;

    if (!audioRefs.current[messageId]) {
      const audio = new Audio(message.message);
      audioRefs.current[messageId] = audio;

      audio.addEventListener("timeupdate", () => {
        setPlaybackProgress(prev => ({ ...prev, [messageId]: (audio.currentTime / audio.duration) * 100 }));
      });
      audio.addEventListener("ended", () => {
        setPlayingStates(prev => ({ ...prev, [messageId]: false }));
        setPlaybackProgress(prev => ({ ...prev, [messageId]: 0 }));
      });
      audio.addEventListener("error", () => toast({ title: "Playback Error", variant: "destructive" }));
    }

    const audio = audioRefs.current[messageId];
    if (playingStates[messageId]) {
      audio.pause();
    } else {
      Object.values(audioRefs.current).forEach(a => a.pause());
      audio.play().catch(() => toast({ title: "Playback Error", variant: "destructive" }));
    }
    setPlayingStates(prev => ({ ...Object.fromEntries(Object.keys(prev).map(k => [k, false])), [messageId]: !prev[messageId] }));
  };
  
  const MessageBubble = ({ msg }: { msg: ChatMessage }) => {
    const isCurrentUser = msg.username === currentUsername;

    if (msg.message_type === "system") {
      return (
        <div className="text-center text-xs text-muted-foreground my-2">{msg.message}</div>
      );
    }
    
    return (
      <div className={cn("flex items-end gap-2 my-2", isCurrentUser ? "justify-end" : "justify-start")}>
        {!isCurrentUser && (
          <Avatar className="w-8 h-8">
            <AvatarFallback>{msg.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        <div
          className={cn(
            "rounded-lg px-3 py-2 max-w-xs sm:max-w-md",
            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-secondary"
          )}
        >
          {!isCurrentUser && <p className="text-xs font-semibold mb-1">{msg.username}</p>}
          {msg.message_type === 'text' && <p className="text-sm">{msg.message}</p>}
          {msg.message_type === 'emoji' && <p className="text-4xl">{msg.message}</p>}
          {msg.message_type === 'voice' && msg.message && (
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => togglePlayback(msg.id)}>
                {playingStates[msg.id] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="w-24 h-1 bg-muted-foreground/20 rounded-full">
                <div className="h-1 bg-primary rounded-full" style={{ width: `${playbackProgress[msg.id] || 0}%` }} />
              </div>
              <span className="text-xs w-10">{formatDuration(msg.duration || 0)}</span>
            </div>
          )}
          <p className="text-xs text-right mt-1 opacity-70">{formatTime(msg.created_at)}</p>
        </div>
      </div>
    );
  };

  if (showVoiceRecorder) {
    return (
      <VoiceRecorder
        onCancel={() => setShowVoiceRecorder(false)}
        onRecordingComplete={handleVoiceMessage}
      />
    );
  }

  return (
    <Card className="flex flex-col h-[50vh] sm:h-[60vh]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle />
          Party Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pr-2">
        {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <div className="flex items-center gap-2 w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost"><Smile /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex gap-1">
                {quickEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="icon"
                    className="text-2xl"
                    onClick={() => sendQuickEmoji(emoji)}
                    disabled={isLoading}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <Button size="icon" onClick={() => setShowVoiceRecorder(true)} disabled={isLoading} variant="ghost">
            <Mic />
          </Button>
          <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !newMessage.trim()}>
            <Send />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
