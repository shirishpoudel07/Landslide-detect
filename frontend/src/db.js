import { openDB } from 'idb';

const dbPromise = openDB('incident-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('incidents')) {
      db.createObjectStore('incidents', { keyPath: 'id', autoIncrement: true });
    }
  },
});

export async function saveIncidentOffline(incident) {
  const db = await dbPromise;
  await db.add('incidents', incident);
}

export async function getOfflineIncidents() {
  const db = await dbPromise;
  return await db.getAll('incidents');
}

export async function deleteIncident(id) {
  const db = await dbPromise;
  await db.delete('incidents', id);
}
