interface KakaoSDK {
  isInitialized: () => boolean;
  Share: {
    sendDefault: (settings: object) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

export function kakaoShare({
  nickname,
  estimatedIq,
  topPercent,
  shareToken,
}: {
  nickname: string;
  estimatedIq: number;
  topPercent: number;
  shareToken: string;
}): boolean {
  const kakao = window.Kakao;
  if (!kakao?.Share) return false;

  const url = `https://brainlab.live/result/${shareToken}`;
  kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: `${nickname}님의 BrainLab IQ 결과`,
      description: `예상 IQ ${estimatedIq} · 상위 ${topPercent}% 🧠 나도 테스트해보기!`,
      imageUrl: "https://brainlab.live/opengraph-image",
      link: { mobileWebUrl: url, webUrl: url },
    },
    buttons: [
      {
        title: "도전하기",
        link: { mobileWebUrl: url, webUrl: url },
      },
    ],
  });
  return true;
}
