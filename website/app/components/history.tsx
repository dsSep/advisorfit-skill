"use client";

import { useState } from "react";
import cases from "../../lib/historical-cases.json";
import { Report } from "./report";

const repo = "https://github.com/dsSep/advisorfit-skill";

export function History() {
  const [selected, setSelected] = useState(0);
  const active = cases[selected];
  return <section className="history-section" id="comparisons" aria-labelledby="history-title">
    <div className="section-heading"><div><p className="eyebrow">01 / 真实对照</p><h2 id="history-title">先看实际回答，自己判断。</h2></div><p>同一案例的两份完整输出，连同改善、缺陷和条件限制一起公开。这里是历史回放，不是现场生成。</p></div>
    <div className="history-switch" role="group" aria-label="选择历史案例">{cases.map((item, index) => <button key={item.id} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.title}<span>Skill {item.skillVersion}</span></button>)}</div>
    <div className="history-meta"><span>{active.date} · ChatGPT网页记录 · 虚构申请者</span><a href={`${repo}/tree/main/examples/${active.id}`} target="_blank" rel="noopener noreferrer">查看记录与匿名全文 ↗</a></div>
    <p className="history-limit"><strong>比较范围：</strong>{active.limitation} 每条件仅一次，不证明普遍优势或录取效果。</p>
    <details className="history-input"><summary>查看这次的提问与背景</summary><p>{active.prompt}</p><pre>{active.background}</pre></details>
    <div className="excerpt-grid">{active.comparisons.slice(0, 3).map(item => <article className="excerpt-card" key={item.point}><h3>{item.point}</h3><div><span className="condition-label">无Skill</span><blockquote>{item.without}</blockquote></div><div><span className="condition-label enhanced">使用AdvisorFit {active.skillVersion}</span><blockquote>{item.with}</blockquote></div><p>{"assessment" in item ? item.assessment : item.value}</p></article>)}</div>
    <div className="answer-pair" key={active.id}>{(["without-skill", "with-skill"] as const).map(condition => <details className="archived-answer" key={condition}><summary><span>{condition === "without-skill" ? "无Skill · 完整回答" : `AdvisorFit ${active.skillVersion} · 完整回答`}</span><span>展开原文</span></summary><div className="archive-body"><Report text={active[condition]} /></div></details>)}</div>
    <details className="history-summary"><summary>改善与未改善项</summary><Report text={active.summary} /></details>
    <p className="field-help">历史内容已匿名化，并保留当时版本与问题；当前实时体验使用0.2.10，不能将旧例当作新版效果证明。更多条件说明见各案例记录。</p>
  </section>;
}

export function DownloadSkill() {
  return <section className="download-section" id="download" aria-labelledby="download-title">
    <div className="section-heading"><div><p className="eyebrow">02 / 下载使用</p><h2 id="download-title">把这套方法，带到你的助手里。</h2></div><p>完整Skill包含核心说明、研究、准备和邮件参考。只安装Skill，无需部署网站或配置模型密钥。</p></div>
    <div className="download-actions"><a className="primary-link" href={`${repo}/releases/download/v0.2.10/advisorfit-skill-0.2.10.zip`}>下载完整Skill · v0.2.10 <span aria-hidden="true">↓</span></a><a href={`${repo}/blob/main/docs/installation.md`} target="_blank" rel="noopener noreferrer">安装与更新指南 ↗</a><a href={`${repo}/releases/tag/v0.2.10`} target="_blank" rel="noopener noreferrer">版本说明与校验值 ↗</a></div>
    <div className="install-grid"><article><h3>ChatGPT</h3><p>在支持自定义插件的账户中导入完整包，再在新聊天选择AdvisorFit。可用入口依账户而异；上传文件作参考不等于原生安装。</p><a href={`${repo}/blob/main/docs/installation.md#chatgpt`} target="_blank" rel="noopener noreferrer">查看ChatGPT安装步骤 ↗</a></article><article><h3>Codex</h3><p>用Skill Installer安装仓库中的技能目录，或将完整目录复制到项目的 .agents/skills/，开启新会话后调用 $advisorfit。</p><a href={`${repo}/blob/main/docs/installation.md#codex`} target="_blank" rel="noopener noreferrer">查看Codex安装步骤 ↗</a></article></div>
    <p className="field-help">分析真实导师需要宿主的搜索与文件能力。结果和邮件请自行核对；研究匹配不代表正在招生。</p>
  </section>;
}
