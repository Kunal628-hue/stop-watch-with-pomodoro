import { createPubSub } from "./pubsub.js";

const bus = createPubSub();
const state = { sessions: [] }; // shared cache (client-side caching)

export const store = {
  getState() { return structuredClone(state); },
  set(updater) {
    const next = updater(state);
    Object.assign(state, next);
    bus.publish(store.getState());
  },
  subscribe: bus.subscribe
};
