const fs = require('fs');
const path = require('path');
const { PERSONA } = require('./persona');
const { quoteFrontmatterColons } = require('./yaml-safe');

const postsDir = path.join(__dirname, '../src/content/posts');

// 네이버 키워드 도구로 추출한 분당/성남 부동산 및 재건축 관련 키워드들
const KEYWORDS = [
  '백현마을2단지', '판교TH', '판교어울림', '판교아파트시세', '판교시세',
  '동판교부동산', '구미동원룸', '분당투룸', '미금역투룸', '선릉역상가임대',
  '판교아파트매매', '성남아파트', '야탑빌라전세', '청솔주공9단지', '구미동월드메르디앙',
  '봇들마을4단지', '수지테라스하우스', '낙생지구', '서현동상가', '서현역상가임대',
  '서현동사무실', '만안부동산', '수지타운하우스', '서판교타운하우스', '용인플랫폼시티',
  '아페르한강', '삼평동부동산', '한남더힐', '판교테크노밸리중흥S클래스', '판교청약',
  '뉴홈', '판교월세', '알파리움2단지', '서현역상가', '대장동금강펜테리움',
  '백현MICE', '판교중흥S클래스', '분당아파트전세', '판교부동산', '성남청약',
  '판교집값', '판교아파트', '성남부동산', '판교212', '대장동테라스하우스',
  'THE212', 'TH212분양가', '판교분양', '대장동TH212', '판교TH212모델하우스',
  '판교타운하우스', '판교푸르지오그랑블', '판교TH212분양가', '미금역', '봇들마을9단지',
  '서현역부동산', '서현동아파트', '대장동타운하우스', '구미동부동산', '라포르테블랑서현',
  '봇들마을1단지', '야탑원룸', '분당재건축', '판교TH212', 'TH212',
  '서현동부동산', '분당아파트매매', '분당선도지구', '분당아파트', '미금역부동산',
  '판교테라스하우스', '알파리움'
];

// 배열에서 랜덤하게 N개 추출
function getRandomKeywords(count = 3) {
  const shuffled = [...KEYWORDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function stripHtml(html) {
  return html.replace(/<[^>]*>?/gm, '');
}

// 네이버 블로그 검색 API 호출
async function fetchNaverBlogSearch(query, clientId, clientSecret, display = 3) {
  const url = `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=${display}&sort=sim`;
  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret
    }
  });
  if (!res.ok) {
    throw new Error(`네이버 블로그 검색 API 호출 실패: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.items || [];
}

// Gemini API로 트렌드 요약 글 생성
async function generateWithGemini(prompt) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
  const responseGemini = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
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

// Pexels API로 사진 찾기
async function findPexelsPhoto() {
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    console.log("PEXELS_API_KEY 환경변수가 설정되지 않아 이미지 검색을 생략합니다.");
    return null;
  }

  try {
    const photoKeyword = 'modern city apartment';
    console.log(`Pexels 이미지 검색을 시작합니다. (검색어: ${photoKeyword})`);
    const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(photoKeyword)}&per_page=1&orientation=landscape`;

    const responsePexels = await fetch(pexelsUrl, {
      headers: { 'Authorization': pexelsApiKey }
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

async function main() {
  const naverClientId = process.env.NAVER_CLIENT_ID;
  const naverClientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!naverClientId || !naverClientSecret) {
    console.log("NAVER_CLIENT_ID/NAVER_CLIENT_SECRET 환경변수가 설정되지 않아 건너뜁니다.");
    process.exit(0);
  }

  const today = new Date().toISOString().split('T')[0];
  const [year, month, day] = today.split('-');
  const dateLabel = `${Number(month)}월 ${Number(day)}일`;

  const selectedKeywords = getRandomKeywords(3);
  console.log(`선택된 메인 키워드: ${selectedKeywords.join(', ')}`);

  let combinedBlogItems = [];
  for (const keyword of selectedKeywords) {
    const items = await fetchNaverBlogSearch(keyword, naverClientId, naverClientSecret, 3);
    combinedBlogItems.push({ keyword, items });
  }

  if (combinedBlogItems.every(group => group.items.length === 0)) {
    console.log('검색된 블로그 글이 없어 건너뜁니다.');
    process.exit(0);
  }

  let searchContext = '';
  combinedBlogItems.forEach(group => {
    searchContext += `\n### 키워드: ${group.keyword}\n`;
    group.items.forEach((item, index) => {
      searchContext += `${index + 1}. 제목: ${stripHtml(item.title)}\n`;
      searchContext += `   요약: ${stripHtml(item.description)}\n`;
    });
  });

  const title = `${dateLabel} 분당·판교 부동산 트렌드: ${selectedKeywords[0]}, ${selectedKeywords[1]}`;
  const filename = `${today}-real-estate-trends-${Date.now()}.md`;

  const prompt = `${PERSONA}

---

아래는 오늘 네이버 블로그에서 반응이 많았던 분당·판교 부동산 키워드와 관련 글 요약이야. 이 내용을 바탕으로 트렌드 정리 블로그 글을 작성해줘.

[오늘의 키워드]
${selectedKeywords.join(', ')}

[네이버 블로그 검색 결과 요약 (참고용, 원문 인용 금지)]
${searchContext}

작성 규칙:
- 오늘은 ${today}다. 계절이나 시기를 언급할 때는 반드시 이 날짜에 맞게 써.
- 매우 중요: 검색 결과를 그대로 베끼거나 특정 블로그 글을 인용하지 마. 어떤 키워드가 왜 주목받는지, 그 배경과 의미를 우리 시각으로 재해석해서 설명해.
- 매우 중요(YMYL): 가격 전망, 투자 조언, "지금 사라/팔아라" 식의 판단은 절대 하지 마. 시세·제도·입지 변화 같은 사실과 그것이 주민 생활에 미치는 영향만 담백하게 설명해.
- 확실하지 않은 구체적 가격·수치는 쓰지 말고, "정확한 시세는 부동산 공시가격 알리미나 인근 공인중개사를 통해 확인하세요" 식으로 안내해.
- 2~3개의 소주제(## 소제목)로 나누어 정리해.
- 맥락상 문단이 변경될 때는 반드시 줄바꿈(엔터 2번)을 해서 빈 줄을 넣어 문단을 명확히 구분해.
- 텍스트를 강조할 때는 \`**강조**\` 대신 반드시 HTML 태그인 \`<strong className="font-bold text-slate-900">강조할 내용</strong>\`을 사용해.
- 사진 출처(예: Pexels 제공)를 남길 때는 \`<span className="text-xs text-slate-500 block text-center mb-6 mt-2">사진: (출처), Pexels 제공</span>\` 형식으로 작게 표시해.
- 글의 맨 마지막 줄에 다음 문구를 그대로 넣어: "부동산 관련 구체적인 시세나 거래는 반드시 공식 확인처와 공인중개사를 통해 확인하시기 바랍니다."

아래 형식으로만 출력하고 다른 텍스트는 붙이지 마:
---
title: "${title}"
date: ${today}
summary: (한 줄 요약)
category: 재개발
tags: [성남부동산, 분당재건축, 판교부동산, ${selectedKeywords[0]}, ${selectedKeywords[1]}]
---

(위 규칙에 따른 본문)`;

  let postContent = await generateWithGemini(prompt);

  const photo = await findPexelsPhoto();
  postContent = injectPhoto(postContent, photo, title);

  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }
  const targetFilePath = path.join(postsDir, filename);
  fs.writeFileSync(targetFilePath, quoteFrontmatterColons(postContent) + '\n', 'utf8');
  console.log(`트렌드 포스트 저장 완료: ${filename}`);
}

main().catch(error => {
  // 트렌드 글 생성 실패가 전체 자동화(데이터 수집/배포)를 막지 않도록 정상 종료
  console.error("네이버 트렌드 글 생성 중 오류 발생 (자동화는 계속 진행됩니다):", error.message);
  process.exit(0);
});
