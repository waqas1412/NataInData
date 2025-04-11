import { demoChatData } from "@/constants/chats";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { syncChatToSupabase, fetchUserChats } from "@/lib/supabase-helpers";
import { useAuthStore } from "./authStore";
import { subscribeToChatUpdates, subscribeToUserChats } from "@/lib/supabase-realtime";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Import types from supabase-helpers
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
  is_roadmap_chat?: boolean;
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
      
      // If user is logged in, prefer to load from Supabase instead of localStorage
      if (user) {
        // Try to fetch from Supabase first
        get().fetchUserChatsFromSupabase();
        return;
      }
      
      // For anonymous users, use localStorage
      const storedData = localStorage.getItem(`chat-list-anonymous`);

      if (!storedData) {
        localStorage.setItem(`chat-list-anonymous`, JSON.stringify(demoChatData));
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
        const formattedChats = chats.map((chat: RpcChat) => ({
          id: chat.id,
          title: chat.title,
          is_roadmap_chat: chat.is_roadmap_chat || false,
          messages: chat.messages.map((msg: RpcChatMessage) => ({
            text: msg.content,
            isUser: msg.is_user,
            timestamp: msg.timestamp,
          }))
        }));
        
        // First clear any existing localStorage data to avoid duplicates
        localStorage.removeItem(`chat-list-${user.id}`);
        
        // Then save fresh data to localStorage as backup
        localStorage.setItem(`chat-list-${user.id}`, JSON.stringify(formattedChats));
        
        // Set state with database data
        set({ chatList: formattedChats });
      } else {
        // If fallback to REST API call
        console.log('Falling back to traditional API call');
        
        const fetchedChats = await fetchUserChats(user.id);
        localStorage.removeItem(`chat-list-${user.id}`);
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
  
  handleSubmit: async (text, chatId) => {
    const user = useAuthStore.getState().user;
    
    // Check if it's a roadmap chat marker
    const isRoadmapChat = text.includes("is_roadmap_chat=true");
    
    // If it's a system message for roadmap chat, don't update the user query
    if (!isRoadmapChat) {
      set({ userQuery: text });
    }
    
    try {
      // If not logged in, handle locally
      if (!user) {
        // Handle anonymous user chat locally
        const storedData = localStorage.getItem(`chat-list-anonymous`);
        let parsedData: Chat[] = storedData ? JSON.parse(storedData) : [];
        
        // Create a new chat ID if not provided
        const currentChatId = chatId || uuidv4();
        
        // Check if this is a new chat
        const isNewChat = !parsedData.some(({ id }) => id === currentChatId);
        
        // Create a new chat message
        const userMessage = {
          text,
          isUser: true,
          timestamp: new Date().toISOString(),
        };
        
        if (isNewChat) {
          // Create a new chat
          const newChat: Chat = {
            id: currentChatId,
            title: text.substring(0, 30) + "...",
            messages: [userMessage],
            is_roadmap_chat: isRoadmapChat
          };
          
          parsedData = [newChat, ...parsedData];
          set({ chatList: parsedData, currentChatId: currentChatId });
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
          set({ chatList: parsedData, currentChatId: currentChatId });
        }
        
        // Save the updated chat list to localStorage
        localStorage.setItem(`chat-list-anonymous`, JSON.stringify(parsedData));
        
        // Handle anonymous user AI response...
        // Continue with your existing anonymous user AI response logic
      } else {
        // Handle logged-in user with Supabase
        let currentChat: Chat | null = null;
        
        // Find existing chat by ID
        if (chatId) {
          currentChat = get().chatList.find((chat) => chat.id === chatId) || null;
        }
        
        // Check if this is a roadmap chat
        //const isExistingRoadmapChat = currentChat?.is_roadmap_chat || false;
        
        // Setup message
        const message: ChatMessagesType = {
          text,
          isUser: true,
          timestamp: new Date().toISOString(),
        };
        
        // If this is a new chat
        if (!currentChat) {
          // Determine if we should create a roadmap chat or normal chat
          const chatTitle = isRoadmapChat ? "Your Roadmap Chat" : text.substring(0, 30) + "...";
          const newChatId = chatId || uuidv4();
          
          // Create initial chat in local state
          const newChat: Chat = {
            id: newChatId,
            title: chatTitle,
            messages: [message],
            is_roadmap_chat: isRoadmapChat
          };
          
          // Update local state
          set((state) => ({
            chatList: [newChat, ...state.chatList],
            currentChatId: newChatId,
            isStreaming: true // Enable streaming for all chats including roadmap chats
          }));
          
          // Set up realtime for the new chat
          get().setupRealtime(newChatId);
          
          try {
            // Create the chat in Supabase using RPC function
            const { error } = await supabase.rpc('create_chat_with_id', {
              p_id: newChatId,
              p_user_id: user.id,
              p_title: chatTitle,
              p_initial_message: typeof message.text === 'string' ? message.text : JSON.stringify(message.text),
              p_is_roadmap_chat: isRoadmapChat
            });
            
            if (error) {
              console.error('Error creating chat:', error);
            }
          } catch (error) {
            console.error('Error creating chat:', error);
          }
          
          // For roadmap chats, add a welcome message from the AI
          if (isRoadmapChat) {
            const welcomeMessage: ChatMessagesType = {
              text: "Welcome to your Roadmap Chat! This is a dedicated space for planning your learning journey. The chat will be persistent across sessions so you can always come back to it.",
              isUser: false,
              timestamp: new Date().toISOString(),
            };
            
            // Add welcome message to local state
            set((state) => ({
              chatList: state.chatList.map((chat) => 
                chat.id === newChatId 
                  ? { ...chat, messages: [...chat.messages, welcomeMessage] }
                  : chat
              ),
            }));
            
            // Add to Supabase using RPC function
            try {
              const { error } = await supabase.rpc('add_message_to_chat', {
                p_chat_id: newChatId,
                p_user_id: user.id,
                p_content: typeof welcomeMessage.text === 'string' 
                  ? welcomeMessage.text 
                  : JSON.stringify(welcomeMessage.text),
                p_is_user: false
              });
              
              if (error) {
                // Handle error appropriately
                if (error.message.includes('Unauthorized access to chat')) {
                  console.error("Permission denied: User doesn't have access to this roadmap chat");
                } else {
                  console.error("Error adding welcome message:", error);
                }
              }
            } catch (error) {
              console.error("Error adding welcome message:", error);
            }
            
            // Don't continue with AI response for system messages
            return;
          }
        } else if (chatId) {
          // Check if this is a roadmap chat
          const isExistingRoadmapChat = currentChat?.is_roadmap_chat || false;
          
          // Special handling for roadmap chats to avoid duplicate messages
          if (isExistingRoadmapChat && isRoadmapChat) {
            // If this is a system message to an existing roadmap chat, skip it
            return;
          }
          
          // Add message to existing chat
          // Update local state
          set((state) => ({
            chatList: state.chatList.map((chat) =>
              chat.id === chatId
                ? { ...chat, messages: [...chat.messages, message] }
                : chat
            ),
            isStreaming: true // Enable streaming for all chats including roadmap chats
          }));
          
          // Add to Supabase using RPC function
          try {
            const { error } = await supabase.rpc('add_message_to_chat', {
              p_chat_id: chatId,
              p_user_id: user.id,
              p_content: typeof message.text === 'string' ? message.text : JSON.stringify(message.text),
              p_is_user: true
            });

            if (error) {
              // Special handling for authorization errors
              if (error.message.includes('Unauthorized access to chat')) {
                console.error("Permission denied: User doesn't have access to this chat");
                // Let the user know they don't have access
                set((state) => ({
                  chatList: state.chatList.filter(chat => chat.id !== chatId)
                }));
              } else {
                console.error("Error adding message:", error);
              }
            }
          } catch (error) {
            console.error("Error adding message:", error);
          }
        }
        
        // Start streaming response for all user messages (including roadmap chats)
        // Only skip for system messages marked with is_roadmap_chat=true
        if (!text.includes("is_roadmap_chat=true")) {
          // Implement streaming AI response logic
          try {
            // Use the Supabase Edge Function
            const streamUrl = 'https://vqssumehiudnzepwnjeq.supabase.co/functions/v1/chat';
            
            // Prepare messages for API
            const currentChatId = chatId || get().currentChatId;
            const currentChat = get().chatList.find(chat => chat.id === currentChatId);
            const messages = currentChat?.messages || [message];
            
            // Call the streaming API endpoint
            const response = await fetch(streamUrl, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({
                messages,
                chatId: currentChatId,
                userId: user.id,
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
            
            set({ 
              chatList: updatedChatList, 
              streamingMessage: '', 
              isStreaming: false 
            });
            
            // Add AI response to Supabase using RPC function
           /* try {
              const { error } = await supabase.rpc('add_message_to_chat', {
                p_chat_id: currentChatId,
                p_user_id: user.id,
                p_content: typeof botResponse.text === 'string' 
                  ? botResponse.text 
                  : JSON.stringify(botResponse.text),
                p_is_user: false
              });
              
              if (error) {
                // Handle error appropriately
                if (error.message.includes('Unauthorized access to chat')) {
                  console.error("Permission denied: User doesn't have access to this chat");
                  // Remove chat from local state
                  set((state) => ({
                    chatList: state.chatList.filter(chat => chat.id !== currentChatId)
                  }));
                } else {
                  console.error('Error adding AI response to database:', error);
                }
              }
            } catch (error) {
              console.error('Error adding AI response to database:', error);
            }*/
          } catch (error) {
            console.error('Error in AI streaming:', error);
            set({ isStreaming: false });
            
            // Add error message to chat
            const errorResponse: ChatMessagesType = {
              text: "Sorry, I encountered an error. Please try again.",
              isUser: false,
              timestamp: new Date().toISOString(),
            };
            
            const currentChatId = chatId || get().currentChatId;
            const updatedChatList = get().chatList.map(chat => {
              if (chat.id === currentChatId) {
                return {
                  ...chat,
                  messages: [...chat.messages, errorResponse],
                };
              }
              return chat;
            });
            
            set({ chatList: updatedChatList });
          }
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      set({ isStreaming: false });
    }
  },
}))
