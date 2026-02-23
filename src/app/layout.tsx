import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://brainlab.live"),
  title: "BrainLab - IQ 지능테스트",
  description: "5분 안에 끝나는 IQ 테스트 🧠 예상 IQ를 지금 바로 확인하세요.",
  openGraph: {
    title: "BrainLab - IQ 지능테스트",
    description: "5분 안에 끝나는 IQ 테스트 🧠 예상 IQ를 지금 바로 확인하세요.",
    type: "website",
    url: "https://brainlab.live",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrainLab - IQ 지능테스트",
    description: "5분 안에 끝나는 IQ 테스트 🧠 예상 IQ를 지금 바로 확인하세요.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BrainLab",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <main className="mx-auto max-w-md min-h-screen flex flex-col">
          {children}
        </main>
      </body>
      <GoogleAnalytics gaId="G-9QPFBS6JFH" />
    </html>
  );
}
