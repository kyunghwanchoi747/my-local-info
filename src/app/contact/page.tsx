"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site.config";

export default function ContactPage() {
  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans py-12 px-4">
      <title>{`문의하기 - ${siteConfig.siteName}`}</title>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
        
        {/* 상단 브레드크럼 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium">문의하기</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">📬 운영자에게 문의하기</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          {siteConfig.siteName}을 이용해 주셔서 감사합니다. 사이트 콘텐츠에 대한 의견, 팩트 수정 요청,
          또는 소개하고 싶은 우리 동네 복지 혜택/행사 제보 등이 있으시다면 아래 폼을 통해 자유롭게 보내주세요.
        </p>

        {/* 안내문 */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8 text-sm text-blue-800 leading-relaxed">
          <p className="font-semibold mb-1">참고해 주세요!</p>
          본 사이트는 현재 정적 데모 사이트로 운영 중입니다. 입력해주신 메시지는 시스템 상에 즉시 전송되지 않을 수 있으니, 
          급한 용건이나 확실한 답변을 원하시면 아래의 공식 운영 이메일 주소로 직접 문의해 주시기 바랍니다.
          <div className="mt-2 font-mono font-bold">공식 이메일: {siteConfig.owner.email}</div>
        </div>

        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">성함 / 닉네임</label>
            <input 
              type="text" 
              id="name" 
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">답변받으실 이메일 주소</label>
            <input 
              type="email" 
              id="email" 
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">문의 구분</label>
            <select 
              id="category"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
            >
              <option value="general">일반 문의</option>
              <option value="report">정보 정정 요청 (오류 신고)</option>
              <option value="suggest">콘텐츠 및 혜택 제보</option>
              <option value="partnership">제휴 및 기타</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">상세 내용</label>
            <textarea 
              id="message" 
              rows={6}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="궁금하신 내용이나 제안하고 싶으신 내용을 구체적으로 적어주세요."
            ></textarea>
          </div>

          <button 
            type="button" 
            onClick={() => alert("데모 시스템입니다. 공식 이메일(rex39@naver.com)을 이용해 발송해 주시면 감사하겠습니다.")}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3.5 px-6 rounded-lg transition duration-200 shadow-sm"
          >
            문의 메세지 보내기
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100 text-xs text-slate-500 space-y-2">
          <p>• {siteConfig.owner.name} | {siteConfig.owner.address}</p>
          <p>• 제공해주신 개인정보는 문의 답변 용도로만 임시 활용되며 본 사이트에 수집 또는 영구 보관되지 않습니다.</p>
        </div>

      </div>
    </div>
  );
}
