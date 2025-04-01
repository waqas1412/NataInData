import { fetchUserChats } from '@/lib/supabase-helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId parameter' }),
        { status: 400 }
      );
    }
    
    const chats = await fetchUserChats(userId);
    
    return new Response(
      JSON.stringify({ chats }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching user chats:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch chats' }),
      { status: 500 }
    );
  }
} 