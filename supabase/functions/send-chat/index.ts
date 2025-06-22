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

    const { roomId, message, messageType = 'text', voiceDuration, userId, username } = await req.json()

    console.log('Chat message:', { roomId, message, messageType, voiceDuration, userId, username })

    // For anonymous users, use the provided userId and username
    const actualUserId = user?.id || userId;
    const actualUsername = username || 'Anonymous';

    if (!actualUserId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is in the room and get their username
    const { data: participant } = await supabaseClient
      .from('participants')
      .select('username')
      .eq('room_id', roomId)
      .eq('user_id', actualUserId)
      .single()

    if (!participant) {
      return new Response(
        JSON.stringify({ error: 'Not authorized for this room' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use the participant's username from the database
    const finalUsername = participant.username;

    // Prepare the chat message data
    const chatData: any = {
      room_id: roomId,
      user_id: actualUserId,
      username: finalUsername,
      message,
      message_type: messageType,
    }

    // Add voice duration if it's a voice message
    if (messageType === 'voice' && voiceDuration) {
      chatData.voice_duration = voiceDuration
    }

    // Insert chat message
    const { error: chatError } = await supabaseClient
      .from('chat_messages')
      .insert(chatData)

    if (chatError) {
      console.error('Chat message error:', chatError)
      throw chatError
    }

    console.log('Chat message sent successfully')
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Send chat function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
