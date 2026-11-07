import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { QuotaStore, beijingDay } from '../lib/server/quota.mjs';
import { createHandlers } from '../lib/server/handlers.mjs';

function database() {
  const sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync(new URL('../drizzle/', import.meta.url)).filter(f => f.endsWith('.sql'))) {
    sqlite.exec(readFileSync(new URL('../drizzle/' + file, import.meta.url), 'utf8'));
  }
  return { sqlite, prepare(sql) { return { bind(...args) { return {
    async first() { return sqlite.prepare(sql).get(...args) ?? null; },
    async run() { const result = sqlite.prepare(sql).run(...args); return { meta: { changes: Number(result.changes) } }; },
  }; } }; } };
}
const now = Date.UTC(2026, 10, 5, 10);
test('real distribution core and task references reach the model request intact', async () => {
  const fullSkill=JSON.parse(readFileSync(new URL('../lib/skill-data.json',import.meta.url),'utf8'));
  let payload;
  const h=createHandlers({db:database(),user:async()=>({userId:'integration'}),skill:fullSkill,cases,apiKey:'test-secret',now:()=>now,
    fetcher:async(_url,options)=>{payload=JSON.parse(options.body);return new Response('data: {"model":"test-model","choices":[{"delta":{"content":"演示正文"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',{headers:{'Content-Type':'text/event-stream'}});}});
  const output=await (await h.generate(request({question:'请分析并写邮件，带我做第一步'}))).text();
  assert.match(output,/"type":"done"/);
  assert.equal(fullSkill.version,'0.2.10');
  for(const name of ['SKILL.md','references/research.md','references/preparation.md','references/outreach.md']) {
    assert.ok(payload.messages[0].content.includes(fullSkill.files[name]),name);
  }
  assert.equal(payload.model,'deepseek-flash');
  assert.doesNotMatch(payload.messages[0].content,/mcp-contract/);
  assert.ok(payload.messages[1].content.includes('已确认背景'));
});
test('Beijing day rolls over at 16:00 UTC', () => {
  assert.equal(beijingDay(Date.UTC(2026, 10, 5, 15, 59)), '2026-11-05');
  assert.equal(beijingDay(Date.UTC(2026, 10, 5, 16)), '2026-11-06');
});
test('one in-flight per user; duplicate IDs and fourth daily request cannot charge', async () => {
  const db = database(); const q = new QuotaStore(db);
  assert.equal((await q.reserve('u', 'r1', now)).ok, true);
  assert.equal((await q.reserve('u', 'r2', now)).code, 'busy');
  await q.finish('r1', { total_tokens: 12 });
  assert.equal((await q.reserve('u', 'r1', now)).code, 'duplicate');
  for (let i = 2; i <= 3; i++) { assert.equal((await q.reserve('u', 'r'+i, now)).ok, true); await q.finish('r'+i); }
  assert.equal((await q.reserve('u', 'r4', now)).code, 'user_limit');
  assert.deepEqual(await q.status('u', now), { remaining: 0, globalRemaining: 97, busy: false });
});
test('concurrent reservations enforce global 100 with no overshoot', async () => {
  const db = database(); const q = new QuotaStore(db);
  const result = await Promise.all(Array.from({ length: 125 }, (_, i) => q.reserve('u'+i, 'r'+i, now)));
  assert.equal(result.filter(r => r.ok).length, 100);
  assert.equal((await q.status(null, now)).globalRemaining, 0);
});
test('four real SQLite writers racing for global quota admit exactly 100', async () => {
  const directory=mkdtempSync(join(tmpdir(),'advisorfit-quota-')); const file=join(directory,'quota.sqlite');
  const db=new DatabaseSync(file); db.exec('PRAGMA journal_mode = WAL');
  for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(name=>name.endsWith('.sql'))) db.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
  const barrier=new SharedArrayBuffer(4); let ready=0;
  try {
    const totals=await Promise.all(Array.from({length:4},(_,id)=>new Promise((resolve,reject)=>{
      const worker=new Worker(new URL('./server-worker.mjs',import.meta.url),{workerData:{file,barrier,id,now}});
      worker.on('error',reject);worker.on('message',value=>{ if(value==='ready') { if(++ready===4) {Atomics.store(new Int32Array(barrier),0,1);Atomics.notify(new Int32Array(barrier),0);} } else resolve(value); });
    })));
    assert.equal(totals.reduce((a,b)=>a+b,0),100);
    assert.equal(db.prepare('select count(*) as n from demo_usage').get().n,100);
  } finally { db.close(); rmSync(directory,{recursive:true,force:true}); }
});
test('expired in-flight releases lock but still counts, next Beijing day resets and seven-day rows expire', async () => {
  const db = database(); const q = new QuotaStore(db);
  await q.reserve('u', 'old', now);
  assert.equal((await q.reserve('u', 'next', now + 181000)).ok, true);
  assert.equal((await q.status('u', now + 86400000)).remaining, 3);
  await q.reserve('u', 'new', now + 8 * 86400000);
  assert.equal(db.sqlite.prepare('select count(*) as n from demo_usage').get().n, 1);
});
const cases = [{ id: 'single', title: '虚构', question: '分析导师', background: '已确认背景', evidence: [{ id:'E1', title:'证据', text:'虚构研究' }], references: ['references/research.md'] }];
const skill = { version:'0.2.3', files:{'SKILL.md':'CORE','references/research.md':'RESEARCH','references/preparation.md':'PREPARATION','references/outreach.md':'OUTREACH'} };
function setup(fetcher, user='user') {
  const db = database();
  const handlers = createHandlers({ db, user: async () => user ? { userId:user } : null, skill, cases, apiKey:'test-secret', model:'deepseek-flash', fetcher, now:() => now });
  return { ...handlers, db };
}
function request(body={}, origin='https://demo.test') { return new Request('https://demo.test/api/generate', {method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({caseId:'single',question:'分析匹配',requestId:crypto.randomUUID(),consent:true,...body})}); }
test('anonymous status is public and POST rejects before any database or provider use', async () => {
  let calls=0; const h=setup(async()=>{calls++;}, null);
  const status=await (await h.status()).json(); assert.equal(status.authenticated,false); assert.equal(status.remaining,0); assert.equal('email' in status,false);
  assert.equal((await h.generate(request())).status,401); assert.equal(calls,0);
  assert.equal(h.db.sqlite.prepare('select count(*) as n from demo_usage').get().n,0);
});
test('cross-origin, missing consent, unknown case, oversized unicode and malformed IDs do not charge', async () => {
  const h=setup(async()=>{throw new Error('must not call');});
  for(const [body,origin,status] of [[{},'https://evil.test',403],[{consent:false},undefined,400],[{caseId:'bad'},undefined,400],[{question:'字'.repeat(2001)},undefined,400],[{requestId:'bad'},undefined,400]]) assert.equal((await h.generate(request(body,origin))).status,status);
  assert.equal(h.db.sqlite.prepare('select count(*) as n from demo_usage').get().n,0);
});
test('server canonical context and actual skill feed provider, streaming usage and truncation reach user', async () => {
  let sent;
  const h=setup(async (url,init)=>{sent=JSON.parse(init.body); assert.equal(url,'https://api.deepseek.com/chat/completions'); return new Response('data: '+JSON.stringify({choices:[{delta:{content:'匹配分析'},finish_reason:null}]})+'\n\ndata: '+JSON.stringify({choices:[{delta:{},finish_reason:'length'}],usage:{total_tokens:42}})+'\n\ndata: [DONE]\n\n',{headers:{'Content-Type':'text/event-stream'}}); });
  const response=await h.generate(request({question:'准备项目第一步并写邮件',background:'伪造背景'}));
  const stream=await response.text();
  assert.match(stream,/匹配分析/); assert.match(stream,/"total_tokens":42/); assert.match(stream,/"finishReason":"length"/);
  const context=sent.messages[0].content; assert.match(context,/CORE/);assert.match(context,/RESEARCH/);assert.match(context,/PREPARATION/);assert.match(context,/OUTREACH/);
  assert.match(sent.messages[1].content,/已确认背景/);assert.doesNotMatch(sent.messages[1].content,/伪造背景/);
  assert.equal(sent.max_tokens,4096); assert.equal(sent.stream,true);
  assert.deepEqual(sent.thinking,{type:'disabled'}); assert.equal(sent.reasoning_effort,'none');
  assert.equal((await (await h.status()).json()).remaining,2);
});
test('provider failure counts once, hides body and secret, releases busy and duplicate never dispatches', async () => {
  let calls=0; const h=setup(async()=>{calls++;return new Response('sensitive test-secret',{status:500});});
  const id=crypto.randomUUID(); const output=await (await h.generate(request({requestId:id}))).text();
  assert.match(output,/provider_error/);assert.doesNotMatch(output,/sensitive|test-secret/);
  assert.equal((await h.generate(request({requestId:id}))).status,409); assert.equal(calls,1);
  const state=await (await h.status()).json();assert.equal(state.remaining,2);assert.equal(state.busy,false);
});
test('case variants of the same UUID cannot charge or dispatch twice', async()=>{
  let calls=0;const h=setup(async()=>{calls++;return new Response('',{status:500});});
  const id='a1234567-1234-4123-8123-123456789abc';
  await (await h.generate(request({requestId:id}))).text();
  const duplicate=await h.generate(request({requestId:id.toUpperCase()}));
  assert.equal(duplicate.status,409);assert.equal((await duplicate.json()).code,'duplicate');assert.equal(calls,1);
  assert.equal((await (await h.status()).json()).remaining,2);
});
test('missing configuration rejects without consuming quota', async()=>{
  const db=database();const h=createHandlers({db,user:async()=>({userId:'u'}),skill,cases,apiKey:'',now:()=>now});
  assert.equal((await h.generate(request())).status,503);
  assert.equal(db.sqlite.prepare('select count(*) as n from demo_usage').get().n,0);
});
test('chunked oversized input stops reading and never calls provider or charges', async()=>{
  let cancelled=false, reads=0, calls=0;
  const h=setup(async()=>{calls++;throw new Error('must not call');});
  const body=new ReadableStream({pull(controller){reads++;if(reads>5){controller.close();return;}controller.enqueue(new Uint8Array(10001));},cancel(){cancelled=true;}});
  const req=new Request('https://demo.test/api/generate',{method:'POST',headers:{Origin:'https://demo.test','Content-Type':'application/json'},body,duplex:'half'});
  assert.equal((await h.generate(req)).status,400);
  assert.equal(cancelled,true);assert.ok(reads<=3);assert.equal(calls,0);
  assert.equal(h.db.sqlite.prepare('select count(*) as n from demo_usage').get().n,0);
});
test('provider HTTP failures expose only fixed safe diagnostics without retry', async()=>{
  for(const [status,body,providerCode,message] of [
    [429,JSON.stringify({error:{code:'1113',message:'private test-secret'}}),'insufficient_balance','余额不足'],
    [402,'private test-secret','insufficient_balance','余额不足'],
    [401,'private test-secret','unauthorized','认证或权限'],
    [403,'private test-secret','unauthorized','认证或权限'],
    [429,'private test-secret','rate_limited','请求过于频繁'],
    [502,'private test-secret','http_error','模型服务暂时不可用'],
  ]) {
    let calls=0;const h=setup(async()=>{calls++;return new Response(body,{status});});
    const output=await (await h.generate(request())).text();
    assert.match(output,new RegExp(message));assert.match(output,new RegExp(`"providerStatus":${status}`));
    assert.match(output,new RegExp(`"providerCode":"${providerCode}"`));assert.doesNotMatch(output,/private|test-secret|1113/);
    assert.equal(calls,1);const state=await (await h.status()).json();assert.equal(state.remaining,2);assert.equal(state.busy,false);
  }
});
test('network errors, malformed SSE and partial replies produce errors and release in-flight lock', async()=>{
  for(const fetcher of [async()=>{throw new Error('private network details');},async()=>new Response('data: invalid\n\n',{headers:{'Content-Type':'text/event-stream'}}),async()=>new Response('data: {"choices":[{"delta":{"content":"片段"}}]}\n\n',{headers:{'Content-Type':'text/event-stream'}})]) {
    const h=setup(fetcher);const output=await (await h.generate(request())).text();
    assert.match(output,/"type":"error"/);assert.doesNotMatch(output,/"type":"done"|private network/);
    const state=await (await h.status()).json();assert.equal(state.remaining,2);assert.equal(state.busy,false);
  }
});



test('daily three-request limit blocks the fourth before any extra provider call',async()=>{
 let calls=0;const h=setup(async()=>{calls++;return new Response('',{status:500});});
 for(let i=0;i<3;i++)await(await h.generate(request())).text();
 const denied=await h.generate(request());assert.equal(denied.status,429);assert.equal((await denied.json()).code,'user_limit');assert.equal(calls,3);
});
test('daily money reservation blocks before dispatch and does not trust visitor budget fields',async()=>{
 const db=database();const q=new QuotaStore(db);
 assert.equal((await q.reserve('user','previous',now,150000)).ok,true);await q.finish('previous');
 db.sqlite.prepare('UPDATE demo_usage SET budget_micros = 490000').run();
 let calls=0;const h=createHandlers({db,user:async()=>({userId:'user'}),skill,cases,apiKey:'test-secret',now:()=>now,fetcher:async()=>{calls++;throw Error('must not call');}});
 // The actual account digest is different from the plain user key used above.
 const key=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('user'));
 db.sqlite.prepare('UPDATE demo_usage SET user_key = ?').run(Array.from(new Uint8Array(key),v=>v.toString(16).padStart(2,'0')).join(''));
 const denied=await h.generate(request({budget:0,model:'cheaper',max_tokens:1}));
 assert.equal(denied.status,429);assert.equal((await denied.json()).code,'user_budget');assert.equal(calls,0);
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) n FROM demo_usage').get().n,1);
});
test('a secret echoed across provider chunks is never returned to the browser',async()=>{
 let payload;const key='test-secret';
 const h=setup(async(_url,options)=>{payload=JSON.parse(options.body);return new Response('data: '+JSON.stringify({model:'prefix-'+key,choices:[{delta:{content:'before test-'},finish_reason:null}]})+'\n\ndata: '+JSON.stringify({choices:[{delta:{content:'secret after'},finish_reason:'stop'}]})+'\n\ndata: [DONE]\n\n',{headers:{'Content-Type':'text/event-stream'}});});
 const output=await(await h.generate(request())).text();assert.doesNotMatch(output,/test-secret|before test-/);assert.match(output,/已隐藏/);assert.doesNotMatch(JSON.stringify(payload),/test-secret/);
});


test('largest current fixed context leaves room for all three normal requests',async()=>{
 const {reserveCost,REQUEST_BUDGET_MICROS,USER_DAILY_BUDGET_MICROS}=await import('../lib/server/budget.mjs');
 const full=JSON.parse(readFileSync(new URL('../lib/skill-data.json',import.meta.url),'utf8'));
 const fixture=readFileSync(new URL('../lib/cases.ts',import.meta.url),'utf8');
 const upperMessages=[{role:'system',content:Object.values(full.files).join('\n')+'演示边界'.repeat(200)},{role:'user',content:fixture+'🧪'.repeat(2000)}];
 const amount=reserveCost(upperMessages,'deepseek-flash');assert.ok(amount!==null&&amount<=REQUEST_BUDGET_MICROS);assert.ok(amount*3<=USER_DAILY_BUDGET_MICROS);
 assert.equal(reserveCost(upperMessages,'unpriced-model'),null);
});
