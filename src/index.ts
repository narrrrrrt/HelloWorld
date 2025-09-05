export class CounterDO {
  state: DurableObjectState;
  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/countup") {
      let n = (await this.state.storage.get<number>("count")) || 0;
      n++;
      await this.state.storage.put("count", n);
      return new Response(JSON.stringify({ count: n }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/getcount") {
      let n = (await this.state.storage.get<number>("count")) || 0;
      return new Response(JSON.stringify({ count: n }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/events") {
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(`data: 初期値 ${Date.now()}

`));

          const interval = setInterval(() => {
            controller.enqueue(encoder.encode(`data: ${new Date().toISOString()}

`));
          }, 1000);

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

    if (url.pathname.startsWith("/countup") || url.pathname.startsWith("/getcount")) {
      const id = env.CounterDO.idFromName("A");
      const stub = env.CounterDO.get(id);
      return stub.fetch(request);
    }

    // 静的ファイル返す
    return env.ASSETS.fetch(request);
  },
};
