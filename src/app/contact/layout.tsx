import type { Metadata } from "next";
import { siteConfig } from "@/lib/site.config";

// page.tsx 가 "use client" 라 metadata 를 export 할 수 없어 레이아웃에서 지정
export const metadata: Metadata = {
  title: `문의하기 - ${siteConfig.siteName}`,
  description: `${siteConfig.siteName} 운영자에게 의견, 정정 요청, 제보를 보내실 수 있습니다.`,
  alternates: { canonical: "/contact/" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
