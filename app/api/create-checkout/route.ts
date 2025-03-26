import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase admin client
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

// Price ID from environment variable
const PRICE_ID = process.env.STRIPE_PRICE_ID!;

interface CheckoutRequest {
  userId: string;
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CheckoutRequest;
    const { userId, email } = body;
    
    if (!userId || !email) {
      console.error('Missing required parameters', { userId, email });
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }
    
    console.log('Creating checkout session for', { userId, email });

    // Create Supabase admin client
    const supabaseAdmin = createSupabaseAdmin();
    
    // First check if user has any existing subscriptions in our database
    const { data: existingSubscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking existing subscription:', subError);
      throw subError;
    }

    let customerId: string = '';  // Initialize with empty string
    
    if (existingSubscription?.stripe_customer_id) {
      // Use the customer ID from our database
      customerId = existingSubscription.stripe_customer_id;
      console.log('Using existing customer from database:', customerId);
      
      try {
        // Verify the customer still exists in Stripe
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        if (customer.deleted) {
          // Customer was deleted in Stripe, create a new one
          throw new Error('Customer was deleted in Stripe');
        }
        
        // Update customer email and metadata if needed
        await stripe.customers.update(customerId, {
          email, // Update email in case it changed
          metadata: { 
            client_reference_id: userId,
            supabase_user_id: userId // Additional reference
          },
        });
      } catch (error) {
        console.log('Error retrieving/updating customer, will create new one:', error);
        customerId = ''; // Reset so we create a new customer
      }
    }
    
    if (!customerId) {
      // Check if customer exists in Stripe by email AND has our metadata
      const { data: customers } = await stripe.customers.list({
        email: email,
        limit: 100 // Get more to search through metadata
      });
      
      const existingCustomer = customers.find(
        cust => cust.metadata?.client_reference_id === userId || 
                cust.metadata?.supabase_user_id === userId
      );
      
      if (existingCustomer) {
        // Found matching customer in Stripe
        customerId = existingCustomer.id;
        console.log('Found existing customer in Stripe:', customerId);
        
        // Update metadata if needed
        await stripe.customers.update(customerId, {
          metadata: { 
            client_reference_id: userId,
            supabase_user_id: userId
          },
        });
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email,
          metadata: { 
            client_reference_id: userId,
            supabase_user_id: userId
          },
        });
        customerId = customer.id;
        console.log('Created new customer:', customerId);
      }
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/new-chat?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/new-chat?canceled=true`,
      client_reference_id: userId,
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
        },
      },
    });
    
    console.log('Checkout session created', session.id);
    
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Return friendly error to client
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create checkout session', message: errorMessage },
      { status: 500 }
    );
  }
} 