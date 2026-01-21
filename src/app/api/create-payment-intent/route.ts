import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { listingId } = await req.json();
    const supabase = await createClient();

    // Get user session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is no longer available' }, { status: 400 });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(listing.price * 100), // Stripe expects cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        listingId: listing.id,
        buyerId: user.id,
        sellerId: listing.owner_id,
      },
    });

    // Create a pending order in Supabase
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.owner_id,
        amount: listing.price,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending',
      });

    if (orderError) {
      console.error('Error creating order:', orderError);
      // We continue since payment intent is created, we can reconcile later
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    console.error('Error creating payment intent:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
