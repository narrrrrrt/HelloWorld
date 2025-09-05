const counterEl = document.getElementById("count");
const evtSource = new EventSource("/events");

evtSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  counterEl.textContent = data.count;
};
