import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default function BlogList() {
  const posts = getSortedPostsData();

  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans flex flex-col justify-between">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏡</span>
            <div>
              <Link href="/">
                <span className="text-2xl font-bold text-blue-900 tracking-tight cursor-pointer">성남시 생활 정보</span>
              </Link>
              <p className="text-xs text-blue-700/80 mt-0.5">우리 동네의 생생한 축제와 맞춤 혜택을 전해드려요</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex gap-4 text-sm font-bold">
              <Link href="/" className="text-slate-600 hover:text-blue-900 transition">
                홈
              </Link>
              <Link href="/blog/" className="text-blue-900 border-b-2 border-blue-900 pb-1 transition">
                블로그
              </Link>
              <Link href="/about/" className="text-slate-600 hover:text-blue-900 transition">
                소개
              </Link>
            </nav>
            <div className="hidden sm:block">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                매일 아침 7시 자동 업데이트
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-blue-950 mb-3">📰 동네 정보 블로그</h2>
          <p className="text-slate-600 max-w-lg mx-auto">
            성남시의 최신 트렌드, 공공 혜택 백서, 축제 후기 등 유익한 로컬 스토리들을 모아보세요.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-blue-100 shadow-sm">
            <span className="text-4xl">✍️</span>
            <h3 className="text-lg font-semibold text-slate-700 mt-4">아직 등록된 블로그 글이 없습니다</h3>
            <p className="text-sm text-slate-500 mt-1">새로운 유익한 소식들로 곧 찾아뵙겠습니다!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-100/70 hover:shadow-md hover:border-blue-200 transition duration-200 flex flex-col md:flex-row"
              >
                {post.image && (
                  <div className="md:w-1/3 h-48 md:h-auto relative shrink-0 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {post.category && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
                          {post.category}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-400">{post.date}</span>
                    </div>
                    <Link href={`/blog/${post.slug}/`}>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 hover:text-blue-900 transition mb-3 cursor-pointer">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
                      {post.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <Link href={`/blog/${post.slug}/`}>
                      <span className="text-sm font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1">
                        자세히 읽기 →
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-900 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <p>© 2026 우리 동네 생활 정보. All rights reserved.</p>
          <p>
            데이터 출처: 공공데이터포털(data.go.kr) Open API | 본 사이트는 구글 애드센스 및 쿠팡 파트너스 활동의 일환으로 수수료를 제공받을 수 있습니다.
          </p>
          <p className="text-slate-500 pt-1">
            마지막 정보 업데이트: <span className="font-mono text-slate-400">2026-06-03</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
