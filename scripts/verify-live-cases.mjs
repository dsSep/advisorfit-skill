// Maintainer-only functional verification. Hidden stdin; never save a key.
import { stdin, stdout } from 'node:process';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { CASES } from '../lib/cases.ts';
import { createHandlers } from '../lib/server/handlers.mjs';
const skill = JSON.parse(readFileSync(new URL('../lib/skill-data.json', import.meta.url)));
if (stdin.isTTY) stdin.setRawMode(true);
stdout.write('Ready for secret on hidden stdin.\n');
let secretInput = '';
stdin.setEncoding('utf8');
stdin.on('data', async chunk => {
  secretInput += chunk;
  if (!/[\r\n]/.test(secretInput)) return;
  stdin.pause(); if (stdin.isTTY) stdin.setRawMode(false);
  const apiKey = secretInput.trim(); secretInput = '';
  const sqlite = new DatabaseSync(':memory:');
  for (const name of readdirSync('drizzle').filter(name => name.endsWith('.sql'))) sqlite.exec(readFileSync('drizzle/' + name, 'utf8'));
  const db = { prepare(sql) { return { bind(...args) { return {
    async first() { return sqlite.prepare(sql).get(...args) ?? null; },
    async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...args).changes) } }; },
  }; } }; } };
  const output = [];
  mkdirSync('outputs/live-verification', { recursive: true });
  for (const selected of CASES) {
    const start = Date.now();
    const handlers = createHandlers({ db, user: async () => ({ userId: 'local-fictional-verification' }), skill, cases: CASES, apiKey, model: 'deepseek-flash' });
    const response = await handlers.generate(new Request('https://demo.test/api/generate', { method: 'POST', headers: { Origin: 'https://demo.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ caseId: selected.id, question: selected.question, consent: true, requestId: crypto.randomUUID() }) }));
    const raw = await response.text();
    const events = raw.split('\n\n').filter(Boolean).map(block => JSON.parse(block.slice(6)));
    const text = events.filter(e => e.type === 'delta').map(e => e.text).join('');
    const meta = events.find(e => e.type === 'meta');
    const done = events.find(e => e.type === 'done');
    const error = events.find(e => e.type === 'error');
    const record = { caseId: selected.id, startedAt: new Date(start).toISOString(), elapsedMs: Date.now() - start, status: response.status, meta, done, error, hasText: !!text.trim(), scope: 'Local real-provider functional check using production handlers and in-memory SQLite; not hosted identity/D1 verification or comparative evaluation.' };
    writeFileSync(`outputs/live-verification/${selected.id}.json`, JSON.stringify({ ...record, question: selected.question, text }, null, 2));
    stdout.write(JSON.stringify(record) + '\n'); output.push(record);
  }
  writeFileSync('outputs/live-verification/summary.json', JSON.stringify(output, null, 2));
  sqlite.close();
  process.exitCode = output.every(r => r.done && r.hasText && !r.error && r.done.finishReason !== 'length') ? 0 : 1;
  stdin.destroy();
});
