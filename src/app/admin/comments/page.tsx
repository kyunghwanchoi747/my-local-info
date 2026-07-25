"use client";

import { useCallback, useEffect, useState } from "react";

interface AdminComment {
  id: string;
  slug: string;
  name: string;
  body: string;
  timestamp: number;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function AdminCommentsPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (tk: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/comments?admin=${encodeURIComponent(tk)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "조회 실패");
        setAuthed(false);
        sessionStorage.removeItem("commentAdminToken");
        return;
      }
      setComments(Array.isArray(data.comments) ? data.comments : []);
      setAuthed(true);
      sessionStorage.setItem("commentAdminToken", tk);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("commentAdminToken");
    if (saved) {
      setToken(saved);
      load(saved);
    }
  }, [load]);

  async function handleDelete(slug: string, id: string) {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, id, adminToken: token }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "삭제 실패");
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("네트워크 오류");
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">댓글 관리</h1>
      <p className="text-xs text-slate-500 mb-6">관리자 토큰으로 모든 글의 댓글을 조회·삭제합니다.</p>

      {!authed ? (
        <div className="rounded-xl border border-blue-100 bg-white p-4 flex flex-wrap gap-2">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="관리자 토큰"
            className="flex-1 min-w-[200px] text-sm px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-700"
          />
          <button
            type="button"
            onClick={() => load(token)}
            disabled={loading || !token}
            className="text-sm font-bold px-5 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-900 transition disabled:opacity-50"
          >
            {loading ? "확인 중…" : "접속"}
          </button>
          {error && <p className="w-full text-xs text-red-500">{error}</p>}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-600">전체 {comments.length}개</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => load(token)}
                className="text-xs px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 transition"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem("commentAdminToken");
                  setAuthed(false);
                  setComments([]);
                }}
                className="text-xs px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 transition"
              >
                로그아웃
              </button>
            </div>
          </div>

          {comments.length === 0 ? (
            <p className="text-sm text-slate-400 py-6">댓글이 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-800">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatDate(c.timestamp)}</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.slug, c.id)}
                        className="text-xs px-2 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <a
                    href={`/blog/${c.slug}/`}
                    className="text-xs text-blue-700 hover:underline break-all"
                  >
                    /blog/{c.slug}/
                  </a>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mt-1">
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
