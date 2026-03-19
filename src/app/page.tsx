"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkEligibility, checkNickname } from "@/services/api";
import { analytics } from "@/lib/analytics";
import { copyToClipboard } from "@/lib/clipboard";
import FeedbackModal from "@/components/FeedbackModal";

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [shared, setShared] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const handleShare = async () => {
    const url = "https://brainlab.live";
    analytics.shareClick();
    if (navigator.share) {
      try {
        await navigator.share({ title: "BrainLab IQ 테스트", url });
      } catch {
        // 사용자가 취소한 경우 등
      }
    } else {
      await copyToClipboard(url);
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
      await checkNickname(trimmed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "사용할 수 없는 닉네임입니다.");
      setChecking(false);
      return;
    }
    try {
      const canSubmit = await checkEligibility();
      if (!canSubmit) {
        analytics.alreadySubmitted();
        setAlreadySubmitted(true);
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
    <div className="flex flex-col items-center justify-center flex-1 px-6 pt-4 pb-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🧠</div>
        <h1 className="text-4xl font-bold text-white mb-2">BrainLab</h1>
        <p className="text-slate-400 text-base">5분 안에 끝내는 두뇌 자극 IQ 테스트</p>
        <p className="text-slate-600 text-xs mt-1">공식 IQ 검사가 아닌 참고용 테스트입니다</p>
      </div>

      {/* 설명 한 줄 */}
      <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 mb-8 text-slate-500 text-sm">
        <span>📝 15문항</span>
        <span className="text-slate-700">·</span>
        <span>⏱️ 15초 제한</span>
        <span className="text-slate-700">·</span>
        <span>🏆 순위/IQ 확인</span>
        <span className="text-slate-700">·</span>
        <span>🔗 링크 공유</span>
      </div>

      {/* 닉네임 입력 + 버튼 */}
      {alreadySubmitted ? (
        <div className="w-full bg-slate-800 rounded-2xl p-6 border border-indigo-500/30 text-center space-y-4">
          <div className="text-4xl">✅</div>
          <div>
            <p className="text-white font-bold text-lg">오늘 이미 참여하셨어요!</p>
            <p className="text-slate-400 text-sm mt-1">자정 이후 다시 도전할 수 있습니다</p>
          </div>
          <div className="space-y-2 pt-1">
            {(() => {
              try {
                const cached = sessionStorage.getItem("lastResult");
                if (cached) {
                  const parsed = JSON.parse(cached);
                  if (parsed?.shareToken) {
                    return (
                      <button
                        onClick={() => router.push(`/result/${parsed.shareToken}`)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition"
                      >
                        내 결과 보기
                      </button>
                    );
                  }
                }
              } catch {}
              return null;
            })()}
            <button
              onClick={() => router.push("/ranking")}
              className="w-full border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 font-medium py-3 rounded-xl transition"
            >
              🏆 전체 순위 보기
            </button>
          </div>
        </div>
      ) : (
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
            className="w-full border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 font-medium py-4 rounded-xl transition text-base"
          >
            🏆 전체 순위 보기
          </button>
        </div>
      )}


      {/* 플로팅 버튼 (공유 + 피드백) */}
      <div className="fixed right-4 bottom-8 flex flex-col gap-3 z-40">
        <button
          onClick={handleShare}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition ${
            shared
              ? "bg-green-500"
              : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700"
          }`}
          title="공유하기"
        >
          {shared ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          )}
        </button>

        <button
          onClick={() => setFeedbackOpen(true)}
          className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center shadow-lg transition"
          title="개발자에게 피드백"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </div>
  );
}
