import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site.config";

const homeTitle = `${siteConfig.siteName} | ${siteConfig.siteTagline}`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: homeTitle,
  description: siteConfig.siteTagline,
  alternates: {
    canonical: "/",
  },
  other: {
    "google-adsense-account": "ca-pub-3288215032789198",
  },
  // url 은 페이지마다 달라야 하므로 여기서 지정하지 않음
  // (루트에 두면 하위 페이지가 상속받아 og:url 이 전부 홈으로 고정됨)
  openGraph: {
    title: homeTitle,
    description: siteConfig.siteTagline,
    siteName: siteConfig.siteName,
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.siteName,
    "url": `${siteConfig.siteUrl}/`,
    "description": siteConfig.siteTagline
  };

  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-3288215032789198";
  const isAdsenseEnabled = adsenseId && adsenseId !== "나중에_입력" && adsenseId.trim() !== "";

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {isAdsenseEnabled && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
