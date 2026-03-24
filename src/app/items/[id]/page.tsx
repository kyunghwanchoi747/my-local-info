import Link from "next/link";
import localData from "../../../../public/data/local-info.json";
import { notFound } from "next/navigation";

interface InfoItem {
  id: string;
  name: string;
  category: "행사" | "혜택";
  startDate: string;
  endDate: string;
  location: string;
  target: string;
  summary: string;
  link: string;
}

export function generateStaticParams() {
  const items = localData.items as InfoItem[];
  return items.map((item) => ({
    id: item.id,
  }));
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = localData.items as InfoItem[];
  const item = items.find((i) => i.id === id);

  if (!item) {
    notFound();
  }

  const isEvent = item.category === "행사";

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-stone-800 pb-20">
      {/* 상단 네비게이션 */}
      <nav className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-orange-600 font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            ← 목록으로
          </Link>
          <div className="text-stone-400 text-sm font-medium">상세 정보</div>
          <div className="w-16"></div> {/* 밸런스를 위한 빈 공간 */}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        <article className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
          {/* 헤더 섹션 */}
          <div className={`p-8 md:p-12 ${isEvent ? "bg-orange-50" : "bg-blue-50"}`}>
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                isEvent ? "bg-orange-200 text-orange-800" : "bg-blue-200 text-blue-800"
              }`}
            >
              {item.category}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight mb-6">
              {item.name}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-stone-200/50">
              <div className="space-y-1">
                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">기간</p>
                <p className="font-semibold text-stone-700">
                  {item.startDate === item.endDate ? item.startDate : `${item.startDate} ~ ${item.endDate}`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">장소</p>
                <p className="font-semibold text-stone-700">{item.location}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">대상</p>
                <p className="font-semibold text-stone-700">{item.target}</p>
              </div>
            </div>
          </div>

          {/* 본문 섹션 */}
          <div className="p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 text-stone-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-orange-400 rounded-full"></span>
                상세 정보
              </h2>
              <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-wrap">
                {item.summary}
              </p>
            </section>

            <div className="pt-8 border-t border-stone-100">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-4 rounded-2xl font-bold text-lg transition-all shadow-md hover:shadow-lg active:scale-[0.98] ${
                  isEvent 
                    ? "bg-orange-500 text-white hover:bg-orange-600" 
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                자세히 보기 →
              </a>
              <p className="text-center text-sm text-stone-400 mt-4">
                ※ 위 버튼을 클릭하면 관련 공식 사이트로 이동합니다.
              </p>
            </div>
          </div>
        </article>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 font-medium transition-colors"
          >
            🏡 메인으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
