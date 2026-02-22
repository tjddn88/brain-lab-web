"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  totalSeconds: number;
  onTimeUp: () => void;
}

export default function Timer({ totalSeconds, onTimeUp }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp();
      return;
    }
    const timer = setTimeout(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [remaining, onTimeUp]);

  const isUrgent = remaining <= 3;
  const progress = (remaining / totalSeconds) * 100;

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`font-mono font-bold text-2xl tabular-nums leading-none ${
          isUrgent ? "text-red-400 animate-pulse" : "text-slate-200"
        }`}
      >
        {remaining}
      </span>
      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isUrgent ? "bg-red-500" : "bg-indigo-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
