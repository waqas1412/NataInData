"use client";
import React, { useEffect, useRef, useState } from "react";
import { useChatHandler, ChatMessagesType } from "@/stores/chatList";
import MyReply from "@/components/chatComponents/MyReply";
import BotReply from "@/components/chatComponents/BotReply";
import ChatBox from "@/components/ChatBox";
import { useAuthStore } from "@/stores/authStore";
import { findOrCreateRoadmapChat } from "@/lib/supabase-helpers";

// Simple circular loader component
const CircularLoader = () => (
  <div className="w-8 h-8 border-4 border-primaryColor/30 border-t-primaryColor rounded-full animate-spin"></div>
);

export default function RoadmapPage() {
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [, setScroll] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessagesType[]>([]);
  const [roadmapChatId, setRoadmapChatId] = useState<string | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  
  // Get chat state and functions
  const {
    chatList,
    setCurrentChatId,
    streamingMessage,
    isStreaming,
    setupRealtime,
  } = useChatHandler();

  const { user } = useAuthStore();

  // Find or create a roadmap chat
  useEffect(() => {
    const initRoadmapChat = async () => {
      setLoading(true);
      
      if (user) {
        try {
          // Try to find an existing roadmap chat first
          const existingRoadmapChat = chatList.find(chat => chat.is_roadmap_chat);
          
          if (existingRoadmapChat) {
            // Found an existing roadmap chat
            setRoadmapChatId(existingRoadmapChat.id);
            setCurrentChatId(existingRoadmapChat.id);
            setupRealtime(existingRoadmapChat.id);
            
            // Get uniquely filtered messages
            const uniqueMessages = filterDuplicateMessages(existingRoadmapChat.messages);
            setDisplayedMessages(uniqueMessages);
            setLoading(false);
          } else {
            // Not found in local state, try to find or create using Supabase
            const roadmapChat = await findOrCreateRoadmapChat(user.id);
            
            if (roadmapChat) {
              setRoadmapChatId(roadmapChat.id);
              setCurrentChatId(roadmapChat.id);
              setupRealtime(roadmapChat.id);
              
              // Update the displayed messages
              const uniqueMessages = filterDuplicateMessages(roadmapChat.messages);
              setDisplayedMessages(uniqueMessages);
              
              // Make sure it's in the chat list - but DON'T automatically send a message
              if (!chatList.some(chat => chat.id === roadmapChat.id)) {
                useChatHandler.setState(state => ({
                  chatList: [roadmapChat, ...state.chatList]
                }));
              }
            }
            setLoading(false);
          }
        } catch (error) {
          console.error("Error initializing roadmap chat:", error);
          setLoading(false);
        }
      } else {
        // No user logged in
        setLoading(false);
      }
    };
    
    initRoadmapChat();
  }, [user, chatList, setCurrentChatId, setupRealtime]);

  // Helper function to filter duplicate messages
  const filterDuplicateMessages = (messages: ChatMessagesType[]): ChatMessagesType[] => {
    return messages.reduce((acc: ChatMessagesType[], curr) => {
      // Only add message if it doesn't already exist by content
      if (!acc.some(msg => 
        typeof msg.text === typeof curr.text && 
        msg.text === curr.text && 
        msg.isUser === curr.isUser
      )) {
        acc.push(curr);
      }
      return acc;
    }, []);
  };

  // Check if user has scrolled up (for preventing auto-scroll)
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollBoxRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollBoxRef.current;
      // If user is close to the bottom (within 100px), we should auto-scroll on new messages
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);
    };
    
    const scrollBox = scrollBoxRef.current;
    if (scrollBox) {
      scrollBox.addEventListener('scroll', handleScroll);
      return () => scrollBox.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Effect for scrolling to bottom on new messages - only if we're already at the bottom
  useEffect(() => {
    if (scrollBoxRef.current && (shouldScrollToBottom || isStreaming)) {
      // Use a small timeout to ensure the DOM has updated
      setTimeout(() => {
        scrollBoxRef.current?.scrollTo({
          top: scrollBoxRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 10);
    }
  }, [streamingMessage, isStreaming, displayedMessages.length, shouldScrollToBottom]);

  // Initial auto-scroll to bottom when chat is first loaded
  useEffect(() => {
    if (scrollBoxRef.current && !loading) {
      // Use "auto" for initial load to avoid animation
      scrollBoxRef.current.scrollTo({
        top: scrollBoxRef.current.scrollHeight,
        behavior: "auto",
      });
    }
  }, [loading]);

  // Update displayed messages when the roadmap chat changes
  useEffect(() => {
    if (roadmapChatId) {
      const roadmapChat = chatList.find(chat => chat.id === roadmapChatId);
      if (roadmapChat) {
        // Make sure all messages have unique timestamps to avoid duplicates
        const uniqueMessages = filterDuplicateMessages(roadmapChat.messages);
        
        // Check if we're just appending a new message to avoid recreating the array unnecessarily
        if (displayedMessages.length > 0 && uniqueMessages.length > displayedMessages.length) {
          // Only replace if there's a true difference to avoid unnecessary re-renders
          if (JSON.stringify(uniqueMessages) !== JSON.stringify(displayedMessages)) {
            setDisplayedMessages(uniqueMessages);
          }
        } else if (displayedMessages.length === 0) {
          // Initial load
          setDisplayedMessages(uniqueMessages);
        }
      }
    }
  }, [chatList, roadmapChatId, displayedMessages]);

  return (
    <div className="bg-white h-[calc(100vh-60px)] dark:bg-[#1A1915] flex flex-col relative w-full">
      <div
        ref={scrollBoxRef}
        className="flex-1 w-full pb-44 lg:pb-44 overflow-auto"
      >
        {loading ? (
          <div className="flex items-center w-full justify-center pt-10">
            <CircularLoader />
          </div>
        ) : !user ? (
          <div className="flex flex-col gap-6 p-4">
            <div className="text-center py-8">
              <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
                Please sign in to access your roadmap chat
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Your roadmap chat will help you plan and track your learning journey
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 px-4 md:px-6 mx-auto max-w-[1070px] w-full pt-4">
            {/* Display welcome message if no messages yet */}
            {displayedMessages.length === 0 && (
              <BotReply
                replyType="Welcome to your Roadmap chat! This your Data Engineering journey with:

130 days of guided learning
Bite-sized lesson
Divided in topics, easy to digest! 
Based on the best materials
Saves you tons of times and effort 
Re-ask if you didn't get something

Click on Show Roamap button to see how your journey will look like."
                setScroll={setScroll}
                isAnimation={false}
              />
            )}
            
            {/* Display messages */}
            {displayedMessages.map((item, index) => (
              <div key={`${item.timestamp}-${index}`} className="message-item">
                {item.isUser ? (
                  <MyReply 
                    replyText={typeof item.text === "string" ? item.text : JSON.stringify(item.text)} 
                    replyTime={new Date(item.timestamp).toLocaleTimeString()}
                  />
                ) : (
                  <BotReply
                    replyType={typeof item.text === "string" ? item.text : ""}
                    setScroll={setScroll}
                    isAnimation={false}
                    replyTime={new Date(item.timestamp).toLocaleTimeString()}
                  />
                )}
              </div>
            ))}

            {/* Show streaming response with typing animation */}
            {isStreaming && streamingMessage && (
              <BotReply
                replyType={streamingMessage}
                setScroll={setScroll}
                isStreaming={true}
                isAnimation={true}
              />
            )}
          </div>
        )}
      </div>

      {user && (
        <div className="absolute w-full bottom-0 z-30 bg-white dark:bg-[#1A1915] shadow-lg pb-5">
          <ChatBox />
        </div>
      )}
    </div>
  );
} 