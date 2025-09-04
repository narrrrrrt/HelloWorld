import { Counter } from "./counter.js";

export default {
  async fetch(request, env) {
    // Durable Object の ID を固定（全リクエストで同じオブジェクトを使う）
    let id = env.COUNTER.idFromName("global");
    let stub = env.COUNTER.get(id);

    // カウンターをインクリメント
    let resp = await stub.fetch(request);

    // DO から返された値をテキストで返す
    let count = await resp.text();
    return new Response(`Hello World! You are visitor #${count}\n`, {
      headers: { "content-type": "text/plain" },
    });
  },
};