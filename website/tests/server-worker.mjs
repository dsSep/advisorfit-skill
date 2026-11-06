import { parentPort, workerData } from 'node:worker_threads';
import { DatabaseSync } from 'node:sqlite';
import { QuotaStore } from '../lib/server/quota.mjs';
const db = new DatabaseSync(workerData.file);
db.exec('PRAGMA busy_timeout = 10000');
const adapter = { prepare(sql) { return { bind(...args) { return {
  async first() { return db.prepare(sql).get(...args) ?? null; },
  async run() { return { meta: { changes: Number(db.prepare(sql).run(...args).changes) } }; },
}; } }; } };
parentPort.postMessage('ready');
Atomics.wait(new Int32Array(workerData.barrier), 0, 0);
const quota = new QuotaStore(adapter); let accepted = 0;
for (let i = 0; i < 40; i++) {
  const id = `${workerData.id}-${i}`;
  if ((await quota.reserve(id, id, workerData.now)).ok) accepted++;
}
db.close(); parentPort.postMessage(accepted);
