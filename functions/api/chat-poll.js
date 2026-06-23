export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const senderFilter = url.searchParams.get("sender");
    
    const listed = await context.env.CHAT_KV.list({ prefix: "msg_" });
    let messages = [];
    
    for (const key of listed.keys) {
      const valStr = await context.env.CHAT_KV.get(key.name);
      if (valStr) {
        const data = JSON.parse(valStr);
        
        // 프론트엔드의 Message 인터페이스(id, sender, text)에 맞게 매핑
        const msg = {
          id: data.id || key.name,
          sender: data.sender,
          text: data.message,
          timestamp: data.timestamp
        };
        
        if (!senderFilter || msg.sender === senderFilter) {
          messages.push(msg);
        }
      }
    }
    
    // 시간순 정렬
    messages.sort((a, b) => a.timestamp - b.timestamp);
    
    return new Response(JSON.stringify({ messages }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
