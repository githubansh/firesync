
-- Drop all existing policies with CASCADE to ensure clean state
DROP POLICY IF EXISTS "Users can view participants in rooms they're in" ON public.participants CASCADE;
DROP POLICY IF EXISTS "Users can join rooms as themselves" ON public.participants CASCADE;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.participants CASCADE;
DROP POLICY IF EXISTS "Users can leave their own participation" ON public.participants CASCADE;

DROP POLICY IF EXISTS "Users can view rooms they participate in" ON public.rooms CASCADE;
DROP POLICY IF EXISTS "Users can create rooms as host" ON public.rooms CASCADE;
DROP POLICY IF EXISTS "Hosts can update their rooms" ON public.rooms CASCADE;
DROP POLICY IF EXISTS "Hosts can delete their rooms" ON public.rooms CASCADE;

DROP POLICY IF EXISTS "Users can view sync events in their rooms" ON public.sync_events CASCADE;
DROP POLICY IF EXISTS "Users can create sync events in their rooms" ON public.sync_events CASCADE;

DROP POLICY IF EXISTS "Users can view chat in their rooms" ON public.chat_messages CASCADE;
DROP POLICY IF EXISTS "Users can send chat in their rooms" ON public.chat_messages CASCADE;

-- Drop any other potential policy names that might exist
DROP POLICY IF EXISTS "Users can view all participants" ON public.participants CASCADE;
DROP POLICY IF EXISTS "Users can view all rooms" ON public.rooms CASCADE;
DROP POLICY IF EXISTS "Users can view all sync events" ON public.sync_events CASCADE;
DROP POLICY IF EXISTS "Users can view all chat messages" ON public.chat_messages CASCADE;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_participant_in_room(room_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.participants 
    WHERE room_id = room_id_param AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_room_host(room_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.rooms 
    WHERE id = room_id_param AND host_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Proper RLS policies for participants table
CREATE POLICY "Participants can view room members" ON public.participants
  FOR SELECT USING (
    public.is_participant_in_room(room_id, auth.uid())
  );

CREATE POLICY "Users join as themselves" ON public.participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own participation" ON public.participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users leave own participation" ON public.participants
  FOR DELETE USING (auth.uid() = user_id);

-- Proper RLS policies for rooms table
CREATE POLICY "Participants view their rooms" ON public.rooms
  FOR SELECT USING (
    public.is_participant_in_room(id, auth.uid())
  );

CREATE POLICY "Users create rooms as host" ON public.rooms
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts update their rooms" ON public.rooms
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Hosts delete their rooms" ON public.rooms
  FOR DELETE USING (auth.uid() = host_id);

-- RLS policies for sync_events
CREATE POLICY "Participants view room sync events" ON public.sync_events
  FOR SELECT USING (
    public.is_participant_in_room(room_id, auth.uid())
  );

CREATE POLICY "Participants create sync events" ON public.sync_events
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    public.is_participant_in_room(room_id, auth.uid())
  );

-- RLS policies for chat_messages
CREATE POLICY "Participants view room chat" ON public.chat_messages
  FOR SELECT USING (
    public.is_participant_in_room(room_id, auth.uid())
  );

CREATE POLICY "Participants send room chat" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    public.is_participant_in_room(room_id, auth.uid())
  );
