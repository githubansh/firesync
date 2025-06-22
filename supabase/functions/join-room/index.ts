// @ts-ignore: Deno-specific imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno-specific imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Deno type declarations for TypeScript
declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS", // ← added
};

serve(async (req) => {
  /* CORS pre-flight ------------------------------------------------------ */
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    /* Verify the caller actually sent a token ---------------------------- */
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    /* Supabase client ---------------------------------------------------- */
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!, // ← non-null assertion
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // ← same name everywhere
      {
        global: {
          headers: {
            Authorization: authHeader, // ← already checked
            apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          },
        },
      },
    );

    /* Business logic stays the same ------------------------------------- */
    const {
      data: { user },
    } = await supabaseClient.auth.getUser(); // ← valid call
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { roomCode, username, deviceType, deviceName } = await req.json();

    const { data: room, error: roomError } = await supabaseClient
      .from("rooms")
      .select("*")
      .ilike("code", roomCode) // ← syntax is correct; `%` wildcards are optional
      .in("status", ["waiting", "active"])
      .single();

    if (roomError || !room) {
      console.error('Room not found error:', roomError || 'Room not found');
      return new Response(
        JSON.stringify({ error: 'Room not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    /* …rest of the original logic… */
    console.log('User joining room:', user.id, { roomCode, username, deviceType, deviceName });

    // Check if user is already a participant in this room
    const { data: existingParticipant, error: existingError } = await supabaseClient
      .from('participants')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_id', user.id)
      .single();

    // If user is already in the room, update their connection status
    if (existingParticipant) {
      const { error: updateError } = await supabaseClient
        .from('participants')
        .update({
          username: username,
          device_type: deviceType,
          device_name: deviceName,
          is_connected: true,
          last_seen: new Date().toISOString()
        })
        .eq('id', existingParticipant.id);

      if (updateError) {
        console.error('Failed to update participant:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update participant' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Return updated room data
      return new Response(
        JSON.stringify({ 
          room, 
          participant: { ...existingParticipant, username, device_type: deviceType, device_name: deviceName, is_connected: true } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add user as new participant
    const { data: participant, error: participantError } = await supabaseClient
      .from('participants')
      .insert({
        room_id: room.id,
        user_id: user.id,
        username: username,
        role: 'member',
        device_type: deviceType,
        device_name: deviceName,
        is_connected: true
      })
      .select()
      .single();

    if (participantError) {
      console.error('Failed to add participant:', participantError);
      return new Response(
        JSON.stringify({ error: 'Failed to join room' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User joined room successfully:', participant);
    return new Response(
      JSON.stringify({ room, participant }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});