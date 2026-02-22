"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuestions, submitResult } from "@/services/api";
import { Question } from "@/types";
import QuestionCard from "@/components/QuestionCard";
import Timer from "@/components/Timer";

const QUESTION_SECONDS = 10;
const FEEDBACK_SECONDS = 3;

const CATEGORY_CONFIG: Record<string, { emoji: string; desc: string }> = {
  수리논리: { emoji: "🔢", desc: "수열과 수리 추론 능력을 측정합니다" },
  언어유추: { emoji: "🔤", desc: "언어 관계와 유추 능력을 측정합니다" },
  인지반사: { emoji: "⚡", desc: "직관적 사고와 판단력을 측정합니다" },
  공간도형: { emoji: "🔷", desc: "공간 지각과 도형 추론 능력을 측정합니다" },
  패턴논리: { emoji: "🧩", desc: "패턴 인식과 논리적 사고를 측정합니다" },
};

type Phase = "loading" | "intro" | "question" | "feedback" | "submitting";

export default function TestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [error, setError] = useState("");

  const startTimeRef = useRef<number>(0);
  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);
  const currentIndexRef = useRef(currentIndex);
  const phaseRef = useRef(phase);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    const nickname = sessionStorage.getItem("nickname");
    if (!nickname) { router.replace("/"); return; }
    getQuestions()
      .then((qs) => {
        setQuestions(qs);
        questionsRef.current = qs;
        startTimeRef.current = Date.now();
        setPhase("intro");
      })
      .catch(() => setError("문제를 불러오지 못했습니다."));
  }, [router]);

  const isNewCategory = (idx: number, qs: Question[]) =>
    idx === 0 || qs[idx].category !== qs[idx - 1].category;

  const categoryIndexOf = (idx: number, qs: Question[]) => {
    const category = qs[idx].category;
    const categories = [...new Set(qs.map((q) => q.category))];
    return categories.indexOf(category);
  };

  const handleSubmit = useCallback(async () => {
    setPhase("submitting");
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    const nickname = sessionStorage.getItem("nickname") || "익명";
    const qs = questionsRef.current;
    const ans = answersRef.current;
    const answerItems = qs.map((q) => ({
      questionId: q.id,
      answer: ans.get(q.id) ?? -1,
    }));
    try {
      const result = await submitResult(nickname, answerItems, elapsed);
      sessionStorage.setItem("lastResult", JSON.stringify(result));
      router.push(`/result/${result.id}`);
    } catch {
      setError("결과 저장에 실패했습니다. 다시 시도해주세요.");
    }
  }, [router]);

  // 피드백 3초 후 자동 다음으로
  const advanceFromFeedback = useCallback(() => {
    const qs = questionsRef.current;
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx >= qs.length) {
      handleSubmit();
      return;
    }
    setCurrentIndex(nextIdx);
    setSelectedAnswer(null);
    setPhase(isNewCategory(nextIdx, qs) ? "intro" : "question");
  }, [handleSubmit]);

  useEffect(() => {
    if (phase !== "feedback") return;
    const t = setTimeout(advanceFromFeedback, FEEDBACK_SECONDS * 1000);
    return () => clearTimeout(t);
  }, [phase, advanceFromFeedback]);

  // 답 제출 (선택 즉시 or 시간 초과)
  const submitAnswer = useCallback((answerIndex: number) => {
    if (phaseRef.current !== "question") return;
    const qs = questionsRef.current;
    const idx = currentIndexRef.current;
    const q = qs[idx];
    const correct = answerIndex === q.answer;
    setSelectedAnswer(answerIndex);
    setAnswers((prev) => new Map(prev).set(q.id, answerIndex));
    setLastCorrect(correct);
    setPhase("feedback");
  }, []);

  const handleTimeUp = useCallback(() => {
    // 시간 초과 = 미응답(-1) = 오답
    submitAnswer(-1);
  }, [submitAnswer]);

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="text-4xl mb-4 animate-spin">⟳</div>
        <p className="text-slate-400">문제를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => router.push("/")} className="text-indigo-400 underline">
          처음으로
        </button>
      </div>
    );
  }

  // ── 카테고리 인트로 화면 ──────────────────────────────────────────
  if (phase === "intro") {
    const category = questions[currentIndex].category;
    const catIdx = categoryIndexOf(currentIndex, questions);
    const config = CATEGORY_CONFIG[category] ?? { emoji: "📝", desc: "" };

    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6">
        <div className="w-full bg-slate-800 rounded-2xl p-8 text-center space-y-5">
          <div className="text-sm text-slate-500 font-medium">
            {catIdx + 1} / {Object.keys(CATEGORY_CONFIG).length} 카테고리
          </div>
          <div className="text-6xl">{config.emoji}</div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{category}</h2>
            <p className="text-slate-400 text-sm">{config.desc}</p>
          </div>
          <div className="text-slate-500 text-sm">문제 3개 · 문제당 10초</div>
          <button
            onClick={() => setPhase("question")}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition text-lg"
          >
            시작하기
          </button>
        </div>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <p className="text-slate-400">결과 저장 중...</p>
      </div>
    );
  }

  // ── 문제 / 피드백 화면 ─────────────────────────────────────────────
  const question = questions[currentIndex];
  const isFeedback = phase === "feedback";

  // 현재 카테고리 내 몇 번째 문제인지 (1~3)
  const catStart = questions.findIndex((q) => q.category === question.category);
  const questionInCat = currentIndex - catStart + 1;

  return (
    <div className="flex flex-col flex-1 px-4 py-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm">{question.category}</span>
          <span className="text-slate-600 text-sm">·</span>
          <span className="text-white font-bold">{questionInCat}</span>
          <span className="text-slate-500 text-sm">/ 3</span>
        </div>
        {phase === "question" && (
          <Timer key={currentIndex} totalSeconds={QUESTION_SECONDS} onTimeUp={handleTimeUp} />
        )}
        {isFeedback && (
          <span className={`font-bold text-lg ${lastCorrect ? "text-green-400" : "text-red-400"}`}>
            {lastCorrect ? "정답! ✓" : "오답 ✗"}
          </span>
        )}
      </div>

      {/* 전체 진행 바 */}
      <div className="w-full bg-slate-700 rounded-full h-1 mb-3">
        <div
          className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 문제 */}
      <QuestionCard
        question={question}
        selected={selectedAnswer}
        onSelect={submitAnswer}
        feedback={isFeedback ? { correctAnswer: question.answer } : null}
      />

      {/* 피드백 메시지 */}
      {isFeedback && !lastCorrect && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
          <span className="text-red-400 text-sm">
            정답:{" "}
            <span className="font-bold text-red-300">
              {question.options[question.answer]}
            </span>
          </span>
        </div>
      )}

      {/* 피드백 안내 */}
      {isFeedback && (
        <div className="text-center text-slate-500 text-xs mt-2">
          {FEEDBACK_SECONDS}초 후 자동으로 넘어갑니다...
        </div>
      )}
    </div>
  );
}
