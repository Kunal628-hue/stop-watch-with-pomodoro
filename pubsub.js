export function createPubSub() {
  const subs = new Set();
  return {
    publish(v) { subs.forEach(fn => fn(v)); },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
  };
}
