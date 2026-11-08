"use client";

import { useState, type ReactNode } from "react";
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

function InstallPlatform({title,description,children}:{title:string;description:string;children:ReactNode}) {
  return <details className="install-platform"><summary><h3>{title}</h3><span className="install-platform-description">{description}</span><span className="install-toggle" aria-hidden="true"><span className="when-closed">展开教程 ＋</span><span className="when-open">收起教程 −</span></span></summary><div className="install-content">{children}</div></details>;
}

export function DownloadSkill() {
  const pluginZip = `${repo}/releases/download/v0.2.10/advisorfit-skill-0.2.10.zip`;
  const workbuddyZip = `${repo}/releases/download/v0.2.10/advisorfit-workbuddy-0.2.10.zip`;
  return <section className="download-section" id="download" aria-labelledby="download-title">
    <div className="section-heading"><div><p className="eyebrow">02 / 下载使用</p><h2 id="download-title">选好平台，按图安装。</h2></div><p>点击所用平台展开完整教程。下载对应ZIP，直接上传，不需要解压；无需部署网站或配置另一套模型密钥。</p></div>
    <div className="install-stack">
      <InstallPlatform title="WorkBuddy" description="技能包 · 下载、上传与使用图示">
        <a className="install-download" href={workbuddyZip}>下载WorkBuddy技能包 ↓</a><p className="install-filename">advisorfit-workbuddy-0.2.10.zip · 保留ZIP，不解压</p>
        <h4>1. 打开「上传技能」</h4><p>左侧「专家·技能·连接器」→ 上方「技能」→ 右上角「添加技能」→「上传技能」。</p><InstallScreenshot file="workbuddy-menu.png" alt="WorkBuddy：技能页面选择添加技能、上传技能" width={1800} height={1032}/>
        <h4>2. 选择刚下载的ZIP</h4><p>点击「选择 ZIP 文件」，上传 advisorfit-workbuddy-0.2.10.zip，或直接拖入。按客户端提示审阅并确认；不必勾选「非高风险自动安装」。</p><InstallScreenshot file="workbuddy-upload.png" alt="WorkBuddy：导入技能窗口选择ZIP文件" width={1800} height={1032}/>
        <h4>3. 新建任务并使用</h4><p>在「已安装」启用「AdvisorFit 导师分析与套磁」，新建任务并选择它，再提供脱敏简历和导师信息。</p><p className="install-example">试着问：使用AdvisorFit，帮我分析这位导师，再写一封申请进组的邮件。</p><a href={`${repo}/blob/main/docs/installation.md#workbuddy`} target="_blank" rel="noopener noreferrer">GitHub完整图示 ↗</a>
      </InstallPlatform>
      <InstallPlatform title="Codex" description="插件包 · 桌面上传与调用图示">
        <a className="install-download" href={pluginZip}>下载Codex插件包 ↓</a><p className="install-filename">advisorfit-skill-0.2.10.zip · 保留ZIP，不解压</p>
        <h4>1. 打开「上传插件压缩包」</h4><p>左侧「自定义」→「插件」，点击右上角「添加」→「上传插件压缩包」。</p><InstallScreenshot file="codex-menu.png" alt="Codex：插件页添加菜单选择上传插件压缩包" width={1376} height={887}/>
        <h4>2. 上传并添加插件</h4><p>点击「点击上传」，选择 advisorfit-skill-0.2.10.zip，或拖入整个ZIP。读取完成后按提示确认「添加插件」。</p><InstallScreenshot file="codex-upload.png" alt="Codex：点击上传、选择ZIP并添加插件" width={1376} height={887}/>
        <h4>3. 新建聊天并调用</h4><p>确认列表中出现AdvisorFit，新建聊天并选择它；支持技能名称调用的环境中，也可使用 $advisorfit。截图中的其他插件不是安装依赖。</p><a href={`${repo}/blob/main/docs/installation.md#codex`} target="_blank" rel="noopener noreferrer">完整图示与备用安装方式 ↗</a>
      </InstallPlatform>
      <InstallPlatform title="ChatGPT" description="共用插件包 · 入口与账户说明">
        <a className="install-download" href={pluginZip}>下载ChatGPT插件包 ↓</a><p className="install-filename">advisorfit-skill-0.2.10.zip · 与Codex共用插件包</p><ol><li>在支持自定义插件的环境中导入完整ZIP。</li><li>确认安装后，新建聊天并选择AdvisorFit。</li></ol><p>普通附件上传不等于安装Skill；入口依账户而异，没有插件导入入口时，可使用WorkBuddy或Codex。</p><a href={`${repo}/blob/main/docs/installation.md#chatgpt`} target="_blank" rel="noopener noreferrer">查看ChatGPT安装说明 ↗</a>
      </InstallPlatform>
    </div>
    <p className="field-help">截图可点击放大。分析真实导师需要宿主的搜索与文件能力；结果和邮件请自行核对。</p>
  </section>;
}
