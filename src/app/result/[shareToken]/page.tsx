import { Metadata } from "next";
import ResultPageClient from "./ResultPageClient";

interface Props {
  params: Promise<{ shareToken: string }>;
}

const INTERNAL_API = "http://localhost:8080/api";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareToken } = await params;

  try {
    const res = await fetch(`${INTERNAL_API}/results/${shareToken}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    if (data.success && data.data) {
      const r = data.data;
      const title = `${r.nickname}님의 IQ 결과 | BrainLab`;
      const description = `예상 IQ ${r.estimatedIq} · 상위 ${r.topPercent}% 🧠 나도 테스트해보기!`;
      return {
        title,
        description,
        openGraph: { title, description, type: "website", images: [{ url: "/opengraph-image" }] },
        twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
      };
    }
  } catch {
    // fallback
  }

  return {
    title: "IQ 테스트 결과 | BrainLab",
    description: "5분 안에 끝나는 IQ 테스트 🧠 내 두뇌의 잠재력은?",
    openGraph: {
      title: "IQ 테스트 결과 | BrainLab",
      description: "5분 안에 끝나는 IQ 테스트 🧠 내 두뇌의 잠재력은?",
      images: [{ url: "/opengraph-image" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "IQ 테스트 결과 | BrainLab",
      description: "5분 안에 끝나는 IQ 테스트 🧠 내 두뇌의 잠재력은?",
      images: ["/opengraph-image"],
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const { shareToken } = await params;
  return <ResultPageClient shareToken={shareToken} />;
}
