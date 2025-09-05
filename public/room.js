document.getElementById("btn").addEventListener("click", async () => {
  await fetch("/countup", { method: "POST" });
});
