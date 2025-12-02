import { listSessions, addSession, removeSession, bulkImport } from "../storage/db.js";
import { debounce } from "../utils/debounce.js";
import { paginate, sortBy, renderPager } from "./components.js";
import { scheduleUndo, popUndo } from "../storage/local.js";

export async function mountHistory(root) {
  const tpl = document.getElementById("history-template");
  root.append(tpl.content.cloneNode(true));

  const list = document.getElementById("hs-list");
  const search = document.getElementById("hs-search");
  const sortSel = document.getElementById("hs-sort");
  const prev = document.getElementById("hs-prev");
  const next = document.getElementById("hs-next");
  const pageLbl = document.getElementById("hs-page");
  const exportBtn = document.getElementById("hs-export");
  const importInp = document.getElementById("hs-import");

  let raw = await listSessions();
  let page = 1; const per = 8; let sortKey = "-created"; let q = "";

  function apply() {
    let data = raw.filter(s => JSON.stringify(s).toLowerCase().includes(q));
    data = sortBy(data, sortKey);
    const { items, totalPages } = paginate(data, page, per);
    list.innerHTML = "";
    items.forEach(s => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${s.mode}</strong> · ${Math.round(s.duration/1000)}s <small>${new Date(s.created).toLocaleString()}</small>`;
      const del = document.createElement("button"); del.className = "btn"; del.textContent = "Delete";
      del.addEventListener("click", async () => {
        await removeSession(s.id);
        scheduleUndo(s, async () => { /* expired */ });
        raw = raw.filter(x => x.id !== s.id); apply();
        // simple undo snackbar
        const u = document.createElement("div"); u.className = "card"; u.textContent = "Deleted. Undo?";
        const b = document.createElement("button"); b.className = "btn"; b.textContent = "Undo";
        b.onclick = async () => { const rec = popUndo(); if (rec) { await addSession(rec); raw = [rec, ...raw]; apply(); u.remove(); } };
        u.appendChild(b); root.appendChild(u);
        setTimeout(() => u.remove(), 5000);
      });
      li.appendChild(del); list.appendChild(li);
    });
    renderPager({ page, totalPages }, prev, pageLbl, next);
  }

  const deb = debounce((v) => { q = v.trim().toLowerCase(); page = 1; apply(); }, 250);
  search.addEventListener("input", e => deb(e.target.value));
  sortSel.addEventListener("change", e => { sortKey = e.target.value; page = 1; apply(); });
  prev.addEventListener("click", () => { page = Math.max(1, page - 1); apply(); });
  next.addEventListener("click", () => { page = page + 1; apply(); });

  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(raw, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "timers-history.json"; a.click(); URL.revokeObjectURL(url);
  });
  importInp.addEventListener("change", async (e) => {
    const file = e.target.files[0]; if (!file) return; const text = await file.text();
    const data = JSON.parse(text); await bulkImport(data); raw = await listSessions(); apply();
  });

  apply();
}
