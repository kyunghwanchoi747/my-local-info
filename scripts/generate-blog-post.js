const fs = require('fs');
const path = require('path');
const { PERSONA } = require('./persona');
const { quoteFrontmatterColons, ensureFrontmatterFence } = require('./yaml-safe');

// Pexels에서 사진 1건 검색 (검색어 없거나 결과 없으면 null)
async function fetchPexelsPhoto(pexelsApiKey, keyword) {
  if (!pexelsApiKey || !keyword) return null;
  try {
    const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`;
    const res = await fetch(pexelsUrl, { headers: { Authorization: pexelsApiKey } });
    if (!res.ok) {
      console.log(`Pexels API 호출 오류: 상태코드 ${res.status}`);
      return null;
    }
    const result = await res.json();
    if (result.photos && result.photos.length > 0) {
      console.log(`Pexels 이미지를 매칭했습니다: ${result.photos[0].src.large}`);
      return result.photos[0];
    }
    console.log(`Pexels에서 키워드 "${keyword}"에 대한 검색 결과가 없습니다.`);
    return null;
  } catch (err) {
    console.log(`Pexels 이미지 가져오기 중 일시적 에러 발생 (생성을 계속 진행합니다): ${err.message}`);
    return null;
  }
}

async function main() {
  const localInfoPath = path.join(__dirname, '../public/data/local-info.json');
  const postsDir = path.join(__dirname, '../src/content/posts');

  try {
    // 1단계: 최신 데이터 확인
    if (!fs.existsSync(localInfoPath)) {
      throw new Error("local-info.json 파일이 존재하지 않습니다.");
    }

    const localInfoContent = fs.readFileSync(localInfoPath, 'utf8');
    const localInfo = JSON.parse(localInfoContent);

    if (localInfo.length === 0) {
      console.log("데이터가 비어 있습니다.");
      process.exit(0);
    }

    const latestItem = localInfo[localInfo.length - 1];
    const latestName = latestItem.name || latestItem.title;

    if (!latestName) {
      throw new Error("최신 데이터에 name 또는 title 정보가 없습니다.");
    }

    // 기존 posts 폴더의 파일들과 비교
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    const files = fs.readdirSync(postsDir);
    let alreadyExists = false;

    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
        if (content.includes(latestName)) {
          alreadyExists = true;
          break;
        }
      }
    }

    if (alreadyExists) {
      console.log("이미 작성된 글입니다");
      process.exit(0);
    }

    // 2단계: Gemini AI로 블로그 글 생성
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
    }

    const today = new Date().toISOString().split('T')[0];
    const itemText = JSON.stringify(latestItem, null, 2);

    const prompt = `${PERSONA}

---

아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보:
${itemText}

오늘은 ${today}다. 날짜·계절을 언급할 때 이 날짜에 맞게 써.

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: "(담백하고 명확한 제목. 과장 없이)"
date: ${today}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

- 본문은 2000~2800자 사이로 작성해. 반드시 \`## 소제목\` 형식(마크다운 H2)으로 3~4개의 소제목을 넣어 각 단락을 구분해. 소제목은 독자가 궁금해할 핵심을 담은 구체적 문구로 써(예: "## 누가 받을 수 있나", "## 신청 전 꼭 확인할 점"). 각 소제목 아래는 서술형 문단으로 풀어쓰되, 페르소나의 세 가지 관점을 문단 흐름 속에 녹여 설명하고, 마지막 소제목 섹션에서 신청 방법을 안내한 뒤 편집실 한줄평 블록을 넣어.
- 맥락상 문단이 변경될 때는 반드시 줄바꿈(엔터 2번)을 해서 빈 줄을 넣어 문단을 명확히 구분해.
- 텍스트를 강조할 때는 \`**강조**\` 대신 반드시 HTML 태그인 \`<strong className="font-bold text-slate-900">강조할 내용</strong>\`을 사용해.
- 본문 중간, 내용상 자연스럽게 끊기는 지점에 정확히 한 번 \`[PHOTO2]\` 라는 문구를 단독 줄로 넣어. 실제 사진은 시스템이 자동으로 삽입하니, 직접 span 태그나 사진 출처 문구를 쓰지 마.

마지막 줄에 다음 형식으로 파일명과 사진 검색어를 출력해줘:
FILENAME: YYYY-MM-DD-keyword (keyword는 반드시 영문 단어로만 작성해. 한글은 절대 쓰지 마)
PHOTO: (글 주제를 대표하는 영어 사진 검색어 1~2단어. 사진 사이트에서 검색할 것이므로 구체적인 사물이나 풍경 단어로. 예: city park)
PHOTO2: ([PHOTO2] 자리에 들어갈, PHOTO와는 다른 소재의 영어 사진 검색어 1~2단어)`;

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

    const responseText = geminiResult.candidates[0].content.parts[0].text;

    // 3단계: 파일명 및 Pexels 키워드 파싱
    const filenameMatch = responseText.match(/FILENAME:\s*([^\r\n]+)/i);
    if (!filenameMatch) {
      throw new Error("응답에서 파일명(FILENAME:) 정보를 찾을 수 없습니다.");
    }

    let targetFilename = filenameMatch[1].trim();
    if (!targetFilename.endsWith('.md')) {
      targetFilename += '.md';
    }

    // 사진 검색어(PHOTO:, PHOTO2:) 추출 (없으면 사진 없이 진행)
    const photoMatch = responseText.match(/PHOTO:\s*([^\r\n]+)/i);
    const photoKeyword = photoMatch ? photoMatch[1].trim() : '';
    const photo2Match = responseText.match(/PHOTO2:\s*([^\r\n]+)/i);
    const photo2Keyword = photo2Match ? photo2Match[1].trim() : '';

    // FILENAME 및 PHOTO 줄 제거 및 코드블록 정비
    let postContent = responseText
      .replace(/FILENAME:\s*[^\r\n]+/gi, '')
      .replace(/PHOTO2:\s*[^\r\n]+/gi, '')
      .replace(/PHOTO:\s*[^\r\n]+/gi, '')
      .trim();

    if (postContent.startsWith('```markdown')) {
      postContent = postContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    } else if (postContent.startsWith('```')) {
      postContent = postContent.replace(/^```[a-zA-Z0-9]*\n/, '').replace(/\n```$/, '');
    }
    postContent = ensureFrontmatterFence(postContent.trim());

    // 4단계: Pexels API 호출을 통해 어울리는 이미지 찾기 (대표 이미지 + 본문 중간 이미지)
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    if (!pexelsApiKey) {
      console.log("PEXELS_API_KEY 환경변수가 설정되지 않아 이미지 검색을 생략합니다.");
    }
    const photo = await fetchPexelsPhoto(pexelsApiKey, photoKeyword);
    const photo2 = await fetchPexelsPhoto(pexelsApiKey, photo2Keyword);

    // 5단계: 글에 이미지와 촬영자 출처 주입 (프론트매터 바로 아래, 본문 맨 위)
    if (photo) {
      const titleMatch = postContent.match(/^title:\s*(.+)$/m);
      const postTitle = titleMatch ? titleMatch[1].trim() : photoKeyword;
      const imageBlock = `![${postTitle}](${photo.src.large})\n*사진: [${photo.photographer}](${photo.photographer_url}), Pexels 제공*`;

      const parts = postContent.split('---');
      if (parts.length >= 3) {
        // 프론트매터에 image 속성 추가 (parts[1]은 대시 사이의 메타데이터 영역)
        parts[1] = parts[1] + `image: ${photo.src.large}\n`;
        // 본문(parts[2]) 시작 지점에 이미지 마크다운 삽입
        parts[2] = `\n\n${imageBlock}\n` + parts[2];
        postContent = parts.join('---');
      } else {
        // 예상 밖의 형식인 경우 본문 맨 위에 추가
        postContent = `${imageBlock}\n\n` + postContent;
      }
    }

    // 6단계: 본문 중간 [PHOTO2] 자리에 실제 이미지 삽입 (없으면 자리표시자만 제거)
    if (photo2) {
      const photo2Block = `![${photo2Keyword}](${photo2.src.large})\n<span className="text-xs text-slate-500 block text-center mb-6 mt-2">사진: [${photo2.photographer}](${photo2.photographer_url}), Pexels 제공</span>`;
      postContent = postContent.replace(/\[PHOTO2\]/, photo2Block);
    }
    postContent = postContent.replace(/\[PHOTO2\]\n*/g, '');

    const targetFilePath = path.join(postsDir, targetFilename);
    fs.writeFileSync(targetFilePath, quoteFrontmatterColons(postContent) + '\n', 'utf8');

    console.log(`성공적으로 블로그 글을 생성했습니다: ${targetFilename}`);

  } catch (error) {
    console.error("블로그 글 생성 중 오류 발생:", error.message);
    process.exit(1);
  }
}

main();
