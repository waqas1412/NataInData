import { supabase } from './supabase';
import { Chat, ChatMessagesType } from '@/stores/chatList';
import { v4 as uuidv4 } from 'uuid';

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
  user_id: string;
  content: string;
  is_user: boolean;
  created_at: string;
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
  chatId: string,
  userId: string
): Omit<SupabaseMessage, 'id' | 'created_at'> {
  return {
    chat_id: chatId,
    user_id: userId,
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
    // Create chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({
        user_id: userId,
        title: title,
        is_roadmap_chat: isRoadmapChat
      })
      .select()
      .single();

    if (chatError) {
      console.error('Error creating chat:', chatError);
      return null;
    }

    if (!chat) {
      console.error('No chat data returned after creation');
      return null;
    }

    // Create initial message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        chat_id: chat.id,
        user_id: userId,
        content: initialMessage,
        is_user: true,
      });

    if (msgError) {
      console.error('Error creating initial message:', msgError);
    }

    return {
      id: chat.id,
      title: chat.title,
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
        await addMessageToChat(
          chat.id,
          userId,
          typeof message.text === 'string' ? message.text : JSON.stringify(message.text),
          message.isUser
        );
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

      // Sync all messages
      for (const message of chat.messages) {
        // Check if message already exists (by matching content and timestamp)
        const { data: existingMessages, error: msgFetchError } = await supabase
          .from('messages')
          .select('id')
          .eq('chat_id', chat.id)
          .eq('user_id', userId)
          .eq('content', typeof message.text === 'string' ? message.text : JSON.stringify(message.text))
          .eq('created_at', message.timestamp);

        if (msgFetchError) {
          console.error('Error checking if message exists:', msgFetchError);
          continue;
        }

        // Only add message if it doesn't exist
        if (!existingMessages || existingMessages.length === 0) {
          await addMessageToChat(
            chat.id,
            userId,
            typeof message.text === 'string' ? message.text : JSON.stringify(message.text),
            message.isUser
          );
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
    
    // Get all user chats
    const { data, error } = await supabase.rpc('get_user_chats', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error fetching user chats:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      // Find roadmap chat if it exists
      const roadmapChat = data.find((chat: RpcChat) => chat.is_roadmap_chat);
      
      if (roadmapChat) {
        // Convert to our app format
        return {
          id: roadmapChat.id,
          title: roadmapChat.title,
          is_roadmap_chat: true,
          messages: (roadmapChat.messages || []).map((msg: RpcChatMessage) => ({
            text: msg.content,
            isUser: msg.is_user,
            timestamp: msg.timestamp
          }))
        };
      }
    }
    
    // No roadmap chat found, create one
    const chatId = uuidv4();
    const title = "Your Roadmap Chat";
    
    // Create a welcome message from AI instead of having the user "send" a message
    const welcomeMessage = "Welcome to your Roadmap Chat! This is a dedicated space for planning your learning journey. The chat will be persistent across sessions so you can always come back to it.";
    
    // Create the chat in Supabase with an empty initial message (to avoid triggering auto-messages)
    const { error: createError } = await supabase.rpc('create_chat_with_id', {
      p_id: chatId,
      p_user_id: userId,
      p_title: title,
      p_initial_message: "", // Empty initial message
      p_is_roadmap_chat: true
    });
    
    if (createError) {
      console.error('Error creating roadmap chat:', createError);
      return null;
    }
    
    // Add welcome message from the AI
    await supabase.rpc('add_message_to_chat', {
      p_chat_id: chatId,
      p_user_id: userId,
      p_content: welcomeMessage,
      p_is_user: false
    });
    
    // Return the newly created chat
    return {
      id: chatId,
      title: title,
      is_roadmap_chat: true,
      messages: [
        {
          text: welcomeMessage,
          isUser: false,
          timestamp: new Date().toISOString()
        }
      ]
    };
  } catch (error) {
    console.error('Error in findOrCreateRoadmapChat:', error);
    return null;
  }
} 