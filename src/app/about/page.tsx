import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "서비스 소개 | 성남시 생활 정보",
  description: "성남시 생활 정보 서비스의 기획 의도, 데이터 출처 및 운영 방식을 소개합니다.",
  openGraph: {
    title: "서비스 소개 | 성남시 생활 정보",
    description: "성남시 생활 정보 서비스의 기획 의도, 데이터 출처 및 운영 방식을 소개합니다.",
    url: "https://my-local-info-b82.pages.dev/about/",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans flex flex-col justify-between">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏡</span>
            <div>
              <Link href="/">
                <span className="text-2xl font-bold text-blue-900 tracking-tight cursor-pointer">성남시 생활 정보</span>
              </Link>
              <p className="text-xs text-blue-700/80 mt-0.5">우리 동네의 생생한 축제와 맞춤 혜택을 전해드려요</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex gap-4 text-sm font-bold">
              <Link href="/" className="text-slate-600 hover:text-blue-900 transition">
                홈
              </Link>
              <Link href="/blog/" className="text-slate-600 hover:text-blue-900 transition">
                블로그
              </Link>
              <Link href="/about/" className="text-blue-900 border-b-2 border-blue-900 pb-1 transition">
                소개
              </Link>
            </nav>
            <div className="hidden sm:block">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                매일 아침 7시 자동 업데이트
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-blue-100/70 space-y-8">
          <div className="text-center pb-6 border-b border-slate-100">
            <h2 className="text-3xl font-extrabold text-blue-950 mb-3">🏡 서비스 소개</h2>
            <p className="text-slate-600 max-w-lg mx-auto text-sm md:text-base">
              성남시 주민들을 위한 맞춤형 생활 정보 제공 서비스의 기획 의도와 기술적 운영 방식을 투명하게 밝힙니다.
            </p>
          </div>

          {/* 소개 내용 */}
          <div className="space-y-6 leading-relaxed text-slate-700">
            <section className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                🎯 기획 및 서비스 운영 목적
              </h3>
              <p className="text-sm md:text-base pl-7">
                정부나 지방자치단체에서 운영하는 훌륭한 복지 지원 제도, 정책 자금 혜택, 유익한 지역 문화 행사들이 존재함에도 불구하고 바쁜 일상 속에서 혹은 복잡한 정보 탓에 이를 놓치는 경우가 많습니다. 
                본 서비스는 성남시민 및 지역 거주자분들이 꼭 필요한 혜택과 즐길 수 있는 행사를 놓치지 않고 편리하게 한눈에 확인하실 수 있도록 돕기 위해 기획되었습니다.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                🔌 데이터 수집 출처
              </h3>
              <p className="text-sm md:text-base pl-7">
                본 사이트에서 제공하는 이벤트, 혜택, 생활 소식은 행정안전부와 한국지능정보사회진흥원에서 운영하는 대한민국 정부의 대표적인 <strong>공공데이터포털(data.go.kr) Open API</strong> 및 정부24 공공서비스 정보 API 등을 직접 연동하여 실시간에 가깝게 공신력 있는 기관의 검증된 공공데이터 원문만을 바탕으로 수집합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                🤖 AI를 활용한 친근한 콘텐츠 작성 방식
              </h3>
              <p className="text-sm md:text-base pl-7">
                공공데이터의 특성상 전문 용어가 많아 이해하기 어렵고 형식이 딱딱한 문제가 있습니다. 
                따라서 본 사이트는 매일 아침 자동으로 데이터를 수집한 후, 구글의 최신 인공지능 기술인 <strong>Gemini AI (gemini-2.5-flash 모델)</strong>를 활용하여 어려운 용어를 풀어서 친근한 어조의 블로그 글로 변환하여 부모님이나 청년들 등 정보 소외 계층까지 누구나 쉽게 가독성 높은 형태로 읽으실 수 있도록 가공하여 제공하고 있습니다.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                🛡️ 정보의 신뢰성 검토 안내
              </h3>
              <p className="text-sm md:text-base pl-7">
                AI를 통해 글 작성을 자동화하고 있지만, 정보의 무결성을 지키기 위해 실제 접수/예약/신청에 필요한 중요한 날짜, 연락처, 장소, 지원 대상 요건은 가공하지 않고 원본 데이터 값을 100% 그대로 전달하는 것을 철칙으로 운영하고 있습니다. 
                또한, 상세 정보 및 공식 신청은 반드시 원본 데이터에 제공된 정부/지자체 운영 공식 웹사이트 링크를 통해 진행하실 수 있도록 각 글 하단에 원문 출처를 투명하게 제공합니다.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-center">
            <Link 
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-sm"
            >
              홈으로 이동하여 혜택 살펴보기
            </Link>
          </div>
        </div>
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-900 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <p>© 2026 우리 동네 생활 정보. All rights reserved.</p>
          <p>
            데이터 출처: 공공데이터포털(data.go.kr) Open API | 본 사이트는 구글 애드센스 및 쿠팡 파트너스 활동의 일환으로 수수료를 제공받을 수 있습니다.
          </p>
          <p className="text-slate-500 pt-1">
            마지막 정보 업데이트: <span className="font-mono text-slate-400">2026-06-06</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
