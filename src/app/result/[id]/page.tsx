import { Metadata } from "next";
import ResultPageClient from "./ResultPageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `IQ 테스트 결과 | BrainLab`,
    description: "BrainLab IQ 테스트 결과를 확인해보세요!",
    openGraph: {
      title: `IQ 테스트 결과 | BrainLab`,
      description: "BrainLab IQ 테스트 결과를 확인해보세요!",
    },
    twitter: {
      card: "summary",
      title: `IQ 테스트 결과 | BrainLab`,
      description: "BrainLab IQ 테스트 결과를 확인해보세요!",
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  return <ResultPageClient id={id} />;
}
