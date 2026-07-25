// 비로그인 댓글 API (Cloudflare Pages Functions + KV)
// - 작성: 닉네임 + 비밀번호(해시 저장) + 내용
// - 조회: 글(slug)별 목록
// - 삭제: 본인 비밀번호 일치 시 OR 관리자 토큰 일치 시
//
// 저장 구조: KV key = `cmt_<slug>_<timestamp>_<rand>`
//   value = { id, slug, name, body, pwHash, timestamp }
// 기존 CHAT_KV 네임스페이스를 재사용한다 (prefix로 chat과 분리).

const KEY_PREFIX = "cmt_";
const MAX_NAME = 40;
const MAX_BODY = 1000;

// ── 유틸 ──────────────────────────────────────────────
async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// slug 화이트리스트: KV 키 인젝션·prefix 오염 방지
function safeSlug(slug) {
  return String(slug || "")
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, "")
    .slice(0, 120);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ── 조회 ─────────────────────────────────────────────────
//   일반: GET /api/comments?slug=...          → 해당 글 댓글
//   관리: GET /api/comments?admin=<TOKEN>     → 전체 댓글(slug 포함)
export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const adminToken = url.searchParams.get("admin");

    // 관리자 전체 조회
    if (adminToken) {
      if (!context.env.ADMIN_TOKEN || adminToken !== context.env.ADMIN_TOKEN) {
        return json({ error: "인증 실패" }, 403);
      }
      const listed = await context.env.CHAT_KV.list({ prefix: KEY_PREFIX });
      const comments = [];
      for (const key of listed.keys) {
        const valStr = await context.env.CHAT_KV.get(key.name);
        if (!valStr) continue;
        const d = JSON.parse(valStr);
        comments.push({
          id: d.id,
          slug: d.slug,
          name: d.name,
          body: d.body,
          timestamp: d.timestamp,
        });
      }
      comments.sort((a, b) => b.timestamp - a.timestamp); // 최신순
      return json({ comments });
    }

    // 일반 글별 조회
    const slug = safeSlug(url.searchParams.get("slug"));
    if (!slug) return json({ comments: [] });

    const listed = await context.env.CHAT_KV.list({ prefix: `${KEY_PREFIX}${slug}_` });
    const comments = [];
    for (const key of listed.keys) {
      const valStr = await context.env.CHAT_KV.get(key.name);
      if (!valStr) continue;
      const d = JSON.parse(valStr);
      // pwHash는 절대 클라이언트로 내보내지 않는다
      comments.push({
        id: d.id,
        name: d.name,
        body: d.body,
        timestamp: d.timestamp,
      });
    }
    comments.sort((a, b) => a.timestamp - b.timestamp);
    return json({ comments });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

// ── 작성: POST /api/comments ─────────────────────────────
// body: { slug, name, password, body }
export async function onRequestPost(context) {
  try {
    const { slug: rawSlug, name, password, body } = await context.request.json();
    const slug = safeSlug(rawSlug);

    if (!slug) return json({ error: "잘못된 게시글입니다." }, 400);
    if (!name || !name.trim()) return json({ error: "닉네임을 입력하세요." }, 400);
    if (!password || password.length < 4)
      return json({ error: "비밀번호는 4자 이상이어야 합니다." }, 400);
    if (!body || !body.trim()) return json({ error: "내용을 입력하세요." }, 400);

    const cleanName = escapeHtml(name.trim().slice(0, MAX_NAME));
    const cleanBody = escapeHtml(body.trim().slice(0, MAX_BODY));
    const timestamp = Date.now();
    const id = `${timestamp}_${Math.random().toString(36).slice(2, 8)}`;
    const pwHash = await sha256(password);

    const record = { id, slug, name: cleanName, body: cleanBody, pwHash, timestamp };
    const key = `${KEY_PREFIX}${slug}_${id}`;
    await context.env.CHAT_KV.put(key, JSON.stringify(record));

    return json({
      ok: true,
      comment: { id, name: cleanName, body: cleanBody, timestamp },
    });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

// ── 삭제: DELETE /api/comments ───────────────────────────
// body: { slug, id, password }  또는  { slug, id, adminToken }
export async function onRequestDelete(context) {
  try {
    const { slug: rawSlug, id, password, adminToken } = await context.request.json();
    const slug = safeSlug(rawSlug);
    if (!slug || !id) return json({ error: "잘못된 요청입니다." }, 400);

    const key = `${KEY_PREFIX}${slug}_${id}`;
    const valStr = await context.env.CHAT_KV.get(key);
    if (!valStr) return json({ error: "이미 삭제되었거나 없는 댓글입니다." }, 404);

    const d = JSON.parse(valStr);

    // 관리자 삭제: 환경변수 ADMIN_TOKEN과 일치하면 무조건 허용
    const adminOk =
      adminToken && context.env.ADMIN_TOKEN && adminToken === context.env.ADMIN_TOKEN;

    // 본인 삭제: 비밀번호 해시 일치
    let ownerOk = false;
    if (!adminOk && password) {
      ownerOk = (await sha256(password)) === d.pwHash;
    }

    if (!adminOk && !ownerOk) {
      return json({ error: "비밀번호가 일치하지 않습니다." }, 403);
    }

    await context.env.CHAT_KV.delete(key);
    return json({ ok: true });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
