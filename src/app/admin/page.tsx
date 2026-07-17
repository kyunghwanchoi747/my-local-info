"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { siteConfig } from "@/lib/site.config";

// --- 타입 정의 ---
interface PostItem {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  status: "발행" | "초안";
  content?: string;
  faq?: { q: string; a: string }[];
  isRecommended: boolean;
}

interface ColumnItem {
  slug: string;
  title: string;
  date: string;
  summary: string;
  author: string;
  content?: string;
}

// 쿼리 파라미터를 안전하게 읽기 위한 컴포넌트 래퍼
function AdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") || "dashboard";

  // --- 상태 관리 ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState(tabParam);

  // 콘텐츠 상태
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [columns, setColumns] = useState<ColumnItem[]>([]);
  const [settings, setSettings] = useState(siteConfig);

  // 글 추가/수정용 폼 상태
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [postSummary, setPostSummary] = useState("");
  const [postCategory, setPostCategory] = useState("복지");
  const [postStatus, setPostStatus] = useState<"발행" | "초안">("발행");
  const [postContent, setPostContent] = useState("");
  const [postIsRecommended, setPostIsRecommended] = useState(false);
  const [postFaqQ, setPostFaqQ] = useState("");
  const [postFaqA, setPostFaqA] = useState("");

  // 칼럼 추가/수정용 폼 상태
  const [editingColumn, setEditingColumn] = useState<ColumnItem | null>(null);
  const [columnTitle, setColumnTitle] = useState("");
  const [columnSlug, setColumnSlug] = useState("");
  const [columnSummary, setColumnSummary] = useState("");
  const [columnContent, setColumnContent] = useState("");

  // 초기화 및 데이터 로드
  useEffect(() => {
    // 1. 로그인 세션 확인
    const session = localStorage.getItem("adminSession");
    if (session === "active") {
      setIsAuthenticated(true);
    }

    // 2. 사이트 설정 로드
    const storedSettings = localStorage.getItem("siteSettings");
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {}
    }

    // 3. 포스트 로드
    const storedPosts = localStorage.getItem("postsData");
    if (storedPosts) {
      try {
        setPosts(JSON.parse(storedPosts));
      } catch (e) {
        loadDefaultPosts();
      }
    } else {
      loadDefaultPosts();
    }

    // 4. 칼럼 로드
    const storedColumns = localStorage.getItem("columnsData");
    if (storedColumns) {
      try {
        setColumns(JSON.parse(storedColumns));
      } catch (e) {
        loadDefaultColumns();
      }
    } else {
      loadDefaultColumns();
    }
  }, []);

  // 탭 파라미터 변경 시 상태 업데이트
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const loadDefaultPosts = () => {
    // 기본 포스트 15개 이상 생성
    const defaults: PostItem[] = [
      { slug: "2026-06-06-nuri-tuition-support", title: "누리과정 보육료 지원 조건 및 신청 방법", date: "2026-06-06", summary: "성남시 만 3-5세 아동의 누리과정 보육료 지원 신청 절차를 친절히 설명합니다.", category: "복지", status: "발행", isRecommended: true, content: "누리과정 지원 본문 내용" },
      { slug: "2026-06-06-seongnam-memorial-park", title: "성남 메모리얼파크 봉안당 이용 자격과 이용료 안내", date: "2026-06-06", summary: "성남시립 메모리얼파크 이용 시 알아두어야 할 자격 조건과 서류입니다.", category: "복지", status: "발행", isRecommended: false, content: "메모리얼파크 본문 내용" },
      { slug: "2026-06-06-youth-concert", title: "성남시 청년 힐링 콘서트 예매 일정 및 라인업", date: "2026-06-06", summary: "청년들의 스트레스 해소를 위한 성남시 야외 콘서트 소식을 전합니다.", category: "행사", status: "발행", isRecommended: true, content: "청년 콘서트 본문 내용" },
      { slug: "2026-06-07-earned-child-benefit", title: "근로·자녀장려금 성남시 가구 대상 지급 기준", date: "2026-06-07", summary: "가구별 소득에 따른 장려금 신청 자격과 성남세무서 접수처를 알아봅니다.", category: "지원금", status: "발행", isRecommended: false },
      { slug: "2026-06-09-tancheon-waterpark", title: "성남 탄천 어린이 물놀이장 개장 일정 및 팁", date: "2026-06-09", summary: "주차, 편의시설 등 여름 휴가철 탄천 물놀이장을 100% 즐기는 방법을 소개합니다.", category: "축제", status: "발행", isRecommended: true },
      { slug: "2026-06-10-rentguarantee", title: "성남시 전세보증금 반환보증 보증료 지원 신청", date: "2026-06-10", summary: "청년 및 신혼부부의 전세 사기 예방을 위한 보증료 지원 사업 안내입니다.", category: "지원금", status: "발행", isRecommended: false },
      { slug: "2026-06-11-fishery-energy-support", title: "수산업 에너지 절감 장비 지원 사업 신청 가이드", date: "2026-06-11", summary: "친환경 고효율 장비 도입을 위한 수산업 금융 보조금 가이드입니다.", category: "금융", status: "발행", isRecommended: false },
      { slug: "2026-06-12-MarineAccidentLegalSupport", title: "어업인 해양 사고 법률 무료 지원 서비스 안내", date: "2026-06-12", summary: "불의의 해양 사고 시 신속한 구제를 돕는 무료 법률 지원 제도입니다.", category: "복지", status: "발행", isRecommended: false },
      { slug: "2026-06-13-observer-boarding-support", title: "옵저버 승선 활성화 및 안전 장비 보조금", date: "2026-06-13", summary: "어업 감독 공무원 및 옵저버 승선 의무 선박의 장비 지원 사업 설명입니다.", category: "금융", status: "발행", isRecommended: false },
      { slug: "2026-06-14-seafoodimport", title: "수입 수산물 원산지 표시 의무 위반 방지 교육", date: "2026-06-14", summary: "투명한 먹거리 조성을 위한 성남 관내 수입 수산물 유통업체 교육 일정입니다.", category: "행사", status: "발행", isRecommended: false },
      { slug: "2026-06-15-fishery-startup-housing", title: "귀어귀촌 창업자 주택 구입 및 융자 조건", date: "2026-06-15", summary: "어촌 정착을 희망하는 예비 귀어인을 위한 금리 혜택 및 신청 방식입니다.", category: "금융", status: "발행", isRecommended: false },
      { slug: "2026-06-16-pelagic-fisheries-fund", title: "원양어업 개발 사업 활성화 자금 신청 자격", date: "2026-06-16", summary: "글로벌 어장 개척 및 선박 보강을 지원하는 저금리 정책 금융 자금 안내입니다.", category: "금융", status: "발행", isRecommended: false },
      { slug: "2026-06-17-deep-sea-vessel-support", title: "노후 원양어선 대체 건조 금융 이자 보조금", date: "2026-06-17", summary: "선박 노후화 예방 및 어업 안전 도모를 위한 건조 금융 지원 가이드입니다.", category: "금융", status: "발행", isRecommended: false },
      { slug: "2026-06-18-fisheries-distribution-loan", title: "수산물 유통 구조 개선 자금 장기 저리 대출", date: "2026-06-18", summary: "지방 직거래 장터 및 현대화 유통 시설 구축을 위한 정책 융자금 조건입니다.", category: "금융", status: "발행", isRecommended: false },
      { slug: "2026-06-19-fishery-recovery-fund", title: "해양 기후재해 피해 어가 긴급 회복 자금 신청", date: "2026-06-19", summary: "적조, 고수온 피해 농어가의 신속한 재기를 돕는 무이자성 융자 혜택입니다.", category: "지원금", status: "발행", isRecommended: false }
    ];
    setPosts(defaults);
    localStorage.setItem("postsData", JSON.stringify(defaults));
  };

  const loadDefaultColumns = () => {
    const defaults: ColumnItem[] = [
      { slug: "2026-07-05-community-based-living", title: "정보 중심의 디지털 골목길을 닦으며 느끼는 소회", date: "2026-07-05", summary: "동네 이웃들의 피드백을 통해 정보 사이트 운영의 본질적인 보람과 올바른 팩트 체크 원칙을 이야기합니다.", author: "성나머" },
      { slug: "2026-07-03-seongnam-welfare-tips", title: "성남시 복지 혜택과 지원 정책 200% 활용하는 비결", date: "2026-07-03", summary: "아는 만큼 챙길 수 있는 성남시의 행정 지원과 누리과정, 청년 혜택을 놓치지 않고 점검하는 노하우를 공유합니다.", author: "성나머" },
      { slug: "2026-07-01-local-information-importance", title: "동네 정보의 가치와 생활 밀착형 사이트를 시작하며", date: "2026-07-01", summary: "대형 포털 사이트가 전하지 못하는 우리 골목, 우리 동네의 세심한 소식과 그것이 주는 삶의 변화에 대해 고찰합니다.", author: "성나머" }
    ];
    setColumns(defaults);
    localStorage.setItem("columnsData", JSON.stringify(defaults));
  };

  // --- 로그인/로그아웃 처리 ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin1234") {
      setIsAuthenticated(true);
      localStorage.setItem("adminSession", "active");
    } else {
      alert("비밀번호가 올바르지 않습니다. (데모 비밀번호: admin1234)");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminSession");
    router.push("/admin");
  };

  // --- 일반 글 저장/수정/삭제 ---
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postSlug.trim()) {
      alert("제목과 슬러그는 필수 입력 사항입니다.");
      return;
    }

    const updatedFaq = postFaqQ ? [{ q: postFaqQ, a: postFaqA }] : [];

    if (editingPost) {
      // 수정 모드
      const updated = posts.map((p) =>
        p.slug === editingPost.slug
          ? {
              ...p,
              title: postTitle,
              slug: postSlug,
              summary: postSummary,
              category: postCategory,
              status: postStatus,
              isRecommended: postIsRecommended,
              content: postContent,
              faq: updatedFaq,
            }
          : p
      );
      setPosts(updated);
      localStorage.setItem("postsData", JSON.stringify(updated));
      alert("글이 성공적으로 수정되었습니다.");
    } else {
      // 신규 추가
      if (posts.some((p) => p.slug === postSlug)) {
        alert("이미 존재하는 슬러그(주소명)입니다.");
        return;
      }
      const newPost: PostItem = {
        title: postTitle,
        slug: postSlug,
        summary: postSummary,
        category: postCategory,
        status: postStatus,
        date: new Date().toISOString().split("T")[0],
        isRecommended: postIsRecommended,
        content: postContent,
        faq: updatedFaq,
      };
      const updated = [newPost, ...posts];
      setPosts(updated);
      localStorage.setItem("postsData", JSON.stringify(updated));
      alert("새 글이 추가되었습니다.");
    }
    resetPostForm();
    setActiveTab("posts");
  };

  const handleEditPostClick = (post: PostItem) => {
    setEditingPost(post);
    setPostTitle(post.title);
    setPostSlug(post.slug);
    setPostSummary(post.summary);
    setPostCategory(post.category);
    setPostStatus(post.status);
    setPostContent(post.content || "");
    setPostIsRecommended(post.isRecommended);
    if (post.faq && post.faq.length > 0) {
      setPostFaqQ(post.faq[0].q);
      setPostFaqA(post.faq[0].a);
    } else {
      setPostFaqQ("");
      setPostFaqA("");
    }
    setActiveTab("new-post");
  };

  const handleDeletePost = (slug: string) => {
    if (confirm("정말 이 글을 삭제하시겠습니까?")) {
      const updated = posts.filter((p) => p.slug !== slug);
      setPosts(updated);
      localStorage.setItem("postsData", JSON.stringify(updated));
    }
  };

  const resetPostForm = () => {
    setEditingPost(null);
    setPostTitle("");
    setPostSlug("");
    setPostSummary("");
    setPostCategory("복지");
    setPostStatus("발행");
    setPostContent("");
    setPostIsRecommended(false);
    setPostFaqQ("");
    setPostFaqA("");
  };

  // --- 칼럼 저장/수정/삭제 ---
  const handleSaveColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnTitle.trim() || !columnSlug.trim()) {
      alert("제목과 슬러그는 필수 입력 사항입니다.");
      return;
    }

    if (editingColumn) {
      const updated = columns.map((c) =>
        c.slug === editingColumn.slug
          ? {
              ...c,
              title: columnTitle,
              slug: columnSlug,
              summary: columnSummary,
              content: columnContent,
            }
          : c
      );
      setColumns(updated);
      localStorage.setItem("columnsData", JSON.stringify(updated));
      alert("칼럼이 수정되었습니다.");
    } else {
      if (columns.some((c) => c.slug === columnSlug)) {
        alert("이미 존재하는 슬러그입니다.");
        return;
      }
      const newCol: ColumnItem = {
        title: columnTitle,
        slug: columnSlug,
        summary: columnSummary,
        date: new Date().toISOString().split("T")[0],
        author: settings.owner.name,
        content: columnContent,
      };
      const updated = [newCol, ...columns];
      setColumns(updated);
      localStorage.setItem("columnsData", JSON.stringify(updated));
      alert("새 칼럼이 추가되었습니다.");
    }
    resetColumnForm();
    setActiveTab("columns");
  };

  const handleEditColumnClick = (col: ColumnItem) => {
    setEditingColumn(col);
    setColumnTitle(col.title);
    setColumnSlug(col.slug);
    setColumnSummary(col.summary);
    setColumnContent(col.content || "");
    setActiveTab("new-column");
  };

  const handleDeleteColumn = (slug: string) => {
    if (confirm("정말 이 칼럼을 삭제하시겠습니까?")) {
      const updated = columns.filter((c) => c.slug !== slug);
      setColumns(updated);
      localStorage.setItem("columnsData", JSON.stringify(updated));
    }
  };

  const resetColumnForm = () => {
    setEditingColumn(null);
    setColumnTitle("");
    setColumnSlug("");
    setColumnSummary("");
    setColumnContent("");
  };

  // --- 사이트 설정 변경 ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("siteSettings", JSON.stringify(settings));
    alert("사이트 설정이 브라우저 로컬 저장소에 임시 저장되었습니다.");
  };

  // --- 데이터 백업 및 가져오기 (JSON Export / Import) ---
  const handleExportData = () => {
    const backup = {
      posts,
      columns,
      settings,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `seongnam_info_cms_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.posts) {
          setPosts(parsed.posts);
          localStorage.setItem("postsData", JSON.stringify(parsed.posts));
        }
        if (parsed.columns) {
          setColumns(parsed.columns);
          localStorage.setItem("columnsData", JSON.stringify(parsed.columns));
        }
        if (parsed.settings) {
          setSettings(parsed.settings);
          localStorage.setItem("siteSettings", JSON.stringify(parsed.settings));
        }
        alert("백업 파일로부터 데이터 복구가 완료되었습니다!");
        window.location.reload();
      } catch (err) {
        alert("올바르지 않은 JSON 백업 파일 포맷입니다.");
      }
    };
    fileReader.readAsText(files[0]);
  };

  // --- 로그인 폼 렌더링 ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="text-center mb-6">
            <span className="text-4xl"></span>
            <h1 className="text-2xl font-bold mt-3 text-slate-900">CMS-lite 관리자 로그인</h1>
            <p className="text-xs text-slate-500 mt-1">성남시 인포메이션 관리 도구 데모</p>
          </div>

          {/* 한계 고지 안내 */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded text-xs text-amber-800 mb-6 leading-relaxed">
            <strong>안내:</strong> 본 사이트는 데이터베이스 서버가 없는 정적 웹 사이트 형태입니다. 
            모든 편집 데이터는 브라우저 내부(localStorage)에 보관되므로 브라우저를 변경하거나 캐시를 지우면 데이터가 유실될 수 있습니다. 
            정식 연재 시에는 <strong>JSON 내보내기</strong> 기능을 통해 백업을 유지하세요.
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">데모 관리자 비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력 (admin1234)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-950 transition-colors shadow-sm text-sm"
            >
              로그인하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 로그인 완료 후 CMS-lite 관리자 화면 렌더링 ---
  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* 좌측 사이드바 네비게이션 */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-white text-base tracking-tight">{settings.siteName}</h2>
            <p className="text-xxs text-slate-500 mt-0.5">Admin Dashboard v1.0</p>
          </div>
          <span className="text-xl"></span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center gap-2.5 ${
              activeTab === "dashboard" ? "bg-blue-900 text-white" : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            대시보드 요약
          </button>
          <button
            onClick={() => { setActiveTab("posts"); resetPostForm(); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center gap-2.5 ${
              activeTab === "posts" || activeTab === "new-post" ? "bg-blue-900 text-white" : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            일반 글 관리
          </button>
          <button
            onClick={() => { setActiveTab("columns"); resetColumnForm(); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center gap-2.5 ${
              activeTab === "columns" || activeTab === "new-column" ? "bg-blue-900 text-white" : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            운영자 칼럼 관리
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center gap-2.5 ${
              activeTab === "settings" ? "bg-blue-900 text-white" : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            사이트 기본 설정
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 text-center">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-slate-800 hover:bg-red-900 hover:text-white text-xs font-semibold rounded-lg transition"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 우측 메인 편집 패널 */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* 상단 통합 고지 바 */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm text-sm">
          <div className="text-blue-900 leading-relaxed">
            <strong>안내:</strong> 이 관리툴은 100% 정적 페이지 데모(CMS-lite)이며, 변경 사항은 본 브라우저 임시 저장소에 실시간 저장됩니다.
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={handleExportData}
              className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-lg transition"
            >
              JSON 백업
            </button>
            <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer transition">
              복구
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>
          </div>
        </div>

        {/* --- 탭 1: 대시보드 --- */}
        {activeTab === "dashboard" && (
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-6">사이트 대시보드 요약</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-xs text-slate-400 font-bold mb-1">총 생활 정보 글</div>
                <div className="text-3xl font-extrabold text-slate-900">{posts.length}건</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-xs text-slate-400 font-bold mb-1">총 칼럼 연재 수</div>
                <div className="text-3xl font-extrabold text-slate-900">{columns.length}건</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-xs text-slate-400 font-bold mb-1">분류된 카테고리 수</div>
                <div className="text-3xl font-extrabold text-slate-900">
                  {new Set(posts.map(p => p.category)).size}개
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-xs text-slate-400 font-bold mb-1">메인 노출 추천글</div>
                <div className="text-3xl font-extrabold text-slate-900">
                  {posts.filter(p => p.isRecommended).length}건
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">최근 등록/수정된 생활 정보 글</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-3">글 제목</th>
                      <th className="pb-3">주소 슬러그</th>
                      <th className="pb-3">카테고리</th>
                      <th className="pb-3">날짜</th>
                      <th className="pb-3">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.slice(0, 5).map((post) => (
                      <tr key={post.slug} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                        <td className="py-3.5 font-semibold text-slate-900">{post.title}</td>
                        <td className="py-3.5 font-mono text-xs text-slate-500">/blog/{post.slug}</td>
                        <td className="py-3.5">{post.category}</td>
                        <td className="py-3.5 text-xs text-slate-400">{post.date}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-xxs font-bold ${
                            post.status === "발행" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            {post.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- 탭 2: 일반 글 목록 --- */}
        {activeTab === "posts" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900">생활 정보 글 리스트</h1>
              <button
                onClick={() => { resetPostForm(); setActiveTab("new-post"); }}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-bold shadow transition"
              >
                새 정보 작성하기
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold px-6">
                      <th className="p-4 pl-6">제목</th>
                      <th className="p-4">카테고리</th>
                      <th className="p-4">날짜</th>
                      <th className="p-4">추천</th>
                      <th className="p-4">상태</th>
                      <th className="p-4 pr-6 text-center">동작</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.slug} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                        <td className="p-4 pl-6 font-semibold text-slate-900">{post.title}</td>
                        <td className="p-4 text-xs font-semibold">{post.category}</td>
                        <td className="p-4 text-xs text-slate-400">{post.date}</td>
                        <td className="p-4 text-xs">
                          {post.isRecommended ? "추천" : "일반"}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xxs font-bold ${
                            post.status === "발행" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-center space-x-2">
                          <button
                            onClick={() => handleEditPostClick(post)}
                            className="px-2.5 py-1 text-xs font-bold border border-slate-200 text-slate-700 rounded hover:bg-slate-100 transition"
                          >
                            편집
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.slug)}
                            className="px-2.5 py-1 text-xs font-bold border border-red-200 text-red-600 rounded hover:bg-red-50 transition"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- 탭 3: 새 글 등록 / 편집 폼 --- */}
        {activeTab === "new-post" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
            <h1 className="text-xl font-extrabold text-slate-900 mb-6">
              {editingPost ? "정보글 편집하기" : "새 생활 정보 글 작성"}
            </h1>

            <form onSubmit={handleSavePost} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">글 제목</label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => {
                      setPostTitle(e.target.value);
                      if (!editingPost) {
                        setPostSlug(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9가-힣]/g, "-").replace(/-+/g, "-"));
                      }
                    }}
                    placeholder="예: 성남시 청년지원금 신청 조건"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">영문/숫자 슬러그 주소명</label>
                  <input
                    type="text"
                    required
                    value={postSlug}
                    onChange={(e) => setPostSlug(e.target.value)}
                    placeholder="예: seongnam-youth-support"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">요약 설명형 서브타이틀</label>
                <input
                  type="text"
                  value={postSummary}
                  onChange={(e) => setPostSummary(e.target.value)}
                  placeholder="리스트나 검색결과에 노출될 1-2줄 설명구"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">카테고리</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm bg-white"
                  >
                    <option value="복지">복지</option>
                    <option value="혜택">혜택</option>
                    <option value="행사">행사</option>
                    <option value="축제">축제</option>
                    <option value="지원금">지원금</option>
                    <option value="금융">금융</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">발행 여부 상태</label>
                  <div className="flex gap-4 mt-2">
                    <label className="inline-flex items-center text-sm font-semibold">
                      <input
                        type="radio"
                        name="post_status"
                        checked={postStatus === "발행"}
                        onChange={() => setPostStatus("발행")}
                        className="mr-2"
                      />
                      발행하기
                    </label>
                    <label className="inline-flex items-center text-sm font-semibold text-slate-500">
                      <input
                        type="radio"
                        name="post_status"
                        checked={postStatus === "초안"}
                        onChange={() => setPostStatus("초안")}
                        className="mr-2"
                      />
                      초안으로 저장
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">메인 홈 추천 배치</label>
                  <label className="inline-flex items-center text-sm font-semibold mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={postIsRecommended}
                      onChange={(e) => setPostIsRecommended(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    메인 추천글로 지정
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">본문 내용 (마크다운 지원)</label>
                <textarea
                  rows={10}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="본문 내용을 입력하세요. 마크다운 언어를 사용하여 리스트나 제목을 지정할 수 있습니다."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm font-mono"
                ></textarea>
              </div>

              {/* FAQ 스키마 생성 영역 */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">FAQ 스키마(구조화) 추가하기</h3>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={postFaqQ}
                      onChange={(e) => setPostFaqQ(e.target.value)}
                      placeholder="FAQ 질문 입력 (예: 신청 기한이 지나도 접수 가능한가요?)"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      value={postFaqA}
                      onChange={(e) => setPostFaqA(e.target.value)}
                      placeholder="FAQ 답변 입력 (예: 아니오, 행정 절차상 기한 이후 추가 접수는 절대 불가합니다.)"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 text-xs"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("posts")}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition"
                >
                  작성 취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-bold transition shadow-sm"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- 탭 4: 운영자 칼럼 관리 목록 --- */}
        {activeTab === "columns" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900">칼럼 연재 관리</h1>
              <button
                onClick={() => { resetColumnForm(); setActiveTab("new-column"); }}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-bold shadow transition"
              >
                새 칼럼 연재
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold px-6">
                      <th className="p-4 pl-6">칼럼 제목</th>
                      <th className="p-4">필자</th>
                      <th className="p-4">등록일</th>
                      <th className="p-4 pr-6 text-center">동작</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((col) => (
                      <tr key={col.slug} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                        <td className="p-4 pl-6 font-semibold text-slate-900">{col.title}</td>
                        <td className="p-4 text-xs font-semibold">{col.author}</td>
                        <td className="p-4 text-xs text-slate-400">{col.date}</td>
                        <td className="p-4 pr-6 text-center space-x-2">
                          <button
                            onClick={() => handleEditColumnClick(col)}
                            className="px-2.5 py-1 text-xs font-bold border border-slate-200 text-slate-700 rounded hover:bg-slate-100 transition"
                          >
                            편집
                          </button>
                          <button
                            onClick={() => handleDeleteColumn(col.slug)}
                            className="px-2.5 py-1 text-xs font-bold border border-red-200 text-red-600 rounded hover:bg-red-50 transition"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- 탭 5: 새 칼럼 등록 / 편집 폼 --- */}
        {activeTab === "new-column" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
            <h1 className="text-xl font-extrabold text-slate-900 mb-6">
              {editingColumn ? "칼럼 수정하기" : "새 연재 칼럼 작성"}
            </h1>

            <form onSubmit={handleSaveColumn} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">칼럼 제목</label>
                  <input
                    type="text"
                    required
                    value={columnTitle}
                    onChange={(e) => {
                      setColumnTitle(e.target.value);
                      if (!editingColumn) {
                        setColumnSlug(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9가-힣]/g, "-").replace(/-+/g, "-"));
                      }
                    }}
                    placeholder="예: 2026 성남시 행정을 되돌아보며"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">칼럼 슬러그 주소명</label>
                  <input
                    type="text"
                    required
                    value={columnSlug}
                    onChange={(e) => setColumnSlug(e.target.value)}
                    placeholder="예: seongnam-welfare-reflection"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">칼럼 한줄 요약</label>
                <input
                  type="text"
                  value={columnSummary}
                  onChange={(e) => setColumnSummary(e.target.value)}
                  placeholder="칼럼의 취지와 동기를 짤막하게 기입하세요."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">칼럼 연재 내용 (마크다운 지원)</label>
                <textarea
                  rows={12}
                  value={columnContent}
                  onChange={(e) => setColumnContent(e.target.value)}
                  placeholder="운영자 성나머으로서 전하고자 하는 생각을 자유롭게 기록해 보세요."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm font-mono"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("columns")}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition"
                >
                  작성 취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-bold transition shadow-sm"
                >
                  칼럼 저장하기
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- 탭 6: 사이트 기본 설정 수정 --- */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
            <h1 className="text-xl font-extrabold text-slate-900 mb-6">사이트 기본 환경 설정</h1>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">사이트명 (SITE_NAME)</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">도메인 주소 (SITE_URL)</label>
                  <input
                    type="text"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">한줄 태그라인 (SITE_TAGLINE)</label>
                <input
                  type="text"
                  value={settings.siteTagline}
                  onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">운영자명 (OWNER_NAME)</label>
                  <input
                    type="text"
                    value={settings.owner.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      owner: { ...settings.owner, name: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">운영 연락 이메일 (CONTACT_EMAIL)</label>
                  <input
                    type="email"
                    value={settings.owner.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      owner: { ...settings.owner, email: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">연락처 전화번호</label>
                  <input
                    type="text"
                    value={settings.owner.phone}
                    onChange={(e) => setSettings({
                      ...settings,
                      owner: { ...settings.owner, phone: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">운영자 소개 프로필 (OWNER_BIO)</label>
                <textarea
                  rows={3}
                  value={settings.owner.bio}
                  onChange={(e) => setSettings({
                    ...settings,
                    owner: { ...settings.owner, bio: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">메인 브랜드 컬러 (HEX 값)</label>
                  <input
                    type="text"
                    value={settings.theme.mainColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      theme: { ...settings.theme, mainColor: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">서브 컬러 (HEX 값)</label>
                  <input
                    type="text"
                    value={settings.theme.subColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      theme: { ...settings.theme, subColor: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-bold transition shadow"
                >
                  기본 설정 변경 사항 임시 저장
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}

// Suspense 경계를 통한 useSearchParams 안전 바인딩
export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">불러오는 중...</div>}>
      <AdminContent />
    </Suspense>
  );
}
