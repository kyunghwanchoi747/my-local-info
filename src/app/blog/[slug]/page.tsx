import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getPostData, getAllPostSlugs } from "@/lib/posts";
import type { Metadata } from "next";
import AdBanner from "@/components/AdBanner";
import Comments from "@/components/Comments";
import { Header, Footer } from "@/components/HeaderFooter";
import { siteConfig } from "@/lib/site.config";

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

export async function generateMetadata({ params }: PostParams): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostData(slug);
  if (!post) {
    return {};
  }
  return {
    title: `${post.title} | ${siteConfig.siteName}`,
    description: post.summary,
    alternates: {
      canonical: `/blog/${encodeURIComponent(post.slug)}/`,
    },
    openGraph: {
      title: `${post.title} | ${siteConfig.siteName}`,
      description: post.summary,
      url: `${siteConfig.siteUrl}/blog/${encodeURIComponent(post.slug)}/`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: PostParams) {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    notFound();
  }

  const postJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "datePublished": post.date,
    "description": post.summary,
    "author": {
      "@type": "Person",
      "name": siteConfig.owner.name,
      "url": `${siteConfig.siteUrl}/author/`
    },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteConfig.siteUrl}/favicon.ico`
      }
    }
  };

  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      
      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
        
        {/* 브레드크럼 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <Link href="/blog/" className="hover:text-blue-600 transition">블로그</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium line-clamp-1">{post.title}</span>
        </nav>

        {/* 블로그 상세 아티클 */}
        <article className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-blue-100/70">
          <header className="pb-6 border-b border-slate-100 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 w-full">
              <div className="flex flex-wrap items-center gap-2">
                {post.category && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
                    {post.category}
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-400">{post.date}</span>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                최종 업데이트: {post.date}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {post.title}
            </h1>
            <p className="text-slate-505 mt-4 text-sm md:text-base leading-relaxed border-l-4 border-blue-400 pl-4 py-1">
              {post.summary}
            </p>
          </header>

          {/* 마크다운 본문 */}
          <div className="prose prose-blue max-w-none break-words overflow-hidden prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-800 leading-relaxed text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {post.content || ""}
            </ReactMarkdown>
          </div>

          {/* 본문 하단 광고 */}
          <AdBanner slot="post-bottom" />

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
                공식 관공서 상세안내 보러가기 →
              </a>
            )}

            {/* 출처 및 AI 생성 정보 공개 (E-E-A-T 신뢰도 구축) */}
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 space-y-2 mt-6 border border-slate-100">
              <p className="font-semibold text-slate-800">출처 및 안내</p>
              {post.link && (
                <p>
                  <strong>행정포털 원문 출처:</strong>{" "}
                  <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {post.link}
                  </a>
                </p>
              )}
              <p>이 글은 공공데이터포털(data.go.kr)의 정보를 바탕으로 시민들의 쉬운 이해를 위해 AI가 초안을 돕고 운영자가 검수한 글입니다.</p>
            </div>

            {/* 운영자/편집자 박스 추가 (요구사항) */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start mt-6">
              <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                최
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="font-bold text-slate-900">글 작성 / 편집자: {siteConfig.owner.name}</span>
                  <span className="text-xxs text-slate-400">정보 큐레이터</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  {siteConfig.owner.bio}
                </p>
                <Link 
                  href="/author/" 
                  className="text-xs font-bold text-blue-900 hover:underline inline-block"
                >
                  필자의 다른 연재 칼럼 더보기 &rarr;
                </Link>
              </div>
            </div>

          </div>

          {/* 댓글 (Cusdis) */}
          <Comments
            pageId={slug}
            pageTitle={post.title}
            pageUrl={`${siteConfig.siteUrl}/blog/${slug}/`}
          />
        </article>
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
