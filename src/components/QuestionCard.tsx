"use client";

import { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  onSelect: (index: number) => void;
}

const LABELS = ["A", "B", "C", "D"];

export default function QuestionCard({ question, onSelect }: QuestionCardProps) {
  return (
    <div className="space-y-3">
      {question.correctRate !== null && (
        <div className="flex justify-end">
          <span className="text-xs text-slate-500">
            정답율 <span className="text-slate-400 font-medium">{question.correctRate}%</span>
          </span>
        </div>
      )}

      <p className="text-white text-base font-medium leading-relaxed">
        {question.content}
      </p>

      <div className="space-y-2">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className="w-full text-left px-4 py-3 rounded-xl border border-slate-600 bg-slate-800 text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white active:scale-[0.98] transition font-medium"
          >
            <span className="inline-block w-7 h-7 rounded-full text-sm text-center leading-7 mr-3 font-bold bg-slate-600 text-slate-300">
              {LABELS[index]}
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
