import { demoChatData } from "@/constants/chats";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { syncChatToSupabase, fetchUserChats, addMessageToChat } from "@/lib/supabase-helpers";
import { useAuthStore } from "./authStore";
import { subscribeToChatUpdates, subscribeToUserChats } from "@/lib/supabase-realtime";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type ChatMessagesType = {
  text:
    | string
    | {
        summary: string;
        isCommandSuggestion?: boolean;
        commands?: { command: string; label: string }[];
        code?: string;
        language?: string;
        image?: string;
      };
  isUser: boolean;
  timestamp: string;
};

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessagesType[];
}

// Add new types for real-time state
interface RealtimeState {
  chatChannel: RealtimeChannel | null;
  userChatsChannel: RealtimeChannel | null;
  unsubscribeChat: () => void;
  unsubscribeUserChats: () => void;
  setupRealtime: (chatId?: string) => void;
  cleanupRealtime: () => void;
}

type ChatHandlerType = {
  userQuery: string;
  chatList: Chat[];
  isAnimation: boolean;
  currentChatId: string | null;
  streamingMessage: string;
  isStreaming: boolean;
  isLoading: boolean;
  handleSubmit: (text: string, chatId?: string) => Promise<void>;
  updateChatList: () => void;
  emptyQuery: () => void;
  setUserQuery: (text: string) => void;
  updateStreamingMessage: (text: string) => void;
  clearStreamingMessage: () => void;
  setCurrentChatId: (chatId: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  fetchUserChatsFromSupabase: () => Promise<void>;
  syncLocalChatsToSupabase: () => Promise<void>;
} & RealtimeState;

export const useChatHandler = create<ChatHandlerType>((set, get) => ({
  userQuery: "",
  chatList: [],
  isAnimation: false,
  currentChatId: null,
  streamingMessage: "",
  isStreaming: false,
  isLoading: false,
  
  // Realtime state
  chatChannel: null,
  userChatsChannel: null,
  unsubscribeChat: () => {},
  unsubscribeUserChats: () => {},
  
  // Clean up realtime subscriptions
  cleanupRealtime: () => {
    const { unsubscribeChat, unsubscribeUserChats } = get();
    unsubscribeChat();
    unsubscribeUserChats();
    set({ 
      chatChannel: null, 
      userChatsChannel: null,
      unsubscribeChat: () => {},
      unsubscribeUserChats: () => {}
    });
  },
  
  // Set up realtime subscriptions
  setupRealtime: (chatId) => {
    const { cleanupRealtime, fetchUserChatsFromSupabase } = get();
    const user = useAuthStore.getState().user;
    
    // Clean up existing subscriptions
    cleanupRealtime();
    
    // If user is not logged in, skip realtime setup
    if (!user) return;
    
    // Set up subscription for all user chats
    const { channel: userChatsChannel, unsubscribe: unsubscribeUserChats } = subscribeToUserChats(
      user.id,
      () => {
        // When chats are updated, fetch the latest data
        fetchUserChatsFromSupabase();
      }
    );
    
    // Set up subscription for specific chat if chatId is provided
    let chatChannel = null;
    let unsubscribeChat = () => {};
    
    if (chatId) {
      const chatSubscription = subscribeToChatUpdates(
        chatId,
        user,
        (newMessage) => {
          // When a new message is received, add it to the chat
          const { chatList } = get();
          const updatedChatList = chatList.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [...chat.messages, newMessage],
              };
            }
            return chat;
          });
          
          set({ chatList: updatedChatList });
        }
      );
      
      chatChannel = chatSubscription.channel;
      unsubscribeChat = chatSubscription.unsubscribe;
    }
    
    // Update state with new subscriptions
    set({ 
      chatChannel, 
      userChatsChannel,
      unsubscribeChat,
      unsubscribeUserChats
    });
  },
  
  setUserQuery: (text) => {
    set({ userQuery: text });
  },
  
  emptyQuery: () => {
    set({ userQuery: "" });
  },
  
  updateStreamingMessage: (text) => {
    set({ streamingMessage: text });
  },
  
  clearStreamingMessage: () => {
    set({ streamingMessage: "" });
  },
  
  setCurrentChatId: (chatId) => {
    // Update current chat ID and set up realtime for the new chat
    set({ currentChatId: chatId });
    get().setupRealtime(chatId);
  },
  
  setIsStreaming: (isStreaming) => {
    set({ isStreaming });
  },
  
  updateChatList: () => {
    try {
      const user = useAuthStore.getState().user;
      const storedData = localStorage.getItem(`chat-list-${user?.id || 'anonymous'}`);

      if (!storedData) {
        localStorage.setItem(`chat-list-${user?.id || 'anonymous'}`, JSON.stringify(demoChatData));
        set({ chatList: demoChatData });
      } else {
        const parsedData = JSON.parse(storedData);
        set({ chatList: parsedData });
      }
    } catch (error) {
      console.log(error);
    }
  },
  
  fetchUserChatsFromSupabase: async () => {
    const user = useAuthStore.getState().user;
    
    // If not logged in, use local storage
    if (!user) {
      get().updateChatList();
      return;
    }
    
    try {
      set({ isLoading: true });
      
      // Directly call Supabase RPC function
      const { data, error } = await supabase.rpc('get_user_chats', {
        p_user_id: user.id
      });
      
      if (error) {
        console.error('Error calling get_user_chats:', error);
        throw new Error('Failed to fetch chats');
      }
      
      // data is already in the correct format
      const chats = data;
      
      if (chats && Array.isArray(chats)) {
        // Convert the JSON data to our Chat format
        const formattedChats = chats.map((chat: any) => ({
          id: chat.id,
          title: chat.title,
          messages: chat.messages.map((msg: any) => ({
            text: msg.content,
            isUser: msg.is_user,
            timestamp: msg.timestamp,
          }))
        }));
        
        // Save to localStorage as backup and set state
        localStorage.setItem(`chat-list-${user.id}`, JSON.stringify(formattedChats));
        set({ chatList: formattedChats });
      } else {
        // If fallback to REST API call
        console.log('Falling back to traditional API call');
        
        const fetchedChats = await fetchUserChats(user.id);
        localStorage.setItem(`chat-list-${user.id}`, JSON.stringify(fetchedChats));
        set({ chatList: fetchedChats });
      }
    } catch (error) {
      console.error('Error fetching chats from Supabase:', error);
      // Fall back to local storage
      get().updateChatList();
    } finally {
      set({ isLoading: false });
    }
  },
  
  syncLocalChatsToSupabase: async () => {
    const user = useAuthStore.getState().user;
    
    // If not logged in, skip sync
    if (!user) {
      return;
    }
    
    try {
      const { chatList } = get();
      
      // Sync each chat
      for (const chat of chatList) {
        await syncChatToSupabase(chat, user.id);
      }
    } catch (error) {
      console.error('Error syncing chats to Supabase:', error);
    }
  },
  
  handleSubmit: async (text, chatId?) => {
    set({ userQuery: text, isStreaming: true });
    
    // Get stored chat data
    const user = useAuthStore.getState().user;
    const storedData = localStorage.getItem(`chat-list-${user?.id || 'anonymous'}`);
    let parsedData: Chat[] = storedData ? JSON.parse(storedData) : [];
    
    // Create a new chat ID if not provided
    let currentChatId = chatId || uuidv4();
    
    // Get current user if available
    const userId = user?.id || 'anonymous-user';
    
    // Check if this is a new chat
    const isNewChat = !parsedData.some(({ id }) => id === currentChatId);
    
    // Create a new chat message
    const userMessage = {
      text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    
    // Update the local state first for immediate UI update
    if (isNewChat) {
      // Create a new chat
      const newChat: Chat = {
        id: currentChatId,
        title: text,
        messages: [userMessage],
      };
      
      parsedData = [newChat, ...parsedData];
      set({ chatList: parsedData, currentChatId });
      
      // Setup realtime for the new chat
      get().setupRealtime(currentChatId);
      
      // If user is logged in, create the chat in Supabase
      if (user) {
        try {
          const { error } = await supabase.rpc('create_chat_with_id', {
            p_id: currentChatId,
            p_user_id: user.id,
            p_title: text,
            p_initial_message: text
          });
          
          if (error) {
            console.error('Error creating chat in Supabase:', error);
          }
        } catch (error) {
          console.error('Error creating chat in Supabase:', error);
        }
      }
    } else {
      // Update existing chat
      parsedData = parsedData.map((chat) => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, userMessage],
          };
        }
        return chat;
      });
      set({ chatList: parsedData, currentChatId });
      
      // If user is logged in, add the message to Supabase
      if (user) {
        try {
          await supabase.rpc('add_message_to_chat', {
            p_chat_id: currentChatId,
            p_user_id: user.id,
            p_content: text,
            p_is_user: true
          });
        } catch (error) {
          console.error('Error adding message to Supabase:', error);
        }
      }
    }
    
    // Save the updated chat list to localStorage as backup
    localStorage.setItem(`chat-list-${user?.id || 'anonymous'}`, JSON.stringify(parsedData));
    
    try {
      // Use the Supabase Edge Function if the user is authenticated
      let streamUrl = '/api/chat';
      
      if (user) {
        // Use Supabase Edge Function URL if authenticated
        streamUrl = 'https://vqssumehiudnzepwnjeq.supabase.co/functions/v1/chat';
      }
      
      // Prepare messages for API
      const currentChat = parsedData.find(chat => chat.id === currentChatId);
      const messages = currentChat?.messages || [userMessage];
      
      // Call the streaming API endpoint
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add Supabase auth header if authenticated
          ...(user && { 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` })
        },
        body: JSON.stringify({
          messages,
          chatId: currentChatId,
          userId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      if (!response.body) {
        throw new Error('No response body');
      }
      
      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';
      
      // Handle the stream data
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode the chunk and update the streaming message
        const chunk = decoder.decode(value);
        accumulatedResponse += chunk;
        set({ streamingMessage: accumulatedResponse });
      }
      
      // Create the bot's response
      const botResponse: ChatMessagesType = {
        text: accumulatedResponse,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      
      // Update the chat with the bot's response
      const updatedChatList = get().chatList.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, botResponse],
          };
        }
        return chat;
      });
      
      // Update localStorage and state
      localStorage.setItem(`chat-list-${user?.id || 'anonymous'}`, JSON.stringify(updatedChatList));
      set({ 
        chatList: updatedChatList, 
        streamingMessage: '', 
        isStreaming: false 
      });
      
    } catch (error) {
      console.error('Error calling chat API:', error);
      set({ isStreaming: false });
      
      // Add error message to chat
      const errorResponse: ChatMessagesType = {
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      
      const updatedChatList = get().chatList.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, errorResponse],
          };
        }
        return chat;
      });
      
      localStorage.setItem(`chat-list-${user?.id || 'anonymous'}`, JSON.stringify(updatedChatList));
      set({ chatList: updatedChatList });
    }
  },
}))
