export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { messages } = await request.json();

    // Workers AI 호출
    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are an AI assistant for a Korean local information blog. Answer in Korean." },
        ...messages
      ],
      max_tokens: 300
    });

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
