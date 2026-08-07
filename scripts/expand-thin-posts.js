// 분량이 얇아 애드센스 "빈약한 콘텐츠" 에 걸릴 소지가 있는 기존 글을
// 원문의 사실관계는 그대로 두고 설명·맥락만 덧붙여 확장한다.
//
// 일회성 정리용 스크립트다. 워크플로우에 걸지 않고 필요할 때 수동 실행한다.
//   node scripts/expand-thin-posts.js           (1800자 미만 전체)
//   node scripts/expand-thin-posts.js --dry     (대상만 출력)
//   node scripts/expand-thin-posts.js <파일명>  (한 건만)

const fs = require('fs');
const path = require('path');
const { PERSONA } = require('./persona');
const { quoteFrontmatterColons } = require('./yaml-safe');

const POSTS_DIR = path.join(__dirname, '../src/content/posts');
const MIN_CHARS = 1800;

// 본문에서 이미지·사진출처·태그를 걷어낸 순수 글자수
function countChars(body) {
  let c = body.replace(/!\[.*?\]\(.*?\)/g, '');
  c = c.replace(/<[^>]+>/g, '');
  c = c.replace(/\*사진:.*?\*/g, '');
  c = c.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  return c.replace(/\s/g, '').length;
}

// AI 는 프롬프트의 금지 조항을 언제든 어기므로 저장 직전에 코드로 검사한다.
const FIRST_PERSON = [
  /저는\s/, /제가\s/, /저\s?역시/, /제\s?경험/, /직접\s?(가|가보|다녀|해)보/,
  /살아오면서/, /살면서/, /저희\s?가족/, /필자/,
];

// 원문에 있던 지역 고유명사가 사라지면 지역성이 옅어진다
function localTerms(text) {
  const found = text.match(/[가-힣]{2,6}(?:산|공원|천|시장|도서관|체육관|역|구청|주민센터)/g) || [];
  return new Set(found);
}

function validate(original, expanded) {
  for (const re of FIRST_PERSON) {
    const m = expanded.match(re);
    if (m) return `지어낸 1인칭 경험담 발견 ("${m[0]}")`;
  }
  const before = localTerms(original);
  const after = localTerms(expanded);
  const lost = [...before].filter(t => !after.has(t));
  if (lost.length > 0) return `원문의 지역 고유명사 누락 (${lost.join(', ')})`;
  return null;
}

function splitPost(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  return { frontmatter: m[1], body: m[2] };
}

// 본문 맨 위의 대표 이미지 블록은 그대로 보존한다
function extractLeadImage(body) {
  const m = body.match(/^\s*(!\[[^\]]*\]\([^)]*\)\s*(?:\*사진:[^\n]*\*|<p[^>]*>사진:[^<]*<\/p>)?)\s*/);
  return m ? { lead: m[1], rest: body.slice(m[0].length) } : { lead: '', rest: body };
}

async function expand(geminiApiKey, title, category, body) {
  const prompt = `${PERSONA}

---

아래는 이미 발행된 블로그 글인데 분량이 너무 짧아 독자에게 도움이 되지 않는다.
이 글을 2200~2800자로 충실하게 다시 써줘.

제목: ${title}
분류: ${category}

기존 본문:
"""
${body}
"""

작성 규칙:
- 기존 본문에 있는 사실(날짜·금액·대상·장소·연락처·기관명)은 절대 바꾸거나 지어내지 마.
  숫자나 고유명사를 새로 만들어내면 안 된다. 모르는 건 "성남시청 홈페이지에서 확인" 처럼 안내로 처리해.
- 늘려야 할 것은 사실이 아니라 설명이다. 제도의 배경, 왜 생겼는지, 어떤 상황에서 유용한지,
  헷갈리기 쉬운 점, 신청 시 주의할 점, 비슷한 제도와의 차이를 이웃에게 설명하듯 풀어써.
- 반드시 \`## 소제목\` 형식(마크다운 H2)으로 3~4개의 소제목을 넣어 단락을 구분해.
  소제목은 독자가 궁금해할 질문 형태의 구체적 문구로 써(예: "## 누가 받을 수 있나요").
  "서론/본론/결론" 같은 형식적 제목은 쓰지 마.
- 각 소제목 아래는 서술형 문단 2~4개로 풀어쓰고, 문단 사이에는 빈 줄을 넣어.
- 강조는 \`**\` 대신 \`<strong className="font-bold text-slate-900">내용</strong>\` 을 사용해.
- 기존 본문에 있던 [PHOTO2] 나 이미지 마크다운, 사진 출처 문구는 결과에 포함하지 마.
- 글 마지막에 "**편집실 한줄평**: (한 문장)" 블록을 넣어.

절대 금지 (어기면 글 전체를 폐기한다):
- 1인칭 경험담을 지어내지 마. "저는 ~해봤는데", "제가 살면서", "직접 가보니",
  "저 역시", "제 경험상" 같은 표현을 쓰면 안 된다. 운영자가 실제로 겪지 않은 일이다.
- 기존 본문에 없는 지명·시설명·행사명·수치를 새로 만들어내지 마.
- 기존 본문에 나오는 지명과 시설명은 빠뜨리지 말고 모두 살려서 설명해.

본문만 출력해. 프론트매터(--- 로 감싼 부분)나 제목은 출력하지 마.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  if (!res.ok) throw new Error(`Gemini 호출 실패: 상태코드 ${res.status}`);

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('응답이 비어 있습니다.');

  // 모델이 프론트매터나 코드펜스를 덧붙이는 경우를 정리
  let out = text.trim();
  out = out.replace(/^```(?:markdown)?\s*/i, '').replace(/```\s*$/, '');
  if (out.startsWith('---')) {
    const m = out.match(/^---[\s\S]*?---\s*([\s\S]*)$/);
    if (m) out = m[1];
  }
  return out.trim();
}

async function main() {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) throw new Error('GEMINI_API_KEY 환경변수가 없습니다.');

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry');
  const only = args.find(a => !a.startsWith('--'));

  let files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  if (only) files = files.filter(f => f === only || f === `${only}.md`);

  const targets = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const parsed = splitPost(raw);
    if (!parsed) continue;
    const n = countChars(parsed.body);
    if (n < MIN_CHARS) targets.push({ file, chars: n, ...parsed });
  }
  targets.sort((a, b) => a.chars - b.chars);

  console.log(`확장 대상: ${targets.length}건 (기준 ${MIN_CHARS}자 미만)`);
  targets.forEach(t => console.log(`  ${String(t.chars).padStart(5)}자  ${t.file}`));
  if (dryRun || targets.length === 0) return;

  let ok = 0;
  for (const t of targets) {
    const titleM = t.frontmatter.match(/^title:\s*(.+)$/m);
    const catM = t.frontmatter.match(/^category:\s*(.+)$/m);
    const title = titleM ? titleM[1].trim().replace(/^"|"$/g, '') : t.file;
    const category = catM ? catM[1].trim() : '';
    const { lead, rest } = extractLeadImage(t.body);

    try {
      console.log(`\n[${t.file}] ${t.chars}자 → 확장 중...`);

      // 한 번은 재시도한다. 두 번 다 규칙을 어기면 원본을 그대로 둔다.
      let expanded = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        const candidate = await expand(geminiApiKey, title, category, rest);
        const problem = validate(rest, candidate);
        if (!problem) { expanded = candidate; break; }
        console.log(`  시도 ${attempt} 폐기: ${problem}`);
      }
      if (!expanded) {
        console.log('  건너뜀: 검증 통과 실패 (원본 유지)');
        continue;
      }

      const after = countChars(expanded);

      // 오히려 짧아지면 원본을 지키는 편이 낫다
      if (after <= t.chars) {
        console.log(`  건너뜀: 결과가 더 짧음 (${after}자)`);
        continue;
      }

      const newBody = (lead ? `${lead}\n\n` : '') + expanded + '\n';
      const out = `---\n${t.frontmatter}\n---\n\n${newBody}`;
      fs.writeFileSync(path.join(POSTS_DIR, t.file), quoteFrontmatterColons(out), 'utf8');
      console.log(`  완료: ${t.chars}자 → ${after}자`);
      ok++;
    } catch (e) {
      console.error(`  실패(원본 유지): ${e.message}`);
    }
  }
  console.log(`\n확장 완료: ${ok}/${targets.length}건`);
}

main().catch(e => {
  console.error('오류:', e.message);
  process.exit(1);
});
