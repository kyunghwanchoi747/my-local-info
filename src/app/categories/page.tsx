import Link from "next/link";
import { siteConfig } from "@/lib/site.config";
import { getSortedPostsData } from "@/lib/posts";

export const metadata = {
  title: `카테고리 모음 - ${siteConfig.siteName}`,
  description: `${siteConfig.siteName}의 카테고리별 유용한 정보 목록입니다.`,
  alternates: { canonical: "/categories/" },
  openGraph: { url: "https://sungnamer.com/categories/" },
};

export default function CategoriesPage() {
  const posts = getSortedPostsData();
  
  // 카테고리별 글 개수 집계
  const categoryCounts = posts.reduce((acc, post) => {
    const cat = post.category || "기타";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }));

  // 카테고리 테마 색상 및 아이콘 매핑
  const categoryMeta: Record<string, { icon: string; bg: string; text: string }> = {
    "행사": { icon: "🎉", bg: "bg-pink-50", text: "text-pink-700" },
    "축제": { icon: "", bg: "bg-rose-50", text: "text-rose-700" },
    "혜택": { icon: "", bg: "bg-emerald-50", text: "text-emerald-700" },
    "지원금": { icon: "", bg: "bg-amber-50", text: "text-amber-700" },
    "복지": { icon: "❤️", bg: "bg-blue-50", text: "text-blue-700" },
    "금융": { icon: "🏦", bg: "bg-indigo-50", text: "text-indigo-700" },
    "수산": { icon: "🐟", bg: "bg-cyan-50", text: "text-cyan-700" },
    "기타": { icon: "", bg: "bg-slate-50", text: "text-slate-700" },
  };

  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* 상단 브레드크럼 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium">카테고리</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">정보 카테고리</h1>
        <p className="text-slate-600 mb-10 leading-relaxed text-sm">
          {siteConfig.siteName}이 분류하여 제공하는 정보 모음입니다.
          원하시는 카테고리를 선택하시면 관련 세부 행정 가이드와 축제 소식을 모아보실 수 있습니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const meta = categoryMeta[cat.name] || categoryMeta["기타"];
            return (
              <Link 
                href={`/categories/${encodeURIComponent(cat.name)}/`}
                key={cat.name}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/70 hover:shadow-md hover:border-blue-200 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <span className={`text-3xl p-3.5 rounded-xl ${meta.bg} ${meta.text}`}>
                    {meta.icon}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950 group-hover:text-blue-900 transition">
                      {cat.name} 정보
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {cat.name} 관련 핵심 생활 밀착형 정보 목록
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {cat.count}개의 포스트
                  </span>
                  <span className="text-slate-400 group-hover:translate-x-1 transition duration-200">&rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
