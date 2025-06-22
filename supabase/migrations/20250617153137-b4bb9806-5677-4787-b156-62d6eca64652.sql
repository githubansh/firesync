
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view all participants" ON public.participants;
DROP POLICY IF EXISTS "Users can join rooms as themselves" ON public.participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON public.participants;

DROP POLICY IF EXISTS "Users can view all rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Hosts can update their rooms" ON public.rooms;
DROP POLICY IF EXISTS "Hosts can delete their rooms" ON public.rooms;

DROP POLICY IF EXISTS "Users can view all sync events" ON public.sync_events;
DROP POLICY IF EXISTS "Users can create sync events" ON public.sync_events;

DROP POLICY IF EXISTS "Users can view all chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send chat messages" ON public.chat_messages;

-- Create new non-recursive policies for participants
CREATE POLICY "Users can view all participants" ON public.participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join rooms as themselves" ON public.participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON public.participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms" ON public.participants
  FOR DELETE USING (auth.uid() = user_id);

-- Create new policies for rooms
CREATE POLICY "Users can view all rooms" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "Users can create rooms" ON public.rooms
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their rooms" ON public.rooms
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their rooms" ON public.rooms
  FOR DELETE USING (auth.uid() = host_id);

-- Create new policies for sync events
CREATE POLICY "Users can view all sync events" ON public.sync_events
  FOR SELECT USING (true);

CREATE POLICY "Users can create sync events" ON public.sync_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create new policies for chat messages
CREATE POLICY "Users can view all chat messages" ON public.chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can send chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
