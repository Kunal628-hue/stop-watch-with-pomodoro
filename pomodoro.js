import { addSession } from "../storage/db.js";

let interval = null, mode = "work", totalMs = 25 * 60000, remainingMs = totalMs;

function fmt(ms) {
  const m = Math.floor(ms / 60000), s = Math.floor(ms % 60000 / 1000);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export function mountPomodoro(root) {
  const tpl = document.getElementById("pomodoro-template"); root.append(tpl.content.cloneNode(true));
  const work = document.getElementById("pm-work");
  const brk = document.getElementById("pm-break");
  const timeEl = document.getElementById("pm-time");
  const bar = document.getElementById("pm-progress");
  const beep = document.getElementById("beep");

  function setMode(m) {
    mode = m;
    const mins = m === "work" ? Number(work.value || 25) : Number(brk.value || 5);
    totalMs = mins * 60000;
    remainingMs = totalMs;
    draw();
  }
  function draw() {
    timeEl.textContent = fmt(remainingMs);
    bar.style.width = `${(totalMs - remainingMs) / totalMs * 100}%`;
  }

  function tick() {
    remainingMs -= 1000;
    if (remainingMs <= 0) {
      // beep + save + switch
      try { beep.currentTime = 0; beep.play(); } catch {}
      clearInterval(interval); interval = null;
      addSession({ mode, duration: totalMs, created: Date.now() });
      setMode(mode === "work" ? "break" : "work");
      start();
      return;
    }
    draw();
  }
  function start() { if (interval) return; interval = setInterval(tick, 1000); }
  function pause() { clearInterval(interval); interval = null; }
  function reset() { pause(); setMode(mode); }

  setMode("work");
  document.getElementById("pm-start").addEventListener("click", start);
  document.getElementById("pm-pause").addEventListener("click", pause);
  document.getElementById("pm-reset").addEventListener("click", reset);
  work.addEventListener("change", () => { if (!interval) setMode("work"); });
  brk.addEventListener("change", () => { if (!interval) setMode("break"); });
}
