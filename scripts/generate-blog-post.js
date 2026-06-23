const fs = require('fs');
const path = require('path');

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

    const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보:
${itemText}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${today}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 다음 형식으로 파일명과 이미지 검색용 키워드를 출력해줘:
FILENAME: YYYY-MM-DD-keyword
PEXELS_KEYWORD: (이 글에 가장 잘 어울리는 펙셀스 이미지 검색용 영단어 딱 1개, 예: concert, children, welfare, park 등)`;

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

    // Pexels 검색 키워드 추출 (없을 경우 기본값 'nature')
    const pexelsKeywordMatch = responseText.match(/PEXELS_KEYWORD:\s*([^\r\n]+)/i);
    const pexelsKeyword = pexelsKeywordMatch ? pexelsKeywordMatch[1].trim() : 'nature';

    // FILENAME 및 PEXELS_KEYWORD 줄 제거 및 코드블록 정비
    let postContent = responseText
      .replace(/FILENAME:\s*[^\r\n]+/gi, '')
      .replace(/PEXELS_KEYWORD:\s*[^\r\n]+/gi, '')
      .trim();

    if (postContent.startsWith('```markdown')) {
      postContent = postContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    } else if (postContent.startsWith('```')) {
      postContent = postContent.replace(/^```[a-zA-Z0-9]*\n/, '').replace(/\n```$/, '');
    }
    postContent = postContent.trim();

    // 4단계: Pexels API 호출을 통해 어울리는 이미지 찾기
    let imageUrl = '';
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    
    if (pexelsApiKey) {
      try {
        console.log(`Pexels 이미지 검색을 시작합니다. (검색어: ${pexelsKeyword})`);
        const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(pexelsKeyword)}&per_page=1`;
        
        const responsePexels = await fetch(pexelsUrl, {
          headers: {
            'Authorization': pexelsApiKey
          }
        });

        if (responsePexels.ok) {
          const pexelsResult = await responsePexels.json();
          if (pexelsResult.photos && pexelsResult.photos.length > 0) {
            imageUrl = pexelsResult.photos[0].src.large;
            console.log(`Pexels 이미지를 매칭했습니다: ${imageUrl}`);
          } else {
            console.log(`Pexels에서 키워드 "${pexelsKeyword}"에 대한 검색 결과가 없습니다.`);
          }
        } else {
          console.log(`Pexels API 호출 오류: 상태코드 ${responsePexels.status}`);
        }
      } catch (err) {
        console.log(`Pexels 이미지 가져오기 중 일시적 에러 발생 (생성을 계속 진행합니다): ${err.message}`);
      }
    } else {
      console.log("PEXELS_API_KEY 환경변수가 설정되지 않아 이미지 검색을 생략합니다.");
    }

    // 5단계: 글에 이미지 주소 주입 (프론트매터 및 본문 맨 위)
    if (imageUrl) {
      const parts = postContent.split('---');
      if (parts.length >= 3) {
        // 프론트매터에 image 속성 추가 (parts[1]은 대시 사이의 메타데이터 영역)
        parts[1] = parts[1] + `image: ${imageUrl}\n`;
        // 본문(parts[2]) 시작 지점에 이미지 마크다운 삽입
        parts[2] = `\n\n![${pexelsKeyword}](${imageUrl})\n` + parts[2];
        postContent = parts.join('---');
      } else {
        // 예상 밖의 형식인 경우 본문 맨 위에 추가
        postContent = `![${pexelsKeyword}](${imageUrl})\n\n` + postContent;
      }
    }

    const targetFilePath = path.join(postsDir, targetFilename);
    fs.writeFileSync(targetFilePath, postContent + '\n', 'utf8');

    console.log(`성공적으로 블로그 글을 생성했습니다: ${targetFilename}`);

  } catch (error) {
    console.error("블로그 글 생성 중 오류 발생:", error.message);
    process.exit(1);
  }
}

main();
