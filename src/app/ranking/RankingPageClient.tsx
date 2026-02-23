"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRanking } from "@/services/api";
import { RankingEntry } from "@/types";
import { analytics } from "@/lib/analytics";

function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return String(rank);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RankingPageClient() {
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    analytics.rankingView();
    getRanking()
      .then(setRanking)
      .catch(() => setError("순위를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1 px-4 py-6">
      {/* 헤더 */}
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <button
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-white mr-3 transition"
          >
            ←
          </button>
          <h1 className="text-white font-bold text-xl">🏆 전체 순위</h1>
        </div>
        <p className="text-slate-500 text-xs ml-8">순위는 1분마다 갱신됩니다.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <p className="text-slate-400">순위 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center flex-1">
          <p className="text-red-400">{error}</p>
        </div>
      ) : ranking.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <p className="text-slate-400 text-center">
            아직 참여자가 없습니다.
            <br />첫 번째 도전자가 되어보세요!
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition"
          >
            테스트 시작
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* 컬럼 헤더 */}
          <div className="grid grid-cols-[2.5rem_1fr_4rem_3rem_3rem] gap-2 px-3 py-2 text-xs text-slate-500 font-medium">
            <span className="text-center">순위</span>
            <span>닉네임</span>
            <span className="text-center">예상IQ</span>
            <span className="text-center">정답</span>
            <span className="text-center">시간</span>
          </div>

          {ranking.map((entry) => (
            <div
              key={entry.rank}
              className={`grid grid-cols-[2.5rem_1fr_4rem_3rem_3rem] gap-2 items-center px-3 py-3 rounded-xl border ${
                entry.rank <= 3
                  ? "bg-slate-700/50 border-slate-600"
                  : "bg-slate-800 border-slate-700"
              }`}
            >
              <span className="text-center text-lg font-bold leading-none">
                {getRankEmoji(entry.rank)}
              </span>
              <span
                className={`font-medium truncate text-sm ${
                  entry.rank <= 3 ? "text-white" : "text-slate-300"
                }`}
              >
                {entry.nickname}
              </span>
              <span className="text-center text-indigo-400 font-bold text-sm">
                {entry.estimatedIq}
              </span>
              <span className="text-center text-slate-400 text-sm">
                {entry.correctCount}/15
              </span>
              <span className="text-center text-slate-500 text-xs">
                {formatTime(entry.timeSeconds)}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => router.push("/")}
        className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition"
      >
        나도 테스트하기
      </button>
    </div>
  );
}
