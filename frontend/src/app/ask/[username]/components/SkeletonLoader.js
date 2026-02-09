"use client";

export default function SkeletonLoader({ stage = "searching" }) {
  return (
    <div className="flex justify-start">
      <div className="px-4 py-3 rounded-2xl bg-gray-700 max-w-md">
        <div className="flex items-center space-x-2 mb-2">
          <span>🤖</span>
          <span className="text-purple-300 text-sm font-medium">
            {stage === "searching" ? "Searching knowledge base..." : "Thinking..."}
          </span>
        </div>
        
        {/* Skeleton bars */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-600 rounded-full animate-pulse w-full"></div>
          <div className="h-3 bg-gray-600 rounded-full animate-pulse w-4/5"></div>
          <div className="h-3 bg-gray-600 rounded-full animate-pulse w-3/5"></div>
        </div>
        
        {/* Pulsing dots */}
        <div className="flex space-x-1 mt-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
}
