const K = {
  THEME: "timers:theme",
  UNDO: "timers:undo",
};

export const local = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  remove(k) { localStorage.removeItem(k); },
  keys: K
};

// Undo manager for deletions (stores last deleted session)
let undoTimer = null;
export function scheduleUndo(deleted, onExpire) {
  local.set(K.UNDO, deleted);
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => { local.remove(K.UNDO); onExpire?.(); }, 8000);
}
export function popUndo() { const v = local.get(K.UNDO, null); local.remove(K.UNDO); return v; }
