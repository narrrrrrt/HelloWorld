export class Counter {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.count = 0;
  }

  async fetch(request) {
    // 永続ストレージからカウント値を読み出し
    let stored = await this.state.storage.get("count");
    this.count = stored || 0;

    // カウントアップ
    this.count++;
    await this.state.storage.put("count", this.count);

    // 新しいカウント値を返す
    return new Response(this.count.toString());
  }
}