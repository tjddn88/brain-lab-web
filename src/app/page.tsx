"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkEligibility } from "@/services/api";

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const url = "https://brainlab.live";
    const text = "나 IQ 테스트 해봤는데 너도 해봐 👇";
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
        setError("오늘은 이미 테스트를 완료하셨습니다. 매일 한 번만 참여할 수 있습니다.");
        return;
      }
    } catch {
      // 체크 실패 시 진행 허용
    } finally {
      setChecking(false);
    }
    sessionStorage.setItem("nickname", trimmed);
    router.push("/test");
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🧠</div>
        <h1 className="text-4xl font-bold text-white mb-2">BrainLab</h1>
        <p className="text-slate-400 text-lg">IQ 지능테스트</p>
      </div>

      {/* 설명 카드 */}
      <div className="w-full bg-slate-800 rounded-2xl p-6 mb-8 space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-xl">📝</span>
          <p className="text-slate-300">총 <strong className="text-white">15문항</strong>으로 구성</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl">⏱️</span>
          <p className="text-slate-300">문제당 <strong className="text-white">10초</strong> 제한 — 시간 초과 시 자동으로 넘어감</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl">🏆</span>
          <p className="text-slate-300">전체 참여자 대비 <strong className="text-white">순위와 예상 IQ</strong> 확인</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl">🔗</span>
          <p className="text-slate-300">결과를 <strong className="text-white">링크로 공유</strong> 가능</p>
        </div>
      </div>

      {/* 닉네임 입력 */}
      <div className="w-full space-y-4">
        <div>
          <label className="block text-slate-300 text-sm mb-2 font-medium">닉네임</label>
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
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <button
          onClick={handleStart}
          disabled={checking}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-4 rounded-xl transition text-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {checking ? "확인 중..." : "테스트 시작"}
        </button>

        <button
          onClick={() => router.push("/ranking")}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition"
        >
          🏆 전체 순위 보기
        </button>

        <button
          onClick={handleShare}
          className="w-full text-slate-400 hover:text-white py-3 transition"
        >
          {shared ? "✅ 링크가 복사되었습니다!" : "🔗 친구에게 공유하기"}
        </button>
      </div>
    </div>
  );
}
