# AdvisorFit

让一句“这位导师适不适合我”，得到有来源的研究分析、具体的匹配解释和真实的进组邮件。

**[在线体验](https://advisorfit-demo.l978542784.chatgpt.site)** · **[下载 v0.2.6](https://github.com/tianxiangliu-ds/advisorfit-skill/releases/tag/v0.2.6)** · **[安装指南](docs/installation.md)** · **[完整案例对照](https://github.com/tianxiangliu-ds/advisorfit-skill/tree/main/examples)**

## 能帮你做什么

- **找导师**：提供背景和学校／院系，整理候选、研究差异和需要确认的条件。
- **分析一位导师**：理解论文与研究问题，把你的实际经历连接到可参与的工作。
- **比较多位导师**：按同一标准比较，解释优先联系谁，以及判断的边界。

确定导师后，可继续设计低成本入门项目，或准备完整的申请进组邮件。项目不是联系导师的前提；没有完成的项目不会自动成为申请经历。

## 怎么开始

安装到支持Skill的 **ChatGPT或Codex**，提供虚构或脱敏简历，再提问：

> 这是我的简历，帮我看看这位导师适不适合我。

> 我想去这所学校，但还没有目标导师，帮我找找。

> 这几位导师我该先联系谁？

[安装与更新](docs/installation.md) · [准备材料、后续辅导和邮件示例](docs/usage.md)

## 先看效果，再决定是否安装

在线体验分为两部分：**历史回答对照**公开实际输出；**实时体验**使用固定虚构背景，让DeepSeek加载完整AdvisorFit核心及对应参考文件现场回答。实时体验需要ChatGPT登录，当前不联网检索真实导师，也不接收简历上传。

- [小红／N.l：0.2.5完整对照](examples/case-001/README.md)：未知技能处理、论文与经历连接、项目范围；保留模型标识差异及未改善项。
- [P.l：0.2.4完整对照](examples/case-002/README.md)：准备成本、匹配解释与结论表达；同时公开两组共同缺陷。

案例显示局部变化，不能证明普遍优于普通助手或提高录取率。[效果证据与限制](docs/limitations.md)

## 隐私与边界

Skill本身不提供独立数据存储服务；在ChatGPT／Codex中使用时，材料处理取决于所用平台及启用的工具。在线体验的输入会发送给DeepSeek，请仅使用虚构或脱敏内容。[隐私说明](docs/privacy.md)

来源可能过时，模型也可能出错；研究匹配不代表招生或接收意向。邮件由你核对、自行发送。

## 项目内容

`skills/advisorfit/` 是完整Skill；`examples/` 保存可复查案例；`website/` 是在线体验源码。ChatGPT／Codex的Skill包不包含网站依赖。

[版本变化](CHANGELOG.md) · [贡献与反馈](CONTRIBUTING.md) · [安全问题](SECURITY.md) · [MIT许可](LICENSE)
