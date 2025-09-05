export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/countup") {
      const id = env.CounterDO.idFromName("global");
      const stub = env.CounterDO.get(id);
      return stub.fetch("https://do/countup", { method: "POST" });
    }

    if (url.pathname === "/events") {
      const id = env.CounterDO.idFromName("global");
      const stub = env.CounterDO.get(id);
      return stub.fetch("https://do/events");
    }

    return env.ASSETS.fetch(request);
  },
};

// Ensure DO is exported from entrypoint
export { CounterDO } from "./do-worker/do-worker";
