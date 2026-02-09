"use client";

import { Sparkles } from "lucide-react";

const suggestions = [
  {
    icon: "📝",
    title: "Summarize",
    question: "Summarize the main points of my documents",
  },
  {
    icon: "📅",
    title: "Key Dates",
    question: "What are the key dates mentioned in my documents?",
  },
  {
    icon: "👥",
    title: "Important Entities",
    question: "List all important people, organizations, or entities mentioned",
  },
];

export default function SuggestedQuestions({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-purple-300">Quick Start</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item.question)}
            className="group p-4 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700 hover:border-purple-500/50 rounded-xl transition-all duration-200 text-left"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <h4 className="font-medium text-purple-300 group-hover:text-purple-200 mb-1">
              {item.title}
            </h4>
            <p className="text-sm text-gray-400 group-hover:text-gray-300 line-clamp-2">
              {item.question}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
