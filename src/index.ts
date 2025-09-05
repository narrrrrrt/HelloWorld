export class CounterDO2 {
  state: DurableObjectState;
  count: number;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.count = 0;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/increment") {
      this.count++;
      return new Response(JSON.stringify({ count: this.count }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/value") {
      return new Response(JSON.stringify({ count: this.count }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
}

export default {
  async fetch(req: Request, env: any): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/countup") {
      const id = env.CounterDO2.idFromName("A");
      const obj = env.CounterDO2.get(id);
      return obj.fetch(new Request("http://dummy/increment"));
    }

    if (url.pathname === "/events") {
      const stream = new ReadableStream({
        start(controller) {
          function send() {
            controller.enqueue(
              new TextEncoder().encode(`data: ${new Date().toISOString()}

`)
            );
            setTimeout(send, 1000);
          }
          send();
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    }

    if (url.pathname === "/value") {
      const id = env.CounterDO2.idFromName("A");
      const obj = env.CounterDO2.get(id);
      return obj.fetch(new Request("http://dummy/value"));
    }

    return new Response("Not found", { status: 404 });
  }
};
