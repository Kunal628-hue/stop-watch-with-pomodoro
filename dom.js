export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export function setAriaPressed(el, pressed) { el.setAttribute("aria-pressed", pressed ? "true" : "false"); }
export function el(tag, cls) { const n = document.createElement(tag); if (cls) n.className = cls; return n; }
