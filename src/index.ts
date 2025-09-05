export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/events") {
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();

          // 最初のイベント
          controller.enqueue(encoder.encode(`data: 初期メッセージ\n\n`));

          // 5秒ごとに現在時刻を送信
          const interval = setInterval(() => {
            controller.enqueue(
              encoder.encode(`data: ${new Date().toISOString()}\n\n`)
            );
          }, 5000);

          controller.closed.then(() => clearInterval(interval));
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // 通常のリクエストはテスト用ページを返す
    return new Response(
      `<!DOCTYPE html>
<html>
  <body>
    <h1>SSE Test</h1>
    <div id="log"></div>
    <script>
      const es = new EventSource("/events");
      es.onmessage = (e) => {
        const div = document.getElementById("log");
        div.innerHTML += "<p>" + e.data + "</p>";
      };
    </script>
  </body>
</html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  },
};
