import localInfoData from "../../public/data/local-info.json";
import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import AdBanner from "@/components/AdBanner";
import Chatbot from "@/components/Chatbot";

interface InfoItem {
  id: string | number;
  title?: string;
  name?: string;
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
  const posts = getSortedPostsData();
  const events = items.filter((item) => item.category === "행사");
  const benefits = items.filter((item) => item.category === "혜택");
  
  const findMatchedPost = (item: InfoItem) => {
    const nameToCheck = (item.name || item.title || "").trim();
    if (!nameToCheck) return null;
    
    // 1. 단순 포함 관계 확인
    let matched = posts.find(post => post.title.includes(nameToCheck) || nameToCheck.includes(post.title));
    if (matched) return matched;
    
    // 2. 괄호 및 특수문자 제거 후 비교
    const cleanName = nameToCheck.replace(/\([^)]*\)/g, '').replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ').trim();
    matched = posts.find(post => post.title.includes(cleanName) || cleanName.includes(post.title));
    if (matched) return matched;
    
    // 3. 2글자 이상 단어들 중 공통 매칭되는 단어가 있는지 확인
    const words = cleanName.split(/\s+/).filter(w => w.length >= 2);
    if (words.length === 0) return null;
    
    return posts.find((post) => {
      const matchCount = words.filter(word => post.title.includes(word)).length;
      // 단어가 여러 개면 최소 2개 단어 일치, 단어가 1개면 1개 일치
      return matchCount >= 2 || (words.length === 1 && matchCount === 1);
    }) || null;
  };

  const getDetailLink = (item: InfoItem) => {
    const matchedPost = findMatchedPost(item);
    return matchedPost ? `/blog/${matchedPost.slug}/` : "/blog/";
  };

  const getPostImage = (item: InfoItem) => {
    const matchedPost = findMatchedPost(item);
    return matchedPost?.image || null;
  };

  const todayDateString = "2026-06-06"; // 로컬 시간 기준

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
              <Link href="/" className="text-blue-900 border-b-2 border-blue-900 pb-1 transition">
                홈
              </Link>
              <Link href="/blog/" className="text-slate-600 hover:text-blue-900 transition">
                블로그
              </Link>
              <Link href="/about/" className="text-slate-600 hover:text-blue-900 transition">
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
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {/* 상단 웰컴 배너 */}
        <section 
          className="relative rounded-2xl overflow-hidden p-8 md:p-12 text-white shadow-lg mb-10 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=1200')` }}
        >
          {/* 반투명 블랙 그라데이션 필터 overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40 z-0"></div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 mb-4">
              📍 우리 동네 실시간 소식
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight leading-tight">🎉 오늘 우리 동네 소식은 어떨까요?</h2>
            <p className="text-sm md:text-base text-slate-200 opacity-90 leading-relaxed">
              공공데이터포털에서 실시간으로 수집한 성남시의 각종 혜택과 행사 소식입니다. 
              놓치기 쉬운 청년 지원금부터 이번 주말 아이들과 함께 가볼 만한 축제 정보까지 한 곳에서 편리하게 확인해 보세요!
            </p>
          </div>
        </section>

        {/* 이번 달 행사/축제 섹션 */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6 border-b border-blue-200/60 pb-3">
            <span className="text-2xl">🌸</span>
            <h3 className="text-xl font-bold text-blue-950">이번 달 행사 / 축제</h3>
            <span className="text-sm font-medium text-blue-700/80 bg-blue-100 px-2 py-0.5 rounded-md ml-2">
              {events.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => {
              const eventJsonLd = {
                "@context": "https://schema.org",
                "@type": "Event",
                "name": event.name || event.title,
                "startDate": event.startDate,
                "endDate": event.endDate,
                "location": {
                  "@type": "Place",
                  "name": event.location,
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "성남시",
                    "addressRegion": "경기도",
                    "addressCountry": "KR"
                  }
                },
                "description": event.summary
              };
              
              const imageUrl = getPostImage(event);

              return (
                <div 
                  key={event.id} 
                  className="bg-white rounded-xl shadow-sm border border-blue-100/70 hover:shadow-md hover:border-blue-200 transition duration-200 flex flex-col justify-between overflow-hidden"
                >
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
                  />
                  <div>
                    {imageUrl && (
                      <div className="h-48 w-full overflow-hidden relative">
                        <img 
                          src={imageUrl} 
                          alt={event.name || event.title} 
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-100">
                          📅 {event.category}
                        </span>
                        <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2 py-1 rounded">
                          {event.startDate === event.endDate ? event.startDate : `${event.startDate} ~ ${event.endDate}`}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{event.name || event.title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">{event.summary}</p>
                    </div>
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
                        href={getDetailLink(event)}
                        className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition shadow-sm animate-none"
                      >
                        상세 정보 보기
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 메인 페이지 중간 광고 */}
        <AdBanner slot="home-middle" />

        {/* 지원금/혜택 정보 섹션 */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-6 border-b border-blue-200/60 pb-3">
            <span className="text-2xl">💰</span>
            <h3 className="text-xl font-bold text-blue-950">지원금 / 혜택 정보</h3>
            <span className="text-sm font-medium text-blue-700/80 bg-blue-100 px-2 py-0.5 rounded-md ml-2">
              {benefits.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => {
              const benefitJsonLd = {
                "@context": "https://schema.org",
                "@type": "GovernmentService",
                "name": benefit.name || benefit.title,
                "serviceName": benefit.name || benefit.title,
                "description": benefit.summary,
                "provider": {
                  "@type": "GovernmentOrganization",
                  "name": benefit.location || "성남시청"
                }
              };

              const imageUrl = getPostImage(benefit);

              return (
                <div 
                  key={benefit.id} 
                  className="bg-white rounded-xl shadow-sm border border-blue-100/70 hover:shadow-md hover:border-blue-200 transition duration-200 flex flex-col justify-between overflow-hidden"
                >
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(benefitJsonLd) }}
                  />
                  <div>
                    {imageUrl && (
                      <div className="h-56 w-full overflow-hidden relative">
                        <img 
                          src={imageUrl} 
                          alt={benefit.name || benefit.title} 
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          🎁 {benefit.category}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          상시 모집
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{benefit.name || benefit.title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">{benefit.summary}</p>
                    </div>
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
                        href={getDetailLink(benefit)}
                        className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition shadow-sm animate-none"
                      >
                        지원 대상 확인 & 신청하기
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* 챗봇 추가 */}
      <Chatbot />
    </div>
  );
}
