import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import ChatBot from "@/components/ChatBot";
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
  title: "성남시 생활 정보 | 행사·혜택·지원금 안내",
  description: "성남시 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
  openGraph: {
    title: "성남시 생활 정보 | 행사·혜택·지원금 안내",
    description: "성남시 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
    url: "https://my-local-info-b82.pages.dev",
    siteName: "성남시 생활 정보",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && process.env.NEXT_PUBLIC_ADSENSE_ID !== "나중에_입력" && (
          <Script
             async
             src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
             strategy="afterInteractive"
             crossOrigin="anonymous"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "name": "성남시 생활 정보",
                  "url": "https://my-local-info-b82.pages.dev",
                  "description": "성남시 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보"
                },
                {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "name": "홈",
                      "item": "https://my-local-info-b82.pages.dev"
                    },
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "name": "블로그",
                      "item": "https://my-local-info-b82.pages.dev/blog"
                    }
                  ]
                }
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
