const counterEl = document.getElementById("count");
const es = new EventSource("/events");
es.onmessage = (ev) => {
  const data = JSON.parse(ev.data);
  counterEl.textContent = data.count;
};
