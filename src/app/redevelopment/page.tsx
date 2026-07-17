import Link from "next/link";
import { siteConfig } from "@/lib/site.config";
import { getSortedPostsData } from "@/lib/posts";

export const metadata = {
  title: `분당·성남 재개발 - ${siteConfig.siteName}`,
  description:
    "1기 신도시 재건축부터 성남 재개발 소식까지, 용어 해설과 최신 동향을 정리합니다.",
};

export default function RedevelopmentPage() {
  const allPosts = getSortedPostsData();
  const filteredPosts = allPosts.filter((post) => post.category === "재개발");

  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* 상단 브레드크럼 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium">재개발</span>
        </nav>

        <div className="border-b border-slate-200 pb-5 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            🏗️ 분당·성남 재개발
          </h1>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            1기 신도시 재건축부터 성남 재개발 소식까지, 용어 해설과 최신 동향을 정리합니다.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            총 {filteredPosts.length}개의 글이 준비되어 있습니다.
          </p>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">
            아직 등록된 재개발 글이 없습니다. 곧 용어 해설과 동향 소식으로 찾아뵙겠습니다.
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
                  <span className="text-xs text-slate-400">작성자: 최경환</span>
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

        <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 leading-relaxed">
          본 섹션의 글은 제도와 절차에 대한 일반 정보이며, 부동산 투자 조언이 아닙니다.
          재건축·재개발 관련 구체적 사항은 성남시청 및 국토교통부 공식 발표를 확인하시기 바랍니다.
        </div>

      </div>
    </div>
  );
}
