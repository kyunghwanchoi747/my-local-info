const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable.');
      process.exit(1);
    }

    // [1단계] 최신 데이터 확인
    const dataPath = path.join(__dirname, '../public/data/local-info.json');
    if (!fs.existsSync(dataPath)) {
      console.error('데이터 파일이 없습니다.');
      return;
    }
    
    const localData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    if (!localData.items || localData.items.length === 0) {
      console.error('데이터 항목이 비어있습니다.');
      return;
    }
    
    // 마지막 항목 읽기
    const lastItem = localData.items[localData.items.length - 1];
    const itemName = lastItem.name;

    // 기존의 작성된 파일들과 비교
    const postsDir = path.join(__dirname, '../src/content/posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }
    
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      // 글의 내용 중 새로운 항목의 서비스명이 포함되어 있으면 작성된 걸로 간주
      if (content.includes(itemName)) {
        console.log('이미 작성된 글입니다');
        return;
      }
    }

    // [2단계] Gemini AI로 블로그 글 생성
    const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(lastItem, null, 2)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: (오늘 날짜 YYYY-MM-DD)
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const resultData = await response.json();
    let resultText = resultData.candidates[0].content.parts[0].text;

    // [3단계] 텍스트 파싱 및 파일 저장
    const lines = resultText.split('\n');
    let contentLines = [];
    let filename = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('FILENAME:')) {
        filename = line.replace('FILENAME:', '').trim();
      } else {
        contentLines.push(lines[i]);
      }
    }

    if (!filename) {
      // 파일명이 프롬프트대로 오지 않았을 경우 기본값 생성
      const today = new Date().toISOString().split('T')[0];
      filename = `${today}-new-post`;
    }
    
    // .md 확장자 확인
    if (!filename.endsWith('.md')) {
      filename += '.md';
    }

    let postContent = contentLines.join('\n').trim();
    
    // 내용에서 불필요한 마크다운 코드블록 잔재 제거 (```markdown 제거)
    if (postContent.startsWith('```markdown')) {
      postContent = postContent.substring('```markdown'.length);
    } else if (postContent.startsWith('```')) {
      postContent = postContent.substring(3);
    }
    if (postContent.endsWith('```')) {
      postContent = postContent.substring(0, postContent.length - 3);
    }
    postContent = postContent.trim();

    const filePath = path.join(postsDir, filename);
    fs.writeFileSync(filePath, postContent, 'utf8');
    
    console.log(`블로그 글 생성 완료: ${filename}`);

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

main();
