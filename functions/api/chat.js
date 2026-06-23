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

    const response = await context.env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for a Korean local information blog. Answer in Korean.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 300,
    });

    return new Response(JSON.stringify({ response: response.response }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
