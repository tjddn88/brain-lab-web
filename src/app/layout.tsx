import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrainLab - IQ 지능테스트",
  description: "10문항으로 측정하는 나의 예상 IQ. 지금 바로 도전해보세요!",
  openGraph: {
    title: "BrainLab - IQ 지능테스트",
    description: "10문항으로 측정하는 나의 예상 IQ. 지금 바로 도전해보세요!",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "BrainLab - IQ 지능테스트",
    description: "10문항으로 측정하는 나의 예상 IQ. 지금 바로 도전해보세요!",
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
