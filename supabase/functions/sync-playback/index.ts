
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

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { roomId, eventType, eventData, timestampMs } = await req.json()

    console.log('Sync event:', { roomId, eventType, eventData, timestampMs, userId: user.id })

    // Verify user is in the room
    const { data: participant } = await supabaseClient
      .from('participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single()

    if (!participant) {
      return new Response(
        JSON.stringify({ error: 'Not authorized for this room' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create sync event
    const { error: syncError } = await supabaseClient
      .from('sync_events')
      .insert({
        room_id: roomId,
        user_id: user.id,
        event_type: eventType,
        event_data: eventData,
        timestamp_ms: timestampMs,
      })

    if (syncError) {
      console.error('Sync event error:', syncError)
      throw syncError
    }

    // Update room state based on event type
    let roomUpdateData: any = {}

    switch (eventType) {
      case 'play':
        roomUpdateData = {
          is_playing: true,
          current_position: eventData?.position || 0,
        }
        break
      case 'pause':
        roomUpdateData = {
          is_playing: false,
          current_position: eventData?.position || 0,
        }
        break
      case 'seek':
        roomUpdateData = {
          current_position: eventData?.position || 0,
        }
        break
      case 'content_change':
        roomUpdateData = {
          current_content_url: eventData?.url,
          current_position: 0,
          is_playing: false,
        }
        break
      case 'start_party':
        // Host starts the party - change room status to active
        if (participant.role === 'host') {
          roomUpdateData = {
            status: 'active',
            is_playing: true,
            current_position: 0,
          }
        }
        break
      case 'end_party':
        // Host ends the party
        if (participant.role === 'host') {
          roomUpdateData = {
            status: 'ended',
            is_playing: false,
          }
        }
        break
    }

    if (Object.keys(roomUpdateData).length > 0) {
      const { error: roomUpdateError } = await supabaseClient
        .from('rooms')
        .update(roomUpdateData)
        .eq('id', roomId)

      if (roomUpdateError) {
        console.error('Room update error:', roomUpdateError)
        throw roomUpdateError
      }
    }

    console.log('Sync event processed successfully')
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Sync playback function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
