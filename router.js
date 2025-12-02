const listeners = new Set();

function notify() {
  const route = location.hash.replace("#", "") || "/stopwatch";
  document.querySelectorAll("[data-link]").forEach(a => {
    const r = a.getAttribute("href").replace("#", "");
    a.setAttribute("aria-current", r === route ? "page" : "false");
  });
  listeners.forEach(fn => fn(route));
}

export function onRoute(fn) { listeners.add(fn); }

window.addEventListener("hashchange", notify);
window.addEventListener("load", notify);
