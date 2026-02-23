import { AnswerItem, ApiResponse, QuestionsResponse, RankingEntry, ResultResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json();
}

export async function getQuestions(): Promise<QuestionsResponse> {
  const res = await fetchApi<QuestionsResponse>("/questions");
  if (!res.success || !res.data) throw new Error(res.error || "문제 로딩 실패");
  return res.data;
}

export async function submitResult(
  nickname: string,
  answers: AnswerItem[],
  sessionToken: string
): Promise<ResultResponse> {
  const res = await fetchApi<ResultResponse>("/results", {
    method: "POST",
    body: JSON.stringify({ nickname, answers, sessionToken }),
  });
  if (!res.success || !res.data) throw new Error(res.error || "결과 저장 실패");
  return res.data;
}

export async function getResult(id: string): Promise<ResultResponse> {
  const res = await fetchApi<ResultResponse>(`/results/${id}`);
  if (!res.success || !res.data) throw new Error(res.error || "결과 조회 실패");
  return res.data;
}

export async function getRanking(): Promise<RankingEntry[]> {
  const res = await fetchApi<RankingEntry[]>("/results/ranking");
  if (!res.success || !res.data) throw new Error(res.error || "순위 조회 실패");
  return res.data;
}

export async function checkEligibility(): Promise<boolean> {
  const res = await fetchApi<{ canSubmit: boolean }>("/questions/eligibility");
  if (!res.success || !res.data) return true; // 오류 시 허용
  return res.data.canSubmit;
}

export async function submitFeedback(content: string): Promise<void> {
  const res = await fetchApi<void>("/feedbacks", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  if (!res.success) throw new Error(res.error || "피드백 전송 실패");
}
