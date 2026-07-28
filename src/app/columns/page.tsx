import Link from "next/link";
import { siteConfig } from "@/lib/site.config";
import { getSortedColumnsData } from "@/lib/posts";

export const metadata = {
  title: `운영자 칼럼 - ${siteConfig.siteName}`,
  description: `${siteConfig.owner.name} 운영자가 직접 집필하는 칼럼 연재 목록입니다.`,
  alternates: { canonical: "/columns/" },
  openGraph: { url: "https://sungnamer.com/columns/" },
};

export default function ColumnsPage() {
  const columns = getSortedColumnsData();

  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* 브레드크럼 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium">칼럼</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">운영자 칼럼</h1>
        <p className="text-slate-600 mb-10 leading-relaxed text-sm">
          {siteConfig.owner.name} 운영자의 개인적인 관점과 생생한 생활 팁을 나누는 소중한 연재 지면입니다. 
          일반적인 행정 나열식 정보보다 조금 더 따뜻하고 주관이 담긴 이야기를 공유합니다.
        </p>

        {columns.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">
            아직 연재된 칼럼이 없습니다. 조만간 첫 번째 연재 글로 찾아뵙겠습니다!
          </div>
        ) : (
          <div className="space-y-6">
            {columns.map((column) => (
              <div 
                key={column.slug}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100/80 hover:shadow-md hover:border-blue-200 transition flex flex-col md:flex-row gap-6 items-start"
              >
                {column.image && (
                  <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={column.image} 
                      alt={column.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-800">
                    <span>칼럼 연재</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{column.date}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-950 mb-3 hover:text-blue-900 transition">
                    <Link href={`/columns/${column.slug}/`}>
                      {column.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2 md:line-clamp-3">
                    {column.summary}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                    <span className="text-slate-500 font-medium">필자: {column.author}</span>
                    <Link 
                      href={`/columns/${column.slug}/`}
                      className="font-bold text-blue-900 hover:underline"
                    >
                      칼럼 전문 읽기 &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
