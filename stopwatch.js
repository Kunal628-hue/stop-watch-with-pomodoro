import { addSession } from "../storage/db.js";
import { debounce } from "../utils/debounce.js";

let interval = null, startTs = 0, accMs = 0, lastLap = 0;
let laps = [];

function fmt(ms) {
  const m = Math.floor(ms / 60000), s = Math.floor(ms % 60000 / 1000), cs = Math.floor(ms % 1000 / 10);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}

export function mountStopwatch(root) {
  const tpl = document.getElementById("stopwatch-template");
  root.append(tpl.content.cloneNode(true));

  const timeEl = document.getElementById("sw-time");
  const lapsTbody = document.getElementById("sw-laps");
  const search = document.getElementById("lap-search");
  const prev = document.getElementById("lap-prev");
  const next = document.getElementById("lap-next");
  const pageLbl = document.getElementById("lap-page");

  let page = 1, per = 8, sortKey = "-idx", q = "";

  function render() { timeEl.textContent = fmt(accMs + (interval ? performance.now() - startTs : 0)); }
  function setTimer(on) {
    if (on && !interval) { startTs = performance.now(); interval = setInterval(render, 10); }
    if (!on && interval) { accMs += performance.now() - startTs; clearInterval(interval); interval = null; render(); }
  }
  function reset() { setTimer(false); accMs = 0; lastLap = 0; laps = []; drawLaps(); render(); }
  function lap() {
    const now = interval ? accMs + (performance.now() - startTs) : accMs;
    if (now === 0) return;
    const split = now - lastLap; lastLap = now; laps.push({ idx: laps.length + 1, split, total: now }); drawLaps();
  }

  async function saveSession() { if (accMs > 0) await addSession({ mode: "stopwatch", duration: accMs, created: Date.now() }); }

  function drawLaps() {
    const data = laps
      .filter(l => JSON.stringify(l).toLowerCase().includes(q))
      .sort((a, b) => sortKey === "-idx" ? b.idx - a.idx : a.idx - b.idx);
    const totalPages = Math.max(1, Math.ceil(data.length / per));
    page = Math.min(page, totalPages);
    const slice = data.slice((page - 1) * per, (page) * per);
    lapsTbody.innerHTML = slice.map(l => `<tr><td>${l.idx}</td><td>${fmt(l.split)}</td><td>${fmt(l.total)}</td></tr>`).join("");
    pageLbl.textContent = `${page} / ${totalPages}`; prev.disabled = page <= 1; next.disabled = page >= totalPages;
  }
  drawLaps(); render();

  document.getElementById("sw-start").addEventListener("click", () => setTimer(true));
  document.getElementById("sw-pause").addEventListener("click", () => setTimer(false));
  document.getElementById("sw-reset").addEventListener("click", () => { saveSession(); reset(); });
  document.getElementById("sw-lap").addEventListener("click", lap);

  const deb = debounce(v => { q = v.toLowerCase(); page = 1; drawLaps(); }, 250);
  search.addEventListener("input", e => deb(e.target.value));
  prev.addEventListener("click", () => { page = Math.max(1, page - 1); drawLaps(); });
  next.addEventListener("click", () => { page = page + 1; drawLaps(); });
}
