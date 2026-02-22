"use client";

import { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  selected: number | null;
  onSelect: (index: number) => void;
  feedback?: { correctAnswer: number } | null;
}

const LABELS = ["A", "B", "C", "D"];

export default function QuestionCard({
  question,
  selected,
  onSelect,
  feedback = null,
}: QuestionCardProps) {
  const getButtonStyle = (index: number) => {
    if (feedback) {
      if (index === feedback.correctAnswer) {
        return "border-green-500 bg-green-500/20 text-white";
      }
      if (index === selected && index !== feedback.correctAnswer) {
        return "border-red-500 bg-red-500/20 text-white";
      }
      return "border-slate-700 bg-slate-800/50 text-slate-500";
    }
    return selected === index
      ? "border-indigo-500 bg-indigo-500/20 text-white"
      : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-400 hover:bg-slate-700";
  };

  const getLabelStyle = (index: number) => {
    if (feedback) {
      if (index === feedback.correctAnswer) return "bg-green-500 text-white";
      if (index === selected && index !== feedback.correctAnswer) return "bg-red-500 text-white";
      return "bg-slate-700 text-slate-500";
    }
    return selected === index
      ? "bg-indigo-500 text-white"
      : "bg-slate-600 text-slate-300";
  };

  return (
    <div className="space-y-4">
      {/* 정답율 */}
      {question.correctRate !== null && (
        <div className="flex justify-end">
          <span className="text-xs text-slate-500">
            정답율 <span className="text-slate-400 font-medium">{question.correctRate}%</span>
          </span>
        </div>
      )}

      <p className="text-white text-lg font-medium leading-relaxed">
        {question.content}
      </p>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !feedback && onSelect(index)}
            disabled={!!feedback}
            className={`w-full text-left px-4 py-4 rounded-xl border transition font-medium ${getButtonStyle(index)}`}
          >
            <span
              className={`inline-block w-7 h-7 rounded-full text-sm text-center leading-7 mr-3 font-bold ${getLabelStyle(index)}`}
            >
              {LABELS[index]}
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
