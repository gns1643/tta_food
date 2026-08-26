import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TTA 인턴 맛집 평론 🍽️",
  description: "TTA 인턴들의 생생한 상암동 점심 맛집 평가 및 공유 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased selection:bg-orange-100 selection:text-orange-900">
        {children}
      </body>
    </html>
  );
}