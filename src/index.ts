export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/countup") {
      const id = env.CounterDO.idFromName("global");
      const stub = env.CounterDO.get(id);
      return stub.fetch("https://do/countup", { method: "POST" });
    }

    if (url.pathname === "/events") {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      const send = (msg: any) => writer.write(`data: ${JSON.stringify(msg)}\n\n`);

      // 初期送信
      send({ time: new Date().toISOString() });

      // 5秒ごとに時刻を送信
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

    return env.ASSETS.fetch(request);
  },
};

export { CounterDO } from "./do-worker/do-worker";
