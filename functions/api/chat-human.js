export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const { text, message, sender } = data;
    const content = text || message; // UI에서는 text, 요청에서는 message라고 언급되어 둘 다 대응

    if (!content || !sender) {
      return new Response(JSON.stringify({ error: "Missing content or sender" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const timestamp = Date.now();
    const key = `msg_${timestamp}_${Math.random().toString(36).substring(7)}`;
    
    await env.CHAT_KV.put(key, JSON.stringify({
      text: content,
      sender,
      timestamp
    }));

    return new Response(JSON.stringify({ success: true, id: key }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
