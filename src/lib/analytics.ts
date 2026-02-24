function sendEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as typeof window & { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  w.gtag("event", eventName, params);
}

export const analytics = {
  // 메인 화면에서 테스트 시작 버튼 클릭
  testStart: () => sendEvent("test_start"),

  // 테스트 완료 (결과 제출 성공)
  testComplete: (score: number, correctCount: number, estimatedIq: number) =>
    sendEvent("test_complete", {
      score,
      correct_count: correctCount,
      estimated_iq: estimatedIq,
    }),

  // 문제 타임 아웃 (15초 초과)
  questionTimeout: (category: string, questionIndex: number) =>
    sendEvent("question_timeout", {
      category,
      question_index: questionIndex,
    }),

  // 메인 화면 공유하기 버튼 클릭
  shareClick: () => sendEvent("share_click"),

  // 결과 페이지 링크 복사
  resultShareClick: () => sendEvent("result_share_click"),

  // 공유 링크로 타인의 결과 조회
  resultViewShared: (estimatedIq: number) =>
    sendEvent("result_view_shared", { estimated_iq: estimatedIq }),

  // 공유된 결과에서 "도전하기" 클릭
  challengeClick: () => sendEvent("challenge_click"),

  // 오답노트 첫 번째 펼침
  answerReviewOpen: () => sendEvent("answer_review_open"),

  // 결과 페이지에서 "다시 테스트하기" 클릭
  retakeClick: () => sendEvent("retake_click"),

  // 순위 페이지 진입
  rankingView: () => sendEvent("ranking_view"),

  // 순위표에서 "나도 테스트하기" 클릭
  rankingChallengeClick: () => sendEvent("ranking_challenge_click"),

  // 오늘 이미 제출한 사용자가 시작 시도
  alreadySubmitted: () => sendEvent("already_submitted"),
};
