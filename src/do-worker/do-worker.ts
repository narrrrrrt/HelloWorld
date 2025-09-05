export class CounterDO {
  state: DurableObjectState;
  storage: DurableObjectStorage;
  listeners: Set<any>;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.storage = state.storage;
    this.listeners = new Set();
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname.endsWith("/countup") && request.method === "POST") {
      let count = (await this.storage.get("count")) || 0;
      count++;
      await this.storage.put("count", count);
      this.broadcast(count);
      return new Response(JSON.stringify({ count }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname.endsWith("/events")) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      this.listeners.add(writer);

      // 初期値送信
      let count = (await this.storage.get("count")) || 0;
      writer.write(`data: ${JSON.stringify({ count })}\n\n`);

      request.signal.addEventListener("abort", () => {
        this.listeners.delete(writer);
        writer.close();
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    return new Response("Not found", { status: 404 });
  }

  broadcast(count: number) {
    const msg = `data: ${JSON.stringify({ count })}\n\n`;
    for (const writer of this.listeners) {
      writer.write(msg).catch(() => {
        this.listeners.delete(writer);
      });
    }
  }
}
