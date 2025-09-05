export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/count") {
      const id = env.CounterDO.idFromName("global");
      const stub = env.CounterDO.get(id);
      return stub.fetch("https://do/count");
    }

    return env.ASSETS.fetch(request);
  },
};

// Durable Object を export
export { CounterDO } from "./do-worker/do-worker";
