import { supabase } from './supabase';
import { Chat, ChatMessagesType } from '@/stores/chatList';

// Type definitions for Supabase tables
type SupabaseChat = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_roadmap_chat?: boolean;
};

type SupabaseMessage = {
  id: string;
  chat_id: string;
  content: string;
  is_user: boolean;
  created_at: string;
  updated_at: string;
};

// RPC function result types
type RpcChatMessage = {
  content: string;
  is_user: boolean;
  timestamp: string;
}

type RpcChat = {
  id: string;
  title: string;
  is_roadmap_chat?: boolean;
  messages: RpcChatMessage[];
}

/**
 * Convert Supabase chat format to app chat format
 */
export function supabaseChatToAppChat(
  supaChat: SupabaseChat,
  messages: SupabaseMessage[]
): Chat {
  return {
    id: supaChat.id,
    title: supaChat.title,
    is_roadmap_chat: supaChat.is_roadmap_chat || false,
    messages: messages.map(msg => ({
      text: msg.content,
      isUser: msg.is_user,
      timestamp: msg.created_at,
    })),
  };
}

/**
 * Convert app message format to Supabase message format
 */
export function appMessageToSupabaseMessage(
  message: ChatMessagesType,
  chatId: string
): Omit<SupabaseMessage, 'id' | 'created_at' | 'updated_at'> {
  return {
    chat_id: chatId,
    content: typeof message.text === 'string'
      ? message.text
      : JSON.stringify(message.text),
    is_user: message.isUser,
  };
}

/**
 * Fetch all chats for a user
 */
export async function fetchUserChats(userId: string): Promise<Chat[]> {
  try {
    if (!userId || userId === 'anonymous-user') {
      console.error('Cannot fetch chats without a valid user ID');
      return [];
    }
    
    // Use the RPC function to get all user chats
    const { data, error } = await supabase.rpc('get_user_chats', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Parse the result and convert to our app format
    const chats: Chat[] = data.map((chat: RpcChat) => ({
      id: chat.id,
      title: chat.title,
      is_roadmap_chat: chat.is_roadmap_chat || false,
      messages: (chat.messages || []).map((msg: RpcChatMessage) => ({
        text: msg.content,
        isUser: msg.is_user,
        timestamp: msg.timestamp
      }))
    }));
    
    return chats;
  } catch (error) {
    console.error('Error in fetchUserChats:', error);
    return [];
  }
}

/**
 * Create a new chat
 */
export async function createChat(
  title: string,
  userId: string,
  initialMessage: string,
  isRoadmapChat: boolean = false
): Promise<Chat | null> {
  try {
    // Use the RPC function to create a chat
    const { data, error } = await supabase.rpc('create_chat', {
      p_user_id: userId,
      p_title: title,
      p_initial_message: initialMessage
    });

    if (error) {
      console.error('Error creating chat:', error);
      return null;
    }

    // The RPC function returns the chat ID
    const chatId = data;

    if (!chatId) {
      console.error('No chat ID returned after creation');
      return null;
    }

    return {
      id: chatId,
      title: title,
      is_roadmap_chat: isRoadmapChat,
      messages: [
        {
          text: initialMessage,
          isUser: true,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  } catch (error) {
    console.error('Error in createChat:', error);
    return null;
  }
}

/**
 * Add a message to a chat
 */
export async function addMessageToChat(
  chatId: string,
  userId: string,
  content: string,
  isUser: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('add_message_to_chat', {
      p_chat_id: chatId,
      p_user_id: userId,
      p_content: content,
      p_is_user: isUser
    });

    if (error) {
      console.error('Error adding message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addMessageToChat:', error);
    return false;
  }
}

/**
 * Sync a chat to Supabase
 */
export async function syncChatToSupabase(
  chat: Chat,
  userId: string
): Promise<boolean> {
  try {
    // Check if chat exists in Supabase
    const { data: existingChat, error: fetchError } = await supabase
      .from('chats')
      .select('id')
      .eq('id', chat.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error checking if chat exists:', fetchError);
      return false;
    }

    // If chat doesn't exist, create it with RPC function
    if (!existingChat) {
      // Get the first message for the initial message
      const initialMessage = chat.messages[0]?.text || 'New chat';
      const initialMessageText = typeof initialMessage === 'string' 
        ? initialMessage 
        : JSON.stringify(initialMessage);

      const { error: createError } = await supabase.rpc('create_chat_with_id', {
        p_id: chat.id,
        p_user_id: userId,
        p_title: chat.title,
        p_initial_message: initialMessageText,
        p_is_roadmap_chat: chat.is_roadmap_chat || false
      });

      if (createError) {
        console.error('Error creating chat:', createError);
        return false;
      }
      
      // Skip the first message since it was added by create_chat_with_id
      const remainingMessages = chat.messages.slice(1);
      
      // Add remaining messages
      for (const message of remainingMessages) {
        try {
          await addMessageToChat(
            chat.id,
            userId,
            typeof message.text === 'string' ? message.text : JSON.stringify(message.text),
            message.isUser
          );
        } catch (error) {
          console.error('Error adding message during sync:', error);
          // Continue with other messages
        }
      }
    } else {
      // Update chat title if it exists
      const { error: updateError } = await supabase
        .from('chats')
        .update({
          title: chat.title,
          is_roadmap_chat: chat.is_roadmap_chat || false
        })
        .eq('id', chat.id);

      if (updateError) {
        console.error('Error updating chat:', updateError);
        return false;
      }

      // Get existing messages to avoid duplicates
      const { data: existingChats } = await supabase.rpc('get_user_chats', {
        p_user_id: userId
      });
      
      const currentChat = existingChats?.find((c: RpcChat) => c.id === chat.id);
      const existingMessages = currentChat?.messages || [];

      // Sync all messages
      for (const message of chat.messages) {
        // Check if message already exists by content and timestamp
        const messageExists = existingMessages.some((existing: RpcChatMessage) => 
          existing.content === (typeof message.text === 'string' ? message.text : JSON.stringify(message.text)) &&
          existing.timestamp === message.timestamp
        );
        
        // Only add message if it doesn't exist
        if (!messageExists) {
          try {
            await addMessageToChat(
              chat.id,
              userId,
              typeof message.text === 'string' ? message.text : JSON.stringify(message.text),
              message.isUser
            );
          } catch (error) {
            // Handle unauthorized errors specially
            if (error instanceof Error && error.message.includes('Unauthorized')) {
              console.error('User does not have permission to add messages to this chat');
              return false;
            }
            
            console.error('Error adding message during sync:', error);
            // Continue trying to add other messages
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error in syncChatToSupabase:', error);
    return false;
  }
}

/**
 * Find or create a roadmap chat for a user
 */
export async function findOrCreateRoadmapChat(userId: string): Promise<Chat | null> {
  try {
    if (!userId || userId === 'anonymous-user') {
      console.error('Cannot create roadmap chat without a valid user ID');
      return null;
    }
    
    // Use a database function to atomically find or create a roadmap chat
    // This prevents race conditions when multiple calls happen simultaneously
    const { data, error } = await supabase.rpc('find_or_create_roadmap_chat', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error finding or creating roadmap chat:', error);
      return null;
    }
    
    if (!data) {
      console.error('No data returned from find_or_create_roadmap_chat');
      return null;
    }
    
    // Convert to our app format
    return {
      id: data.id,
      title: data.title,
      is_roadmap_chat: true,
      messages: (data.messages || []).map((msg: RpcChatMessage) => ({
        text: msg.content,
        isUser: msg.is_user,
        timestamp: msg.timestamp
      }))
    };
  } catch (error) {
    console.error('Error in findOrCreateRoadmapChat:', error);
    return null;
  }
} 