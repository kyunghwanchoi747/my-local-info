import Link from "next/link";
import { siteConfig } from "@/lib/site.config";

export const metadata = {
  title: `면책고지 - ${siteConfig.siteName}`,
  description: `${siteConfig.siteName} 사이트의 법적 면책 한계를 알려드립니다.`,
};

export default function DisclaimerPage() {
  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
        
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium">면책고지</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">면책고지</h1>
        
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p>
            {siteConfig.siteName}(이하 &quot;본 사이트&quot;)에서 제공하는 모든 혜택 정보, 신청 방법, 조건 가이드 및 칼럼글은 공적 발표 자료를 일반 시민의 시각에서 한층 더 알기 쉽게 풀어 작성한 **단순 정보 제공 목적**의 비공식 콘텐츠입니다.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">1. 보증의 부인</h2>
          <p>
            운영자 최경환은 게재된 콘텐츠의 신뢰도와 정확성을 기하기 위해 최선의 검수를 거치지만, 이에 대한 정확성, 유효성, 안전성 혹은 특정 요건 충족에 대하여 명시적 또는 묵시적으로 어떠한 법적 보증도 하지 않습니다.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">2. 법률 및 행정 조언의 부존재</h2>
          <p>
            본 사이트의 콘텐츠는 변호사, 법무사, 혹은 공인행정사의 자문 또는 행정 기관의 공식적인 법률 유권해석을 대신할 수 없습니다. 개별적인 자격 판정이나 혜택 신청 대상 여부의 결정은 반드시 소관 정부 부처 및 지방자치단체의 행정 창구(주민센터, 시청 등)의 판단을 따라야 합니다.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">3. 책임의 제한</h2>
          <p>
            이용자가 본 사이트의 안내만을 신뢰하여 행동을 취함에 따라 발생한 불이익, 손해, 직접적 혹은 간접적인 정신적/물질적 피해에 대하여 운영자 최경환은 일체의 민·형사상 법적 책임을 지지 않습니다. 신청 기한 마감 여부나 추가 변경사항은 공식 주최처에 반드시 재확인하시기 바랍니다.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">4. 외부 링크에 대한 면책</h2>
          <p>
            본 사이트가 제공하는 본문 내용 중 포함된 외부 공식 링크 및 파트너 링크를 통해 이동하게 되는 타 웹사이트의 작동 가용성, 개인정보 침해 혹은 수록된 정보의 완결성에 대해 본 사이트는 간섭 권한이 없으며 책임을 지지 않습니다.
          </p>
          
          <div className="bg-slate-50 p-4 rounded-lg mt-8 border border-slate-100 font-mono">
            <div>• 공표자: {siteConfig.owner.name}</div>
            <div>• 이메일: {siteConfig.owner.email}</div>
          </div>

          <p className="mt-8 text-xs text-slate-400">공표일자: 2026년 7월 7일</p>
        </div>

      </div>
    </div>
  );
}
