export function beijingDay(now = Date.now()) { return new Date(now + 8 * 3600000).toISOString().slice(0, 10); }
export class QuotaStore {
  constructor(db) { this.db = db; }
  async status(userKey, now = Date.now()) {
    const row = await this.db.prepare(`SELECT
      (SELECT COUNT(*) FROM demo_usage WHERE day = ?) AS global_used,
      (SELECT COUNT(*) FROM demo_usage WHERE day = ? AND user_key = ?) AS user_used,
      (SELECT COUNT(*) FROM demo_usage WHERE user_key = ? AND busy_until > ?) AS active
    `).bind(beijingDay(now), beijingDay(now), userKey, userKey, now).first();
    return { remaining: userKey ? Math.max(0, 5 - row.user_used) : 0, globalRemaining: Math.max(0, 100 - row.global_used), busy: row.active > 0 };
  }
  async reserve(userKey, requestId, now = Date.now()) {
    await this.db.prepare('DELETE FROM demo_usage WHERE created_at < ?').bind(now - 7 * 86400000).run();
    // A single SQLite write statement is serialized by D1. The checks and insert
    // are indivisible, including when multiple Workers race for the last slot.
    const result = await this.db.prepare(`INSERT OR IGNORE INTO demo_usage
      (request_id, user_key, day, created_at, busy_until)
      SELECT ?, ?, ?, ?, ?
      WHERE (SELECT COUNT(*) FROM demo_usage WHERE day = ?) < 100
        AND (SELECT COUNT(*) FROM demo_usage WHERE day = ? AND user_key = ?) < 5
        AND NOT EXISTS (SELECT 1 FROM demo_usage WHERE user_key = ? AND busy_until > ?)
    `).bind(requestId, userKey, beijingDay(now), now, now + 180000, beijingDay(now), beijingDay(now), userKey, userKey, now).run();
    if (result.meta.changes === 1) return { ok: true, ...await this.status(userKey, now) };
    const duplicate = await this.db.prepare('SELECT request_id FROM demo_usage WHERE request_id = ?').bind(requestId).first();
    const state = await this.status(userKey, now);
    return { ok: false, code: duplicate ? 'duplicate' : state.busy ? 'busy' : state.remaining === 0 ? 'user_limit' : 'global_limit', ...state };
  }
  async finish(requestId, usage) {
    const token = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
    await this.db.prepare('UPDATE demo_usage SET busy_until = 0, input_tokens = ?, output_tokens = ?, total_tokens = ? WHERE request_id = ?')
      .bind(token(usage?.prompt_tokens), token(usage?.completion_tokens), token(usage?.total_tokens), requestId).run();
  }
}
