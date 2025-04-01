import { supabase } from '@/lib/supabase';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { title, userId } = await req.json();

    // Input validation
    if (!title || !userId) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: 'Title and userId are required' 
        }),
        { status: 400 }
      );
    }

    // Create a new chat in Supabase
    const { data, error } = await supabase
      .from('chats')
      .insert({
        title: title,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating chat:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create chat', details: error.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Chat created successfully', 
        chat: data 
      }),
      { status: 201 }
    );
  } catch (error: Error | unknown) {
    console.error('Error creating chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error creating chat' }),
      { status: 500 }
    );
  }
} 