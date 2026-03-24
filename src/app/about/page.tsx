import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-orange-50 font-sans text-stone-800 pb-20">
      <header className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            🏡 성남시 생활 정보
          </Link>
          <nav className="flex gap-4 text-sm font-medium">
            <Link href="/" className="text-stone-500 hover:text-orange-600 transition-colors">홈</Link>
            <Link href="/blog" className="text-stone-500 hover:text-orange-600 transition-colors">블로그</Link>
            <Link href="/about" className="text-orange-600 font-bold border-b-2 border-orange-400">소개</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-stone-900 mb-8">💡 서비스 소개</h1>

        <div className="space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-orange-100">
          <section>
            <h2 className="text-xl font-bold text-orange-600 mb-3">운영 목적</h2>
            <p className="text-stone-600 leading-relaxed">
              &apos;성남시 생활 정보&apos; 웹사이트는 지역 주민들이 일상 속에서 필요한 행사, 축제, 지원금 및 다양한 생활 혜택을 보다 쉽고 빠르게 찾아볼 수 있도록 돕기 위해 만들어졌습니다. 우리 동네의 유익한 정보를 놓치지 않도록 언제나 최선을 다하고 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-600 mb-3">데이터 출처</h2>
            <p className="text-stone-600 leading-relaxed">
              본 사이트에서 제공되는 모든 기본 정보는 대한민국의 <strong>공공데이터포털(data.go.kr)</strong>을 통해 안전하고 투명하게 수집된 공공서비스 정보를 바탕으로 제공됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-orange-600 mb-3">콘텐츠 생성 방식</h2>
            <p className="text-stone-600 leading-relaxed">
              딱딱할 수 있는 공공정보를 시민 여러분이 읽기 쉽고 친근하게 접할 수 있도록, <strong>최신 인공지능(AI) 기술</strong>을 활용하여 블로그 형태의 콘텐츠로 재생산하고 공유하고 있습니다. 기술을 통해 지역 커뮤니티의 정보 접근성을 더욱 높이는 것이 우리의 목표입니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
