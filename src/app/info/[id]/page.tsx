import localInfoData from "../../../../public/data/local-info.json";
import Link from "next/link";
import { notFound } from "next/navigation";

interface InfoItem {
  id: string;
  title: string;
  category: "행사" | "혜택";
  startDate: string;
  endDate: string;
  location: string;
  target: string;
  summary: string;
  link: string;
}

// Next.js 정적 배포(Static Export)를 위해 가능한 모든 id 경로를 사전에 알려줍니다.
export async function generateStaticParams() {
  const items = localInfoData as InfoItem[];
  return items.map((item) => ({
    id: item.id,
  }));
}

// 각 상세 페이지를 렌더링하는 컴포넌트
export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const items = localInfoData as InfoItem[];
  const item = items.find((i) => i.id === resolvedParams.id);

  if (!item) {
    notFound();
  }

  const isEvent = item.category === "행사";
  const todayDateString = "2026-06-03";

  return (
    <div className="bg-amber-50/40 min-h-screen text-slate-800 font-sans flex flex-col justify-between">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-amber-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <span className="text-3xl">🏡</span>
            <div>
              <h1 className="text-2xl font-bold text-amber-900 tracking-tight">성남시 생활 정보</h1>
              <p className="text-xs text-amber-700/80 mt-0.5">우리 동네의 생생한 축제와 맞춤 혜택을 전해드려요</p>
            </div>
          </Link>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        {/* 뒤로 가기 링크 */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:text-amber-950 transition"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>

        {/* 상세 정보 카드 본문 */}
        <article className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          {/* 상단 타이틀 영역 */}
          <div className="p-6 md:p-10 border-b border-slate-100 bg-gradient-to-br from-amber-50/50 to-transparent">
            <div className="flex items-center gap-2.5 mb-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                isEvent 
                  ? "bg-pink-50 text-pink-700 border-pink-100" 
                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
              }`}>
                {isEvent ? "📅 행사" : "🎁 혜택"}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isEvent ? "행사/축제 상세정보" : "지원금/혜택 상세정보"}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">
              {item.title}
            </h2>
          </div>

          {/* 주요 항목 표식 영역 (기간, 장소, 대상) */}
          <div className="p-6 md:p-10 bg-slate-50/60 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                {isEvent ? "🗓️ 행사 기간" : "🗓️ 지원 기간"}
              </span>
              <p className="text-sm font-bold text-slate-800">
                {isEvent 
                  ? (item.startDate === item.endDate ? item.startDate : `${item.startDate} ~ ${item.endDate}`)
                  : "상시 모집 / 해당 연도 시행"
                }
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                {isEvent ? "📍 행사 장소" : "📍 신청 및 접수처"}
              </span>
              <p className="text-sm font-bold text-slate-800 truncate" title={item.location}>
                {item.location}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                {isEvent ? "👥 참가 대상" : "👥 지원 대상"}
              </span>
              <p className="text-sm font-bold text-slate-800 truncate" title={item.target}>
                {item.target}
              </p>
            </div>
          </div>

          {/* 상세 설명 글 내용 */}
          <div className="p-6 md:p-10 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <span className="text-amber-600">▪</span> 상세 안내 내용
              </h3>
              <p className="text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
                {item.summary}
              </p>
            </div>

            {/* 원본 링크 및 뒤로가기 버튼 */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <a 
                href={item.link}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-center transition shadow-sm"
              >
                공식 사이트에서 자세히 보기 →
              </a>
              <Link 
                href="/"
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8 py-3 rounded-xl text-center transition"
              >
                이전 화면으로
              </Link>
            </div>
          </div>
        </article>
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-900 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <p>© 2026 우리 동네 생활 정보. All rights reserved.</p>
          <p>
            데이터 출처: 공공데이터포털(data.go.kr) Open API | 본 사이트는 구글 애드센스 및 쿠팡 파트너스 활동의 일환으로 수수료를 제공받을 수 있습니다.
          </p>
          <p className="text-slate-500 pt-1">
            마지막 정보 업데이트: <span className="font-mono text-slate-400">{todayDateString}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
