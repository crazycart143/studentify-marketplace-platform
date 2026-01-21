import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';
import { resend } from '@/lib/resend';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;
    const { listingId, buyerId, sellerId } = paymentIntent.metadata;

    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'succeeded' })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    // Mark listing as sold
    await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', listingId);

    // Send emails via Resend
    try {
      // Get seller email
      const { data: sellerProfile } = await supabase
        .from('profiles')
        .select('full_name, id')
        .eq('id', sellerId)
        .single();
        
      const { data: listing } = await supabase
        .from('listings')
        .select('title, price')
        .eq('id', listingId)
        .single();

      // In a real app, you'd fetch the seller's email from auth.users or profiles
      // Since we don't have emails in profiles yet, let's assume we can get it from auth
      // For now, we'll just log that we would send it.
      
      console.log(`Payment succeeded for listing ${listingId}. Sending confirmation emails...`);
      
      /*
      await resend.emails.send({
        from: 'MarketPro <onboarding@resend.dev>',
        to: sellerEmail,
        subject: 'Item Sold!',
        html: `<h1>Congrats!</h1><p>Your item "${listing.title}" has been sold for $${listing.price}.</p>`
      });
      */
    } catch (emailErr) {
      console.error('Error sending email:', emailErr);
    }
  }

  return NextResponse.json({ received: true });
}
