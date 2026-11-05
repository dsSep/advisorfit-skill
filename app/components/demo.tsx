"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, Check, ChevronDown, FileText, CodeXml, Layers3, LoaderCircle, Search, ShieldCheck, Sparkles, UserRound, RotateCcw } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import { CASES } from "../../lib/cases";
import { Report } from "./report";

const statusSchema = z.object({ authenticated: z.boolean(), configured: z.boolean(), remaining: z.number().nonnegative(), globalRemaining: z.number().nonnegative(), version: z.string(), model: z.string(), busy: z.boolean().optional() });
type Status = z.infer<typeof statusSchema>;
const errorSchema = z.object({ message: z.string().optional(), error: z.union([z.string(), z.object({ message: z.string().optional() })]).optional() });
async function readStatus(): Promise<Status> {
  const response = await fetch("/api/status", { cache: "no-store" });
  if (!response.ok) throw new Error("status_unavailable");
  return statusSchema.parse(await response.json());
}
type StreamEvent = { type: "meta" | "delta" | "done" | "error"; text?: string; message?: string; code?: string; version?: string; model?: string; references?: string[]; remaining?: number; globalRemaining?: number; finishReason?: string; usage?: { total_tokens?: number } | null };
const icons = [Search, UserRound, Layers3];

export function Demo({ authenticated, signInPath }: { authenticated: boolean; signInPath: string }) {
  const [selected, setSelected] = useState(0);
  const [question, setQuestion] = useState(CASES[0].question);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [phase, setPhase] = useState<"idle" | "connecting" | "generating" | "done" | "error">("idle");
  const [result, setResult] = useState("");
  const [usage, setUsage] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<{ version?: string; model?: string; references?: string[] }>({});
  const running = useRef(false);
  const active = CASES[selected];
  const busy = phase === "connecting" || phase === "generating";
  const signedIn = status?.authenticated ?? authenticated;
  const exhausted = status !== null && (status.remaining <= 0 || status.globalRemaining <= 0);

  useEffect(() => {
    let ignore = false;
    readStatus().then(data => { if (!ignore) setStatus(data); }).catch(() => { if (!ignore) setStatusError(true); });
    return () => { ignore = true; };
  }, []);

  function selectCase(index: number) {
    if (running.current) return;
    setSelected(index); setQuestion(CASES[index].question); setResult(""); setError(""); setPhase("idle"); setMeta({});
  }
  function reset() {
    if (running.current) return;
    setQuestion(active.question); setResult(""); setError(""); setPhase("idle"); setMeta({});
  }
  async function generate() {
    if (running.current || !consent || !question.trim() || !signedIn || !status?.configured || statusError || status.busy || exhausted) return;
    running.current = true;
    setPhase("connecting"); setUsage(null); setResult(""); setError(""); setMeta({});
    let finished = false;
    let receivedText = false;
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ caseId: active.id, question: question.trim(), requestId: crypto.randomUUID(), consent: true }) });
      if (!response.ok) {
        const parsed = errorSchema.safeParse(await response.json().catch(() => null));
        const body = parsed.success ? parsed.data : null;
        throw new Error(body?.message || (typeof body?.error === "string" ? body.error : body?.error?.message) || "暂时无法开始生成，请稍后再试。");
      }
      if (!response.body) throw new Error("没有收到生成内容，请稍后重试。");
      if (!response.headers.get("Content-Type")?.includes("text/event-stream")) throw new Error("服务没有返回有效的生成连接，请稍后重试。");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      function consume(block: string) {
        const data = block.split("\n").filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n");
        if (!data || data === "[DONE]") return;
        const event = JSON.parse(data) as StreamEvent;
        if (event.type === "meta") { setMeta({ version: event.version, model: event.model, references: event.references }); setPhase("generating"); }
        if (event.type === "delta" && event.text) { receivedText ||= !!event.text.trim(); setPhase("generating"); setResult(previous => previous + event.text); }
        if (event.type === "error") throw new Error(event.message || "生成中断，已收到的内容保留如下。");
        if (event.type === "done") {
          if (!receivedText) throw new Error("模型没有返回回答正文，本次生成未完成。");
          finished = true;
          setUsage(typeof event.usage?.total_tokens === 'number' ? event.usage.total_tokens : null);
          setPhase("done");
          if (event.finishReason === "length") setError("本次回答达到长度上限，内容可能不完整。");
          setStatus(previous => previous ? { ...previous, remaining: event.remaining ?? previous.remaining, globalRemaining: event.globalRemaining ?? previous.globalRemaining, busy: false } : null);
        }
      }
      while (true) {
        const { done, value } = await reader.read();
        buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
        buffer = buffer.replace(/\r\n/g, "\n");
        let boundary: number;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) { consume(buffer.slice(0, boundary)); buffer = buffer.slice(boundary + 2); }
        if (done) { if (buffer.trim()) consume(buffer); break; }
      }
      if (!finished) throw new Error("连接已结束，但未收到完成确认；以下内容可能不完整。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "生成失败，请稍后再试。"); setPhase("error");
    } finally {
      running.current = false;
      readStatus().then(data => { setStatus(data); setStatusError(false); }).catch(() => setStatusError(true));
    }
  }
  function download() {
    const content = `# AdvisorFit 演示 · ${active.title}\n\n> 固定虚构案例，不代表真实导师信息。\n\n## 提问\n\n${question}\n\n## 生成结果\n\n${result}\n\n---\nSkill ${meta.version || "0.2.5"} · ${meta.model || status?.model || "模型未返回"}\n`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `advisorfit-${active.id}.md`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <>
    <a className="skip-link" href="#workspace">跳到演示工作台</a>
    <header className="site-header"><Link className="brand" href="/" aria-label="AdvisorFit 首页"><span className="brand-symbol" aria-hidden="true">a<span>f</span></span><span>AdvisorFit<span className="brand-cn">择师有据</span></span></Link><nav aria-label="主导航"><span className="version">SKILL v0.2.5</span><a className="github-link" href="https://github.com/tianxiangliu-ds/advisorfit-skill" target="_blank" rel="noreferrer"><CodeXml size={17} aria-hidden="true" /><span>GitHub</span><ArrowRight size={15} aria-hidden="true" /></a></nav></header>
    <main>
      <section className="hero" aria-labelledby="hero-title"><div className="hero-main"><p className="eyebrow"><span /> AN ADVISORFIT PLAYGROUND</p><h1 id="hero-title">把一句提问，<br />变成有依据的<span className="hero-accent">下一步。</span></h1><p className="hero-description">找导师、读懂研究、准备联系。<br className="mobile-break" />让每个判断有来处，让每一步更具体。</p></div><div className="hero-aside"><div className="orbit" aria-hidden="true"><div className="orbit-center"><span>问</span><span>据</span><span>行</span></div><span className="orbit-dot" /></div><p>从「我适合谁」<br />到「我可以怎样开始」</p></div></section>
      <div className="demo-notice"><ShieldCheck size={18} aria-hidden="true" /><p><strong>这是一个透明的固定案例演示。</strong>人物、学校和研究材料均为虚构；不实时搜索网页，不提供真实招生判断。</p><span className="notice-label">FICTIONAL CASES</span></div>
      <section id="workspace" className="workspace" aria-label="AdvisorFit 演示工作台">
        <div className="input-column"><div className="section-heading"><span className="section-number">01</span><h2>从你的问题开始</h2><span className="micro-label">THE QUESTION</span></div>
          <fieldset className="case-list" disabled={busy}><legend className="sr-only">选择演示场景</legend>{CASES.map((item, i) => { const Icon = icons[i]; return <button key={item.id} className={`case-card ${selected === i ? "is-selected" : ""}`} type="button" aria-pressed={selected === i} onClick={() => selectCase(i)}><span className="case-icon"><Icon size={21} strokeWidth={1.5} aria-hidden="true" /></span><span className="case-text"><strong>{item.title}</strong><span>{item.subtitle}</span></span><span className="case-check" aria-hidden="true">{selected === i ? <Check size={14} /> : <ArrowRight size={15} />}</span></button>; })}</fieldset>
          <div className="context-card"><div className="context-heading"><span className="label">案例背景</span><span className="small-tag">只读 · 虚构材料</span></div><p>{active.background.replace("【虚构申请者】", "")}</p><details className="evidence-details"><summary><span><FileText size={15} aria-hidden="true" />查看本次使用的 {active.evidence.length} 条材料</span><ChevronDown size={16} aria-hidden="true" /></summary><div className="evidence-list">{active.evidence.map(item => <article key={item.id}><span className="evidence-id">{item.id}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></details></div>
          <div className="question-area"><div className="question-label"><label htmlFor="question">这一次，你想问什么？</label><span>{question.length} / 2000</span></div><textarea id="question" maxLength={2000} rows={6} value={question} disabled={busy} onChange={event => setQuestion(event.target.value)} aria-describedby="question-help" /><p id="question-help" className="field-help">可改写提问，背景与材料保持固定。请勿输入真实简历、电话等个人敏感信息。</p></div>
          <label className="consent"><input type="checkbox" checked={consent} disabled={busy} onChange={event => setConsent(event.target.checked)} /><span>我同意将本次提问与虚构案例材料发送给DeepSeek，用于生成演示回答。</span></label>
          {signedIn ? <button className="primary-button" disabled={busy || !consent || !question.trim() || exhausted || !status?.configured || statusError || status?.busy} onClick={generate}>{busy ? <LoaderCircle size={18} className="spinning" aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}<span>{phase === "connecting" ? "正在连接模型…" : phase === "generating" ? "正在生成回答…" : statusError ? "暂时无法读取服务状态" : !status ? "正在读取服务状态…" : !status.configured ? "演示尚未配置完成" : exhausted ? "今日演示额度已用完" : status?.busy ? "已有任务正在生成" : "生成有依据的回答"}</span>{!busy && <ArrowRight size={18} aria-hidden="true" />}</button> : <a className="primary-button" href={signInPath} target="_top"><span>使用 ChatGPT 登录后体验</span><ArrowRight size={18} aria-hidden="true" /></a>}
          {statusError && <p className="error-message" role="alert">无法读取当前服务状态，请刷新页面重试。</p>}{status?.configured === false && <p className="error-message" role="status">演示尚未配置完成，暂时无法生成。你仍可阅读下方虚构案例材料。</p>}<div className="usage-note"><span>{signedIn ? status ? `今日个人剩余 ${status.remaining} / 5 次` : statusError ? "暂时无法读取演示额度" : "正在读取演示额度" : "登录后每日 5 次免费演示"}</span><span>{status ? `全站今日剩余 ${status.globalRemaining} / 100 次` : "全站每日上限 100 次"}</span></div><p className="privacy-note">访客无需填写模型密钥，不向访客收费。生成内容供参考，联系邮件需自行审阅。</p>
        </div>
        <div className="output-column"><div className="section-heading"><span className="section-number">02</span><h2>看见依据与行动</h2><span className="micro-label">THE NEXT STEP</span></div><section className={`result-panel ${result ? "has-result" : ""}`} aria-label="生成结果" aria-busy={busy}>
          <div className="result-toolbar"><span className="report-label"><span className={`status-dot ${busy ? "active" : ""}`} />{phase === "done" ? error ? "回答已返回，内容可能不完整" : "回答已生成" : phase === "connecting" ? "正在连接服务" : phase === "generating" ? "正在生成回答" : phase === "error" ? "本次生成未完成" : "等待你的第一个问题"}</span><div className="result-actions"><button type="button" aria-label="重置提问与结果" title="重置提问与结果" disabled={busy} onClick={reset}><RotateCcw size={16} aria-hidden="true" /></button><button type="button" aria-label="下载 Markdown 回答" title="下载 Markdown 回答" disabled={!result || busy} onClick={download}><ArrowDownToLine size={17} aria-hidden="true" /></button></div></div>
          {error && <div className="error-message" role="alert">{error}</div>}
          {result ? <div className="report-content"><div className="report-eyebrow">ADVISORFIT / {active.id.toUpperCase()}</div><Report text={result} />{busy && <span className="writing-mark" aria-hidden="true" />}</div> : <div className="empty-result"><div className="empty-illustration" aria-hidden="true"><div className="paper-sheet"><span /><span /><span /><span /><i><Check size={18} /></i></div><span className="illustration-index">AF / 01</span></div><p className="empty-eyebrow">A LITTLE CLARITY, A NEXT STEP.</p><h3>{busy ? "你的问题，正在被认真整理。" : "好判断，从看清材料开始。"}</h3><p>{busy ? "正在等待模型返回内容。回答会在这里逐步出现，请保持页面打开。" : "选一个场景，读一读背景，再试着提问。这里会出现基于这些材料生成的分析。"}</p><div className="output-promises"><span><Check size={14} aria-hidden="true" />解释判断依据</span><span><Check size={14} aria-hidden="true" />保留未知信息</span><span><Check size={14} aria-hidden="true" />给出具体行动</span></div></div>}
          {phase === "done" && <p className="field-help" style={{ padding: "0 24px" }}>{usage === null ? "模型未返回用量，本次无法统计 token。" : `本次用量：${usage} token（模型计数，不等于金额）`}</p>}<div className="report-footer"><span>Skill {meta.version || "0.2.5"}</span><span>{meta.model || status?.model || "由DeepSeek 生成"}</span></div>
        </section><div className="method-note"><span className="method-line" /><p><strong>有依据，也有边界。</strong><br />研究匹配不等于正在招生；建议的项目不等于已经完成的经历。演示回答仍可能出错，请回到材料核对。</p></div>{meta.references && <details className="skill-details"><summary>查看本次加载的 Skill 参考文件</summary><ul>{meta.references.map(item => <li key={item}><code>{item}</code></li>)}</ul></details>}<div className="sr-only" role="status" aria-live="polite">{phase === "connecting" ? "正在连接模型" : phase === "generating" ? "正在生成回答" : phase === "done" ? error ? "回答可能不完整，请检查提示" : "回答已生成" : phase === "error" ? "本次生成未完成，请检查错误提示" : ""}</div></div>
      </section>
      <section className="how-it-works" aria-label="演示工作方式"><div><p className="eyebrow">SMALL DEMO. CLEAR BOUNDARIES.</p><h2>体验方法，而非虚构确定性。</h2></div><ol><li><span>01</span><p><strong>固定材料</strong>背景与虚构研究摘要公开可读。</p></li><li><span>02</span><p><strong>真实生成</strong>模型依据 Skill 0.2.5 现场回答。</p></li><li><span>03</span><p><strong>自己判断</strong>核对依据，把建议变成可执行的小步。</p></li></ol></section>
    </main><footer className="site-footer"><a className="footer-brand" href="https://github.com/tianxiangliu-ds/advisorfit-skill" target="_blank" rel="noreferrer">AdvisorFit <ArrowRight size={14} aria-hidden="true" /></a><span>择师有据，行动有路。</span><span>一个关于更好提问的开源实验。</span></footer>
  </>;
}


