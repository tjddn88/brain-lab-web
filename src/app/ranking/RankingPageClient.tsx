"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRanking } from "@/services/api";
import { RankingResponse, PercentileEntry } from "@/types";
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

const PERCENTILE_LABELS: Record<number, string> = {
  30: "상위 30%",
  50: "상위 50%",
  70: "상위 70%",
  90: "상위 90%",
};

const COL = "grid-cols-[2rem_1fr_3.5rem_3rem_3rem]";

export default function RankingPageClient() {
  const router = useRouter();
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    analytics.rankingView();
    getRanking()
      .then(setData)
      .catch(() => setError("순위를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  // 퍼센타일 항목을 rank 기준으로 빠르게 찾기 위한 맵
  const percentileByRank = new Map<number, PercentileEntry>(
    (data?.percentileEntries ?? []).map((p) => [p.rank, p])
  );

  const isEmpty = data && data.topEntries.length === 0;

  return (
    <div className="flex flex-col flex-1 px-4 py-6">
      {/* 헤더 */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <button
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-white mr-3 transition"
          >
            ←
          </button>
          <h1 className="text-white font-bold text-xl">🏆 전체 순위</h1>
          {data && (
            <span className="ml-auto text-slate-500 text-xs">
              총 {data.totalCount.toLocaleString()}명
            </span>
          )}
        </div>
        {/* 정보 뱃지 */}
        <div className="flex flex-wrap gap-2 ml-8">
          <span className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-full px-2.5 py-0.5 text-xs text-slate-400">
            <span className="text-amber-400">★</span> IP당 최고점수 1개만 표시
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-full px-2.5 py-0.5 text-xs text-slate-400">
            <span className="text-indigo-400">↻</span> 1분마다 갱신
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <p className="text-slate-400">순위 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center flex-1">
          <p className="text-red-400">{error}</p>
        </div>
      ) : isEmpty ? (
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
        <div className="space-y-1">
          {/* 컬럼 헤더 */}
          <div className={`grid ${COL} gap-1 px-3 py-2 text-xs text-slate-500 font-medium`}>
            <span className="text-center">#</span>
            <span>닉네임</span>
            <span className="text-center">IQ</span>
            <span className="text-center">정답</span>
            <span className="text-center">시간</span>
          </div>

          {/* TOP 10 */}
          {data!.topEntries.map((entry) => (
            <div
              key={entry.rank}
              className={`grid ${COL} gap-1 items-center px-3 py-3 rounded-xl border ${
                entry.rank <= 3
                  ? "bg-slate-700/50 border-slate-600"
                  : "bg-slate-800 border-slate-700"
              }`}
            >
              <span className="text-center text-base font-bold leading-none">
                {getRankEmoji(entry.rank)}
              </span>
              <span className={`font-medium truncate text-sm ${entry.rank <= 3 ? "text-white" : "text-slate-300"}`}>
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

          {/* 퍼센타일 구간 */}
          {data!.percentileEntries.map((p) => (
            <div key={p.topPercent}>
              {/* 구분선 + 라벨 */}
              <div className="flex items-center gap-2 py-2 px-1">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  {PERCENTILE_LABELS[p.topPercent] ?? `상위 ${p.topPercent}%`} 기준 ({p.rank}위)
                </span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              {/* 해당 순위 항목 */}
              <div className={`grid ${COL} gap-1 items-center px-3 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50`}>
                <span className="text-center text-slate-400 text-sm font-bold">
                  {p.rank}
                </span>
                <span className="font-medium truncate text-sm text-slate-400">
                  {p.nickname}
                </span>
                <span className="text-center text-indigo-400/80 font-bold text-sm">
                  {p.estimatedIq}
                </span>
                <span className="text-center text-slate-500 text-sm">
                  {p.correctCount}/15
                </span>
                <span className="text-center text-slate-500 text-xs">
                  {formatTime(p.timeSeconds)}
                </span>
              </div>
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
