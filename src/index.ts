export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // カウントアップ
    if (url.pathname === "/countup") {
      const id = env.CounterDO.idFromName("global");
      const stub = env.CounterDO.get(id);
      return stub.fetch("/countup", { method: "POST" });
    }

    // SSEイベント
    if (url.pathname === "/events") {
      const id = env.CounterDO.idFromName("global");
      const stub = env.CounterDO.get(id);
      return stub.fetch("/events");
    }

    // 静的ファイル配信
    return env.ASSETS.fetch(request);
  },
};

// Durable Object を export してバインドに認識させる
export { CounterDO } from "./do-worker/do-worker";