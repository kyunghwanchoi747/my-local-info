const fs = require('fs');
const path = require('path');
const { PERSONA } = require('./persona');
const { quoteFrontmatterColons } = require('./yaml-safe');

const postsDir = path.join(__dirname, '../src/content/posts');

// XML 엔티티를 일반 문자로 되돌리기
function decodeEntities(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

// 구글 뉴스 RSS에서 최근 48시간 이내 뉴스 상위 5개 가져오기
async function fetchRecentNews(query) {
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
  const responseRss = await fetch(rssUrl);
  if (!responseRss.ok) {
    throw new Error(`구글 뉴스 RSS 호출 실패: ${responseRss.status} ${responseRss.statusText}`);
  }
  const xml = await responseRss.text();

  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch;
  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const block = itemMatch[1];
    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    if (!titleMatch || !linkMatch || !pubDateMatch) continue;

    const rawTitle = decodeEntities(titleMatch[1]);
    const link = decodeEntities(linkMatch[1]);
    const pubDate = new Date(pubDateMatch[1].trim());
    if (isNaN(pubDate.getTime())) continue;

    // 제목 끝의 " - 언론사명" 분리
    let title = rawTitle;
    let source = '';
    const sepIndex = rawTitle.lastIndexOf(' - ');
    if (sepIndex > 0) {
      title = rawTitle.slice(0, sepIndex).trim();
      source = rawTitle.slice(sepIndex + 3).trim();
    }

    items.push({ title, source, link, pubDate });
  }

  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  return items
    .filter(item => item.pubDate.getTime() >= cutoff)
    .slice(0, 5);
}

// Gemini API로 브리핑 본문 생성
async function generateWithGemini(prompt) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
  const responseGemini = await fetch(geminiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    })
  });

  if (!responseGemini.ok) {
    throw new Error(`Gemini API 호출 실패: ${responseGemini.status} ${responseGemini.statusText}`);
  }

  const geminiResult = await responseGemini.json();
  if (!geminiResult.candidates || !geminiResult.candidates[0] || !geminiResult.candidates[0].content || !geminiResult.candidates[0].content.parts || !geminiResult.candidates[0].content.parts[0]) {
    throw new Error("Gemini API 응답 형식이 올바르지 않습니다.");
  }

  let postContent = geminiResult.candidates[0].content.parts[0].text.trim();
  if (postContent.startsWith('```')) {
    postContent = postContent.replace(/^```[a-zA-Z0-9]*\n/, '').replace(/\n```$/, '');
  }
  return postContent.trim();
}

// Pexels API로 사진 찾기 (검색어 "korea city" 고정)
async function findPexelsPhoto() {
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    console.log("PEXELS_API_KEY 환경변수가 설정되지 않아 이미지 검색을 생략합니다.");
    return null;
  }

  try {
    const photoKeyword = 'korea city';
    console.log(`Pexels 이미지 검색을 시작합니다. (검색어: ${photoKeyword})`);
    const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(photoKeyword)}&per_page=1&orientation=landscape`;

    const responsePexels = await fetch(pexelsUrl, {
      headers: {
        'Authorization': pexelsApiKey
      }
    });

    if (responsePexels.ok) {
      const pexelsResult = await responsePexels.json();
      if (pexelsResult.photos && pexelsResult.photos.length > 0) {
        console.log(`Pexels 이미지를 매칭했습니다: ${pexelsResult.photos[0].src.large}`);
        return pexelsResult.photos[0];
      }
      console.log("Pexels에서 검색 결과가 없습니다.");
    } else {
      console.log(`Pexels API 호출 오류: 상태코드 ${responsePexels.status}`);
    }
  } catch (err) {
    console.log(`Pexels 이미지 가져오기 중 일시적 에러 발생 (생성을 계속 진행합니다): ${err.message}`);
  }
  return null;
}

// 글에 이미지와 촬영자 출처 주입 (프론트매터 바로 아래, 본문 맨 위)
function injectPhoto(postContent, photo, altText) {
  if (!photo) return postContent;

  const imageBlock = `![${altText}](${photo.src.large})\n*사진: [${photo.photographer}](${photo.photographer_url}), Pexels 제공*`;

  const parts = postContent.split('---');
  if (parts.length >= 3) {
    parts[1] = parts[1] + `image: ${photo.src.large}\n`;
    parts[2] = `\n\n${imageBlock}\n` + parts[2];
    return parts.join('---');
  }
  return `${imageBlock}\n\n` + postContent;
}

// 브리핑 1건 생성 (뉴스 수집 → Gemini 작성 → 사진 삽입 → 저장)
async function generateBriefing(config) {
  const targetFilePath = path.join(postsDir, config.filename);

  if (fs.existsSync(targetFilePath)) {
    console.log(`이미 작성된 글입니다: ${config.filename}`);
    return;
  }

  const recentNews = await fetchRecentNews(config.query);
  if (recentNews.length === 0) {
    console.log(`최근 48시간 이내 뉴스가 없어 건너뜁니다. (검색어: ${config.query})`);
    return;
  }

  const newsListText = recentNews
    .map((n, i) => `${i + 1}. 제목: ${n.title}\n   언론사: ${n.source || '알 수 없음'}\n   링크: ${n.link}`)
    .join('\n');

  const extraRules = config.extraRules ? `\n${config.extraRules}` : '';
  const footerRule = config.footer
    ? `\n- 글의 맨 마지막 줄에 다음 문구를 그대로 추가해: "${config.footer}"`
    : '';

  const prompt = `${PERSONA}

---

아래는 오늘 수집한 뉴스 ${recentNews.length}개의 제목 목록이야. 이 목록으로 뉴스 브리핑 블로그 글을 작성해줘.

뉴스 목록:
${newsListText}

작성 규칙:
- 매우 중요: 기사 본문 내용을 지어내지 마. 각 뉴스는 제목에서 알 수 있는 사실만 언급하고, 자세한 내용은 링크 기사에서 확인하라고 안내해.
- 도입부는 오늘 브리핑을 여는 인사 2~3문장으로 시작해.
- 각 뉴스 제목은 \`## 제목\` 형식으로 큰 따옴표 안에 작성해.
- 각 뉴스 제목 아래에 2~3문장으로 소식을 요약해서 친절하게 설명해.
- 본문 안에는 뉴스 출처나 링크를 절대 적지 마.
- 대신, 글의 맨 마지막 하단에 \`## 관련 기사 원문 링크\`라는 소제목을 달고, 본문에서 다룬 뉴스들의 출처를 중복 없이 모아서 \`- [언론사명](뉴스링크)\` 형식의 리스트로 깔끔하게 정리해.
- 맥락상 문단이 변경될 때는 반드시 줄바꿈(엔터 2번)을 해서 빈 줄을 넣어 문단을 명확히 구분해.
- 텍스트를 강조할 때는 \`**강조**\` 대신 반드시 HTML 태그인 \`<strong className="font-bold text-slate-900">강조할 내용</strong>\`을 사용해.
- 사진 출처(예: Pexels 제공)를 남길 때는 \`<span className="text-xs text-slate-500 block text-center mb-6 mt-2">사진: (출처), Pexels 제공</span>\` 형식으로 작게 표시해.${extraRules}${footerRule}

아래 형식으로만 출력하고 다른 텍스트는 붙이지 마:
---
title: "${config.title}"
date: ${config.date}
summary: (오늘 브리핑을 요약하는 한 문장)
category: ${config.category}
tags: [${config.tags.join(', ')}]
---

(위 규칙에 따른 본문)`;

  let postContent = await generateWithGemini(prompt);

  const photo = await findPexelsPhoto();
  postContent = injectPhoto(postContent, photo, config.title);

  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }
  fs.writeFileSync(targetFilePath, quoteFrontmatterColons(postContent) + '\n', 'utf8');
  console.log(`성공적으로 뉴스 브리핑 글을 생성했습니다: ${config.filename}`);
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  const [year, month, day] = today.split('-');
  const dateLabel = `${Number(month)}월 ${Number(day)}일`;

  const briefings = [
    {
      query: '성남시',
      filename: `${today}-seongnam-news-briefing.md`,
      title: `${dateLabel} 성남 소식 브리핑`,
      date: today,
      category: '뉴스',
      tags: ['성남시', '뉴스브리핑', '지역소식']
    },
    {
      query: '"분당 재건축" OR "성남 재개발"',
      filename: `${today}-bundang-redevelopment-news.md`,
      title: `${dateLabel} 분당·성남 재개발 소식`,
      date: today,
      category: '재개발',
      tags: ['성남시', '분당재건축', '재개발소식'],
      extraRules: '- 부동산 투자 조언이나 가격 전망은 절대 쓰지 마. 제목에서 확인되는 사실과 시민에게 미치는 영향만 담백하게 코멘트해.',
      footer: '본 글은 뉴스 제목 기반 요약으로, 자세한 내용은 각 기사 원문을 확인해 주세요.'
    }
  ];

  // 한 브리핑이 실패해도 다음 브리핑과 전체 자동화는 계속 진행
  for (const config of briefings) {
    try {
      await generateBriefing(config);
    } catch (error) {
      console.error(`뉴스 브리핑 생성 중 오류 발생 (자동화는 계속 진행됩니다) [${config.filename}]:`, error.message);
    }
  }
}

main();
