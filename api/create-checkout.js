// ============================================================
// Vercel Serverless Function — Create Stripe Checkout Session
// ============================================================
// Endpoint: POST /api/create-checkout
// Body: { userId: string, email: string }
// Returns: { url: string }

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role key para bypass RLS
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, email } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: 'Missing userId or email' });
  }

  try {
    // Busca ou cria stripeCustomerId no Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabaseUserId: userId },
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Cria sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: process.env.VITE_STRIPE_PRICE_ID,
        quantity: 1,
      }],
      success_url: `${req.headers.origin}/?subscription=success`,
      cancel_url: `${req.headers.origin}/?subscription=canceled`,
      locale: 'pt-BR',
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: error.message });
  }
};
