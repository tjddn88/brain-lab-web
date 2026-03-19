"use client";

import { ResultResponse } from "@/types";
import { formatTimeMinSec, getIqInfo } from "@/lib/utils";

interface ResultCardProps {
  result: ResultResponse;
  iqDelta?: number | null;
}

export default function ResultCard({ result, iqDelta }: ResultCardProps) {
  const iqInfo = getIqInfo(result.estimatedIq);

  return (
    <div className="w-full space-y-4">
      {/* IQ 카드 */}
      <div className="bg-slate-800 rounded-2xl p-8 text-center border border-slate-700">
        <p className="text-slate-400 text-sm mb-1">{result.nickname}님의 예상 IQ</p>
        <div className={`text-7xl font-black mb-2 ${iqInfo.color}`}>
          {result.estimatedIq}
        </div>
        <p className={`text-lg font-semibold ${iqInfo.color}`}>{iqInfo.label}</p>
        {iqDelta != null && iqDelta !== 0 && (
          <p
            className={`text-sm font-medium mt-2 ${
              iqDelta > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {iqDelta > 0 ? `▲ +${iqDelta}` : `▼ ${iqDelta}`} 지난번 대비
          </p>
        )}
      </div>

      {/* 순위 카드 */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-slate-400 text-xs mb-1">순위</p>
            <p className="text-white text-2xl font-bold">
              {result.rank.toLocaleString()}
              <span className="text-slate-400 text-sm font-normal">등</span>
            </p>
            <p className="text-slate-500 text-xs mt-1">
              전체 {result.totalParticipants.toLocaleString()}명 중
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs mb-1">상위</p>
            <p className="text-indigo-400 text-2xl font-bold">
              {result.topPercent}
              <span className="text-slate-400 text-sm font-normal">%</span>
            </p>
          </div>
        </div>
      </div>

      {/* 세부 결과 */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-slate-400 text-xs mb-1">정답</p>
            <p className="text-white text-xl font-bold">
              {result.correctCount}
              <span className="text-slate-400 text-sm">/15</span>
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">점수</p>
            <p className="text-white text-xl font-bold">
              {result.score.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">풀이 시간</p>
            <p className="text-white text-lg font-bold">
              {formatTimeMinSec(result.timeSeconds)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
