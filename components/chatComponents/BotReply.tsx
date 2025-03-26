import React, { useEffect, useState } from "react";
import BotVideoReply from "./BotVideoReply";
import BotAudioClipReply from "./BotAudioClipReply";
import BotImageReply from "./BotImageReply";
import BotRetouchImageReply from "./BotRetouchImageReply";
import BotTableReply from "./BotTableReply";
import { TypeAnimation } from "react-type-animation";
import logo from "@/public/images/favicon.png";
import {
  PiArrowsCounterClockwise,
  PiChecks,
  PiCopy,
  PiShareFat,
  PiSparkle,
  PiSpeakerHigh,
  PiThumbsDown,
  PiThumbsUp,
} from "react-icons/pi";
import Image from "next/image";
import BotCodeReply from "./BotCodeReply";
import { useChatHandler } from "@/stores/chatList";
import BotSuggestionReply from "./BotSuggestionReply";

const generalText =
  "Based on the gender identified in the uploaded data, the reply has been automatically generated with a appropriate data. However, you have the option to customize your reply by selecting from the available options below.";

interface BotReplyProps {
  reply: string;
  replyType: string;
  isAnimation: boolean;
  setScroll: (value: boolean) => void;
  emptyQuery: () => void;
  hideSuggestions: () => void;
}

interface ShowElementsState {
  generatingMessage: boolean;
  generatingDots: boolean;
  generatingText: boolean;
  generatingCode: boolean;
  generatingImage: boolean;
  generatingVideo: boolean;
  generatingAudio: boolean;
  generatingDataTable: boolean;
  generatingRetouch: boolean;
  generatingShare: boolean;
  generatingDownload: boolean;
  generatingCopy: boolean;
  botReplyText: boolean;
  preview: boolean;
  lastMessage: boolean;
}

export default function BotReply({ 
  reply, 
  replyType, 
  isAnimation,
  setScroll,
  emptyQuery,
  hideSuggestions
}: BotReplyProps) {
  const { emptyQuery: chatHandlerEmptyQuery } = useChatHandler();
  const [showElements, setShowElements] = useState<ShowElementsState>({
    generatingMessage: false,
    generatingDots: false,
    generatingText: false,
    generatingCode: false,
    generatingImage: false,
    generatingVideo: false,
    generatingAudio: false,
    generatingDataTable: false,
    generatingRetouch: false,
    generatingShare: false,
    generatingDownload: false,
    generatingCopy: false,
    botReplyText: false,
    preview: false,
    lastMessage: false,
  });

  const isCodeBlock = [
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "csharp",
    "php",
    "ruby",
    "go",
    "rust",
    "swift",
    "kotlin",
    "scala",
    "r",
    "dart",
    "html",
    "css",
    "sql",
    "shell",
    "bash",
    "powershell",
    "yaml",
    "json",
    "markdown",
    "text",
    "code",
  ].includes(replyType);

  useEffect(() => {
    if (isAnimation) {
      setScroll(true);
      chatHandlerEmptyQuery();
      hideSuggestions();
    }
  }, [isAnimation, setScroll, chatHandlerEmptyQuery, hideSuggestions]);

  useEffect(() => {
    const timeouts = [
      setTimeout(() => setShowElements({ ...showElements, generatingMessage: true }), 1000),
      setTimeout(() => setShowElements({ ...showElements, generatingMessage: true, generatingDots: true }), 2000),
      setTimeout(() => setShowElements({ ...showElements, generatingMessage: true, generatingDots: true, generatingText: true }), 3000),
      setTimeout(() => setShowElements({ ...showElements, generatingMessage: true, generatingDots: true, generatingText: true, generatingCode: true }), 4000),
      setTimeout(() => setShowElements({ ...showElements, generatingMessage: true, generatingDots: true, generatingText: true, generatingCode: true, generatingImage: true }), 5000),
      setTimeout(() => setShowElements({ ...showElements, generatingMessage: true, generatingDots: true, generatingText: true, generatingCode: true, generatingImage: true, generatingVideo: true }), 6000),
      setTimeout(() => setShowElements({ ...showElements, generatingMessage: true, generatingDots: true, generatingText: true, generatingCode: true, generatingImage: true, generatingVideo: true, generatingAudio: true }), 7000),
      setTimeout(() => setShowElements({ ...showElements, generatingMessage: true, generatingDots: true, generatingText: true, generatingCode: true, generatingImage: true, generatingVideo: true, generatingAudio: true, generatingDataTable: true }), 8000),
      setTimeout(() => setShowElements({ ...showElements, generatingMessage: true, generatingDots: true, generatingText: true, generatingCode: true, generatingImage: true, generatingVideo: true, generatingAudio: true, generatingDataTable: true, generatingRetouch: true }), 9000),
      setTimeout(() => setShowElements({ ...showElements, generatingMessage: true, generatingDots: true, generatingText: true, generatingCode: true, generatingImage: true, generatingVideo: true, generatingAudio: true, generatingDataTable: true, generatingRetouch: true, generatingShare: true }), 10000),
      setTimeout(() => setShowElements({ ...showElements, generatingMessage: true, generatingDots: true, generatingText: true, generatingCode: true, generatingImage: true, generatingVideo: true, generatingAudio: true, generatingDataTable: true, generatingRetouch: true, generatingShare: true, generatingDownload: true }), 11000),
      setTimeout(() => setShowElements({ ...showElements, generatingMessage: true, generatingDots: true, generatingText: true, generatingCode: true, generatingImage: true, generatingVideo: true, generatingAudio: true, generatingDataTable: true, generatingRetouch: true, generatingShare: true, generatingDownload: true, generatingCopy: true }), 12000),
      setTimeout(() => chatHandlerEmptyQuery(), 12500),
    ];
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isAnimation, setScroll, chatHandlerEmptyQuery, hideSuggestions]);
  return (
    <div className="flex justify-start items-start gap-1 sm:gap-3  w-full max-w-[90%]  ">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-white"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium text-gray-900">Tutor Chatbot</div>
            <div className="text-xs text-gray-500">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {showElements.botReplyText && (
            <div className="text-sm text-gray-700">
              {reply}
            </div>
          )}
          {showElements.preview && (
            <div className="text-sm text-gray-700">
              {reply}
            </div>
          )}
          {showElements.lastMessage && (
            <div className="text-sm text-gray-700">
              {reply}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
