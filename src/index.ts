export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. SSE のイベントストリーム
    if (url.pathname === "/events") {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      function send(msg: any) {
        writer.write(`data: ${JSON.stringify(msg)}\n\n`);
      }

      // 初回送信
      send({ time: new Date().toISOString() });

      const interval = setInterval(() => {
        send({ time: new Date().toISOString() });
      }, 5000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
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

    // 2. カウンターアップ → DO に投げる
    if (url.pathname === "/countup") {
      const id = env.CounterDO.idFromName("global");
      const stub = env.CounterDO.get(id);
      return stub.fetch("https://do/countup", { method: "POST" });
    }

    // 3. それ以外は静的アセットへ
    return env.ASSETS.fetch(request);
  },
};

// DO を export
export { CounterDO } from "./do-worker/do-worker";