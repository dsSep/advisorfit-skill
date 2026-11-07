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

function InstallScreenshot({file,alt,width,height}:{file:string;alt:string;width:number;height:number}) {
  return <a className="install-screenshot" href={`/install/${file}`} target="_blank" rel="noopener noreferrer" aria-label={`${alt}，打开大图`}><img src={`/install/${file}`} alt={alt} width={width} height={height} loading="lazy" decoding="async" /></a>;
}

export function DownloadSkill() {
  const pluginZip = `${repo}/releases/download/v0.2.10/advisorfit-skill-0.2.10.zip`;
  const workbuddyZip = `${repo}/releases/download/v0.2.10/advisorfit-workbuddy-0.2.10.zip`;
  return <section className="download-section" id="download" aria-labelledby="download-title">
    <div className="section-heading"><div><p className="eyebrow">02 / 下载使用</p><h2 id="download-title">选好平台，按图安装。</h2></div><p>下载对应ZIP，直接上传，不需要解压。安装Skill即可，无需部署网站或配置另一套模型密钥。</p></div>
    <div className="install-grid">
      <article><h3>WorkBuddy</h3><p>下载技能包，上传到「技能」。</p><a className="install-download" href={workbuddyZip}>下载WorkBuddy技能包 ↓</a><p className="install-filename">advisorfit-workbuddy-0.2.10.zip</p><ol><li>打开「专家·技能·连接器」→「技能」。</li><li>「添加技能」→「上传技能」，选择刚下载的ZIP。</li><li>在「已安装」启用AdvisorFit，新建任务并选择它。</li></ol><details className="install-guide"><summary>展开WorkBuddy图示</summary><p>按红框依次操作；点击截图可放大。</p><InstallScreenshot file="workbuddy-menu.png" alt="WorkBuddy：技能页面选择添加技能、上传技能" width={1800} height={1032}/><InstallScreenshot file="workbuddy-upload.png" alt="WorkBuddy：导入技能窗口选择ZIP文件" width={1800} height={1032}/><p>不必勾选「非高风险自动安装」，按客户端提示审阅并确认。</p></details><a href={`${repo}/blob/main/docs/installation.md#workbuddy`} target="_blank" rel="noopener noreferrer">GitHub完整图示 ↗</a></article>
      <article><h3>Codex</h3><p>下载插件包，使用桌面上传入口。</p><a className="install-download" href={pluginZip}>下载Codex插件包 ↓</a><p className="install-filename">advisorfit-skill-0.2.10.zip</p><ol><li>打开「自定义」→「插件」。</li><li>「添加」→「上传插件压缩包」，选择ZIP并确认添加。</li><li>新建聊天，选择AdvisorFit，或使用 $advisorfit 调用。</li></ol><details className="install-guide"><summary>展开Codex图示</summary><p>上传整个ZIP，不用先解压；点击截图可放大。</p><InstallScreenshot file="codex-menu.png" alt="Codex：插件页添加菜单选择上传插件压缩包" width={1376} height={887}/><InstallScreenshot file="codex-upload.png" alt="Codex：点击上传、选择ZIP并添加插件" width={1376} height={887}/></details><a href={`${repo}/blob/main/docs/installation.md#codex`} target="_blank" rel="noopener noreferrer">完整图示与备用安装方式 ↗</a></article>
      <article><h3>ChatGPT</h3><p>与Codex共用插件包，安装入口依账户而异。</p><a className="install-download" href={pluginZip}>下载ChatGPT插件包 ↓</a><p className="install-filename">advisorfit-skill-0.2.10.zip</p><ol><li>在支持自定义插件的环境中导入完整ZIP。</li><li>确认安装后，新建聊天并选择AdvisorFit。</li></ol><p>普通附件上传不等于安装Skill；没有插件导入入口时，可使用WorkBuddy或Codex。</p><a href={`${repo}/blob/main/docs/installation.md#chatgpt`} target="_blank" rel="noopener noreferrer">查看ChatGPT安装说明 ↗</a></article>
    </div>
    <p className="field-help">安装后提供脱敏背景，再问「这位导师适不适合我，帮我写封申请进组的邮件」。分析真实导师需要宿主的搜索与文件能力；结果和邮件请自行核对。</p>
  </section>;
}
