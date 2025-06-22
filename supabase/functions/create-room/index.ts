
/// <reference path="./types.d.ts" />

// @ts-ignore - Deno module resolution
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno module resolution
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Anonymous user management system
const ANONYMOUS_USER_IDS = [
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
];

const ROOM_LIMIT_PER_ANONYMOUS_USER = 1000;

// Validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Get an available anonymous user ID with load balancing
const getAnonymousUserId = async (supabaseClient: any): Promise<string> => {
  try {
    for (const userId of ANONYMOUS_USER_IDS) {
      const { count, error } = await supabaseClient
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', userId);
      
      if (error) {
        console.error('Error checking room count for user:', userId, error);
        continue;
      }
      
      const roomCount = count || 0;
      if (roomCount < ROOM_LIMIT_PER_ANONYMOUS_USER) {
        console.log(`Using anonymous user ${userId} (current rooms: ${roomCount})`);
        return userId;
      }
    }
    
    // If all users are at capacity, use the first one (fallback)
    console.warn('All anonymous users are at capacity, using first user as fallback');
    return ANONYMOUS_USER_IDS[0];
  } catch (error) {
    console.error('Error in getAnonymousUserId:', error);
    // Fallback to first user if there's any error
    return ANONYMOUS_USER_IDS[0];
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization')!,
            apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
          },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    
    // For anonymous users, use load-balanced system user ID
    let hostId = user?.id;
    
    if (!user) {
      // Get an available anonymous user ID with load balancing
      hostId = await getAnonymousUserId(supabaseClient);
      console.log('Creating room for anonymous user with system host ID:', hostId);
    } else {
      console.log('Creating room for authenticated user:', user.id);
    }
    
    // Validate that we have a valid hostId
    if (!hostId) {
      console.error('No valid host ID available');
      return new Response(
        JSON.stringify({ error: 'Unable to determine host user. Please try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { name = 'Family Movie Night', allowRemoteControl = true, autoDiscovery = true } = await req.json()

    console.log('Creating room for user:', hostId, { name, allowRemoteControl, autoDiscovery })

    // Generate room code
    const { data: roomCode, error: codeError } = await supabaseClient
      .rpc('generate_room_code')

    if (codeError || !roomCode) {
      console.error('Failed to generate room code:', codeError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate room code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create room
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .insert({
        code: roomCode,
        name,
        host_id: hostId,
        status: 'waiting',
        allow_remote_control: allowRemoteControl,
        auto_discovery: autoDiscovery,
      })
      .select()
      .single()

    if (roomError) {
      console.error('Room creation error:', roomError)
      
      // Provide more specific error messages
      if (roomError.code === '23503') {
        return new Response(
          JSON.stringify({ error: 'Invalid host user. Please ensure anonymous users are set up correctly.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to create room: ' + roomError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add host as participant
    const { error: participantError } = await supabaseClient
      .from('participants')
      .insert({
        room_id: room.id,
        user_id: hostId,
        username: user ? 'Host' : 'Anonymous Host',
        role: 'host',
        device_type: 'firetv',
        device_name: user ? 'Host Device' : 'Anonymous Device',
      })

    if (participantError) {
      console.error('Host participant creation error:', participantError)
      // Don't fail room creation if participant creation fails
    }

    console.log('Room created successfully:', room)
    return new Response(
      JSON.stringify({ room }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Create room function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
