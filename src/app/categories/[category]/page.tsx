import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site.config";
import { getSortedPostsData } from "@/lib/posts";

interface Props {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  const categories = Array.from(new Set(posts.map(post => post.category).filter(Boolean)));
  return categories.map((category) => ({
    category: category,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  return {
    title: `${decodedCategory} 정보 모음 - ${siteConfig.siteName}`,
    description: `${siteConfig.siteName}의 ${decodedCategory} 카테고리에 등록된 추천 생활 가이드 목록입니다.`,
    alternates: {
      canonical: `/categories/${encodeURIComponent(decodedCategory)}/`,
    },
    openGraph: {
      url: `${siteConfig.siteUrl}/categories/${encodeURIComponent(decodedCategory)}/`,
    },
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  
  const allPosts = getSortedPostsData();
  const filteredPosts = allPosts.filter(
    (post) => (post.category || "기타") === decodedCategory
  );

  // 글이 없는 카테고리는 빈 페이지가 색인되지 않도록 404 처리
  if (filteredPosts.length === 0) {
    notFound();
  }

  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* 상단 브레드크럼 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <Link href="/categories/" className="hover:text-blue-600 transition">카테고리</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium">{decodedCategory}</span>
        </nav>

        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {decodedCategory} 카테고리
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              총 {filteredPosts.length}개의 생활 밀착형 정보가 준비되어 있습니다.
            </p>
          </div>
          <Link 
            href="/categories/"
            className="text-xs text-blue-800 bg-blue-50 hover:bg-blue-100 font-semibold px-4 py-2 rounded-lg transition"
          >
            전체 카테고리 보기
          </Link>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">
            이 카테고리에 아직 등록된 글이 없습니다. 다른 유용한 카테고리를 탐색해 보세요!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <div 
                key={post.slug}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {post.category || "기타"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{post.date}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-950 mb-2 hover:text-blue-900 transition">
                    <Link href={`/blog/${post.slug}/`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {post.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-400">작성자: 성나머</span>
                  <Link 
                    href={`/blog/${post.slug}/`}
                    className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
                  >
                    자세히 보기 &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
