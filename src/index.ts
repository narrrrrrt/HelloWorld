export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/countup") {
      const id = env.CounterDO.idFromName("global");
      const stub = env.CounterDO.get(id);
      return stub.fetch("/countup", { method: "POST" });
    }

    if (url.pathname === "/events") {
      const id = env.CounterDO.idFromName("global");
      const stub = env.CounterDO.get(id);
      return stub.fetch("/events");
    }

    if (url.pathname === "/access") {
      const id = env.CounterDO.idFromName("global");
      const stub = env.CounterDO.get(id);
      return stub.fetch("/access");
    }

    return env.ASSETS.fetch(request);
  },
};

export { CounterDO } from "./do-worker/do-worker";
