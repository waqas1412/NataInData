import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

// Initialize Supabase admin client with service role key for direct DB access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// This makes Next.js properly handle OPTIONS requests (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  console.log('Received webhook request');

  if (!sig) {
    console.log('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.log(`Event received: ${event.type}`);
  
  // Immediately acknowledge receipt of the valid webhook
  // This sends a 200 OK response to Stripe as quickly as possible
  const response = NextResponse.json({ received: true }, { status: 200 });
  
  // Process the event asynchronously
  processWebhookEvent(event).catch(error => {
    console.error('Error processing webhook event:', error);
  });
  
  return response;
}

// Async function to process webhook events without blocking the response
async function processWebhookEvent(event: Stripe.Event) {
  try {
    // Handle specific Stripe events
    switch (event.type) {
      // New subscription created
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      // Subscription updated (renewal, plan change, etc.)
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      // Subscription cancelled or expired
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // Payment successful
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      // Payment failed
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // Handle other events as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Even though we log errors, we don't return an error response
    // since we've already sent the 200 OK to Stripe
  }
}

// Handler functions for different Stripe events

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Get customer to find user ID from metadata or email
  const customerData = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  
  // Make sure we're handling a proper customer, not a deleted one
  if (customerData.deleted) {
    console.error('Cannot handle deleted customer');
    return;
  }
  
  // First, try to get user_id from client_reference_id
  const clientReferenceId = customerData.metadata?.client_reference_id;
  const customerEmail = customerData.email;
  let userId = clientReferenceId;
  
  console.log('Customer data:', { 
    email: customerEmail, 
    metadata: customerData.metadata,
    clientReferenceId
  });
  
  // If user_id not in metadata, find by email using the admin API
  if (!userId && customerEmail) {
    console.log(`Looking up user by email: ${customerEmail}`);
    
    try {
      // List all users and find the one with matching email
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) {
        console.error('Error listing users:', error);
        return;
      }
      
      const matchedUser = data.users.find(u => u.email === customerEmail);
      if (matchedUser) {
        userId = matchedUser.id;
        console.log(`Found user by email lookup: ${userId}`);
      } else {
        console.log('No user found with this email');
      }
    } catch (error) {
      console.error('Error in auth admin API:', error);
    }
  }
  
  if (!userId) {
    console.error(`User not found for email: ${customerEmail}`);
    return;
  }

  console.log(`Creating subscription for user: ${userId}`);

  // Extended subscription data to better match Stripe's fields
  const subscriptionData = {
    id: subscription.id, // Use Stripe's subscription ID as our primary key
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    price_id: subscription.items.data[0]?.price?.id || '',
    product_id: subscription.items.data[0]?.price?.product as string || '',
    quantity: subscription.items.data[0]?.quantity || 1,
    cancel_at_period_end: subscription.cancel_at_period_end,
    created_at: new Date(subscription.created * 1000).toISOString(),
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
    cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    currency: subscription.currency,
    interval: subscription.items.data[0]?.plan?.interval || 'month',
    interval_count: subscription.items.data[0]?.plan?.interval_count || 1,
    amount: subscription.items.data[0]?.plan?.amount || 0,
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' });

    if (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
    
    console.log('Subscription created successfully');
  } catch (error) {
    console.error('Failed to save subscription:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`Updating subscription: ${subscription.id}`);
  
  // Update subscription with all relevant fields
  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: subscription.status,
        price_id: subscription.items.data[0]?.price?.id || '',
        product_id: subscription.items.data[0]?.price?.product as string || '',
        quantity: subscription.items.data[0]?.quantity || 1,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        currency: subscription.currency,
        interval: subscription.items.data[0]?.plan?.interval || 'month',
        interval_count: subscription.items.data[0]?.plan?.interval_count || 1,
        amount: subscription.items.data[0]?.plan?.amount || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
    
    console.log('Subscription updated successfully');
  } catch (error) {
    console.error('Failed to update subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Cancelling subscription: ${subscription.id}`);
  
  // Update subscription status to cancelled with additional fields
  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : new Date().toISOString(),
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
    
    console.log('Subscription cancelled successfully');
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    console.log(`Payment succeeded for subscription: ${invoice.subscription}`);
    
    // Fetch the subscription to get updated details
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    
    await handleSubscriptionUpdated(subscription);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    console.log(`Payment failed for subscription: ${invoice.subscription}`);
    
    // Fetch the subscription to get updated details
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    
    // Update status to past_due or whatever the current status is
    await handleSubscriptionUpdated(subscription);
  }
} 