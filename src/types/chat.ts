
export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  message: string;
  message_type: 'text' | 'voice' | 'image' | 'reaction' | 'system' | 'emoji';
  created_at: string;
  voice_duration?: number;
  duration?: number; // For backward compatibility with voice messages
}
