async function updateCounter() {
  const res = await fetch("/count");
  const data = await res.json();
  document.getElementById("count").textContent = data.count;
}
updateCounter();
