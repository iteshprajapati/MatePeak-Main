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
    const { amount, account_details } = await req.json();
    
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid withdrawal amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing withdrawal for user:', user.id, 'Amount:', amount);

    // Get mentor's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('mentor_id', user.id)
      .single();

    if (walletError || !wallet) {
      return new Response(
        JSON.stringify({ success: false, error: 'Wallet not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if sufficient balance
    if (wallet.balance < amount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Insufficient balance',
          current_balance: wallet.balance 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct from wallet
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ 
        balance: wallet.balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id);

    if (updateError) {
      throw updateError;
    }

    // Record withdrawal transaction
    const { error: txnError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'debit',
        amount: amount,
        description: `Withdrawal to ${account_details?.bank_name || 'bank account'}`
      });

    if (txnError) {
      console.error('Transaction recording error:', txnError);
    }

    console.log('Withdrawal successful');

    // In production, integrate with payment gateway for actual transfer
    // For MVP, we're just recording the transaction

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Withdrawal request submitted successfully',
        new_balance: wallet.balance - amount,
        withdrawal_amount: amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in wallet-withdraw:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
