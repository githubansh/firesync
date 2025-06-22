-- Create a function to handle anonymous room creation
-- This function will create rooms with a system user when no authenticated user is available

CREATE OR REPLACE FUNCTION create_anonymous_room(
    room_name TEXT DEFAULT 'Family Movie Night',
    allow_remote_control BOOLEAN DEFAULT true,
    auto_discovery BOOLEAN DEFAULT true
)
RETURNS TABLE (
    id UUID,
    code TEXT,
    name TEXT,
    host_id UUID,
    status room_status,
    created_at TIMESTAMPTZ,
    allow_remote_control BOOLEAN,
    auto_discovery BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    room_code TEXT;
    system_user_id UUID := '00000000-0000-0000-0000-000000000000';
    new_room_id UUID;
BEGIN
    -- Generate room code
    SELECT generate_room_code() INTO room_code;
    
    -- Insert room with system user as host
    INSERT INTO rooms (code, name, host_id, status, allow_remote_control, auto_discovery)
    VALUES (room_code, room_name, system_user_id, 'waiting', allow_remote_control, auto_discovery)
    RETURNING rooms.id INTO new_room_id;
    
    -- Return the created room
    RETURN QUERY
    SELECT r.id, r.code, r.name, r.host_id, r.status, r.created_at, r.allow_remote_control, r.auto_discovery
    FROM rooms r
    WHERE r.id = new_room_id;
END;
$$;
