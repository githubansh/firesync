import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Try to get authenticated user, but don't fail if not authenticated
    let user = null;
    try {
      const { data: { user: authUser } } = await supabaseClient.auth.getUser();
      user = authUser;
    } catch (error) {
      console.log('No authenticated user, proceeding with anonymous user');
    }

    const { roomId, action, userId } = await req.json()

    // For anonymous users, use the provided userId
    const actualUserId = user?.id || userId;

    if (!actualUserId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Leave room request:', { roomId, action, userId: actualUserId })

    // Verify user is in the room
    const { data: participant } = await supabaseClient
      .from('participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', actualUserId)
      .single()

    if (!participant) {
      return new Response(
        JSON.stringify({ error: 'Not a participant in this room' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get room info
    const { data: room } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (!room) {
      return new Response(
        JSON.stringify({ error: 'Room not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'leave') {
      // Remove participant from room
      const { error: leaveError } = await supabaseClient
        .from('participants')
        .delete()
        .eq('id', participant.id)

      if (leaveError) {
        console.error('Leave room error:', leaveError)
        throw leaveError
      }

      console.log('User left room successfully')
      return new Response(
        JSON.stringify({ success: true, action: 'left' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'end_party') {
      // Only host can end the party
      if (participant.role !== 'host') {
        return new Response(
          JSON.stringify({ error: 'Only the host can end the party' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update room status to ended
      const { error: roomUpdateError } = await supabaseClient
        .from('rooms')
        .update({
          status: 'ended',
          is_playing: false,
        })
        .eq('id', roomId)

      if (roomUpdateError) {
        console.error('End party room update error:', roomUpdateError)
        throw roomUpdateError
      }

      // Remove all participants from the room
      const { error: participantsDeleteError } = await supabaseClient
        .from('participants')
        .delete()
        .eq('room_id', roomId)

      if (participantsDeleteError) {
        console.error('End party participants delete error:', participantsDeleteError)
        throw participantsDeleteError
      }

      console.log('Party ended successfully')
      return new Response(
        JSON.stringify({ success: true, action: 'ended' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Leave room function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 