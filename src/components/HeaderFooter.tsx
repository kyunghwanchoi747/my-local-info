"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site.config";
import { useEffect, useState } from "react";

export function Header() {
  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏡</span>
          <div>
            <Link href="/">
              <span className="text-xl md:text-2xl font-bold text-blue-900 tracking-tight cursor-pointer">
                {siteConfig.siteName}
              </span>
            </Link>
            <p className="text-xxs md:text-xs text-blue-700/80 mt-0.5">{siteConfig.siteTagline}</p>
          </div>
        </div>
        <nav className="flex gap-4 text-xs md:text-sm font-bold text-slate-600">
          <Link href="/" className="hover:text-blue-900 transition">홈</Link>
          <Link href="/blog/" className="hover:text-blue-900 transition">블로그</Link>
          <Link href="/columns/" className="hover:text-blue-900 transition">칼럼</Link>
          <Link href="/redevelopment/" className="hover:text-blue-900 transition">재개발</Link>
          <Link href="/categories/" className="hover:text-blue-900 transition">카테고리</Link>
          <Link href="/about/" className="hover:text-blue-900 transition">소개</Link>
          <Link href="/author/" className="hover:text-blue-900 transition">운영자</Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("adminSession");
      setIsAdmin(session === "active");
    }
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 font-sans mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold mb-3">{siteConfig.siteName}</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              성남시민을 위한 실시간 혜택 가이드 및 소소한 우리 동네 소식을 전하는 비공식 생활 정보 큐레이션 채널입니다.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">바로가기</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/privacy/" className="hover:text-white transition">개인정보처리방침</Link>
              <Link href="/terms/" className="hover:text-white transition">이용약관</Link>
              <Link href="/disclaimer/" className="hover:text-white transition">면책고지</Link>
              <Link href="/sitemap/" className="hover:text-white transition">HTML 사이트맵</Link>
              <Link href="/contact/" className="hover:text-white transition">문의하기</Link>
              <Link href="/admin/" className="hover:text-white transition">관리자 모드</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">운영 및 신뢰 정보</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              운영자:{" "}
              <Link href="/author/" className="text-white font-semibold underline hover:text-blue-400 transition">
                {siteConfig.owner.name}
              </Link>
              {isAdmin && (
                <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-xxs bg-emerald-600 text-white font-bold">
                  관리자 로그인 중
                </span>
              )}
            </p>
            <p className="text-xs mt-1 text-slate-500">주소: {siteConfig.owner.address}</p>
            <p className="text-xs text-slate-500">이메일: {siteConfig.owner.email}</p>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © 2026 {siteConfig.siteName}. All rights reserved. 본 사이트는 성남시청 공식 웹사이트가 아닌 개인 큐레이션 정보 포털입니다.
        </div>
      </div>
    </footer>
  );
}
