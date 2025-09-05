import { CounterDO } from "./counter";

let clients = new Set<WritableStreamDefaultWriter>();

export default {
  async fetch(req: Request, env: any): Promise<Response> {
    const url = new URL(req.url);

    // カウントアップ要求
    if (url.pathname === "/countup" && req.method === "POST") {
      const id = env.CounterDO.idFromName("global");
      const stub = env.CounterDO.get(id);
      const res = await stub.fetch("http://do/increment");
      const { count } = await res.json();

      // 全クライアントに push
      const msg = JSON.stringify({
        timestamp: new Date().toISOString(),
        count,
      });
      const encoder = new TextEncoder();
      for (const w of clients) {
        w.write(encoder.encode(`data: ${msg}\n\n`));
      }

      return new Response(JSON.stringify({ count }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // SSE 接続
    if (url.pathname === "/events") {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      clients.add(writer);

      // 接続直後に初期値を返す
      (async () => {
        const id = env.CounterDO.idFromName("global");
        const stub = env.CounterDO.get(id);
        const res = await stub.fetch("http://do/current");
        const { count } = await res.json();

        const msg = JSON.stringify({
          timestamp: new Date().toISOString(),
          count,
        });
        const encoder = new TextEncoder();
        writer.write(encoder.encode(`data: ${msg}\n\n`));
      })();

      // 接続終了時にクリーンアップ
      req.signal.addEventListener("abort", () => {
        clients.delete(writer);
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

    return env.ASSETS.fetch(req);
  },
};


export { CounterDO } from "./CounterDO.ts";