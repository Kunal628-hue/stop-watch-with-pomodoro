import { mountStopwatch } from "./timers/stopwatch.js";
import { mountPomodoro } from "./timers/pomodoro.js";
import { mountHistory } from "./ui/history.js";
import { onRoute } from "./router.js";
import { $, setAriaPressed } from "./utils/dom.js";
import { i18n, loadLocaleFromSelect } from "./i18n/index.js";
import { store } from "./core/store.js";

const main = document.getElementById("main");

// Render a route, then apply i18n for the newly injected DOM
async function render(route) {
  main.innerHTML = "";

  switch (route) {
    case "/pomodoro":
      mountPomodoro(main);
      break;
    case "/history":
      mountHistory(main);
      break;
    default:
      mountStopwatch(main);
      break;
  }

  // Apply translations to just-rendered content
  await i18n.apply(main);
  main.focus();
}

// Routing
onRoute(render);
render(location.hash.replace("#", "") || "/stopwatch");

// Theme toggle with persistence
const themeBtn = $("#themeBtn");
const THEME_KEY = "timers:theme";
(() => {
  const t = localStorage.getItem(THEME_KEY) || "light";
  document.body.classList.toggle("dark", t === "dark");
  setAriaPressed(themeBtn, t === "dark");
})();
themeBtn.addEventListener("click", () => {
  const dark = !document.body.classList.contains("dark");
  document.body.classList.toggle("dark", dark);
  setAriaPressed(themeBtn, dark);
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
});

// i18n: restore language, apply initially, and handle dropdown changes
loadLocaleFromSelect("#lang");

// Service worker (use relative path so it works on Live Server)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

// Keyboard shortcuts (Space = start; L = lap)
document.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLInputElement) return; // don't intercept typing

  if (e.code === "Space") {
    const btn = document.getElementById("sw-start") || document.getElementById("pm-start");
    if (btn) {
      btn.click();
      e.preventDefault();
    }
  }
  if (e.key.toLowerCase() === "l") {
    document.getElementById("sw-lap")?.click();
  }
});

// Example store subscription (for future features)
store.subscribe(() => { /* no-op */ });
