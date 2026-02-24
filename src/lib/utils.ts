export const OPTION_LABELS = ["A", "B", "C", "D"] as const;

export const CAT_ORDER = [
  "수리논리",
  "언어유추",
  "인지반사",
  "공간도형",
  "패턴논리",
] as const;

// 결과 카드용 (예: 2분 30초)
export function formatTimeMinSec(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${s}초`;
}

// 순위표용 (예: 2:30)
export function formatTimeClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const IQ_LEVELS: { min: number; label: string; color: string }[] = [
  { min: 130, label: "천재 수준", color: "text-yellow-400" },
  { min: 125, label: "매우 우수", color: "text-yellow-400" },
  { min: 119, label: "우수", color: "text-green-400" },
  { min: 110, label: "평균 이상", color: "text-green-400" },
  { min: 100, label: "평균", color: "text-blue-400" },
  { min: 90, label: "평균 이하", color: "text-blue-400" },
  { min: 81, label: "낮음", color: "text-slate-400" },
];

export function getIqInfo(iq: number): { label: string; color: string } {
  return (
    IQ_LEVELS.find((l) => iq >= l.min) ?? {
      label: "매우 낮음",
      color: "text-slate-400",
    }
  );
}
