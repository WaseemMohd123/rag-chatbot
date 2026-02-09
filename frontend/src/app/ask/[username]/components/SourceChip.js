"use client";

import { FileText } from "lucide-react";

export default function SourceChip({ filename, page }) {
  return (
    <button
      className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-800/50 hover:bg-purple-700/50 text-purple-200 rounded-full text-xs font-medium transition-colors border border-purple-600/30"
      title={`Source: ${filename}${page ? `, Page ${page}` : ""}`}
    >
      <FileText className="w-3 h-3" />
      <span>{filename}</span>
      {page && <span className="text-purple-400">p.{page}</span>}
    </button>
  );
}
