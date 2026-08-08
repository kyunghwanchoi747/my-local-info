import localInfoData from "../../public/data/local-info.json";
import Link from "next/link";
import Image from "next/image";
import { getSortedPostsData, getSortedColumnsData } from "@/lib/posts";
import AdBanner from "@/components/AdBanner";
import Chatbot from "@/components/Chatbot";
import { Header, Footer } from "@/components/HeaderFooter";
import { siteConfig } from "@/lib/site.config";

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

export const metadata = {
  title: `${siteConfig.siteName} - ${siteConfig.siteTagline}`,
  description: `${siteConfig.siteName}은 성남시 공식 공공데이터를 기반으로 이웃분들께 실시간 행사, 혜택, 보조금 정보를 가장 친절하게 전달합니다.`,
  openGraph: {
    url: `${siteConfig.siteUrl}/`,
  },
};

export default function Home() {
  const items = localInfoData as InfoItem[];
  const posts = getSortedPostsData();
  const columns = getSortedColumnsData();
  // '혜택' 항목은 재건축과 무관한 전국 공통 제도가 대부분이라 홈에서 제외 (2026-08-08)
  const events = items.filter((item) => item.category === "행사");
  
  const findMatchedPost = (item: InfoItem) => {
    const nameToCheck = (item.name || item.title || "").trim();
    if (!nameToCheck) return null;
    
    let matched = posts.find(post => post.title.includes(nameToCheck) || nameToCheck.includes(post.title));
    if (matched) return matched;
    
    const cleanName = nameToCheck.replace(/\([^)]*\)/g, '').replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ').trim();
    matched = posts.find(post => post.title.includes(cleanName) || cleanName.includes(post.title));
    if (matched) return matched;
    
    const words = cleanName.split(/\s+/).filter(w => w.length >= 2);
    if (words.length === 0) return null;
    
    return posts.find((post) => {
      const matchCount = words.filter(word => post.title.includes(word)).length;
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

  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans flex flex-col justify-between">
      
      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {/* 상단 웰컴 히어로 배너 */}
        <section 
          className="relative rounded-2xl overflow-hidden p-8 md:p-12 text-white shadow-lg mb-10 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=1200')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40 z-0"></div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 mb-4">
              📍 성남시 40년 거주민의 밀착형 정보 가이드
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight leading-tight flex items-center gap-2">
              <Image src="/icon.png" alt="로고" width={40} height={40} className="rounded-md" />
              성남시 이웃들을 위한 알뜰 혜택과 행사 소식
            </h1>
            <p className="text-sm md:text-base text-slate-200 opacity-90 leading-relaxed mb-6">
              공공데이터포털에서 수집한 정보를 가공하여 어려운 행정 용어를 알기 쉽게 풀어 설명합니다. 
              놓치기 쉬운 청년 지원금부터 이번 주말 아이들과 가볼 만한 탄천 소식까지 한눈에 확인하세요!
            </p>
            <div className="flex gap-3">
              <Link 
                href="/about/" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg text-sm transition"
              >
                서비스 기획 의도 보기
              </Link>
              <Link 
                href="/author/" 
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-2.5 px-5 rounded-lg text-sm transition"
              >
                운영자 소개 & 칼럼
              </Link>
            </div>
          </div>
        </section>

        {/* 운영자 칼럼 섹션 (미리보기) */}
        {columns.length > 0 && (
          <section className="mb-12 bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl"></span>
                <h3 className="text-xl font-bold text-slate-950">성나머 운영자의 최근 칼럼</h3>
              </div>
              <Link 
                href="/columns/" 
                className="text-xs font-bold text-blue-900 hover:underline"
              >
                전체 칼럼 목록 보기 &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {columns.slice(0, 3).map((col) => (
                <div 
                  key={col.slug}
                  className="bg-slate-50/50 rounded-xl p-5 border border-slate-100/70 hover:shadow-sm transition flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xxs text-slate-400 font-semibold block mb-1">{col.date}</span>
                    <h4 className="text-sm font-bold text-slate-900 mb-2 line-clamp-1 hover:text-blue-900">
                      <Link href={`/columns/${col.slug}/`}>{col.title}</Link>
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">{col.summary}</p>
                  </div>
                  <Link 
                    href={`/columns/${col.slug}/`}
                    className="text-xxs font-bold text-blue-900 hover:underline self-start"
                  >
                    전문 읽기 &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 최근 업데이트된 소식 (블로그 글) */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6 border-b border-blue-200/60 pb-3">
            <span className="text-2xl"></span>
            <h3 className="text-xl font-bold text-blue-950">새로 올라온 우리 동네 소식</h3>
            <Link href="/blog/" className="ml-auto text-xs font-bold text-blue-900 hover:underline">
              전체 보기 &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.slice(0, 6).map((post) => (
              <div 
                key={post.slug}
                className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                {post.image && (
                  <div className="h-40 w-full overflow-hidden relative">
                    <Image 
                      src={post.image} 
                      alt={post.title} 
                      fill
                      className="object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xxs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {post.category || "정보"}
                    </span>
                    <span className="text-xxs text-slate-400">{post.date}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 hover:text-blue-700">
                    <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {post.summary}
                  </p>
                  <Link 
                    href={`/blog/${post.slug}/`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    자세히 보기 &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 이번 달 행사/축제 섹션 */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6 border-b border-blue-200/60 pb-3">
            <span className="text-2xl"></span>
            <h3 className="text-xl font-bold text-blue-950">이번 달 행사 / 축제</h3>
            <span className="text-sm font-medium text-blue-700/80 bg-blue-100 px-2 py-0.5 rounded-md ml-2">
              {events.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event) => {
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
                          {event.category}
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
                      <span className="font-semibold text-slate-700 min-w-[45px]">장소:</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-700 min-w-[45px]">대상:</span>
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
      </main>

      {/* 푸터 */}
      <Footer />

      {/* 챗봇 추가 */}
      <Chatbot />
    </div>
  );
}
