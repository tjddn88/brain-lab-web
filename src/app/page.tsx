"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleStart = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (trimmed.length > 20) {
      setError("닉네임은 20자 이하여야 합니다.");
      return;
    }
    sessionStorage.setItem("nickname", trimmed);
    router.push("/test");
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🧠</div>
        <h1 className="text-4xl font-bold text-white mb-2">BrainHub</h1>
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
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-4 rounded-xl transition text-lg"
        >
          테스트 시작
        </button>

        <button
          onClick={() => router.push("/ranking")}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition"
        >
          🏆 전체 순위 보기
        </button>
      </div>
    </div>
  );
}
