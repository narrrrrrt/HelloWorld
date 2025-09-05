export default {
  async fetch(req: Request, env: any): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/events") {
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          function push() {
            const now = new Date().toISOString();
            controller.enqueue(encoder.encode(`data: ${now}\n\n`));
          }
          push();
          const interval = setInterval(push, 1000);
          (controller as any).close = () => clearInterval(interval);
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

    // デフォルトは public/ のアセットを返す
    return env.ASSETS.fetch(req);
  },
};
