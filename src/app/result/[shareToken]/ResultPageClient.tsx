"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getResult } from "@/services/api";
import { Question, QuestionFeedback, ResultResponse } from "@/types";
import ResultCard from "@/components/ResultCard";
import { analytics } from "@/lib/analytics";
import { copyToClipboard } from "@/lib/clipboard";
import { OPTION_LABELS, CAT_ORDER } from "@/lib/utils";
import { kakaoShare } from "@/lib/kakao";

function AnswerReview({
  feedback,
  questions,
}: {
  feedback: QuestionFeedback[];
  questions: Question[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const reviewTrackedRef = useRef(false);
  const questionMap = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions]
  );

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
                onClick={() => {
                  if (!isOpen && !reviewTrackedRef.current) {
                    analytics.answerReviewOpen();
                    reviewTrackedRef.current = true;
                  }
                  setExpanded(isOpen ? null : idx);
                }}
                className={`w-full text-left px-3 py-2 flex items-center gap-3 transition ${
                  item.isCorrect ? "bg-green-500/10" : "bg-red-500/10"
                }`}
              >
                <span
                  className={`text-lg ${
                    item.isCorrect ? "text-green-400" : "text-red-400"
                  }`}
                >
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
                          <span className="font-bold">{OPTION_LABELS[optIdx]}</span>
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="ml-auto text-xs">정답</span>
                          )}
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
                  {q.explanation && (
                    <p className="text-slate-400 text-xs leading-relaxed border-t border-slate-700 pt-2">
                      💡 {q.explanation}
                    </p>
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

export default function ResultPageClient({ shareToken }: { shareToken: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shared, setShared] = useState(false);
  const [isOwn, setIsOwn] = useState(false);
  const [showChallengeIntro, setShowChallengeIntro] = useState(false);
  const [iqDelta, setIqDelta] = useState<number | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem("lastResult");
    const cachedQuestions = sessionStorage.getItem("lastQuestions");

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as ResultResponse;
        if (parsed.shareToken === shareToken) {
          setResult(parsed);
          setIsOwn(true);
          if (cachedQuestions) setQuestions(JSON.parse(cachedQuestions));
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }
    }

    getResult(shareToken)
      .then((r) => {
        setResult(r);
        setShowChallengeIntro(true);
        analytics.resultViewShared(r.estimatedIq);
        setLoading(false);
      })
      .catch(() => {
        setError("결과를 찾을 수 없습니다.");
        setLoading(false);
      });
  }, [shareToken]);

  // IQ 추이 (본인 결과만)
  useEffect(() => {
    if (!result || !isOwn) return;
    try {
      const raw = localStorage.getItem("iqHistory");
      const history: { iq: number; token: string }[] = raw ? JSON.parse(raw) : [];
      const prev = [...history].reverse().find((h) => h.token !== result.shareToken);
      if (prev) setIqDelta(result.estimatedIq - prev.iq);
      if (!history.some((h) => h.token === result.shareToken)) {
        history.push({ iq: result.estimatedIq, token: result.shareToken });
        if (history.length > 10) history.shift();
        localStorage.setItem("iqHistory", JSON.stringify(history));
      }
    } catch {
      // ignore
    }
  }, [result, isOwn]);

  const handleShare = async () => {
    const url = `${window.location.origin}/result/${shareToken}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${result?.nickname}님의 IQ 결과 | BrainLab`,
          url,
        });
      } catch {
        // 사용자 취소
      }
    } else {
      await copyToClipboard(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const categoryStats = useMemo(() => {
    if (!result?.answerFeedback?.length) return null;
    return CAT_ORDER.map((cat) => {
      const items = result.answerFeedback!.filter((f) => f.category === cat);
      if (!items.length) return null;
      return { cat, correct: items.filter((f) => f.isCorrect).length, total: items.length };
    }).filter(Boolean);
  }, [result]);

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

  // 친구 도전 인트로
  if (showChallengeIntro) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6">
        <div className="w-full bg-slate-800 rounded-2xl p-8 text-center space-y-4 border border-slate-700">
          <div className="text-4xl">🧠</div>
          <h2 className="text-white font-bold text-xl">
            {result.nickname}님 IQ 넘기 도전!
          </h2>
          <div className="text-6xl font-black text-indigo-400">{result.estimatedIq}</div>
          <p className="text-slate-400 text-sm">
            상위 {result.topPercent}% · 정답 {result.correctCount}/15
          </p>
          <p className="text-slate-500 text-sm">나의 IQ는 얼마일까요?</p>
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                analytics.challengeClick();
                sessionStorage.removeItem("nickname");
                router.push("/");
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition"
            >
              도전하기
            </button>
            <button
              onClick={() => setShowChallengeIntro(false)}
              className="w-full text-slate-400 hover:text-white py-3 transition text-sm"
            >
              결과 자세히 보기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-8">
      <h1 className="text-center text-white font-bold text-xl mb-6">🧠 테스트 결과</h1>

      <ResultCard result={result} iqDelta={iqDelta} />

      {/* 공유 버튼 */}
      <div className="mt-4 space-y-2">
        <button
          onClick={() => {
            analytics.resultShareClick();
            kakaoShare({
              nickname: result.nickname,
              estimatedIq: result.estimatedIq,
              topPercent: result.topPercent,
              shareToken,
            });
          }}
          className="w-full bg-[#FEE500] hover:bg-[#F6DC00] text-[#191919] font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.582 2 11c0 2.713 1.57 5.106 3.964 6.627L5 21l3.682-1.932C9.77 19.34 10.868 19.5 12 19.5c5.523 0 10-3.582 10-8s-4.477-8-10-8z"/>
          </svg>
          카카오톡으로 공유하기
        </button>
        <button
          onClick={handleShare}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-4 rounded-xl transition flex items-center justify-center gap-2"
        >
          {shared ? "✅ 링크가 복사되었습니다!" : "🔗 링크 복사"}
        </button>
      </div>

      {/* 카테고리별 점수 */}
      {categoryStats && categoryStats.length > 0 && (
        <div className="mt-4 bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <h3 className="text-white font-bold mb-3 text-sm">📊 카테고리별 결과</h3>
          <div className="space-y-2">
            {categoryStats.map(
              (s) =>
                s && (
                  <div key={s.cat} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-14 flex-shrink-0">
                      {s.cat}
                    </span>
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${(s.correct / s.total) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold w-8 text-right ${
                        s.correct === s.total
                          ? "text-green-400"
                          : s.correct === 0
                          ? "text-red-400"
                          : "text-white"
                      }`}
                    >
                      {s.correct}/{s.total}
                    </span>
                  </div>
                )
            )}
          </div>
        </div>
      )}

      {/* 오답노트 - 본인 결과이고 피드백 있을 때만 표시 */}
      {result.answerFeedback && result.answerFeedback.length > 0 && questions && (
        <div className="mt-4">
          <AnswerReview feedback={result.answerFeedback} questions={questions} />
        </div>
      )}

      <div className="mt-4 space-y-3">
        <button
          onClick={() => {
            analytics.retakeClick();
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
