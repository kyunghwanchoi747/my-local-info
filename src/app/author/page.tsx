"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site.config";

interface ColumnItem {
  slug: string;
  title: string;
  date: string;
  summary: string;
  author: string;
}

export default function AuthorHubPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [columns, setColumns] = useState<ColumnItem[]>([]);

  useEffect(() => {
    // 1. 관리자 로그인 세션 감지
    const session = localStorage.getItem("adminSession");
    if (session === "active") {
      setIsAdmin(true);
    }

    // 2. localStorage에 저장된 칼럼이 있는지 먼저 확인하고, 없으면 기본 칼럼 목록을 제공함.
    const stored = localStorage.getItem("columnsData");
    if (stored) {
      try {
        setColumns(JSON.parse(stored));
      } catch (e) {
        loadDefaultColumns();
      }
    } else {
      loadDefaultColumns();
    }
  }, []);

  const loadDefaultColumns = () => {
    // 마크다운 파일로 빌드된 기본 연재물 데이터를 클라이언트에서 간이로 재구성
    const defaults = [
      {
        slug: "2026-07-05-community-based-living",
        title: "정보 중심의 디지털 골목길을 닦으며 느끼는 소회",
        date: "2026-07-05",
        summary: "동네 이웃들의 생생한 피드백을 통해 정보 사이트 운영의 본질적인 보람과 올바른 팩트 체크 원칙을 이야기합니다.",
        author: "최경환"
      },
      {
        slug: "2026-07-03-seongnam-welfare-tips",
        title: "성남시 복지 혜택과 지원 정책 200% 활용하는 비결",
        date: "2026-07-03",
        summary: "아는 만큼 챙길 수 있는 성남시의 행정 지원과 누리과정, 청년 혜택을 놓치지 않고 꼼꼼하게 점검하는 노하우를 공개합니다.",
        author: "최경환"
      },
      {
        slug: "2026-07-01-local-information-importance",
        title: "동네 정보의 가치와 생활 밀착형 사이트를 시작하며",
        date: "2026-07-01",
        summary: "대형 포털 사이트가 전하지 못하는 우리 골목, 우리 동네의 세심한 소식과 그것이 주는 삶의 변화에 대해 고찰합니다.",
        author: "최경환"
      }
    ];
    setColumns(defaults);
    localStorage.setItem("columnsData", JSON.stringify(defaults));
  };

  return (
    <div className="bg-slate-50/40 min-h-screen text-slate-800 font-sans py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* 브레드크럼 */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">홈</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-slate-700 font-medium">편집실 소개</span>
        </nav>

        {/* 상단 프로필 헤더 박스 */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="w-24 h-24 rounded-full bg-blue-900 text-white flex items-center justify-center text-3xl font-bold shadow-md flex-shrink-0">
            최
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">{siteConfig.owner.name} 편집장</h1>
                <p className="text-xs text-blue-800 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  성남생활정보 편집실
                </p>
              </div>
              
              {/* 분기 UI: 관리자 상태 감지 시 칼럼 작성하기 노출 */}
              {isAdmin ? (
                <Link 
                  href="/admin?tab=new-column" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                >
                  새 칼럼 작성하기 (관리자)
                </Link>
              ) : (
                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                  운영자가 정리한 칼럼을 읽어보세요.
                </span>
              )}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              성남에서 오랫동안 거주해 온 운영진이 지역 정보를 생활자의 시선으로 해석합니다.
              글은 AI 도구로 초안을 작성하고, 편집실이 직접 검수하여 발행합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500 font-medium border-t border-slate-50 pt-5">
              <div>활동 지역: 경기도 성남시 분당구 판교</div>
              <div>✉️ 문의 메일: {siteConfig.owner.email}</div>
              <div>사이트 주제: {siteConfig.siteTopic}</div>
              <div>📞 비상연락처: {siteConfig.owner.phone}</div>
            </div>
          </div>
        </section>

        {/* 편집 원칙 섹션 */}
        <section className="bg-slate-100/70 rounded-2xl p-6 md:p-8 mb-10 border border-slate-200/40">
          <h2 className="text-lg font-bold text-slate-900 mb-3">편집실이 모든 글에서 답하는 세 가지 질문</h2>
          <ul className="space-y-2 text-sm text-slate-600 leading-relaxed">
            <li>• <strong>무엇이 달라지나</strong>: 이 소식으로 성남 주민의 일상에서 실제로 달라지는 것을 짚습니다.</li>
            <li>• <strong>누가 챙겨야 하나</strong>: 대상을 구·동·상황 단위로 구체화합니다. (예: &ldquo;서현동에서 전세 사는 신혼부부라면&rdquo;)</li>
            <li>• <strong>오늘 무엇을 하면 되나</strong>: 독자가 지금 바로 취할 수 있는 행동 한 가지를 안내합니다.</li>
          </ul>
          <p className="mt-4 text-xs text-slate-500 border-t border-slate-200 pt-4">
            모든 글은 공식 출처를 명시하며, 확인되지 않은 내용을 사실처럼 쓰지 않습니다.
            부동산 투자 조언·가격 전망은 다루지 않습니다.
          </p>
        </section>

        {/* 칼럼 목록 */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3">
            편집실 연재 칼럼 ({columns.length}건)
          </h2>

          <div className="space-y-6">
            {columns.map((column) => (
              <div 
                key={column.slug}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition"
              >
                <div className="text-xs text-slate-400 font-medium mb-1.5">{column.date}</div>
                <h3 className="text-lg font-bold text-slate-950 mb-2 hover:text-blue-900 transition">
                  <Link href={`/columns/${column.slug}/`}>
                    {column.title}
                  </Link>
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {column.summary}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
                  <span className="text-slate-400">필자: {column.author}</span>
                  <Link 
                    href={`/columns/${column.slug}/`}
                    className="font-bold text-blue-900 hover:underline"
                  >
                    전문 읽기 &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
