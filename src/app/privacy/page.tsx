import Link from "next/link";
import { siteConfig } from "@/lib/site.config";

export const metadata = {
  title: `개인정보처리방침 - ${siteConfig.siteName}`,
  description: `${siteConfig.siteName}의 개인정보처리방침 가이드라인을 투명하게 공개합니다.`,
};

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
        
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium">개인정보처리방침</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">🔒 개인정보처리방침</h1>
        
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p>
            {siteConfig.siteName}(이하 &quot;본 사이트&quot;)는 운영자 최경환이 운영하며, 이용자의 개인정보를 매우 중요하게 생각합니다. 본 방침은 이용자가 사이트를 안심하고 이용할 수 있도록, 어떤 정보가 수집되고 어떻게 관리되는지 투명하게 알려드리기 위해 작성되었습니다.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">1. 수집하는 개인정보 항목 및 방법</h2>
          <p>
            본 사이트는 기본적인 웹 검색 시 별도의 개인정보 입력을 요구하지 않습니다. 다만, 이용자가 문의 페이지를 통해 메일을 보낼 때 아래와 같은 정보를 최소한으로 작성할 수 있습니다.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>필수 항목: 성함 / 닉네임, 답변받으실 이메일 주소</li>
            <li>선택 항목: 문의 메시지에 포함된 기타 정보</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">2. 개인정보의 수집 및 이용 목적</h2>
          <p>
            수집된 이메일과 이름은 오직 다음의 목적으로만 한정하여 이용합니다.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>이용자의 문의 사항이나 제보에 대한 사실 여부 확인 및 답변 발송</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">3. 개인정보의 보관 및 파기</h2>
          <p>
            본 사이트는 별도의 영구적인 회원 데이터베이스나 서버 저장 장치를 운영하지 않습니다. 문의 메일로 접수된 이메일 데이터는 문의 처리가 완료되는 즉시 또는 수신일로부터 3개월 이내에 복구 불가능한 형태로 완전 파기 및 삭제합니다.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">4. 제3자 제공 및 위탁</h2>
          <p>
            본 사이트는 이용자의 동의 없이 개인정보를 제3자에게 임의로 제공하거나 외부 업체에 위탁하지 않습니다. 단, 법령에 따른 요구가 있을 경우에는 예외로 합니다.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">5. 쿠키(Cookie) 및 웹 분석 도구 운영</h2>
          <p>
            본 사이트는 웹 호스팅 및 브라우저 성능 개선, 사용자 경험 향상을 위해 브라우저의 로컬 저장소(localStorage)를 일시적으로 이용할 수 있습니다. 이는 개인 식별 정보를 포함하지 않으며, 이용자는 브라우저 설정을 통해 쿠키 수집 및 로컬 데이터 저장을 거부할 수 있습니다.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-3">6. 개인정보 보호 책임자 및 연락처</h2>
          <p>
            본 사이트의 콘텐츠 관련하여 개인정보 관련 문의사항이 있으시면 아래 연락처로 문의해 주시기 바랍니다.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg mt-3 border border-slate-100 font-mono">
            <div>• 성명: {siteConfig.owner.name}</div>
            <div>• 주소: {siteConfig.owner.address}</div>
            <div>• 이메일: {siteConfig.owner.email}</div>
          </div>

          <p className="mt-8 text-xs text-slate-400">시행일자: 2026년 7월 7일</p>
        </div>

      </div>
    </div>
  );
}
