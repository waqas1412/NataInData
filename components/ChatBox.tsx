import { useChatHandler } from "@/stores/chatList";
import { usePathname, useRouter } from "next/navigation";
import React, { FormEvent, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  PiArrowUp,
  PiLightbulb,
  PiMagnifyingGlass,
  PiMicrophone,
  PiPaperclip,
} from "react-icons/pi";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import dynamic from "next/dynamic";

const SubscriptionOverlay = dynamic(() => import("@/components/SubscriptionOverlay"), {
  ssr: false,
});

function ChatBox() {
  const [inputText, setInputText] = useState("");
  const [showSubscriptionOverlay, setShowSubscriptionOverlay] = useState(false);
  const router = useRouter();
  const path = usePathname();
  const { 
    userQuery, 
    handleSubmit, 
    setUserQuery, 
    streamingMessage, 
    isStreaming, 
    currentChatId 
  } = useChatHandler();
  const { hasActiveSubscription } = useSubscriptionStore();

  const chatIdUrl = path.includes("/chat/") ? path.split("/chat/")[1] : null;

  // Redirect to the current chat URL if we're on a generic page
  useEffect(() => {
    if (currentChatId && !chatIdUrl && !path.includes("/new-chat")) {
      router.push(`/chat/${currentChatId}`);
    }
  }, [currentChatId, chatIdUrl, path, router]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (userQuery.length === 0) {
      return;
    }

    // Check subscription status for all messages
    if (!hasActiveSubscription) {
      setShowSubscriptionOverlay(true);
      return;
    }

    // Handle sending the message
    try {
      // If we're not on a chat-specific page, we'll create a new chat with a new ID
      // Otherwise, use the current chat ID from the URL
      const isNewChat = !chatIdUrl;
      const targetChatId = chatIdUrl || uuidv4();
      
      // For new chats, navigate to the chat page first before submitting
      if (isNewChat && path.includes("/new-chat")) {
        // Set current chat ID and navigate to the new chat
        router.push(`/chat/${targetChatId}`);
        
        // Wait for navigation to complete
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Call submit handler from store (will handle creating/updating chats)
      await handleSubmit(userQuery, targetChatId);
      
      // Clear input after sending
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  return (
    <>
      <div className="w-full max-w-[1070px] mx-auto px-4 sm:px-6">
        <form
          onSubmit={handleSendMessage}
          className="w-full bg-primaryColor/5 p-2 lg:p-4 rounded-xl border border-primaryColor/20"
        >
          <div className="w-full bg-white rounded-lg max-lg:text-sm block dark:bg-n0">
            <input
              className="w-full outline-none p-4 bg-transparent"
              placeholder={isStreaming ? "AI is generating a response..." : "Message Tutor Chatbot..."}
              value={inputText}
              onChange={(e) => {
                setUserQuery(e.target.value);
                setInputText(e.target.value);
              }}
              disabled={isStreaming}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="flex justify-start items-center gap-3">
              <button 
                type="button"
                className="flex justify-center items-center gap-2 py-2 px-2 sm:px-4 rounded-full border border-secondaryColor/20 bg-secondaryColor/5"
              >
                <PiMagnifyingGlass className="text-secondaryColor" />
                <span className="text-xs font-medium max-sm:hidden">Search</span>
              </button>
              <button 
                type="button"
                className="flex justify-center items-center gap-2 py-2 px-2 sm:px-4 rounded-full border border-warningColor/30 bg-warningColor/5"
              >
                <PiLightbulb className="text-warningColor" />
                <span className="text-xs font-medium max-sm:hidden">
                  Brainstorm
                </span>
              </button>
            </div>
            <div className="flex justify-end items-center gap-3">
              <button 
                type="button"
                className="bg-white p-2 rounded-full flex justify-center items-center border border-primaryColor/20 dark:bg-n0"
              >
                <PiMicrophone />
              </button>
              <button 
                type="button"
                className="bg-white p-2 rounded-full flex justify-center items-center border border-primaryColor/20 dark:bg-n0"
              >
                <PiPaperclip />
              </button>
              <button
                type="submit"
                className={`${
                  isStreaming ? 'opacity-50 cursor-not-allowed' : ''
                } bg-primaryColor p-2 rounded-full flex justify-center items-center border border-primaryColor text-white`}
                disabled={isStreaming}
              >
                <PiArrowUp />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Subscription Overlay */}
      {showSubscriptionOverlay && (
        <SubscriptionOverlay onClose={() => setShowSubscriptionOverlay(false)} />
      )}
    </>
  );
}

export default ChatBox;
