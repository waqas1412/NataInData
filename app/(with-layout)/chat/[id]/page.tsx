"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useChatHandler, Chat } from "@/stores/chatList";
import Image from "next/image";
import MyReply from "@/components/chatComponents/MyReply";
import BotReply from "@/components/chatComponents/BotReply";
import ChatBox from "@/components/ChatBox";
import { useAuthStore } from "@/stores/authStore";

// Simple circular loader component
const CircularLoader = () => (
  <div className="w-8 h-8 border-4 border-primaryColor/30 border-t-primaryColor rounded-full animate-spin"></div>
);

export default function CustomChat() {
  const { id } = useParams();
  const pathname = usePathname();
  const userScrollRef = useRef<boolean>(true);
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [scroll, setScroll] = useState(false);
  
  // Get the user for realtime subscriptions
  const user = useAuthStore((state) => state.user);

  // Get chat state and functions
  const {
    chatList,
    updateChatList,
    currentChatId,
    setCurrentChatId,
    fetchUserChatsFromSupabase,
    streamingMessage,
    isStreaming,
    setupRealtime
  } = useChatHandler();

  // Find the current chat
  const current = chatList?.find((item) => item.id === id);

  // Effect to create a temporary local chat if not found
  useEffect(() => {
    if (!loading && !current && id) {
      // Create a temporary empty chat while we wait for data
      const tempChat: Chat = {
        id: id as string,
        title: "Loading chat...",
        messages: []
      };
      useChatHandler.setState(state => ({
        chatList: [tempChat, ...state.chatList],
      }));
    }
  }, [current, loading, id]);
  
  // Setup effect
  useEffect(() => {
    setLoading(true);
    // First, set the current chat ID
    if (id) {
      setCurrentChatId(id as string);
      
      // Setup realtime for this chat
      setupRealtime(id as string);
    }
    
    // Then fetch user's chats
    fetchUserChatsFromSupabase().then(() => {
      setLoading(false);
    });
    
  }, [id, setCurrentChatId, fetchUserChatsFromSupabase, setupRealtime]);
  
  // Effect to avoid "Chat not found" flashing before data loads
  useEffect(() => {
    if (chatList.length > 0) {
      const currentChat = chatList.find(chat => chat.id === id);
      if (currentChat) {
        setLoading(false);
      }
    }
  }, [chatList, id]);

  // Effect for scrolling
  useEffect(() => {
    // Automatically scroll to bottom when new messages are added or during streaming
    if (scrollBoxRef.current) {
      const scrollHeight = scrollBoxRef.current.scrollHeight;
      scrollBoxRef.current.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatList, streamingMessage, isStreaming]);

  return (
    <div className=" bg-white h-[calc(100vh-60px)] dark:bg-slate-950 flex flex-col relative w-full">
      <div
        ref={scrollBoxRef}
        className="flex-1 w-full pb-44 lg:pb-44 overflow-auto"
      >
        {loading ? (
          <div className="flex items-center w-full justify-center pt-10">
            <CircularLoader />
          </div>
        ) : current ? (
          <div className="flex flex-col gap-6">
            {current.messages.map((item, index) => (
              <div key={index}>
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
                isAnimation={false}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center w-full justify-center pt-10">
            <h1 className="text-3xl font-medium text-slate-300">
              Chat not found
            </h1>
          </div>
        )}
      </div>

      <div className="absolute w-full bottom-0 z-30 bg-white dark:bg-slate-950 shadow-lg pb-5">
        <ChatBox />
      </div>
    </div>
  );
}
