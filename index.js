 // Multilingual, cached, persistent i18n
let current = "en";
let cache = new Map();          // lang -> dictionary object
let dict = {};                  // active dictionary in memory

// Save + set current language
export function setLocale(lang) {
  current = lang || "en";
  localStorage.setItem("timers:lang", current);
}

// Load a locale once and cache it
async function loadOnce(lang) {
  if (cache.has(lang)) return cache.get(lang);
  const res = await fetch(`./js/i18n/${lang}.json`);
  if (!res.ok) throw new Error(`i18n file not found: ${lang}.json`);
  const data = await res.json();
  cache.set(lang, data);
  return data;
}

// Apply translations to a subtree (defaults to whole document)
async function apply(root = document) {
  dict = await loadOnce(current);
  root.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = dict[key] ?? key;
  });
}

// Tiny helper for direct lookups (optional)
function t(key) { return dict[key] ?? key; }

export const i18n = { apply, t };

// Initialize select, restore saved language, bind change listener
export async function loadLocaleFromSelect(selector = "#lang") {
  const select = document.querySelector(selector);
  const saved = localStorage.getItem("timers:lang") || "en";
  setLocale(saved);
  if (select) select.value = saved;

  // Initial apply for first render
  await apply(document);

  if (select) {
    select.addEventListener("change", async (e) => {
      setLocale(e.target.value);
      await apply(document);    // re-render current page strings immediately
    });
  }
}
