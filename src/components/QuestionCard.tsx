"use client";

import { Question } from "@/types";
import { OPTION_LABELS } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  displayOptions: string[];
  onSelect: (index: number) => void;
}

function obscureText(text: string): string {
  return text.split("").join("\u200B");
}

export default function QuestionCard({
  question,
  displayOptions,
  onSelect,
}: QuestionCardProps) {
  return (
    <div
      className="space-y-3 select-none"
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {question.correctRate !== null && (
        <div className="flex justify-end">
          <span className="text-xs text-slate-500">
            정답율{" "}
            <span className="text-slate-400 font-medium">
              {question.correctRate}%
            </span>
          </span>
        </div>
      )}

      <p className="text-white text-base font-medium leading-relaxed">
        {obscureText(question.content)}
      </p>

      <div className="space-y-2">
        {displayOptions.map((option, index) => (
          <button
            key={option}
            onClick={() => onSelect(index)}
            className="w-full text-left px-4 py-3 rounded-xl border border-slate-600 bg-slate-800 text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white active:scale-[0.98] transition font-medium"
          >
            <span className="inline-block w-7 h-7 rounded-full text-sm text-center leading-7 mr-3 font-bold bg-slate-600 text-slate-300">
              {OPTION_LABELS[index]}
            </span>
            {obscureText(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
