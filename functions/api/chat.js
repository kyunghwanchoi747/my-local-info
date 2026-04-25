export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { messages } = await request.json();
    const userQuery = messages[messages.length - 1].content;

    // 1. 검색 인덱스 가져오기 (RAG 데이터)
    const indexUrl = new URL(request.url).origin + "/data/search-index.json";
    const indexResponse = await fetch(indexUrl);
    const searchIndex = await indexResponse.json();

    // 2. 키워드 매칭 (간이 검색 엔진 로직)
    const keywords = userQuery.split(/\s+/).filter(k => k.length > 1);
    const scoredItems = searchIndex.map(item => {
      let score = 0;
      const searchText = `${item.title} ${item.summary} ${item.content}`.toLowerCase();
      keywords.forEach(keyword => {
        if (searchText.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
      return { ...item, score };
    });

    // 상위 3개 항목 추출
    const topItems = scoredItems
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const contextData = topItems.length > 0 
      ? topItems.map(item => `- 제목: ${item.title}\n  요약: ${item.summary}`).join("\n")
      : "관련 정보 없음";

    // 3. 시스템 프롬프트 구성
    const systemPrompt = `You are an AI assistant for a Korean local information blog.
Answer ONLY in Korean. Keep answers to 2-3 sentences maximum.
Do NOT use any markdown symbols (**, *, #, -). Plain text only.
Base your answer ONLY on the following blog data. If not relevant, reply: 해당 내용은 블로그에서 확인이 어렵습니다. 다른 질문을 해주세요.

[블로그 데이터]
${contextData}`;

    // 4. Workers AI 호출
    const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery }
      ],
      max_tokens: 150
    });

    // 5. 마크다운 기호 제거 함수 (Plain Text 전용)
    const stripMarkdown = (text) => {
      if (!text) return "";
      return text
        .replace(/#+\s+/g, '') // 헤더
        .replace(/\*\*/g, '') // 굵게
        .replace(/\*/g, '')   // 기울임
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 링크
        .replace(/---/g, '')  // 구분선
        .replace(/-/g, '')    // 목록 기호
        .trim();
    };

    const finalResponse = stripMarkdown(aiResponse.response);

    return new Response(JSON.stringify({ response: finalResponse }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
