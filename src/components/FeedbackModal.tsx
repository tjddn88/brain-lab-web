"use client";

import { useState } from "react";
import { submitFeedback } from "@/services/api";

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSending(true);
    setError("");
    try {
      await submitFeedback(text.trim());
      setDone(true);
      setText("");
      setTimeout(() => onClose(), 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <h2 className="text-white font-bold mb-4">💬 개발자에게 피드백</h2>

        {done ? (
          <p className="text-green-400 text-center py-4">✅ 피드백이 전송되었습니다!</p>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="의견이나 제안을 자유롭게 작성해주세요..."
              maxLength={500}
              rows={4}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none text-sm"
            />
            <div className="flex justify-between items-center mt-1 mb-3">
              {error ? (
                <p className="text-red-400 text-xs">{error}</p>
              ) : (
                <span />
              )}
              <span className="text-slate-600 text-xs ml-auto">
                {text.length}/500
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition text-sm"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={sending || !text.trim()}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "전송 중..." : "보내기"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
