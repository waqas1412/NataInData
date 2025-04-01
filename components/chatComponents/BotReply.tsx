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
  replyType: string;
  isAnimation?: boolean;
  isStreaming?: boolean;
  setScroll?: (value: boolean) => void;
  hideSuggestions?: () => void;
  replyTime?: string;
}

export default function BotReply({
  replyType,
  isAnimation = false,
  isStreaming = false,
  setScroll = () => {},
  hideSuggestions = () => {},
  replyTime,
}: BotReplyProps) {
  const { emptyQuery: chatHandlerEmptyQuery } = useChatHandler();
  const [showElements, setShowElements] = useState({
    generatingMessage: false,
    firstMessage: false,
    secondMessage: false,
    thirdMessage: false,
    lastMessage: false,
    preview: false,
    botReplyText: false,
  });

  const shouldHideSuggestions = ["video", "audio", "image", "retouch", "data-table", "code"].includes(replyType);
  
  // Determine if this is a regular text reply from OpenAI vs special content
  const isRegularTextReply = !shouldHideSuggestions && 
    typeof replyType === 'string' && 
    replyType.length > 0 && 
    !isStreaming && 
    !isAnimation;

  // First useEffect - handles animation flag
  useEffect(() => {
    if (isAnimation) {
      setScroll(true);
      hideSuggestions();
      // Don't call emptyQuery here - it causes a state change loop
    }
  }, [isAnimation, setScroll, hideSuggestions]);

  // Second useEffect - handles animation timeouts
  useEffect(() => {
    // Skip animation for streaming or regular text responses
    if (isStreaming || isRegularTextReply) {
      // Still notify to scroll for streaming messages
      if (isStreaming) {
        setScroll(true);
      }
      return;
    }

    // Only set up animation timeouts once
    let animationStarted = false;
    
    const timeouts: NodeJS.Timeout[] = [];
    
    if (!animationStarted) {
      animationStarted = true;
      
      timeouts.push(setTimeout(() => setShowElements((prev) => ({ ...prev, generatingMessage: true })), 1000));
      timeouts.push(setTimeout(() => setShowElements((prev) => ({ ...prev, generatingMessage: false })), 2000));
      timeouts.push(setTimeout(() => setShowElements((prev) => ({ ...prev, firstMessage: true })), 3000));
      timeouts.push(setTimeout(() => setShowElements((prev) => ({ ...prev, firstMessage: false })), 4000));
      timeouts.push(setTimeout(() => setShowElements((prev) => ({ ...prev, secondMessage: true })), 5000));
      timeouts.push(setTimeout(() => setShowElements((prev) => ({ ...prev, secondMessage: false })), 6000));
      timeouts.push(setTimeout(() => setShowElements((prev) => ({ ...prev, thirdMessage: true })), 7000));
      timeouts.push(setTimeout(() => setShowElements((prev) => ({ ...prev, thirdMessage: false })), 8000));
      timeouts.push(setTimeout(() => setShowElements((prev) => ({ ...prev, lastMessage: true })), 9000));
      timeouts.push(
        setTimeout(
          () => setShowElements((prev) => ({ ...prev, lastMessage: false })),
          shouldHideSuggestions ? 12000 : 10000
        )
      );
      
      // Move chatHandlerEmptyQuery to a separate, non-dependency tracked variable
      const emptyChatQuery = chatHandlerEmptyQuery;
      timeouts.push(setTimeout(() => emptyChatQuery(), 12500));
    }
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  // Remove chatHandlerEmptyQuery from dependencies to prevent infinite loops
  }, [shouldHideSuggestions, isStreaming, isRegularTextReply, setScroll]);

  return (
    <div className="flex justify-start items-start gap-1 sm:gap-3 w-full px-4">
      <Image src={logo} alt="" className="max-sm:size-5 object-cover" />
      <div className="flex flex-col justify-start items-start gap-3 flex-1">
        <p className="text-xs text-n100">Tutor Chatbot, {isStreaming ? new Date().toLocaleTimeString() : replyTime || new Date().toLocaleTimeString()}</p>
        <div className="text-sm bg-primaryColor/5 py-3 px-5 border border-primaryColor/20 rounded-lg w-full sm:max-w-[90%]">
          {isStreaming ? (
            // Streaming content display
            <div className="whitespace-pre-wrap">
              {replyType}
              <span className="inline-block w-2 h-4 ml-1 bg-primaryColor/70 animate-pulse"></span>
            </div>
          ) : isRegularTextReply ? (
            // Regular text reply display
            <div className="whitespace-pre-wrap">{replyType}</div>
          ) : (
            // Animation or special content display
            <>
              <div className="flex justify-start items-center gap-1">
                <PiChecks className="text-successColor text-xl" />
                <p>
                  {isAnimation ? (
                    <TypeAnimation
                      sequence={["Scanning the data..."]}
                      speed={20}
                      cursor={false}
                    />
                  ) : (
                    "Scanning the data..."
                  )}
                </p>
              </div>
              {showElements.generatingMessage && (
                <div className="flex justify-start items-center gap-1 pt-3">
                  <div className={`${isAnimation ? "circle" : ""}`}>
                    <PiSparkle className="text-secondaryColor text-xl " />
                  </div>
                  <p>
                    {isAnimation ? (
                      <TypeAnimation
                        sequence={["Generating answers for you..."]}
                        speed={50}
                        cursor={false}
                        repeat={2}
                      />
                    ) : (
                      "Generating answers for you..."
                    )}
                  </p>
                </div>
              )}

              {showElements.botReplyText && (
                <p className="pt-5">
                  {isAnimation ? (
                    <TypeAnimation
                      splitter={(str) => str.split(/(?= )/)}
                      sequence={[
                        shouldHideSuggestions
                          ? generalText
                          : "Please Click on the commands to generate pre defined reply:",
                      ]}
                      speed={20}
                      cursor={false}
                    />
                  ) : shouldHideSuggestions ? (
                    generalText
                  ) : (
                    "Please Click on the commands to generate pre defined reply:"
                  )}
                </p>
              )}

              {replyType === "video" && (
                <BotVideoReply show={showElements.preview} />
              )}
              {replyType === "audio" && (
                <BotAudioClipReply show={showElements.preview} />
              )}
              {replyType === "image" && (
                <BotImageReply show={showElements.preview} />
              )}
              {replyType === "retouch" && (
                <BotRetouchImageReply show={showElements.preview} />
              )}
              {replyType === "data-table" && (
                <BotTableReply show={showElements.preview} />
              )}
              {replyType === "code" && <BotCodeReply show={showElements.preview} />}

              {!shouldHideSuggestions && (
                <BotSuggestionReply show={showElements.preview} />
              )}

              {showElements.lastMessage && (
                <p className="pt-5">
                  {isAnimation ? (
                    <TypeAnimation
                      splitter={(str) => str.split(/(?= )/)}
                      sequence={[
                        "Would you like me to refine this further or add script elements? 🚀",
                      ]}
                      speed={20}
                      cursor={false}
                    />
                  ) : (
                    "Would you like me to refine this further or add script elements? 🚀"
                  )}
                </p>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end items-center gap-2 cursor-pointer">
          <PiSpeakerHigh />
          <PiThumbsUp />
          <PiThumbsDown />
          <PiCopy />
          <PiArrowsCounterClockwise />
          <PiShareFat />
        </div>
      </div>
    </div>
  );
}
