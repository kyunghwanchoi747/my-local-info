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

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

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

    // 3단계: 파일명 파싱 및 내용 정리
    const filenameMatch = responseText.match(/FILENAME:\s*([^\r\n]+)/i);
    if (!filenameMatch) {
      throw new Error("응답에서 파일명(FILENAME:) 정보를 찾을 수 없습니다.");
    }

    let targetFilename = filenameMatch[1].trim();
    if (!targetFilename.endsWith('.md')) {
      targetFilename += '.md';
    }

    // FILENAME 줄 제거 및 코드블록 정비
    let postContent = responseText.replace(/FILENAME:\s*[^\r\n]+/gi, '').trim();
    if (postContent.startsWith('```markdown')) {
      postContent = postContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    } else if (postContent.startsWith('```')) {
      postContent = postContent.replace(/^```[a-zA-Z0-9]*\n/, '').replace(/\n```$/, '');
    }
    postContent = postContent.trim();

    const targetFilePath = path.join(postsDir, targetFilename);
    fs.writeFileSync(targetFilePath, postContent + '\n', 'utf8');

    console.log(`성공적으로 블로그 글을 생성했습니다: ${targetFilename}`);

  } catch (error) {
    console.error("블로그 글 생성 중 오류 발생:", error.message);
    process.exit(1);
  }
}

main();
