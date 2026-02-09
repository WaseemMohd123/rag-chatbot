"use client";

import { Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { useState } from "react";

export default function MessageActions({ text }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'up' | 'down' | null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleFeedback = (type) => {
    setFeedback(feedback === type ? null : type);
    // TODO: Send feedback to backend
    console.log(`Feedback: ${type}`);
  };

  return (
    <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-600 transition-colors"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      <button
        onClick={() => handleFeedback("up")}
        className={`p-1.5 rounded-lg transition-colors ${
          feedback === "up"
            ? "bg-green-600/50 text-green-400"
            : "bg-gray-700/50 hover:bg-gray-600 text-gray-400"
        }`}
        title="Good response"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => handleFeedback("down")}
        className={`p-1.5 rounded-lg transition-colors ${
          feedback === "down"
            ? "bg-red-600/50 text-red-400"
            : "bg-gray-700/50 hover:bg-gray-600 text-gray-400"
        }`}
        title="Bad response"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
    </div>
  );
}
