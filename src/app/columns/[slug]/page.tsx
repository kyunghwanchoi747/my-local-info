import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site.config";
import { getColumnData, getAllColumnSlugs } from "@/lib/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllColumnSlugs();
  return slugs.map((item) => ({
    slug: item.params.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const column = getColumnData(slug);
  if (!column) return {};

  return {
    title: `${column.title} - ${siteConfig.siteName}`,
    description: column.summary,
    alternates: {
      canonical: `/columns/${encodeURIComponent(column.slug)}/`,
    },
    openGraph: {
      url: `${siteConfig.siteUrl}/columns/${encodeURIComponent(column.slug)}/`,
      type: "article",
      publishedTime: column.date,
    },
  };
}

export default async function ColumnDetailPage({ params }: Props) {
  const { slug } = await params;
  const column = getColumnData(slug);

  // 200 을 반환하는 소프트 404 를 만들지 않도록 실제 404 처리
  if (!column) {
    notFound();
  }

  const columnJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": column.title,
    "datePublished": column.date,
    "description": column.summary,
    "author": {
      "@type": "Person",
      "name": column.author || siteConfig.owner.name,
      "url": `${siteConfig.siteUrl}/author/`
    },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteConfig.siteUrl}/icon.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteConfig.siteUrl}/columns/${encodeURIComponent(column.slug)}/`
    },
    ...(column.image ? { image: column.image } : {})
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "홈",
        "item": `${siteConfig.siteUrl}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "칼럼",
        "item": `${siteConfig.siteUrl}/columns/`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": column.title,
        "item": `${siteConfig.siteUrl}/columns/${encodeURIComponent(column.slug)}/`
      }
    ]
  };

  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-12">
        
        {/* 상단 브레드크럼 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <Link href="/columns/" className="hover:text-blue-600 transition">칼럼</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium line-clamp-1">{column.title}</span>
        </nav>

        <header className="mb-8 border-b border-slate-100 pb-6">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 mb-4 border border-emerald-100">
            성나머의 칼럼 코너
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-3">
            {column.title}
          </h1>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">작성자:</span>
              <Link href="/author/" className="text-blue-900 font-bold hover:underline">
                {column.author}
              </Link>
            </div>
            <span>작성일: {column.date}</span>
          </div>
        </header>

        {column.image && (
          <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-sm">
            <img 
              src={column.image} 
              alt={column.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 본문 요약 박스 */}
        <div className="bg-slate-50 rounded-xl p-5 border-l-4 border-emerald-500 mb-8 text-sm text-slate-700 leading-relaxed font-medium">
          한줄 요약: {column.summary}
        </div>

        {/* 본문 에디터 렌더러 */}
        <div className="prose prose-slate max-w-none break-words overflow-hidden prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-800 leading-relaxed text-slate-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {column.content || ""}
          </ReactMarkdown>
        </div>

        {/* 칼럼 하단 필자 정보 박스 */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-100 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            <div className="w-16 h-16 rounded-full bg-blue-900 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
              최
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <span className="font-bold text-slate-900">{column.author}</span>
                <span className="text-xs text-slate-400">{siteConfig.siteName} 운영자</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {siteConfig.owner.bio}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs">
                <Link 
                  href="/author/"
                  className="font-bold text-blue-900 hover:underline"
                >
                  프로필 & 칼럼 더보기 &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

      </article>
    </div>
  );
}
