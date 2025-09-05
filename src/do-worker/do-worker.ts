export class CounterDO {
  state: DurableObjectState;
  storage: DurableObjectStorage;
  listeners: Set<WritableStreamDefaultWriter>;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.storage = state.storage;
    this.listeners = new Set();
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === "/countup" && request.method === "POST") {
      let count = (await this.storage.get("sseCount")) || 0;
      count++;
      await this.storage.put("sseCount", count);
      this.broadcast(count);
      return new Response(JSON.stringify({ count }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/events") {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      this.listeners.add(writer);

      let count = (await this.storage.get("sseCount")) || 0;
      await writer.write(`data: ${JSON.stringify({ count })}\n\n`);

      request.signal.addEventListener("abort", () => {
        this.listeners.delete(writer);
        writer.close();
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        },
      });
    }

    if (url.pathname === "/access") {
      let count = (await this.storage.get("accessCount")) || 0;
      count++;
      await this.storage.put("accessCount", count);
      return new Response(JSON.stringify({ count }), {
        headers: { "Content-Type": "application/json" },
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
