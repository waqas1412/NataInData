import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
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

export async function GET() {
  try {
    console.log('Checking Supabase connection');
    
    // Create a fresh Supabase client for this request
    const supabaseAdmin = createSupabaseAdmin();
    
    // Attempt to query the database
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      return NextResponse.json({ 
        status: 'error',
        message: 'Failed to connect to Supabase',
        error: error.message
      }, { status: 500 });
    }
    
    // Success - return connection info
    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to Supabase',
      supabaseUrl: supabaseUrl,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Unexpected error in Supabase check:', err);
    const error = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ 
      status: 'error', 
      message: 'Unexpected error checking Supabase connection',
      error 
    }, { status: 500 });
  }
} 