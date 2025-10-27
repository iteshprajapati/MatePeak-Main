import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookSessionRequest {
  mentor_id: string
  session_time: string
  duration: number
  session_type: string
  message?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: BookSessionRequest = await req.json()
    const { mentor_id, session_time, duration, session_type, message } = body

    // Validate input
    if (!mentor_id || !session_time || !duration || !session_type) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Booking session:', { mentor_id, session_time, duration, user_id: user.id })

    // Check if mentor exists and get pricing
    const { data: mentor, error: mentorError } = await supabaseClient
      .from('expert_profiles')
      .select('id, pricing, full_name')
      .eq('id', mentor_id)
      .single()

    if (mentorError || !mentor) {
      console.error('Mentor not found:', mentorError)
      return new Response(
        JSON.stringify({ success: false, message: 'Mentor not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check availability using database function
    const { data: isAvailable, error: availError } = await supabaseClient
      .rpc('check_mentor_availability', {
        p_mentor_id: mentor_id,
        p_session_time: session_time,
        p_duration: duration
      })

    if (availError) {
      console.error('Availability check error:', availError)
      return new Response(
        JSON.stringify({ success: false, message: 'Error checking availability' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!isAvailable) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Mentor is not available at this time. Please choose another time slot.' 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate total amount
    const total_amount = mentor.pricing || 0

    // Create booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        user_id: user.id,
        expert_id: mentor_id,
        session_type,
        session_time,
        duration,
        message,
        total_amount,
        status: 'pending',
        payment_status: 'pending'
      })
      .select('*, expert:expert_profiles(full_name, category)')
      .single()

    if (bookingError) {
      console.error('Booking error:', bookingError)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create booking', error: bookingError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Booking created successfully:', booking.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Session booked successfully',
        data: booking
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error', error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
