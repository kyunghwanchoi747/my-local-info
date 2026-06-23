export async function onRequestPost(context) {
  try {
    const { message, sender, id } = await context.request.json();
    const timestamp = Date.now();
    const key = "msg_" + timestamp;
    
    // id를 함께 저장해야 프론트엔드에서 중복 메시지(낙관적 업데이트)를 방지할 수 있습니다.
    const value = JSON.stringify({ id, message, sender, timestamp });
    
    await context.env.CHAT_KV.put(key, value);
    
    return new Response(JSON.stringify({ success: true, key }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
