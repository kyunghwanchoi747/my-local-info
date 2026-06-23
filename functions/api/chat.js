// 마크다운 문법 제거 함수 (답변 정제용)
function stripMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/#+\s+/g, "") // 헤더 (#) 제거
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // 볼드 (**) 제거
    .replace(/(\*|_)(.*?)\1/g, "$2") // 이탤릭 (*) 제거
    .replace(/`{3}[\s\S]*?`{3}/g, "") // 코드 블록 제거
    .replace(/`([^`]+)`/g, "$1") // 인라인 코드 제거
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 링크 제거
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // 이미지 제거
    .replace(/>\s+/g, "") // 인용구 제거
    .replace(/[-*+]\s+/g, "") // 리스트 기호 제거
    .replace(/\s+/g, " ") // 공백 압축
    .trim();
}

export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!context.env.AI) {
      return new Response(JSON.stringify({ error: "AI binding not found" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. search-index.json 가져오기
    const indexUrl = new URL(context.request.url).origin + "/data/search-index.json";
    let searchIndex = [];
    try {
      const indexRes = await fetch(indexUrl);
      if (indexRes.ok) {
        searchIndex = await indexRes.json();
      }
    } catch (e) {
      console.error("search-index.json 로드 실패:", e.message);
    }

    // 2. 키워드 매칭 스코어링 (RAG)
    const queryWords = message.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
    const scoredItems = searchIndex.map(item => {
      let score = 0;
      const searchText = `${item.title} ${item.summary} ${item.content}`.toLowerCase();
      
      queryWords.forEach(word => {
        if (searchText.includes(word)) {
          score += 1;
          // 제목에 포함 시 가중치 부여
          if (item.title.toLowerCase().includes(word)) {
            score += 2;
          }
        }
      });
      return { item, score };
    });

    // 점수가 높은 상위 3개 항목 선택 (점수가 0보다 큰 항목 위주)
    const topMatches = scoredItems
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(x => x.item);

    // 블로그 데이터 스트링 생성
    let blogDataText = "";
    if (topMatches.length > 0) {
      blogDataText = topMatches.map((item, idx) => 
        `[${idx + 1}] Title: ${item.title}\nSummary: ${item.summary || item.content}`
      ).join("\n\n");
    } else {
      blogDataText = "No relevant data found.";
    }

    // 3. 시스템 프롬프트 작성
    const systemPrompt = `You are an AI assistant for a Korean local information blog.
Answer ONLY in Korean. Keep answers to 2-3 sentences maximum.
Do NOT use any markdown symbols (**, *, #, -). Plain text only.
Base your answer ONLY on the following blog data. If not relevant, reply: 해당 내용은 블로그에서 확인이 어렵습니다. 다른 질문을 해주세요.

[블로그 데이터]
${blogDataText}`;

    // 4. Workers AI 호출
    const response = await context.env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 150,
    });

    // AI 결과 텍스트에서 마크다운 기호 제거
    const cleanResponse = stripMarkdown(response.response);

    return new Response(JSON.stringify({ response: cleanResponse }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
