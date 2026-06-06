import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostData, getAllPostSlugs } from "@/lib/posts";

interface PostParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths.map((path) => ({
    slug: path.params.slug,
  }));
}

export default async function BlogPostPage({ params }: PostParams) {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-amber-50/40 min-h-screen text-slate-800 font-sans flex flex-col justify-between">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-amber-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏡</span>
            <div>
              <Link href="/">
                <span className="text-2xl font-bold text-amber-900 tracking-tight cursor-pointer">성남시 생활 정보</span>
              </Link>
              <p className="text-xs text-amber-700/80 mt-0.5">우리 동네의 생생한 축제와 맞춤 혜택을 전해드려요</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex gap-4 text-sm font-bold">
              <Link href="/" className="text-slate-600 hover:text-amber-900 transition">
                홈
              </Link>
              <Link href="/blog/" className="text-amber-900 border-b-2 border-amber-900 pb-1 transition">
                블로그
              </Link>
            </nav>
            <div className="hidden sm:block">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                매일 아침 7시 자동 업데이트
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
        {/* 뒤로가기 버튼 */}
        <Link href="/blog/">
          <span className="inline-flex items-center text-sm font-semibold text-amber-900 hover:text-amber-700 mb-6 cursor-pointer gap-1">
            ← 목록으로 돌아가기
          </span>
        </Link>

        {/* 블로그 상세 아티클 */}
        <article className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-amber-100/70">
          <header className="pb-6 border-b border-slate-100 mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {post.category && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  {post.category}
                </span>
              )}
              <span className="text-xs font-semibold text-slate-400">{post.date}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              {post.title}
            </h1>
            <p className="text-slate-500 mt-4 text-sm md:text-base leading-relaxed border-l-4 border-amber-400 pl-4 py-1">
              {post.summary}
            </p>
          </header>

          {/* 마크다운 본문 */}
          <div className="prose prose-amber max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-800 leading-relaxed text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content || ""}
            </ReactMarkdown>
          </div>

          {/* 하단 태그 및 공식 사이트 버튼 */}
          <div className="mt-10 pt-6 border-t border-slate-100 space-y-4">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {post.link && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-sm"
              >
                공식 사이트에서 자세히 보기 →
              </a>
            )}
          </div>
        </article>
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
