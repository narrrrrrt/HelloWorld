export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/events") {
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();

          const interval = setInterval(() => {
            const data = `data: ${new Date().toISOString()}\n\n`;
            controller.enqueue(encoder.encode(data));
          }, 1000);

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

    return env.ASSETS.fetch(request);
  },
};
