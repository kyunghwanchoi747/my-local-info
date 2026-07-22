const fs = require('fs');
const path = require('path');
const { PERSONA } = require('./persona');
const { quoteFrontmatterColons, ensureFrontmatterFence } = require('./yaml-safe');

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
  '판교테라스하우스', '알파리움', '성남', '재개발', '성남 추모 공원', '성남 세무사',
  '1 1 재개발', '1 1 재건축', 'e 편한 세상 그랑 메종', 'lh 공공 재개발', 'lh 재개발',
  'lh 재개발 임대 주택', '가로 정비 사업 재건축', '경기도 성남', '경기도 성남시', '경기도 성남시 분당구',
  '경기도 성남시 수정구 금토동', '경기도 성남시 중원구', '경우 현 재건축', '계림 3 구역', '계림 4 구역 모아 엘가',
  '공공 재개발', '공공 재개발 구역', '공공 재개발 민간 재개발', '공공 재개발 사업', '공공 재건축',
  '공공 재건축 이란', '공공 주도 재개발', '광천 재개발', '구성남 재개발', '구성남 재건축',
  '구월초 재개발', '금광 1 구역', '기자촌 재개발', '까치 마을 건영 빌라 재건축', '난곡 재개발',
  '남광 로얄 재건축', '내손 라 구역', '뉴타운 삼호 재건축', '단독 주택 재개발', '달맞이 재개발',
  '덕현 지구', '도시 재개발', '도시 재개발 사업', '도시 재생 재개발', '도시 정비 형 재개발',
  '도시 정비 형 재개발 사업', '도화 4 구역', '도환 중 2 구역', '돈 되는 재건축', '돈 되는 재건축 재개발',
  '동남 빌라 재건축', '동부 연합 재건축', '디 에이치 루체 도르', '롯데 월드 재개발', '모아 모아 주택',
  '미아 2 재정비 촉진 구역', '미아 재개발', '미추 1 구역', '미추 10 구역', '미추 4 구역',
  '미추 8 구역', '민간 재개발', '민간 재건축', '민영 재개발', '반송 재개발',
  '백사 마을 재개발', '백운 주택 1 구역', '범천 5 구역', '복정 2 지구', '복정 지구',
  '부곡가 구역', '부동산 재개발', '부동산 재건축', '북항 재개발', '분당 물놀이 장',
  '비산 초교 주변 지구', '사당 재개발', '사직 1 구역', '사직 3 구역', '삼호 뉴타운 재건축',
  '상계 1 구역', '상인천 재개발', '상인천 초교 재개발', '상인천 초교 주변 구역', '새말 지구',
  '서 금사 5 구역', '성남 구도심', '성남 금토동', '성남 대출', '성남 도시 공사',
  '성남 물놀이 장', '성남 복정 2', '성남 복정 2 지구', '성남 복정 지구', '성남 사랑 상품권',
  '성남 사랑 상품권 10', '성남 사랑 상품권 가맹점', '성남 사랑 상품권 구매', '성남 사랑 상품권 구매 방법', '성남 사랑 상품권 구입',
  '성남 사랑 상품권 사용법', '성남 사랑 상품권 주유소', '성남 사랑 상품권 판매', '성남 사랑 상품권 편의점', '성남 사랑 상품권 할인',
  '성남 사랑 상품권 현금', '성남 사랑 상품권 환전', '성남 상품권', '성남 상품권 가맹점', '성남 소상공인',
  '성남 시장', '성남 시청 알바', '성남 시청 홈페이지', '성남 신도시', '성남 신촌',
  '성남 신촌 지구', '성남 아이 사랑 놀이터', '성남 에', '성남 영어', '성남 위례 신도시',
  '성남 중원구', '성남 직업 소개소', '성남 폐차', '성남 포레스 티아', '성남 풋살 장',
  '성남 화장', '성남 화장장', '성남시', '성남시 금토동', '성남시 로고',
  '성남시 물놀이 장', '성남시 분당구 대장동', '성남시 상권 활성화 재단', '성남시 상품권', '성남시 소개',
  '성남시 소상공인', '성남시 수정구', '성남시 영어', '성남시 자가 격리 시설', '성남시 자동차 검사소',
  '성남시 조기 폐차', '성남시 중원구', '성남시 추모 원', '성남시 폐차', '성남시 폐차장',
  '성남시 하늘 누리 추모 원', '성남시 홈페이지', '성남시 화장장', '세운 상가 재개발', '세운 상가 재건축',
  '세운 재개발', '소규모 빌라 재건축', '소규모 재개발', '소규모 재개발 사업', '소규모 재건축 정비 사업',
  '송림 1 2 구역', '송림 6 구역', '송월 아파트 재건축', '수복 재개발', '수정구',
  '숭의 3 구역', '신가 지구 재건축', '신사 1 구역 재건축', '신성 빌라 재건축', '신속 통합',
  '신속 통합 재개발', '신정 뉴타운 1 3', '아파트 재개발', '양평동 재개발', '역세권 재개발',
  '역세권 재건축', '염주 주공 재건축', '영구 임대 재건축', '오전 나 구역', '오피스텔 재개발',
  '온천 래미안 포레스 티지', '왕자 맨션 재건축', '운천 주공 재건축', '원당 재건축', '원천 주공 재건축',
  '융창 지구', '을지 맨션 재건축', '이문 3 구역 재개발', '이문 3 구역 홈페이지', '이문 재개발',
  '인정 프린스 재건축', '작전 현대 아파트 구역', '작전 현대 재개발', '장군 마을 재개발', '장성 재개발',
  '재개발 과 재건축', '재개발 구역', '재개발 권리 가액', '재개발 매몰 비용', '재개발 부동산',
  '재개발 비용', '재개발 사업', '재개발 아파트', '재개발 이란', '재개발 이주',
  '재개발 이주 비용', '재개발 재건축', '재개발 정비 구역', '재개발 정비 사업', '재개발 종류',
  '재개발 주택', '재개발 지구', '재개발 현황', '재건축 1 1', '재건축 가능한 아파트',
  '재건축 과 재개발', '재건축 권리 가액', '재건축 사업', '재건축 시 이주비', '재건축 이란',
  '재건축 이주비 산정', '재건축 임대', '재건축 임대 주택', '재건축 재개발', '재건축 정비 사업',
  '전농 9 구역', '전농 도시 환경 정비 구역', '제기 6 구역', '주례 재개발', '주안 2.4 동 재정비 촉진 지구',
  '주안남초 재개발', '주택 재개발', '주택 재개발 사업', '주택 재개발 정비 사업', '중원구',
  '중화 1 재정비 촉진 구역', '지방 재개발', '청천 1 구역', '초기 재개발', '촉진 4 구역',
  '충훈부 빌라 재건축', '충훈부 재개발', '충훈부 재건축', '통합 재건축', '한강 맨션 재건축 현황',
  '현대 건설 재건축', '호갱 노노 재건축', '호계 온천 지구', '화수 화평', '화수 화평 구역',
  '화수 화평 재개발', '황송 마을 재건축'
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

// Pexels API로 사진 찾기 (키워드 없으면 "modern city apartment" 기본값)
async function findPexelsPhoto(photoKeyword = 'modern city apartment') {
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    console.log("PEXELS_API_KEY 환경변수가 설정되지 않아 이미지 검색을 생략합니다.");
    return null;
  }

  try {
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

  // 슬러그에 Date.now() 를 쓰면 실행할 때마다 무조건 새 파일이 생겨
  // 같은 날 여러 번 실행 시 중복 글이 쌓인다. (2026-07-22 수정)
  // 날짜 고정 슬러그 + 존재 시 중단으로 하루 1건을 보장한다.
  const filename = `${today}-real-estate-trends.md`;
  const targetPath = path.join(postsDir, filename);
  if (fs.existsSync(targetPath)) {
    console.log(`✅ 오늘자 부동산 트렌드 글이 이미 있습니다: ${filename} — 종료`);
    return;
  }

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
- 소제목이나 번호 매기기 없이, 2~3개의 화제를 자연스러운 문단 흐름으로 이어서 정리해.
- 맥락상 문단이 변경될 때는 반드시 줄바꿈(엔터 2번)을 해서 빈 줄을 넣어 문단을 명확히 구분해.
- 텍스트를 강조할 때는 \`**강조**\` 대신 반드시 HTML 태그인 \`<strong className="font-bold text-slate-900">강조할 내용</strong>\`을 사용해.
- 본문 중간, 내용상 자연스럽게 끊기는 지점에 정확히 한 번 \`[PHOTO2]\` 라는 문구를 단독 줄로 넣어. 실제 사진은 시스템이 자동으로 삽입하니, 직접 span 태그나 사진 출처 문구를 쓰지 마.
- 글의 맨 마지막 줄에 다음 문구를 그대로 넣어: "부동산 관련 구체적인 시세나 거래는 반드시 공식 확인처와 공인중개사를 통해 확인하시기 바랍니다."

아래 형식으로만 출력하고 다른 텍스트는 붙이지 마:
---
title: "${title}"
date: ${today}
summary: (한 줄 요약)
category: 재개발
tags: [성남부동산, 분당재건축, 판교부동산, ${selectedKeywords[0]}, ${selectedKeywords[1]}]
---

(위 규칙에 따른 본문)

마지막 줄에 다음 형식으로 사진 검색어를 출력해줘:
PHOTO2: ([PHOTO2] 자리에 들어갈 영어 사진 검색어 1~2단어)`;

  const rawResponse = await generateWithGemini(prompt);
  const photo2Match = rawResponse.match(/PHOTO2:\s*([^\r\n]+)/i);
  const photo2Keyword = photo2Match ? photo2Match[1].trim() : '';
  let postContent = ensureFrontmatterFence(rawResponse.replace(/PHOTO2:\s*[^\r\n]+/gi, '').trim());

  const photo = await findPexelsPhoto();
  postContent = injectPhoto(postContent, photo, title);

  const photo2 = photo2Keyword ? await findPexelsPhoto(photo2Keyword) : null;
  if (photo2) {
    const photo2Block = `![${photo2Keyword}](${photo2.src.large})\n<span className="text-xs text-slate-500 block text-center mb-6 mt-2">사진: [${photo2.photographer}](${photo2.photographer_url}), Pexels 제공</span>`;
    postContent = postContent.replace(/\[PHOTO2\]/, photo2Block);
  }
  postContent = postContent.replace(/\[PHOTO2\]\n*/g, '');

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
