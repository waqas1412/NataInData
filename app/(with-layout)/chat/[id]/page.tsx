"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useChatHandler, Chat, ChatMessagesType } from "@/stores/chatList";
import MyReply from "@/components/chatComponents/MyReply";
import BotReply from "@/components/chatComponents/BotReply";
import ChatBox from "@/components/ChatBox";

// Simple circular loader component
const CircularLoader = () => (
  <div className="w-8 h-8 border-4 border-primaryColor/30 border-t-primaryColor rounded-full animate-spin"></div>
);

// Number of messages to load per page
const MESSAGES_PER_PAGE = 20;

export default function CustomChat() {
  const { id } = useParams();
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [, setScroll] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessagesType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollObserverRef = useRef<HTMLDivElement>(null);
  
  // Get chat state and functions
  const {
    chatList,
    setCurrentChatId,
    fetchUserChatsFromSupabase,
    streamingMessage,
    isStreaming,
    setupRealtime
  } = useChatHandler();

  // Find the current chat
  const current = chatList?.find((item) => item.id === id);

  // Initialize message loading
  useEffect(() => {
    if (current && current.messages.length > 0) {
      // Get most recent messages first (in reverse order for display)
      const totalMessages = current.messages.length;
      const initialMessages = current.messages.slice(
        Math.max(0, totalMessages - MESSAGES_PER_PAGE),
        totalMessages
      );
      
      setDisplayedMessages(initialMessages);
      setHasMoreMessages(totalMessages > MESSAGES_PER_PAGE);
      setPage(1);
    }
  }, [current]);

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

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!scrollObserverRef.current || !hasMoreMessages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMoreMessages();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(scrollObserverRef.current);
    return () => observer.disconnect();
  }, [hasMoreMessages, isLoadingMore, current]); 

  // Load more messages when scrolling up
  const loadMoreMessages = () => {
    if (!current || isLoadingMore || !hasMoreMessages) return;
    
    setIsLoadingMore(true);
    
    // Get current scroll position to maintain it after loading more messages
    const scrollContainer = scrollBoxRef.current;
    const scrollPosition = scrollContainer?.scrollHeight || 0;
    
    // Calculate the next batch of messages to load
    const totalMessages = current.messages.length;
    const nextPage = page + 1;
    const startIdx = Math.max(0, totalMessages - (nextPage * MESSAGES_PER_PAGE));
    const endIdx = Math.max(0, totalMessages - ((page) * MESSAGES_PER_PAGE));
    
    const newMessages = current.messages.slice(startIdx, endIdx);
    
    // Add new messages to the beginning of the displayed messages
    setDisplayedMessages(prev => [...newMessages, ...prev]);
    setPage(nextPage);
    setHasMoreMessages(startIdx > 0);
    
    // Restore scroll position after DOM update
    setTimeout(() => {
      if (scrollContainer) {
        const newScrollHeight = scrollContainer.scrollHeight;
        scrollContainer.scrollTop = newScrollHeight - scrollPosition;
      }
      setIsLoadingMore(false);
    }, 10);
  };

  // Effect for scrolling to bottom on new messages
  useEffect(() => {
    if (scrollBoxRef.current && !isLoadingMore) {
      // When the user sends a new message or receives a new one and isn't viewing older messages
      scrollBoxRef.current.scrollTo({
        top: scrollBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [streamingMessage, isStreaming, displayedMessages.length]);

  // Initial auto-scroll to bottom when chat is first loaded
  useEffect(() => {
    if (scrollBoxRef.current && !loading && !isLoadingMore) {
      scrollBoxRef.current.scrollTo({
        top: scrollBoxRef.current.scrollHeight,
        behavior: "auto", // Use "auto" for initial load to avoid animation
      });
    }
  }, [loading, current?.id]);

  return (
    <div className="bg-white h-[calc(100vh-60px)] dark:bg-slate-950 flex flex-col relative w-full">
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
            {/* Loading indicator at the top for infinite scroll */}
            {hasMoreMessages && (
              <div ref={scrollObserverRef} className="w-full py-2 text-center">
                {isLoadingMore ? (
                  <div className="flex justify-center">
                    <CircularLoader />
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Scroll up to load more messages</div>
                )}
              </div>
            )}
            
            {/* Display messages */}
            {displayedMessages.map((item, index) => (
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
