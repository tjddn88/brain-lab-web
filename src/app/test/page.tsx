"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuestions, submitResult } from "@/services/api";
import { analytics } from "@/lib/analytics";
import { Question } from "@/types";
import QuestionCard from "@/components/QuestionCard";
import Timer from "@/components/Timer";

const QUESTION_SECONDS = 15;

interface ShuffleInfo {
  displayOptions: string[];
  optionMap: number[]; // optionMap[displayedIdx] = originalIdx
}

function shuffleOptions(options: string[]): ShuffleInfo {
  const indices = options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return { displayOptions: indices.map((i) => options[i]), optionMap: indices };
}

const CATEGORY_CONFIG: Record<string, { emoji: string; desc: string }> = {
  수리논리: { emoji: "🔢", desc: "수열과 수리 추론 능력을 측정합니다" },
  언어유추: { emoji: "🔤", desc: "언어 관계와 유추 능력을 측정합니다" },
  인지반사: { emoji: "⚡", desc: "직관적 사고와 판단력을 측정합니다" },
  공간도형: { emoji: "🔷", desc: "공간 지각과 도형 추론 능력을 측정합니다" },
  패턴논리: { emoji: "🧩", desc: "패턴 인식과 논리적 사고를 측정합니다" },
};

interface CategoryIntroProps {
  category: string;
  catIndex: number;
  totalCategories: number;
  onStart: () => void;
}

function CategoryIntro({
  category,
  catIndex,
  totalCategories,
  onStart,
}: CategoryIntroProps) {
  const config = CATEGORY_CONFIG[category] ?? { emoji: "📝", desc: "" };
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6">
      <div className="w-full bg-slate-800 rounded-2xl p-8 text-center space-y-5">
        <div className="text-sm text-slate-500 font-medium">
          {catIndex + 1} / {totalCategories} 카테고리
        </div>
        <div className="text-6xl">{config.emoji}</div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{category}</h2>
          <p className="text-slate-400 text-sm">{config.desc}</p>
        </div>
        <div className="text-slate-500 text-sm">문제 3개 · 문제당 15초</div>
        <button
          onClick={onStart}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition text-lg"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}

type Phase = "loading" | "intro" | "question" | "submitting";

export default function TestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [error, setError] = useState("");
  const [shuffleMap, setShuffleMap] = useState<ShuffleInfo[]>([]);

  const sessionTokenRef = useRef<string>("");
  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);
  const currentIndexRef = useRef(currentIndex);
  const phaseRef = useRef(phase);
  const shuffleMapRef = useRef(shuffleMap);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { shuffleMapRef.current = shuffleMap; }, [shuffleMap]);

  // 키보드 복사 방지
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["c", "a", "x"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 문제/단계 변경 시 항상 맨 위로 (blur 먼저 → 포커스 자동스크롤 방지)
  useEffect(() => {
    (document.activeElement as HTMLElement)?.blur();
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // Safari
  }, [currentIndex, phase]);

  useEffect(() => {
    const nickname = sessionStorage.getItem("nickname");
    if (!nickname) { router.replace("/"); return; }
    getQuestions()
      .then((res) => {
        setQuestions(res.questions);
        questionsRef.current = res.questions;
        sessionTokenRef.current = res.sessionToken;
        const map = res.questions.map((q) => shuffleOptions(q.options));
        setShuffleMap(map);
        shuffleMapRef.current = map;
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
    const nickname = sessionStorage.getItem("nickname") || "익명";
    const qs = questionsRef.current;
    const ans = answersRef.current;
    const answerItems = qs.map((q) => ({
      questionId: q.id,
      answer: ans.get(q.id) ?? -1,
    }));
    try {
      const result = await submitResult(nickname, answerItems, sessionTokenRef.current);
      analytics.testComplete(result.score, result.correctCount, result.estimatedIq);
      sessionStorage.setItem("lastResult", JSON.stringify(result));
      sessionStorage.setItem("lastQuestions", JSON.stringify(qs));
      try {
        localStorage.setItem(
          "myResult",
          JSON.stringify({
            score: result.score,
            estimatedIq: result.estimatedIq,
            correctCount: result.correctCount,
            timeSeconds: result.timeSeconds,
          })
        );
      } catch {}
      router.push(`/result/${result.shareToken}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "결과 저장에 실패했습니다.";
      setError(msg);
    }
  }, [router]);

  const submitAnswer = useCallback(
    (displayedIndex: number) => {
      if (phaseRef.current !== "question") return;
      const qs = questionsRef.current;
      const idx = currentIndexRef.current;
      const q = qs[idx];

      const answerIndex =
        displayedIndex === -1
          ? -1
          : (shuffleMapRef.current[idx]?.optionMap[displayedIndex] ?? displayedIndex);

      const newAnswers = new Map(answersRef.current).set(q.id, answerIndex);
      answersRef.current = newAnswers;
      setAnswers(newAnswers);

      const nextIdx = idx + 1;
      if (nextIdx >= qs.length) {
        handleSubmit();
      } else {
        setCurrentIndex(nextIdx);
        setPhase(isNewCategory(nextIdx, qs) ? "intro" : "question");
      }
    },
    [handleSubmit]
  );

  const handleTimeUp = useCallback(() => {
    const q = questionsRef.current[currentIndexRef.current];
    analytics.questionTimeout(q?.category ?? "", currentIndexRef.current);
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

  if (phase === "intro") {
    const category = questions[currentIndex].category;
    const catIdx = categoryIndexOf(currentIndex, questions);
    return (
      <CategoryIntro
        category={category}
        catIndex={catIdx}
        totalCategories={Object.keys(CATEGORY_CONFIG).length}
        onStart={() => setPhase("question")}
      />
    );
  }

  if (phase === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <p className="text-slate-400">결과 저장 중...</p>
      </div>
    );
  }

  // ── 문제 화면 ────────────────────────────────────────────────
  const question = questions[currentIndex];

  return (
    <div className="flex flex-col flex-1 px-4 py-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm">{question.category}</span>
          <span className="text-slate-600 text-sm">·</span>
          <span className="text-white font-bold">{currentIndex + 1}</span>
          <span className="text-slate-500 text-sm">/ {questions.length}</span>
        </div>
        <Timer
          key={currentIndex}
          totalSeconds={QUESTION_SECONDS}
          onTimeUp={handleTimeUp}
        />
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
        displayOptions={shuffleMap[currentIndex]?.displayOptions ?? question.options}
        onSelect={submitAnswer}
      />
    </div>
  );
}
