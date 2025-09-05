fetch("/countup", { method: "POST" })
  .then(res => res.json())
  .then(data => {
    document.getElementById("count").textContent = data.count;
  });
