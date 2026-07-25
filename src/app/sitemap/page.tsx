import Link from "next/link";
import { siteConfig } from "@/lib/site.config";
import { getSortedPostsData, getSortedColumnsData } from "@/lib/posts";

export const metadata = {
  title: `사이트맵 - ${siteConfig.siteName}`,
  description: `${siteConfig.siteName}의 전체 페이지와 게시글 목록을 한눈에 찾아볼 수 있는 HTML 사이트맵입니다.`,
};

export default function SitemapPage() {
  const posts = getSortedPostsData();
  const columns = getSortedColumnsData();

  // 중복 없는 카테고리 추출
  const categories = Array.from(new Set(posts.map(post => post.category).filter(Boolean)));

  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
        
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium">사이트맵</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">HTML 사이트맵</h1>
        <p className="text-slate-600 mb-10 leading-relaxed text-sm">
          {siteConfig.siteName}에서 다루고 있는 모든 핵심 페이지와 발행물들의 목록입니다.
          원하시는 카테고리나 최신 칼럼 정보를 아래 구조화된 목록을 통해 빠르게 탐색해 보세요.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* 주요 사이트 메뉴 */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-blue-900 border-b border-blue-100 pb-2 mb-3">기본 서비스 페이지</h2>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><Link href="/" className="text-slate-700 hover:text-blue-600 transition">• 홈 화면 (실시간 소식)</Link></li>
                <li><Link href="/about/" className="text-slate-700 hover:text-blue-600 transition">• 사이트 소개 (About)</Link></li>
                <li><Link href="/author/" className="text-slate-700 hover:text-blue-600 transition">• 운영자 소개 & 칼럼 허브 (Author)</Link></li>
                <li><Link href="/blog/" className="text-slate-700 hover:text-blue-600 transition">• 생활 정보 블로그 전체보기</Link></li>
                <li><Link href="/columns/" className="text-slate-700 hover:text-blue-600 transition">• 운영자 칼럼 전체보기</Link></li>
                <li><Link href="/categories/" className="text-slate-700 hover:text-blue-600 transition">• 카테고리 모음 허브</Link></li>
                <li><Link href="/contact/" className="text-slate-700 hover:text-blue-600 transition">• 문의하기 (Contact)</Link></li>
                <li><Link href="/admin/" className="text-slate-700 hover:text-blue-600 transition">• 관리자 모드 데모 (Admin)</Link></li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-blue-900 border-b border-blue-100 pb-2 mb-3">법적 고지 및 신뢰 정보</h2>
              <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
                <li><Link href="/privacy/" className="hover:text-blue-600 transition">• 개인정보처리방침</Link></li>
                <li><Link href="/terms/" className="hover:text-blue-600 transition">• 이용약관</Link></li>
                <li><Link href="/disclaimer/" className="hover:text-blue-600 transition">• 면책고지</Link></li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-blue-900 border-b border-blue-100 pb-2 mb-3">카테고리별 탐색</h2>
              <ul className="space-y-2.5 text-sm font-medium text-slate-700">
                {categories.map((cat, idx) => (
                  <li key={idx}>
                    <Link href={`/categories/${encodeURIComponent(cat)}/`} className="hover:text-blue-600 transition">
                      • {cat} 정보 목록 ({posts.filter(p => p.category === cat).length}건)
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 블로그 글 및 칼럼 리스트 */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-blue-900 border-b border-blue-100 pb-2 mb-3">운영자 칼럼 ({columns.length}건)</h2>
              <ul className="space-y-2 text-xs font-medium text-slate-700">
                {columns.map((col, idx) => (
                  <li key={idx} className="line-clamp-1">
                    <Link href={`/columns/${col.slug}/`} className="hover:text-blue-600 transition">
                      • [{col.date}] {col.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-blue-900 border-b border-blue-100 pb-2 mb-3">전체 생활 정보 글 ({posts.length}건)</h2>
              <ul className="space-y-2 text-xs font-medium text-slate-700 max-h-[350px] overflow-y-auto pr-2">
                {posts.map((post, idx) => (
                  <li key={idx} className="line-clamp-1">
                    <Link href={`/blog/${post.slug}/`} className="hover:text-blue-600 transition">
                      • [{post.category || "기타"}] {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
