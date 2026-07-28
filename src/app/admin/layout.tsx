import type { Metadata } from "next";

// 관리자 화면은 검색 결과에 노출될 이유가 없으므로 색인 제외
export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
