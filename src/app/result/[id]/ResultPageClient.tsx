"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getResult } from "@/services/api";
import { ResultResponse } from "@/types";
import ResultCard from "@/components/ResultCard";

export default function ResultPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 방금 완료된 결과는 sessionStorage에서 먼저 확인
    const cached = sessionStorage.getItem("lastResult");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as ResultResponse;
        if (String(parsed.id) === id) {
          setResult(parsed);
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }
    }

    getResult(id)
      .then((r) => {
        setResult(r);
        setLoading(false);
      })
      .catch(() => {
        setError("결과를 찾을 수 없습니다.");
        setLoading(false);
      });
  }, [id]);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/result/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1">
        <p className="text-slate-400">결과 불러오는 중...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6">
        <p className="text-red-400 mb-4">{error || "오류가 발생했습니다."}</p>
        <button
          onClick={() => router.push("/")}
          className="text-indigo-400 underline"
        >
          처음으로
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-8">
      <h1 className="text-center text-white font-bold text-xl mb-6">
        🧠 테스트 결과
      </h1>

      <ResultCard result={result} />

      <div className="mt-6 space-y-3">
        <button
          onClick={handleCopyLink}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-4 rounded-xl transition flex items-center justify-center gap-2"
        >
          {copied ? "✅ 링크가 복사되었습니다!" : "🔗 결과 링크 복사"}
        </button>
        <button
          onClick={() => {
            sessionStorage.removeItem("nickname");
            sessionStorage.removeItem("lastResult");
            router.push("/");
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition"
        >
          다시 테스트하기
        </button>
        <button
          onClick={() => router.push("/ranking")}
          className="w-full text-slate-400 hover:text-white py-3 transition"
        >
          🏆 전체 순위 보기
        </button>
      </div>
    </div>
  );
}
