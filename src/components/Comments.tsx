"use client";

import { useEffect } from "react";

interface CommentsProps {
  pageId: string;
  pageTitle: string;
  pageUrl: string;
}

declare global {
  interface Window {
    CUSDIS?: {
      initial: () => void;
    };
  }
}

export default function Comments({ pageId, pageTitle, pageUrl }: CommentsProps) {
  const appId = process.env.NEXT_PUBLIC_CUSDIS_APP_ID;

  useEffect(() => {
    if (!appId) return;

    // 이미 스크립트가 로드되어 있으면 위젯만 다시 초기화 (글 간 이동 대응)
    if (window.CUSDIS) {
      window.CUSDIS.initial();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cusdis.com/js/cusdis.es.js";
    script.async = true;
    document.body.appendChild(script);
  }, [appId, pageId]);

  if (!appId) {
    return null;
  }

  return (
    <section className="mt-10 pt-6 border-t border-slate-100">
      <h2 className="text-lg font-bold text-slate-900 mb-1">댓글</h2>
      <p className="text-xs text-slate-500 mb-4">댓글은 관리자 승인 후 게시됩니다.</p>
      <div
        id="cusdis_thread"
        data-host="https://cusdis.com"
        data-app-id={appId}
        data-page-id={pageId}
        data-page-url={pageUrl}
        data-page-title={pageTitle}
      />
    </section>
  );
}
