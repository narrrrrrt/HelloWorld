// カウンター: ページ読み込み時に /countup を叩いて表示
fetch("/countup", { method: "POST" })
  .then(res => res.json())
  .then(data => {
    document.getElementById("count").textContent = data.count;
  })
  .catch(err => {
    document.getElementById("count").textContent = "エラー: " + err.message;
  });

// SSE: /events から現在時刻を受け取って表示
const timeEl = document.getElementById("time");
const es = new EventSource("/events");
es.onmessage = (ev) => {
  const data = JSON.parse(ev.data);
  timeEl.textContent = data.time;
};
