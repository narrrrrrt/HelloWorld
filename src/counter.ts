export class CounterDO {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/increment")) {
      let count = (await this.state.storage.get<number>("count")) || 0;
      count++;
      await this.state.storage.put("count", count);
      return new Response(JSON.stringify({ count }), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname.endsWith("/current")) {
      const count = (await this.state.storage.get<number>("count")) || 0;
      return new Response(JSON.stringify({ count }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("Not found", { status: 404 });
  }
}
