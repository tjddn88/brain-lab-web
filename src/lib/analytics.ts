declare const gtag: (...args: unknown[]) => void;

function sendEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof gtag === "undefined") return;
  gtag("event", eventName, params);
}

export const analytics = {
  // 메인 화면에서 테스트 시작 버튼 클릭
  testStart: () => sendEvent("test_start"),

  // 테스트 완료 (결과 제출 성공)
  testComplete: (score: number, correctCount: number, estimatedIq: number) =>
    sendEvent("test_complete", { score, correct_count: correctCount, estimated_iq: estimatedIq }),

  // 메인 화면 공유하기 버튼 클릭
  shareClick: () => sendEvent("share_click"),

  // 결과 페이지 링크 복사
  resultShareClick: () => sendEvent("result_share_click"),

  // 순위 페이지 진입
  rankingView: () => sendEvent("ranking_view"),

  // 오늘 이미 제출한 사용자가 시작 시도
  alreadySubmitted: () => sendEvent("already_submitted"),
};
