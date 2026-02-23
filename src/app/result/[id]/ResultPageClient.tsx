"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getResult } from "@/services/api";
import { Question, QuestionFeedback, ResultResponse } from "@/types";
import ResultCard from "@/components/ResultCard";

const LABELS = ["A", "B", "C", "D"];

function AnswerReview({
  feedback,
  questions,
}: {
  feedback: QuestionFeedback[];
  questions: Question[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
      <h3 className="text-white font-bold mb-3 text-sm">📋 문제별 결과</h3>
      <div className="space-y-2">
        {feedback.map((item, idx) => {
          const q = questionMap.get(item.questionId);
          const isOpen = expanded === idx;
          return (
            <div key={item.questionId} className="rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : idx)}
                className={`w-full text-left px-3 py-2 flex items-center gap-3 transition ${
                  item.isCorrect ? "bg-green-500/10" : "bg-red-500/10"
                }`}
              >
                <span className={`text-lg ${item.isCorrect ? "text-green-400" : "text-red-400"}`}>
                  {item.isCorrect ? "✓" : "✗"}
                </span>
                <span className="text-slate-400 text-xs flex-1 truncate">
                  {idx + 1}. {q?.content ?? "문제"}
                </span>
                <span className="text-slate-600 text-xs">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && q && (
                <div className="bg-slate-900/50 px-3 py-3 space-y-2">
                  <p className="text-white text-sm leading-relaxed">{q.content}</p>
                  <div className="space-y-1">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === item.correctAnswer;
                      const isUserAnswer = optIdx === item.userAnswer;
                      return (
                        <div
                          key={optIdx}
                          className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                            isCorrect
                              ? "bg-green-500/20 border border-green-500/40 text-green-300"
                              : isUserAnswer && !isCorrect
                              ? "bg-red-500/20 border border-red-500/40 text-red-300"
                              : "text-slate-500"
                          }`}
                        >
                          <span className="font-bold">{LABELS[optIdx]}</span>
                          <span>{opt}</span>
                          {isCorrect && <span className="ml-auto text-xs">정답</span>}
                          {isUserAnswer && !isCorrect && (
                            <span className="ml-auto text-xs">내 답</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {item.userAnswer === -1 && (
                    <p className="text-slate-500 text-xs">시간 초과 (미응답)</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ResultPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 방금 완료된 결과는 sessionStorage에서 먼저 확인
    const cached = sessionStorage.getItem("lastResult");
    const cachedQuestions = sessionStorage.getItem("lastQuestions");

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as ResultResponse;
        if (String(parsed.id) === id) {
          setResult(parsed);
          if (cachedQuestions) setQuestions(JSON.parse(cachedQuestions));
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }
    }

    getResult(id)
      .then((r) => {
        setResult(r);
        setLoading(false);
      })
      .catch(() => {
        setError("결과를 찾을 수 없습니다.");
        setLoading(false);
      });
  }, [id]);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/result/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <p className="text-slate-400">결과 불러오는 중...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6">
        <p className="text-red-400 mb-4">{error || "오류가 발생했습니다."}</p>
        <button onClick={() => router.push("/")} className="text-indigo-400 underline">
          처음으로
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-8">
      <h1 className="text-center text-white font-bold text-xl mb-6">
        🧠 테스트 결과
      </h1>

      <ResultCard result={result} />

      {/* 오답노트 - 본인 결과이고 피드백 있을 때만 표시 */}
      {result.answerFeedback?.length > 0 && questions && (
        <div className="mt-4">
          <AnswerReview feedback={result.answerFeedback} questions={questions} />
        </div>
      )}

      <div className="mt-6 space-y-3">
        <button
          onClick={handleCopyLink}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-4 rounded-xl transition flex items-center justify-center gap-2"
        >
          {copied ? "✅ 링크가 복사되었습니다!" : "🔗 결과 링크 복사"}
        </button>
        <button
          onClick={() => {
            sessionStorage.removeItem("nickname");
            sessionStorage.removeItem("lastResult");
            sessionStorage.removeItem("lastQuestions");
            router.push("/");
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition"
        >
          다시 테스트하기
        </button>
        <button
          onClick={() => router.push("/ranking")}
          className="w-full text-slate-400 hover:text-white py-3 transition"
        >
          🏆 전체 순위 보기
        </button>
      </div>
    </div>
  );
}
