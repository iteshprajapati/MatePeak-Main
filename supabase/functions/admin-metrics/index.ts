import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Verify user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin');

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching admin metrics...');

    // Get overview statistics
    const [
      { count: totalMentors },
      { count: totalStudents },
      { count: totalBookings },
      { data: revenueData }
    ] = await Promise.all([
      supabase.from('expert_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('total_amount').eq('payment_status', 'paid')
    ]);

    const totalRevenue = revenueData?.reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0) || 0;

    // Get recent bookings with details
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select(`
        *,
        expert:expert_profiles(full_name, category),
        student:profiles!bookings_user_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get daily metrics for the last 30 days
    const { data: dailyMetrics } = await supabase
      .from('admin_metrics')
      .select('*')
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Get top mentors by revenue
    const { data: topMentors } = await supabase
      .from('bookings')
      .select(`
        expert_id,
        total_amount,
        expert:expert_profiles(full_name, category)
      `)
      .eq('payment_status', 'paid');

    // Aggregate top mentors
    const mentorRevenue = new Map();
    topMentors?.forEach(booking => {
      const mentorId = booking.expert_id;
      const current = mentorRevenue.get(mentorId) || { 
        mentor: booking.expert, 
        revenue: 0,
        bookings: 0 
      };
      current.revenue += Number(booking.total_amount || 0);
      current.bookings += 1;
      mentorRevenue.set(mentorId, current);
    });

    const topMentorsList = Array.from(mentorRevenue.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    console.log('Metrics fetched successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          overview: {
            total_mentors: totalMentors || 0,
            total_students: totalStudents || 0,
            total_bookings: totalBookings || 0,
            total_revenue: totalRevenue,
            platform_commission: totalRevenue * 0.10
          },
          recent_bookings: recentBookings || [],
          daily_metrics: dailyMetrics || [],
          top_mentors: topMentorsList
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in admin-metrics:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
