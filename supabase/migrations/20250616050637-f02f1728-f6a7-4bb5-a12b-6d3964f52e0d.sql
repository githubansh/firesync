
-- Create enum for room status
CREATE TYPE room_status AS ENUM ('waiting', 'active', 'ended');

-- Create enum for participant roles
CREATE TYPE participant_role AS ENUM ('host', 'member');

-- Create enum for device types
CREATE TYPE device_type AS ENUM ('firetv', 'mobile');

-- Create rooms table for watch party management
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status room_status NOT NULL DEFAULT 'waiting',
  allow_remote_control BOOLEAN NOT NULL DEFAULT true,
  auto_discovery BOOLEAN NOT NULL DEFAULT true,
  current_content_url TEXT,
  current_position INTEGER DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table for room members
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  role participant_role NOT NULL DEFAULT 'member',
  device_type device_type NOT NULL,
  device_name TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create sync_events table for real-time synchronization
CREATE TABLE public.sync_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'play', 'pause', 'seek', 'content_change'
  event_data JSONB,
  timestamp_ms BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table for in-room chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'emoji', 'system'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Users can view rooms they participate in" ON public.rooms
  FOR SELECT USING (
    id IN (SELECT room_id FROM public.participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create rooms" ON public.rooms
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their rooms" ON public.rooms
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their rooms" ON public.rooms
  FOR DELETE USING (auth.uid() = host_id);

-- RLS Policies for participants
CREATE POLICY "Users can view participants in their rooms" ON public.participants
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM public.participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join rooms" ON public.participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON public.participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms" ON public.participants
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sync_events
CREATE POLICY "Users can view sync events in their rooms" ON public.sync_events
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM public.participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create sync events in their rooms" ON public.sync_events
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    room_id IN (SELECT room_id FROM public.participants WHERE user_id = auth.uid())
  );

-- RLS Policies for chat_messages
CREATE POLICY "Users can view chat in their rooms" ON public.chat_messages
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM public.participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send chat in their rooms" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    room_id IN (SELECT room_id FROM public.participants WHERE user_id = auth.uid())
  );

-- Enable real-time for all tables
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.participants REPLICA IDENTITY FULL;
ALTER TABLE public.sync_events REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sync_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Create function to generate unique room codes
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(6)
LANGUAGE plpgsql
AS $$
DECLARE
    code VARCHAR(6);
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generate a random 6-character code
        code := UPPER(
            CHR(65 + (RANDOM() * 25)::INT) ||
            CHR(65 + (RANDOM() * 25)::INT) ||
            CHR(65 + (RANDOM() * 25)::INT) ||
            (RANDOM() * 9)::INT ||
            (RANDOM() * 9)::INT ||
            (RANDOM() * 9)::INT
        );
        
        -- Check if code already exists
        SELECT COUNT(*) INTO exists_check 
        FROM public.rooms 
        WHERE code = generate_room_code.code AND status != 'ended';
        
        -- If code doesn't exist, break the loop
        EXIT WHEN exists_check = 0;
    END LOOP;
    
    RETURN code;
END;
$$;

-- Create function to update room timestamps
CREATE OR REPLACE FUNCTION update_room_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create trigger for updating room timestamps
CREATE TRIGGER update_rooms_timestamp
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_room_timestamp();
