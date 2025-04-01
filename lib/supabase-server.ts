import { createClient } from '@supabase/supabase-js'

// Types for database tables
export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          content: string
          is_user: boolean
          timestamp: string
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          content: string
          is_user: boolean
          timestamp?: string
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          content?: string
          is_user?: boolean
          timestamp?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: string
          price_id: string | null
          quantity: number | null
          cancel_at_period_end: boolean
          created_at: string
          current_period_start: string
          current_period_end: string
          ended_at: string | null
          cancel_at: string | null
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
          stripe_subscription_id: string
          stripe_customer_id: string
        }
        Insert: {
          id?: string
          user_id: string
          status: string
          price_id?: string | null
          quantity?: number | null
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_start: string
          current_period_end: string
          ended_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          stripe_subscription_id: string
          stripe_customer_id: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          price_id?: string | null
          quantity?: number | null
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_start?: string
          current_period_end?: string
          ended_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          stripe_subscription_id?: string
          stripe_customer_id?: string
        }
      }
    }
    Functions: {
      create_chat: {
        Args: {
          p_user_id: string
          p_title: string
          p_initial_message: string
        }
        Returns: unknown
      }
      add_message_to_chat: {
        Args: {
          p_chat_id: string
          p_user_id: string
          p_content: string
          p_is_user: boolean
        }
        Returns: unknown
      }
      get_user_chats: {
        Args: {
          p_user_id: string
        }
        Returns: unknown
      }
      delete_chat: {
        Args: {
          p_chat_id: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
  }
}

// Create Supabase admin client with service role key
const createSupabaseServer = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for server')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export const supabaseServer = createSupabaseServer() 