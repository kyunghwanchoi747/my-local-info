import Link from "next/link";
import localData from "../../public/data/local-info.json";

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

export default function Home() {
  const items = localData.items as InfoItem[];
  const events = items.filter((item) => item.category === "행사");
  const benefits = items.filter((item) => item.category === "혜택");

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-stone-800">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-orange-600 tracking-tight">
            🏡 성남시 생활 정보
          </h1>
          <p className="text-stone-500 mt-1 text-sm md:text-base">우리 동네 유익한 정보만 모았습니다.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-12">
        {/* 행사/축제 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🌸</span>
            <h2 className="text-xl md:text-2xl font-bold">이번 달 행사 / 축제</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-shadow group"
              >
                <div className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full w-fit mb-3">
                  {event.category}
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-orange-600 transition-colors">
                  {event.name}
                </h3>
                <div className="space-y-2 text-sm text-stone-600">
                  <p className="flex items-start gap-2">
                    <span className="text-stone-400 font-medium whitespace-nowrap">📅 일시:</span>
                    <span>{event.startDate === event.endDate ? event.startDate : `${event.startDate} ~ ${event.endDate}`}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-stone-400 font-medium whitespace-nowrap">📍 장소:</span>
                    <span>{event.location}</span>
                  </p>
                  <p className="mt-4 line-clamp-2 text-stone-500 italic">&quot;{event.summary}&quot;</p>
                </div>
                <Link
                  href={`/items/${event.id}`}
                  className="mt-6 block text-center py-2 bg-orange-50 text-orange-600 rounded-xl font-medium text-sm hover:bg-orange-600 hover:text-white transition-colors"
                >
                  자세히 보기
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 지원금/혜택 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">💰</span>
            <h2 className="text-xl md:text-2xl font-bold">지원금 / 혜택 정보</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6"
              >
                <div className="flex-1">
                  <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full w-fit mb-3">
                    {benefit.category}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{benefit.name}</h3>
                  <div className="space-y-2 text-sm text-stone-600">
                    <p className="flex items-start gap-2">
                      <span className="text-stone-400 font-medium whitespace-nowrap">👤 대상:</span>
                      <span>{benefit.target}</span>
                    </p>
                    <p className="mt-3 text-stone-500">{benefit.summary}</p>
                  </div>
                </div>
                <div className="md:w-32 flex flex-col justify-end">
                  <Link
                    href={`/items/${benefit.id}`}
                    className="block text-center py-2 border border-blue-200 text-blue-600 rounded-xl font-medium text-sm hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    신청방법 확인
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-white border-t border-orange-100 mt-20">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center space-y-4">
          <p className="text-stone-400 text-sm">
            본 사이트의 데이터는 <span className="font-semibold">공공데이터포털</span>의 정보를 바탕으로 작성되었습니다.
          </p>
          <div className="text-stone-300 text-xs">
            마지막 업데이트: 2026년 3월 24일
          </div>
          <div className="pt-4 flex justify-center gap-4 text-stone-400 text-sm">
            <a href="#" className="hover:text-orange-500 underline underline-offset-4">개인정보처리방침</a>
            <a href="#" className="hover:text-orange-500 underline underline-offset-4">이용약관</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
