import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import { Header, Footer } from "@/components/HeaderFooter";
import { siteConfig } from "@/lib/site.config";

export const metadata = {
  title: `생활 정보 블로그 - ${siteConfig.siteName}`,
  description: `${siteConfig.siteName}의 모든 유익한 정보와 복지 혜택 안내 글 모음입니다.`,
  alternates: { canonical: "/blog/" },
  openGraph: { url: "https://sungnamer.com/blog/" },
};

export default function BlogList() {
  const posts = getSortedPostsData();

  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans flex flex-col justify-between">
      
      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full">
        
        {/* 브레드크럼 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium">블로그</span>
        </nav>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-blue-950 mb-3">동네 생활 정보 블로그</h1>
          <p className="text-slate-600 max-w-lg mx-auto text-sm">
            성남시의 최신 복지 혜택 백서, 축제 및 행사 등 실생활에 유용한 이야기들을 모두 모았습니다.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-blue-100 shadow-sm">
            <span className="text-4xl"></span>
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
                      {post.tags && post.tags.map((tag) => (
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
                        자세히 읽기 &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
