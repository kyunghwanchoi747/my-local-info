import localInfoData from "../../public/data/local-info.json";
import Link from "next/link";

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

export default function Home() {
  const items = localInfoData as InfoItem[];
  const events = items.filter((item) => item.category === "행사");
  const benefits = items.filter((item) => item.category === "혜택");
  const todayDateString = "2026-06-03"; // 로컬 시간 기준

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
              <Link href="/" className="text-amber-900 border-b-2 border-amber-900 pb-1 transition">
                홈
              </Link>
              <Link href="/blog/" className="text-slate-600 hover:text-amber-900 transition">
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
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {/* 상단 웰컴 배너 */}
        <section className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-6 md:p-8 text-white shadow-md mb-10">
          <h2 className="text-xl md:text-2xl font-bold mb-2">🎉 오늘 우리 동네 소식은 어떨까요?</h2>
          <p className="text-sm md:text-base text-amber-50 opacity-90 leading-relaxed max-w-2xl">
            공공데이터포털에서 실시간으로 수집한 성남시의 각종 혜택과 행사 소식입니다. 
            놓치기 쉬운 청년 지원금부터 이번 주말 아이들과 함께 가볼 만한 축제 정보까지 한 곳에서 편리하게 확인해 보세요!
          </p>
        </section>

        {/* 이번 달 행사/축제 섹션 */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6 border-b border-amber-200/60 pb-3">
            <span className="text-2xl">🌸</span>
            <h3 className="text-xl font-bold text-amber-950">이번 달 행사 / 축제</h3>
            <span className="text-sm font-medium text-amber-700/80 bg-amber-100 px-2 py-0.5 rounded-md ml-2">
              {events.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-xl shadow-sm border border-amber-100 hover:shadow-md hover:border-amber-200 transition duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-100">
                      📅 {event.category}
                    </span>
                    <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2 py-1 rounded">
                      {event.startDate === event.endDate ? event.startDate : `${event.startDate} ~ ${event.endDate}`}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{event.title}</h4>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">{event.summary}</p>
                </div>
                
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700 min-w-[45px]">📍 장소:</span>
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700 min-w-[45px]">👥 대상:</span>
                    <span className="truncate">{event.target}</span>
                  </div>
                  <div className="pt-2">
                    <Link 
                      href="/blog"
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition shadow-sm"
                    >
                      상세 정보 보기
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 지원금/혜택 정보 섹션 */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-6 border-b border-amber-200/60 pb-3">
            <span className="text-2xl">💰</span>
            <h3 className="text-xl font-bold text-amber-950">지원금 / 혜택 정보</h3>
            <span className="text-sm font-medium text-amber-700/80 bg-amber-100 px-2 py-0.5 rounded-md ml-2">
              {benefits.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div 
                key={benefit.id} 
                className="bg-white rounded-xl shadow-sm border border-amber-100 hover:shadow-md hover:border-amber-200 transition duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      🎁 {benefit.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      상시 모집
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{benefit.title}</h4>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">{benefit.summary}</p>
                </div>
                
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700 min-w-[55px]">📍 신청방법:</span>
                    <span className="truncate">{benefit.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700 min-w-[55px]">👥 대상요건:</span>
                    <span className="truncate">{benefit.target}</span>
                  </div>
                  <div className="pt-2">
                    <Link 
                      href="/blog"
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition shadow-sm"
                    >
                      지원 대상 확인 & 신청하기
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-900 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
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
