import Link from "next/link";
import type { Metadata } from "next";
import { Header, Footer } from "@/components/HeaderFooter";
import { siteConfig } from "@/lib/site.config";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `서비스 소개 - ${siteConfig.siteName}`,
  description: `${siteConfig.siteName} 서비스의 기획 의도, 데이터 출처 및 운영 방식을 소개합니다.`,
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans flex flex-col justify-between">
      
      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full">
        
        {/* 브레드크럼 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium">서비스 소개</span>
        </nav>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-blue-100/70 space-y-8">
          <div className="text-center pb-6 border-b border-slate-100">
            <h1 className="text-3xl font-extrabold text-blue-950 mb-3">서비스 소개</h1>
            <p className="text-slate-600 max-w-lg mx-auto text-sm">
              성남시 주민들을 위한 맞춤형 생활 정보 제공 서비스의 기획 의도와 기술적 운영 방식을 투명하게 밝힙니다.
            </p>
          </div>

          {/* 소개 내용 */}
          <div className="space-y-6 leading-relaxed text-slate-700">
            <section className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                기획 및 서비스 운영 목적
              </h3>
              <p className="text-sm md:text-base pl-7">
                정부나 지방자치단체에서 운영하는 훌륭한 복지 지원 제도, 정책 자금 혜택, 유익한 지역 문화 행사들이 존재함에도 불구하고 바쁜 일상 속에서 혹은 복잡한 정보 탓에 이를 놓치는 경우가 많습니다. 
                본 서비스는 성남시민 및 지역 거주자분들이 꼭 필요한 혜택과 즐길 수 있는 행사를 놓치지 않고 편리하게 한눈에 확인하실 수 있도록 돕기 위해 기획되었습니다.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                데이터 수집 출처
              </h3>
              <p className="text-sm md:text-base pl-7">
                본 사이트에서 제공하는 이벤트, 혜택, 생활 소식은 행정안전부와 한국지능정보사회진흥원에서 운영하는 대한민국 정부의 대표적인 <strong>공공데이터포털(data.go.kr) Open API</strong> 및 정부24 공공서비스 정보 API 등을 직접 연동하여 실시간에 가깝게 공신력 있는 기관의 검증된 공공데이터 원문만을 바탕으로 수집합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                AI를 활용한 친근한 콘텐츠 작성 방식
              </h3>
              <p className="text-sm md:text-base pl-7">
                공공데이터의 특성상 전문 용어가 많아 이해하기 어렵고 형식이 딱딱한 문제가 있습니다. 
                따라서 본 사이트는 매일 아침 자동으로 데이터를 수집한 후, 구글의 최신 인공지능 기술인 <strong>Gemini AI (gemini-2.5-flash 모델)</strong>를 활용하여 어려운 용어를 풀어서 친근한 어조의 블로그 글로 변환하여 부모님이나 청년들 등 정보 소외 계층까지 누구나 쉽게 가독성 높은 형태로 읽으실 수 있도록 가공하여 제공하고 있습니다.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                정보의 신뢰성 검토 안내
              </h3>
              <p className="text-sm md:text-base pl-7">
                AI를 통해 글 작성을 자동화하고 있지만, 정보의 무결성을 지키기 위해 실제 접수/예약/신청에 필요한 중요한 날짜, 연락처, 장소, 지원 대상 요건은 가공하지 않고 원본 데이터 값을 100% 그대로 전달하는 것을 철칙으로 운영하고 있습니다. 
                또한, 상세 정보 및 공식 신청은 반드시 원본 데이터에 제공된 정부/지자체 운영 공식 웹사이트 링크를 통해 진행하실 수 있도록 각 글 하단에 원문 출처를 투명하게 제공합니다.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
