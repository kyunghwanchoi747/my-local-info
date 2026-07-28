import type { Metadata } from "next";
import { siteConfig } from "@/lib/site.config";

// page.tsx 가 "use client" 라 metadata 를 export 할 수 없어 레이아웃에서 지정
export const metadata: Metadata = {
  title: `운영자 소개 - ${siteConfig.siteName}`,
  description: `${siteConfig.siteName} 운영자 ${siteConfig.owner.name}의 소개와 집필 칼럼 목록입니다.`,
  alternates: { canonical: "/author/" },
};

export default function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
