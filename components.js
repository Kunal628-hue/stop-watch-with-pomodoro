export function renderPager({ page, totalPages }, prevBtn, labelEl, nextBtn) {
  labelEl.textContent = `${page} / ${totalPages}`;
  prevBtn.disabled = page <= 1; nextBtn.disabled = page >= totalPages;
}

export function paginate(items, page = 1, perPage = 10) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const start = (page - 1) * perPage; const slice = items.slice(start, start + perPage);
  return { items: slice, page, totalPages };
}

export function sortBy(items, key) {
  const desc = key.startsWith('-'); const k = desc ? key.slice(1) : key;
  return items.slice().sort((a, b) => {
    const va = a[k]; const vb = b[k];
    return desc ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1);
  });
}
