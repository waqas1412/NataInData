import { supabase } from './supabase';
import { Chat, ChatMessagesType } from '@/stores/chatList';

// Type definitions for Supabase tables
type SupabaseChat = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type SupabaseMessage = {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  is_user: boolean;
  timestamp: string;
};

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
    messages: messages.map(msg => ({
      text: msg.content,
      isUser: msg.is_user,
      timestamp: msg.timestamp,
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
): Omit<SupabaseMessage, 'id'> {
  return {
    chat_id: chatId,
    user_id: userId,
    content: typeof message.text === 'string'
      ? message.text
      : JSON.stringify(message.text),
    is_user: message.isUser,
    timestamp: message.timestamp,
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
    
    // Get all chats for the user
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (chatsError) {
      console.error('Error fetching chats:', chatsError);
      return [];
    }

    if (!chats || chats.length === 0) {
      return [];
    }

    // For each chat, fetch its messages
    const chatPromises = chats.map(async (chat) => {
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chat.id)
        .eq('user_id', userId) // Only get messages for this user
        .order('timestamp', { ascending: true });

      if (messagesError) {
        console.error(`Error fetching messages for chat ${chat.id}:`, messagesError);
        return supabaseChatToAppChat(chat, []);
      }

      return supabaseChatToAppChat(chat, messages || []);
    });

    // Wait for all chat data to be loaded
    return await Promise.all(chatPromises);
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
  initialMessage: string
): Promise<Chat | null> {
  try {
    // Create chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({
        user_id: userId,
        title: title,
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
    const { error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        user_id: userId,
        content: content,
        is_user: isUser,
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
 * Sync local chat to Supabase
 */
export async function syncChatToSupabase(
  chat: Chat,
  userId: string
): Promise<boolean> {
  try {
    // Check if chat exists
    const { data: existingChat, error: checkError } = await supabase
      .from('chats')
      .select('id, user_id')
      .eq('id', chat.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking chat existence:', checkError);
      return false;
    }

    // If chat doesn't exist, create it
    if (!existingChat) {
      const { error: createError } = await supabase
        .from('chats')
        .insert({
          id: chat.id,
          user_id: userId,
          title: chat.title,
        });

      if (createError) {
        console.error('Error creating chat:', createError);
        return false;
      }
    } else {
      // Security check: Verify this user owns the chat
      if (existingChat.user_id !== userId) {
        console.error('Security violation: User attempted to sync a chat they do not own');
        return false;
      }
    }

    // Get existing messages
    const { data: existingMessages, error: messagesError } = await supabase
      .from('messages')
      .select('content, timestamp')
      .eq('chat_id', chat.id);

    if (messagesError) {
      console.error('Error fetching existing messages:', messagesError);
      return false;
    }

    // Find messages that don't exist in Supabase
    const existingTimestamps = new Set(
      existingMessages?.map(msg => msg.timestamp) || []
    );

    const newMessages = chat.messages.filter(
      msg => !existingTimestamps.has(msg.timestamp)
    );

    // Insert new messages
    if (newMessages.length > 0) {
      const messagesToInsert = newMessages.map(msg => 
        appMessageToSupabaseMessage(msg, chat.id, userId)
      );

      const { error: insertError } = await supabase
        .from('messages')
        .insert(messagesToInsert);

      if (insertError) {
        console.error('Error inserting messages:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in syncChatToSupabase:', error);
    return false;
  }
} 