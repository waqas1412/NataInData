"use client";
import React, { useEffect } from "react";
import logo from "@/public/images/favicon.png";
import Image from "next/image";
import { chatOptions } from "@/constants/data";
import ChatBox from "@/components/ChatBox";
import { useChatHandler } from "@/stores/chatList";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

function NewChat() {
  const router = useRouter();
  const { handleSubmit, fetchUserChatsFromSupabase, isLoading } = useChatHandler();

  // Fetch chats when component mounts
  useEffect(() => {
    // Fetch chats when the component loads
    fetchUserChatsFromSupabase();
  }, [fetchUserChatsFromSupabase]);

  const handleClick = async (label: string) => {
    // Generate a new chat ID
    const chatId = uuidv4();
    
    // Send the message via the chat handler
    await handleSubmit(label, chatId);
    
    // Navigate to the chat page
    router.push(`/chat/${chatId}`);
  };
  
  return (
    <>
      <div className="w-full max-w-[1090px] mx-auto px-6 flex flex-col">
        <div
          className="flex flex-col justify-center items-center text-center pb-8"
        >
          <div className="flex justify-start items-center gap-3">
            <Image src={logo} alt="" />
            <p className="text-2xl font-semibold text-n700 dark:text-n30">
              Hello, I&apos;m Tutor Chatbot
            </p>
          </div>
          <p className="text-n700 pt-4 dark:text-n30">
            How can I make things easier for you?
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primaryColor/30 border-t-primaryColor rounded-full animate-spin"></div>
          </div>
        ) : (
          <ChatBox />
        )}

        <div
          className="flex flex-wrap justify-center items-center max-md:px-4 pt-8 gap-2 lg:gap-3 px-4"
        >
          {chatOptions.map(({ id, name, icon, color, label }) => (
            <button
              key={id}
              className={`flex justify-center items-center gap-1 lg:gap-2 py-1 sm:py-2 px-2 sm:px-3 lg:px-4 3xl:py-3 3xl:px-6 rounded-full border `}
              style={{
                backgroundColor: `rgba(${color},.05)`,
                borderColor: `rgba(${color},.30)`,
              }}
              onClick={() => handleClick(label)}
              disabled={isLoading}
            >
              {React.createElement(icon, {
                className: ` text-sm sm:text-base lg:text-xl`,
                style: {
                  color: `rgba(${color},1)`,
                },
              })}
              <span className="text-[10px] sm:text-xs lg:text-sm font-medium">
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default NewChat;
