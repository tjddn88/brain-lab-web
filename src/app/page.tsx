"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkEligibility, submitFeedback } from "@/services/api";
import { analytics } from "@/lib/analytics";

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [shared, setShared] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackSending(true);
    setFeedbackError("");
    try {
      await submitFeedback(feedbackText.trim());
      setFeedbackDone(true);
      setFeedbackText("");
      setTimeout(() => {
        setFeedbackOpen(false);
        setFeedbackDone(false);
      }, 1500);
    } catch (e: unknown) {
      setFeedbackError(e instanceof Error ? e.message : "전송에 실패했습니다.");
    } finally {
      setFeedbackSending(false);
    }
  };

  const handleShare = async () => {
    const url = "https://brainlab.live";
    const text = "나 IQ 테스트 해봤는데 너도 해봐 👇";
    analytics.shareClick();
    if (navigator.share) {
      try {
        await navigator.share({ title: "BrainLab IQ 테스트", text, url });
      } catch {
        // 사용자가 취소한 경우 등
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        const el = document.createElement("textarea");
        el.value = url;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleStart = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (trimmed.length > 20) {
      setError("닉네임은 20자 이하여야 합니다.");
      return;
    }
    setChecking(true);
    try {
      const canSubmit = await checkEligibility();
      if (!canSubmit) {
        analytics.alreadySubmitted();
        setError("오늘은 이미 테스트를 완료하셨습니다. 매일 한 번만 참여할 수 있습니다.");
        return;
      }
    } catch {
      // 체크 실패 시 진행 허용
    } finally {
      setChecking(false);
    }
    analytics.testStart();
    sessionStorage.setItem("nickname", trimmed);
    router.push("/test");
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🧠</div>
        <h1 className="text-4xl font-bold text-white mb-2">BrainLab</h1>
        <p className="text-slate-400 text-base">5분 안에 끝내는 두뇌 자극 IQ 테스트</p>
        <p className="text-slate-600 text-xs mt-1">공식 IQ 검사가 아닌 참고용 테스트입니다</p>
      </div>

      {/* 설명 카드 */}
      <div className="w-full bg-slate-800 rounded-2xl p-5 mb-6 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-lg w-6 text-center">📝</span>
          <p className="text-slate-300 text-sm">총 <strong className="text-white">15문항</strong>으로 구성</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg w-6 text-center">⏱️</span>
          <p className="text-slate-300 text-sm">문제당 <strong className="text-white">15초</strong> 제한</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg w-6 text-center">🏆</span>
          <p className="text-slate-300 text-sm">전체 참여자 대비 <strong className="text-white">순위와 예상 IQ</strong> 확인</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg w-6 text-center">🔗</span>
          <p className="text-slate-300 text-sm">결과를 <strong className="text-white">링크로 공유</strong> 가능</p>
        </div>
      </div>

      {/* 닉네임 입력 + 버튼 */}
      <div className="w-full space-y-3">
        <input
          type="text"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          placeholder="닉네임을 입력하세요 (최대 20자)"
          maxLength={20}
          className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleStart}
          disabled={checking}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-4 rounded-xl transition text-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {checking ? "확인 중..." : "테스트 시작"}
        </button>

        <button
          onClick={() => router.push("/ranking")}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-4 rounded-xl transition text-base"
        >
          🏆 전체 순위 보기
        </button>
      </div>

      {/* 하단 안내 */}
      <div className="mt-6 pt-4 border-t border-slate-800 text-center">
        <p className="text-slate-700 text-xs">
          🛡️ 공정한 테스트를 위해 다양한 AI 방지 기술이 적용되어 있습니다
        </p>
      </div>

      {/* 플로팅 버튼 (공유 + 피드백) */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
        {/* 공유 */}
        <button
          onClick={handleShare}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition ${
            shared ? "bg-green-500" : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700"
          }`}
          title="공유하기"
        >
          {shared ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          )}
        </button>

        {/* 피드백 */}
        <button
          onClick={() => { setFeedbackOpen(true); setFeedbackError(""); }}
          className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center shadow-lg transition"
          title="개발자에게 피드백"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* 피드백 모달 */}
      {feedbackOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setFeedbackOpen(false); }}
        >
          <div className="w-full max-w-sm bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <h2 className="text-white font-bold mb-4">💬 개발자에게 피드백</h2>

            {feedbackDone ? (
              <p className="text-green-400 text-center py-4">✅ 피드백이 전송되었습니다!</p>
            ) : (
              <>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="의견이나 제안을 자유롭게 작성해주세요..."
                  maxLength={500}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none text-sm"
                />
                <div className="flex justify-between items-center mt-1 mb-3">
                  {feedbackError
                    ? <p className="text-red-400 text-xs">{feedbackError}</p>
                    : <span />}
                  <span className="text-slate-600 text-xs ml-auto">{feedbackText.length}/500</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFeedbackOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition text-sm"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={feedbackSending || !feedbackText.trim()}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {feedbackSending ? "전송 중..." : "보내기"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
