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

// Create a more robust Supabase client with additional options for Vercel serverless environment
const createSupabaseAdmin = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: fetch,
    },
  });
};

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
  
  try {
    // Process the event synchronously and capture any errors
    await processWebhookEvent(event);
    
    // Only send success if processing completes without errors
    return NextResponse.json({ received: true, processed: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    
    // Return an error response to Stripe - this will cause them to retry
    const errorMessage = error instanceof Error ? error.message : 'Unknown error processing webhook';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Function to process webhook events
async function processWebhookEvent(event: Stripe.Event) {
  // Create a fresh Supabase client for each request
  const supabaseAdmin = createSupabaseAdmin();
  
  // Handle specific Stripe events
  switch (event.type) {
    // New subscription created
    case 'customer.subscription.created':
      await handleSubscriptionCreated(supabaseAdmin, event.data.object as Stripe.Subscription);
      break;

    // Subscription updated (renewal, plan change, etc.)
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(supabaseAdmin, event.data.object as Stripe.Subscription);
      break;

    // Subscription cancelled or expired
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(supabaseAdmin, event.data.object as Stripe.Subscription);
      break;

    // Payment successful
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(supabaseAdmin, event.data.object as Stripe.Invoice);
      break;

    // Payment failed
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(supabaseAdmin, event.data.object as Stripe.Invoice);
      break;
      
    // Checkout session completed
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(supabaseAdmin, event.data.object as Stripe.Checkout.Session);
      break;
      
    // Invoice events  
    case 'invoice.created':
    case 'invoice.finalized':
    case 'invoice.updated':
    case 'invoice.paid':
      // Log but don't error; we handle invoice.payment_succeeded instead
      console.log(`Received invoice event: ${event.type}`);
      break;
      
    // Customer events
    case 'customer.created':
    case 'customer.updated':
      // Log but don't error; we process info via the subscription events
      console.log(`Received customer event: ${event.type}`);
      break;
      
    // Payment intents and payment methods
    case 'payment_intent.created':
    case 'payment_intent.succeeded':
    case 'payment_method.attached':
    case 'charge.succeeded':
      // Log but don't error; we rely on subscription and invoice events
      console.log(`Received payment event: ${event.type}`);
      break;

    // Handle other events as needed
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

// New handler for checkout.session.completed events
async function handleCheckoutSessionCompleted(supabaseAdmin: ReturnType<typeof createSupabaseAdmin>, session: Stripe.Checkout.Session) {
  try {
    console.log(`Checkout session completed: ${session.id}`);
    
    // If the session has a subscription, process it
    if (session.subscription) {
      // Fetch the subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      // Handle the subscription creation
      await handleSubscriptionCreated(supabaseAdmin, subscription);
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error; // Propagate the error
  }
}

// Handler functions for different Stripe events

async function handleSubscriptionCreated(supabaseAdmin: ReturnType<typeof createSupabaseAdmin>, subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    
    // Get customer to find user ID from metadata or email
    const customerData = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    
    // Make sure we're handling a proper customer, not a deleted one
    if (customerData.deleted) {
      throw new Error('Cannot handle deleted customer');
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
          throw error;
        }
        
        const matchedUser = data.users.find(u => u.email === customerEmail);
        if (matchedUser) {
          userId = matchedUser.id;
          console.log(`Found user by email lookup: ${userId}`);
        } else {
          throw new Error(`No user found with email: ${customerEmail}`);
        }
      } catch (error) {
        console.error('Error in auth admin API:', error);
        throw error;
      }
    }
    
    if (!userId) {
      throw new Error(`User not found for email: ${customerEmail}`);
    }

    console.log(`Creating subscription for user: ${userId}`);

    // UUID for Supabase primary key (do not use stripe subscription ID as the primary key)
    const uuid = crypto.randomUUID();

    // Extended subscription data to better match Stripe's fields
    const subscriptionData = {
      id: uuid, // Generate a UUID for the primary key
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id, // Store Stripe's subscription ID separately
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

    console.log('Upserting subscription data to Supabase:', subscriptionData.stripe_subscription_id);
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' });

    if (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
    
    console.log('Subscription created successfully');
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error);
    throw error; // Propagate the error to trigger retry from Stripe
  }
}

async function handleSubscriptionUpdated(supabaseAdmin: ReturnType<typeof createSupabaseAdmin>, subscription: Stripe.Subscription) {
  try {
    console.log(`Updating subscription: ${subscription.id}`);
    
    // First check if the subscription exists
    const { error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching subscription:', fetchError);
      
      // If subscription doesn't exist, create it
      if (fetchError.code === 'PGRST116') {
        console.log('Subscription not found, creating instead of updating');
        return await handleSubscriptionCreated(supabaseAdmin, subscription);
      }
      
      throw fetchError;
    }
    
    // Update subscription with all relevant fields
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
    throw error; // Propagate the error to trigger retry from Stripe
  }
}

async function handleSubscriptionDeleted(supabaseAdmin: ReturnType<typeof createSupabaseAdmin>, subscription: Stripe.Subscription) {
  try {
    console.log(`Cancelling subscription: ${subscription.id}`);
    
    // Update subscription status to cancelled with additional fields
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
    throw error; // Propagate the error to trigger retry from Stripe
  }
}

async function handleInvoicePaymentSucceeded(supabaseAdmin: ReturnType<typeof createSupabaseAdmin>, invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    try {
      console.log(`Payment succeeded for subscription: ${invoice.subscription}`);
      
      // Fetch the subscription to get updated details
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );
      
      await handleSubscriptionUpdated(supabaseAdmin, subscription);
    } catch (error) {
      console.error('Error handling invoice payment succeeded:', error);
      throw error; // Propagate the error to trigger retry from Stripe
    }
  } else {
    console.log('Invoice payment succeeded, but no subscription attached');
  }
}

async function handleInvoicePaymentFailed(supabaseAdmin: ReturnType<typeof createSupabaseAdmin>, invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    try {
      console.log(`Payment failed for subscription: ${invoice.subscription}`);
      
      // Fetch the subscription to get updated details
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );
      
      // Update status to past_due or whatever the current status is
      await handleSubscriptionUpdated(supabaseAdmin, subscription);
    } catch (error) {
      console.error('Error handling invoice payment failed:', error);
      throw error; // Propagate the error to trigger retry from Stripe
    }
  } else {
    console.log('Invoice payment failed, but no subscription attached');
  }
} 