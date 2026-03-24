import { getAllPosts, getPostBySlug } from "@/lib/posts";
import type { Metadata } from 'next';
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import localData from "../../../../public/data/local-info.json";
import AdBanner from "@/components/AdBanner";

export const dynamicParams = false;

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: `${post.title} | 성남시 생활 정보`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `https://my-local-info-b82.pages.dev/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const originalItem = localData.items.find((item: any) => 
    post.title.includes(item.name) || post.content.includes(item.name)
  );
  const sourceLink = originalItem?.link && originalItem.link !== "#" ? originalItem.link : null;

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-stone-800 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "datePublished": post.date,
            "description": post.summary,
            "author": {
              "@type": "Organization",
              "name": "성남시 생활 정보"
            },
            "publisher": {
              "@type": "Organization",
              "name": "성남시 생활 정보"
            }
          })
        }}
      />
      <nav className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/blog" className="text-orange-600 font-bold hover:opacity-80 transition-opacity">
            ← 목록으로
          </Link>
          <Link href="/" className="text-stone-400 text-sm hover:text-orange-500 transition-colors">홈</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        <article className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="p-8 md:p-12 bg-orange-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-orange-200 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
                {post.category}
              </span>
              <span className="text-stone-400 text-sm">최종 업데이트: {post.date}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-stone-500">{post.summary}</p>
            {post.tags.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-white text-stone-500 px-2 py-0.5 rounded-full border border-stone-200">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-8 md:p-12">
            <div className="prose prose-stone max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          <AdBanner />

          {/* E-E-A-T 준수: AI 안내 및 출처 링크 */}
          <div className="mx-8 md:mx-12 mb-12 p-6 bg-stone-50 rounded-2xl border border-stone-100 text-sm text-stone-500 mt-8">
            <p className={sourceLink ? "mb-4" : ""}>
              ✨ <strong>안내:</strong> 이 글은 공공데이터포털(<a href="https://data.go.kr" target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-600">data.go.kr</a>)의 정보를 바탕으로 AI가 작성하였습니다. 정확한 내용은 원문 링크를 통해 확인해주세요.
            </p>
            {sourceLink && (
              <a href={sourceLink} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">
                원문 출처 링크 이동
              </a>
            )}
          </div>
        </article>

        <div className="mt-12 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 font-medium transition-colors">
            📝 블로그 목록으로
          </Link>
        </div>
      </main>
    </div>
  );
}
