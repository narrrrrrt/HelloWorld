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

    // カウントアップ処理
    if (url.pathname.endsWith("/countup") && request.method === "POST") {
      let count = (await this.storage.get("count")) || 0;
      count++;
      await this.storage.put("count", count);
      this.broadcast(count);
      return new Response(JSON.stringify({ count }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // SSE (イベントストリーム)
    if (url.pathname.endsWith("/events")) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      this.listeners.add(writer);

      // 初期値を必ず送る
      let count = (await this.storage.get("count")) || 0;
      await writer.write(`data: ${JSON.stringify({ count })}\n\n`);

      // 切断時にクリーンアップ
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
