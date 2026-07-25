"use client";

import { useCallback, useEffect, useState } from "react";

interface CommentsProps {
  pageId: string;
  pageTitle: string;
  pageUrl: string;
}

interface CommentItem {
  id: string;
  name: string;
  body: string;
  timestamp: number;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function Comments({ pageId }: CommentsProps) {
  const slug = pageId;

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 작성 폼
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 삭제 대상(비밀번호 입력창을 여는 댓글 id)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletePw, setDeletePw] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch {
      /* 조회 실패 시 빈 목록 유지 */
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || password.length < 4 || !body.trim()) {
      setError("닉네임, 비밀번호(4자 이상), 내용을 모두 입력하세요.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, password, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "등록에 실패했습니다.");
      } else {
        setBody("");
        setPassword("");
        await load();
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteError("");
    if (!deletePw) {
      setDeleteError("비밀번호를 입력하세요.");
      return;
    }
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, id, password: deletePw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "삭제에 실패했습니다.");
      } else {
        setDeleteTarget(null);
        setDeletePw("");
        await load();
      }
    } catch {
      setDeleteError("네트워크 오류가 발생했습니다.");
    }
  }

  return (
    <section className="mt-10 pt-6 border-t border-slate-100">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        댓글 {comments.length > 0 && <span className="text-blue-800">{comments.length}</span>}
      </h2>

      {/* 목록 */}
      {loading ? (
        <p className="text-sm text-slate-400 py-4">댓글을 불러오는 중…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400 py-4">첫 번째 댓글을 남겨보세요.</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-800">{c.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{formatDate(c.timestamp)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget(deleteTarget === c.id ? null : c.id);
                      setDeletePw("");
                      setDeleteError("");
                    }}
                    className="text-xs text-slate-400 hover:text-red-500 transition"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{c.body}</p>

              {deleteTarget === c.id && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="password"
                    value={deletePw}
                    onChange={(e) => setDeletePw(e.target.value)}
                    placeholder="작성 시 비밀번호"
                    className="text-xs px-2 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="text-xs px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    삭제하기
                  </button>
                  {deleteError && <span className="text-xs text-red-500">{deleteError}</span>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 작성 폼 */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-blue-100 bg-white p-4">
        <p className="text-xs text-slate-500 mb-3">
          로그인 없이 댓글을 남길 수 있습니다. 비밀번호는 본인 댓글 삭제에만 사용됩니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="닉네임"
            maxLength={40}
            className="flex-1 text-sm px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-700"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (4자 이상)"
            maxLength={60}
            className="flex-1 text-sm px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-700"
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="댓글을 입력하세요"
          rows={3}
          maxLength={1000}
          className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-700 resize-y"
        />
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="text-sm font-bold px-5 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-900 transition disabled:opacity-50"
          >
            {submitting ? "등록 중…" : "댓글 등록"}
          </button>
        </div>
      </form>
    </section>
  );
}
