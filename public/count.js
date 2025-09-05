// アクセスカウンター
fetch("/access")
  .then(res => res.json())
  .then(data => {
    document.getElementById("accessCount").textContent = data.count;
  });

// SSEカウンター
const sseEl = document.getElementById("sseCount");
const es = new EventSource("/events");
es.onmessage = (ev) => {
  const data = JSON.parse(ev.data);
  sseEl.textContent = data.count;
};
