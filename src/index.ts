export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/events") {
      const stream = new ReadableStream({
        start(controller) {
          function send() {
            const now = new Date().toISOString();
            controller.enqueue(
              new TextEncoder().encode(`data: ${now}\n\n`)
            );
          }
          send();
          const interval = setInterval(send, 1000);
          controller.close = () => clearInterval(interval);
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

    return new Response("Hello from SSE-only worker!");
  },
};
