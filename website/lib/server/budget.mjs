// Conservative CNY reservation, not the provider's billing ledger.
// DeepSeek official peak prices checked 2026-11-07: input miss 2 / output 8 CNY per million tokens.
export const USER_DAILY_LIMIT = 3;
export const USER_DAILY_BUDGET_MICROS = 500000;
export const REQUEST_BUDGET_MICROS = 150000;
export const MAX_OUTPUT_TOKENS = 4096;
export function reserveCost(messages, model) {
  if (model !== 'deepseek-flash') return null; // Price unknown: fail closed, never switch the model silently.
  // UTF-8 bytes conservatively cover text tokens; include an envelope allowance.
  const inputUpper = new TextEncoder().encode(JSON.stringify(messages)).byteLength + 2048;
  const micros = inputUpper * 2 + MAX_OUTPUT_TOKENS * 8;
  return micros <= REQUEST_BUDGET_MICROS ? micros : null;
}
export function secretRedactor(secret) {
  let pending = '';
  const keep = Math.max(0, secret.length - 1);
  const clean = value => secret ? value.split(secret).join('[密钥已隐藏]') : value;
  return {
    push(value) { pending = clean(pending + value); const n = Math.max(0,pending.length - keep); const text = pending.slice(0,n); pending = pending.slice(n); return text; },
    finish() { const text = clean(pending); pending = ''; return text; },
    clean,
  };
}
