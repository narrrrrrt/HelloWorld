export class CounterDO {
  state: DurableObjectState;
  storage: DurableObjectStorage;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.storage = state.storage;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === "/countup" && request.method === "POST") {
      let count = (await this.storage.get("count")) || 0;
      count++;
      await this.storage.put("count", count);

      return new Response(JSON.stringify({ count }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }
}
