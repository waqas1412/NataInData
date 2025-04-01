import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { ChatMessagesType } from '@/stores/chatList'

/**
 * Subscribe to chat updates in real-time
 * @param chatId The ID of the chat to subscribe to
 * @param user The current user
 * @param onNewMessage Callback function to handle new messages
 * @returns The Realtime channel subscription and an unsubscribe function
 */
export const subscribeToChatUpdates = (
  chatId: string,
  user: User | null,
  onNewMessage: (message: ChatMessagesType) => void
) => {
  if (!user) {
    console.warn('Cannot subscribe to chat updates without a user')
    return {
      channel: null,
      unsubscribe: () => {},
    }
  }

  // Subscribe to the messages table for the specific chat
  const channel = supabase
    .channel(`chat:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        // Only process messages that are not from the current user to avoid duplicates
        // since we optimistically add messages to the UI
        const messageData = payload.new
        const isCurrentUserMessage = messageData.user_id === user.id && messageData.is_user

        // Skip messages we've added optimistically
        if (isCurrentUserMessage) {
          return
        }

        // Convert message to the app's format
        const message: ChatMessagesType = {
          text: messageData.content,
          isUser: messageData.is_user,
          timestamp: messageData.timestamp,
        }

        // Call the callback with the new message
        onNewMessage(message)
      }
    )
    .subscribe()

  // Return the channel and an unsubscribe function
  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel)
    },
  }
}

/**
 * Subscribe to all user's chats for real-time updates
 * @param userId The user ID to subscribe to chats for
 * @param onChatUpdate Callback function to handle chat updates
 * @returns The Realtime channel subscription and an unsubscribe function
 */
export const subscribeToUserChats = (
  userId: string,
  onChatUpdate: () => void
) => {
  if (!userId) {
    console.warn('Cannot subscribe to user chats without a user ID')
    return {
      channel: null,
      unsubscribe: () => {},
    }
  }

  // Subscribe to both chat updates and message inserts to handle all changes
  const channel = supabase
    .channel(`user-chats:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'chats',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        // When chats change, refresh the chat list
        onChatUpdate()
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        // When new messages arrive, refresh the chat list
        onChatUpdate()
      }
    )
    .subscribe()

  // Return the channel and an unsubscribe function
  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel)
    },
  }
} 