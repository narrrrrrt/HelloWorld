export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // SSE エンドポイント
    if (url.pathname === "/events") {
      const stream = new ReadableStream({
        start(controller) {
          function send() {
            const msg = `data: ${new Date().toISOString()}\n\n`;
            controller.enqueue(new TextEncoder().encode(msg));
          }
          send();
          setInterval(send, 1000);
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // 静的ファイル返却
    return new Response("Not found", { status: 404 });
  }
};
