const fs = require('fs');
const path = require('path');
const { PERSONA } = require('./persona');

async function main() {
  const topicsPath = path.join(__dirname, '../public/data/redev-topics.json');
  const postsDir = path.join(__dirname, '../src/content/posts');

  try {
    // 1단계: 주제 큐에서 아직 쓰지 않은 첫 번째 주제 고르기
    if (!fs.existsSync(topicsPath)) {
      throw new Error("redev-topics.json 파일이 존재하지 않습니다.");
    }

    const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
    const topicIndex = topics.findIndex(t => t.done === false);

    if (topicIndex === -1) {
      console.log("주제 큐가 비었습니다");
      process.exit(0);
    }

    const topic = topics[topicIndex].topic;
    console.log(`오늘의 재건축 해설 주제: ${topic}`);

    // 2단계: Gemini AI로 해설 글 생성
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
    }

    const today = new Date().toISOString().split('T')[0];

    const prompt = `${PERSONA}

---

아래 주제로 재건축·재개발 용어 해설 블로그 글을 작성해줘.

주제: ${topic}

작성 규칙:
- 오늘은 ${today}다. 계절이나 시기를 언급할 때는 반드시 이 날짜에 맞게 써.
- 독자는 재건축 뉴스를 접했지만 용어가 낯선 분당·성남 주민이야. 어려운 용어는 풀어서 설명해.
- 글 구조: 개념 정의 → 왜 중요한가 → 분당·성남 상황과의 연결 → 자주 묻는 질문 2~3개. 각 부분에 "## " 소제목을 붙여.
- 분량은 1200자 이상.
- 글의 맨 마지막 줄에 반드시 다음 문구를 그대로 넣어: "재건축·재개발 관련 구체적 사항은 성남시청 및 국토교통부 공식 발표를 확인하시기 바랍니다."

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: "(주제를 담은 담백한 제목)"
date: ${today}
summary: (한 줄 요약)
category: 재개발
tags: [태그1, 태그2, 태그3]
---

(위 규칙에 따른 본문)

마지막 줄에 다음 형식으로 파일명과 사진 검색어를 출력해줘:
FILENAME: YYYY-MM-DD-keyword
PHOTO: (글 주제를 대표하는 영어 사진 검색어 1~2단어. 사진 사이트에서 검색할 것이므로 구체적인 사물이나 풍경 단어로. 예: apartment buildings)`;

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

    // 파일명 파싱
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
    postContent = postContent.trim();

    // 3단계: Pexels API 호출을 통해 어울리는 이미지 찾기
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

    // 4단계: 글에 이미지와 촬영자 출처 주입 (프론트매터 바로 아래, 본문 맨 위)
    if (photo) {
      const titleMatch = postContent.match(/^title:\s*(.+)$/m);
      const postTitle = titleMatch ? titleMatch[1].trim() : photoKeyword;
      const imageBlock = `![${postTitle}](${photo.src.large})\n*사진: [${photo.photographer}](${photo.photographer_url}), Pexels 제공*`;

      const parts = postContent.split('---');
      if (parts.length >= 3) {
        parts[1] = parts[1] + `image: ${photo.src.large}\n`;
        parts[2] = `\n\n${imageBlock}\n` + parts[2];
        postContent = parts.join('---');
      } else {
        postContent = `${imageBlock}\n\n` + postContent;
      }
    }

    // 5단계: 글 저장
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }
    const targetFilePath = path.join(postsDir, targetFilename);
    fs.writeFileSync(targetFilePath, postContent + '\n', 'utf8');
    console.log(`성공적으로 재건축 해설 글을 생성했습니다: ${targetFilename}`);

    // 6단계: 사용한 주제를 done 처리하고 큐 저장
    topics[topicIndex].done = true;
    fs.writeFileSync(topicsPath, JSON.stringify(topics, null, 2) + '\n', 'utf8');
    console.log(`주제 큐를 갱신했습니다. (남은 주제: ${topics.filter(t => t.done === false).length}개)`);

  } catch (error) {
    // 해설 글 실패가 전체 자동화(데이터 수집/배포)를 막지 않도록 정상 종료
    console.error("재건축 해설 글 생성 중 오류 발생 (자동화는 계속 진행됩니다):", error.message);
    process.exit(0);
  }
}

main();
