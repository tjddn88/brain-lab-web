"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRanking } from "@/services/api";
import { RankingResponse } from "@/types";
import { analytics } from "@/lib/analytics";
import { formatTimeClock } from "@/lib/utils";

function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return String(rank);
}

const PERCENTILE_LABELS: Record<number, string> = {
  25: "상위 25%",
  50: "상위 50% (중앙값)",
  75: "상위 75%",
};

const COL = "grid-cols-[2rem_1fr_3.5rem_3rem_3rem]";

interface MyResult {
  score: number;
  estimatedIq: number;
  correctCount: number;
  timeSeconds: number;
}

// 0 = top10 이상, 1 = top10 아래~p[0] 이상, 2 = p[0] 아래~p[1] 이상, ...
function getMySection(myScore: number, data: RankingResponse): number {
  const last10Score = data.topEntries.at(-1)?.score ?? -1;
  if (myScore >= last10Score) return 0;
  for (let i = 0; i < data.percentileEntries.length; i++) {
    if (myScore >= data.percentileEntries[i].score) return i + 1;
  }
  return data.percentileEntries.length + 1;
}

export default function RankingPageClient() {
  const router = useRouter();
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myResult, setMyResult] = useState<MyResult | null>(null);

  useEffect(() => {
    analytics.rankingView();
    getRanking()
      .then(setData)
      .catch(() => setError("순위를 불러오지 못했습니다."))
      .finally(() => setLoading(false));

    try {
      const stored = localStorage.getItem("myResult");
      if (stored) setMyResult(JSON.parse(stored));
    } catch {}
  }, []);

  const mySection = data && myResult ? getMySection(myResult.score, data) : null;
  const isEmpty = data && data.topEntries.length === 0;

  const MyRow = () => (
    <div
      className={`grid ${COL} gap-1 items-center px-3 py-2.5 rounded-xl border border-indigo-500/60 bg-indigo-950/50`}
    >
      <span className="text-center text-indigo-400 text-xs font-bold">나</span>
      <span className="text-indigo-300 text-sm font-medium truncate">
        내 점수{" "}
        <span className="text-indigo-400/60 text-xs">({myResult!.score}점)</span>
      </span>
      <span className="text-center text-indigo-400 font-bold text-sm">
        {myResult!.estimatedIq}
      </span>
      <span className="text-center text-indigo-400/80 text-sm">
        {myResult!.correctCount}/15
      </span>
      <span className="text-center text-indigo-400/60 text-xs">
        {formatTimeClock(myResult!.timeSeconds)}
      </span>
    </div>
  );

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
        <div className="flex flex-wrap gap-2 ml-8">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 text-xs text-amber-400 font-medium">
            <span>★</span> IP당 최고점수 1개만 표시
          </span>
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-3 py-1 text-xs text-indigo-400 font-medium">
            <span>↻</span> 순위는 1분마다 갱신
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
          {/* 내 결과 고정 배너 */}
          {myResult && (
            <div className="mb-3 p-4 rounded-2xl border border-indigo-500/40 bg-indigo-950/40">
              <p className="text-indigo-400 text-xs font-medium mb-2">내 결과</p>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-indigo-300 text-2xl font-black">{myResult.estimatedIq}</p>
                  <p className="text-indigo-500 text-xs">예상 IQ</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-lg font-bold">{myResult.correctCount}<span className="text-slate-500 text-sm font-normal">/15</span></p>
                  <p className="text-slate-500 text-xs">정답</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-lg font-bold">{myResult.score.toLocaleString()}</p>
                  <p className="text-slate-500 text-xs">점수</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-base font-bold">{formatTimeClock(myResult.timeSeconds)}</p>
                  <p className="text-slate-500 text-xs">시간</p>
                </div>
              </div>
              <p className="text-indigo-600 text-xs mt-2 text-center">↓ 아래 목록에서 내 위치 확인</p>
            </div>
          )}

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
                {formatTimeClock(entry.timeSeconds)}
              </span>
            </div>
          ))}

          {/* 나 — TOP 10 이후 */}
          {myResult && mySection !== null && mySection <= 1 && <MyRow />}

          {/* 퍼센타일 구간 */}
          {data!.percentileEntries.map((p, idx) => (
            <div key={p.topPercent}>
              <div className="flex items-center gap-2 py-2 px-1">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  {PERCENTILE_LABELS[p.topPercent] ?? `상위 ${p.topPercent}%`} ({p.rank}위)
                </span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <div
                className={`grid ${COL} gap-1 items-center px-3 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50`}
              >
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
                  {formatTimeClock(p.timeSeconds)}
                </span>
              </div>
              {/* 나 — 이 퍼센타일 항목 이후 */}
              {myResult && mySection !== null && mySection === idx + 2 && (
                <div className="mt-1">
                  <MyRow />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          analytics.rankingChallengeClick();
          router.push("/");
        }}
        className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition"
      >
        나도 테스트하기
      </button>
    </div>
  );
}
