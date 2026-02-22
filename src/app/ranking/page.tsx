import { Metadata } from "next";
import RankingPageClient from "./RankingPageClient";

export const metadata: Metadata = {
  title: "전체 순위 | BrainHub",
  description: "BrainHub IQ 테스트 전체 참여자 순위표",
};

export default function RankingPage() {
  return <RankingPageClient />;
}
