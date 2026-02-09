"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Star } from "lucide-react";
import { format } from "date-fns";
import MessageActions from "./MessageActions";
import SourceChip from "./SourceChip";

export default function ChatBubble({ message, isUser, sources = [], timestamp, isBookmarked, onToggleBookmark, messageIndex }) {
  if (isUser) {
    return (
      <div className="flex justify-end group">
        <div className="relative">
          <div className="px-4 py-2 rounded-2xl max-w-md bg-purple-600 text-white flex items-start space-x-2">
            <span>🧑</span>
            <span>{message}</span>
          </div>
          <div className="flex items-center justify-end space-x-2 mt-1">
            {timestamp && (
              <span className="text-xs text-gray-500">
                {format(new Date(timestamp), "h:mm a")}
              </span>
            )}
            <button
              onClick={() => onToggleBookmark && onToggleBookmark(messageIndex)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title={isBookmarked ? "Remove bookmark" : "Bookmark message"}
            >
              <Star
                className={`w-4 h-4 ${isBookmarked ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start group">
      <div className="relative max-w-2xl">
        <div className="px-4 py-3 rounded-2xl bg-gray-700 text-purple-200">
          <div className="flex items-start space-x-2">
            <span className="mt-1">🤖</span>
            <div className="flex-1 overflow-hidden">
              {/* Markdown Content */}
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Code blocks with syntax highlighting
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg !bg-gray-800 !mt-2 !mb-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-300 text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    // Styled lists
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
                    ),
                    // Styled headers
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold text-purple-300 mt-3 mb-2">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-semibold text-purple-300 mt-3 mb-2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-semibold text-purple-300 mt-2 mb-1">{children}</h3>
                    ),
                    // Styled paragraphs
                    p: ({ children }) => <p className="my-1.5">{children}</p>,
                    // Styled links
                    a: ({ children, href }) => (
                      <a href={href} className="text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    // Styled blockquotes
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-purple-500 pl-4 my-2 italic text-gray-300">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message}
                </ReactMarkdown>
              </div>

              {/* Source Citations */}
              {sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-600">
                  {sources.map((source, idx) => (
                    <SourceChip
                      key={idx}
                      filename={source.filename}
                      page={source.page}
                    />
                  ))}
                </div>
              )}

              {/* Message Actions */}
              <MessageActions text={message} />
            </div>
          </div>
        </div>
        
        {/* Timestamp and Bookmark */}
        <div className="flex items-center justify-start space-x-2 mt-1 ml-8">
          {timestamp && (
            <span className="text-xs text-gray-500">
              {format(new Date(timestamp), "h:mm a")}
            </span>
          )}
          <button
            onClick={() => onToggleBookmark && onToggleBookmark(messageIndex)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            title={isBookmarked ? "Remove bookmark" : "Bookmark message"}
          >
            <Star
              className={`w-4 h-4 ${isBookmarked ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
