import React, { useState } from "react";
import { PiCopy, PiCheckCircle } from "react-icons/pi";

type MyReplyProps = {
  replyTime: string;
  replyText: string;
};

function MyReply({ replyTime, replyText }: MyReplyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(replyText);
    setCopied(true);
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col justify-end items-end gap-3 px-4">
      <p className="text-xs text-n100">{replyTime}</p>
      <div className="text-sm bg-infoColor/5 py-3 px-5 border border-infoColor/20 rounded-lg max-w-[75%]">
        <p className="">{replyText}</p>
      </div>
      <div className="flex justify-end items-center gap-2">
        <button 
          onClick={handleCopy} 
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          title="Copy to clipboard"
        >
          {copied ? 
            <PiCheckCircle className="text-successColor" /> : 
            <PiCopy />
          }
        </button>
      </div>
    </div>
  );
}

export default MyReply;
