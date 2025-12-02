const DB_NAME = "timers-db"; const STORE = "sessions"; const VER = 1;

function open() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        os.createIndex("created", "created");
        os.createIndex("mode", "mode");
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export async function addSession(session) {
  const db = await open();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).add(session);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
export async function listSessions() {
  const db = await open();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => rej(req.error);
  });
}
export async function removeSession(id) {
  const db = await open();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
export async function bulkImport(sessions) {
  const db = await open();
  const tx = db.transaction(STORE, "readwrite");
  sessions.forEach(s => tx.objectStore(STORE).add(s));
  return new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}
