"use client";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="px-4 py-3 rounded-2xl max-w-2xl bg-gray-700 dark:bg-gray-700 light:bg-gray-200 text-purple-200 light:text-purple-800">
        <div className="flex items-center space-x-2">
          <span className="mt-1">🤖</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
