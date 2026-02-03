import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header, Footer } from "@/components/layout";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "수입무역 교육은 셀러노트 | 실무 중심 무역 강의 플랫폼",
    template: "%s | 셀러노트",
  },
  description: "수입무역 입문부터 통관실무까지, 현직 전문가에게 배우는 실전 무역 교육. 체계적 커리큘럼과 수료증 발급, 취업 연계까지 셀러노트에서 시작하세요.",
  keywords: ["수입무역", "무역교육", "통관실무", "수입 강의", "무역 입문", "알리바바 소싱", "중국 수입"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://edu.seller-note.com",
    siteName: "셀러노트",
    title: "수입무역 교육은 셀러노트 | 실무 중심 무역 강의 플랫폼",
    description: "수입무역 입문부터 통관실무까지, 현직 전문가에게 배우는 실전 무역 교육. 체계적 커리큘럼과 수료증 발급, 취업 연계까지 셀러노트에서 시작하세요.",
  },
  twitter: {
    card: "summary_large_image",
    title: "수입무역 교육은 셀러노트 | 실무 중심 무역 강의 플랫폼",
    description: "수입무역 입문부터 통관실무까지, 현직 전문가에게 배우는 실전 무역 교육.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
