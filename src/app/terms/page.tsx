import Link from "next/link";
import { siteConfig } from "@/lib/site.config";

export const metadata = {
  title: `이용약관 - ${siteConfig.siteName}`,
  description: `${siteConfig.siteName} 사이트 이용 시 유의해야 할 사항과 약관을 설명합니다.`,
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
        
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium">이용약관</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">이용약관</h1>
        
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p>
            {siteConfig.siteName}(이하 &quot;본 사이트&quot;)는 운영자 성나머이 성남시민 및 지역 정보가 필요한 일반 사용자를 위해 무상으로 제공하는 정보 전달 플랫폼입니다. 본 약관은 본 사이트의 정보 제공 서비스 이용과 관련한 권리와 책임 조항을 안내합니다.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">1. 목적 및 서비스 성격</h2>
          <p>
            본 사이트가 제공하는 모든 정보(복지 혜택 신청 자격, 행사 기간, 지원금 수령 가이드 등)는 공공데이터 및 공식 발표 자료를 바탕으로 재정리한 것입니다. 본 사이트는 이 모든 가이드와 편의 기능을 회원가입 없이 무료로 열람 및 활용할 수 있도록 제공합니다.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">2. 정보 신뢰성에 대한 안내</h2>
          <p>
            운영자는 최신 행정 변경사항이나 행사 일정의 오차가 없도록 최선을 다해 검토하고 수정합니다. 그러나 행정 기관의 갑작스러운 정책 변경이나 오기입 등으로 인해 일부 정보에 오류가 발생할 수 있습니다. 따라서 중요한 행정 지원금 신청 전에는 반드시 안내된 공식 행정 관서(예: 성남시청 홈페이지)를 통해 교차 검증하시기를 권장합니다.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">3. 이용자의 준수 사항</h2>
          <p>
            이용자는 본 사이트를 이용할 때 다음 행위를 하여서는 안 됩니다.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>본 사이트의 정상적인 작동을 방해하는 해킹 또는 악의적인 트래픽 조작 행위</li>
            <li>게시된 유용한 정보 글의 맥락을 무시하고 불법 사이트 홍보 등에 허락 없이 재배포하는 행위</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">4. 저작권 조항</h2>
          <p>
            본 사이트에 게재된 정보 안내 텍스트, 운영자 칼럼, 독자적 요약 콘텐츠는 창작물로서 운영자 성나머에게 저작권이 귀속됩니다. 영리 목적의 무단 배포는 금지하며, 비영리 목적의 단순 공유 시에는 출처(사이트 링크)를 반드시 표기해주시기 바랍니다.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">5. 약관의 개정 및 문의</h2>
          <p>
            본 약관은 정책적 필요에 따라 변경될 수 있으며, 개정 시 본 페이지를 통해 공지합니다. 이용 과정에 있어 궁금한 사항은 공식 메일로 연락해 주시기 바랍니다.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg mt-3 border border-slate-100 font-mono">
            <div>• 이메일: {siteConfig.owner.email}</div>
          </div>

          <p className="mt-8 text-xs text-slate-400">공표일자: 2026년 7월 7일</p>
        </div>

      </div>
    </div>
  );
}
