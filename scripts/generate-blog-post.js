const fs = require('fs');
const path = require('path');
const { PERSONA } = require('./persona');
const { quoteFrontmatterColons, ensureFrontmatterFence } = require('./yaml-safe');

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

- 본문은 1500~2000자 사이의 자연스러운 서술형 글로 작성해. 소제목이나 번호 매기기 없이, 페르소나의 세 가지 관점을 문단 흐름 속에 녹여서 설명하고, 마지막에 신청 방법을 안내한 뒤 편집실 한줄평 블록을 넣어.
- 맥락상 문단이 변경될 때는 반드시 줄바꿈(엔터 2번)을 해서 빈 줄을 넣어 문단을 명확히 구분해.
- 텍스트를 강조할 때는 \`**강조**\` 대신 반드시 HTML 태그인 \`<strong className="font-bold text-slate-900">강조할 내용</strong>\`을 사용해.
- 글의 시작 부분이나 사진 아래에 출처(예: Pexels 제공)를 남길 때는 \`<span className="text-xs text-slate-500 block text-center mb-6 mt-2">사진: (출처), Pexels 제공</span>\` 형식으로 작게 표시해.

마지막 줄에 다음 형식으로 파일명과 사진 검색어를 출력해줘:
FILENAME: YYYY-MM-DD-keyword (keyword는 반드시 영문 단어로만 작성해. 한글은 절대 쓰지 마)
PHOTO: (글 주제를 대표하는 영어 사진 검색어 1~2단어. 사진 사이트에서 검색할 것이므로 구체적인 사물이나 풍경 단어로. 예: city park)`;

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

    // 사진 검색어(PHOTO:) 추출 (없으면 사진 없이 진행)
    const photoMatch = responseText.match(/PHOTO:\s*([^\r\n]+)/i);
    const photoKeyword = photoMatch ? photoMatch[1].trim() : '';

    // FILENAME 및 PHOTO 줄 제거 및 코드블록 정비
    let postContent = responseText
      .replace(/FILENAME:\s*[^\r\n]+/gi, '')
      .replace(/PHOTO:\s*[^\r\n]+/gi, '')
      .trim();

    if (postContent.startsWith('```markdown')) {
      postContent = postContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    } else if (postContent.startsWith('```')) {
      postContent = postContent.replace(/^```[a-zA-Z0-9]*\n/, '').replace(/\n```$/, '');
    }
    postContent = ensureFrontmatterFence(postContent.trim());

    // 4단계: Pexels API 호출을 통해 어울리는 이미지 찾기
    let photo = null;
    const pexelsApiKey = process.env.PEXELS_API_KEY;

    if (!pexelsApiKey) {
      console.log("PEXELS_API_KEY 환경변수가 설정되지 않아 이미지 검색을 생략합니다.");
    } else if (!photoKeyword) {
      console.log("응답에 PHOTO: 검색어가 없어 이미지 검색을 생략합니다.");
    } else {
      try {
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
            photo = pexelsResult.photos[0];
            console.log(`Pexels 이미지를 매칭했습니다: ${photo.src.large}`);
          } else {
            console.log(`Pexels에서 키워드 "${photoKeyword}"에 대한 검색 결과가 없습니다.`);
          }
        } else {
          console.log(`Pexels API 호출 오류: 상태코드 ${responsePexels.status}`);
        }
      } catch (err) {
        console.log(`Pexels 이미지 가져오기 중 일시적 에러 발생 (생성을 계속 진행합니다): ${err.message}`);
      }
    }

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

    const targetFilePath = path.join(postsDir, targetFilename);
    fs.writeFileSync(targetFilePath, quoteFrontmatterColons(postContent) + '\n', 'utf8');

    console.log(`성공적으로 블로그 글을 생성했습니다: ${targetFilename}`);

  } catch (error) {
    console.error("블로그 글 생성 중 오류 발생:", error.message);
    process.exit(1);
  }
}

main();
