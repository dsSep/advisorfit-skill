# AdvisorFit

导师调研与套磁 Skill：用一句普通提问，了解导师研究、解释与你经历的关系，再准备可审阅的申请进组邮件。

**[在线体验](https://advisorfit-demo.l978542784.chatgpt.site)** · **[安装图示](docs/installation.md)** · **[案例对照](examples/README.md)**

## 下载并安装

**只下载你所用平台的一份 ZIP，直接上传，不需要解压；不要下载 GitHub 的 Source code。**

| 使用平台 | 直接下载 | 上传到哪里 | 看图操作 |
|---|---|---|---|
| **WorkBuddy** | [下载技能包 · v0.2.10](https://github.com/dsSep/advisorfit-skill/releases/download/v0.2.10/advisorfit-workbuddy-0.2.10.zip) | 专家·技能·连接器 → 技能 → 添加技能 → 上传技能 | [WorkBuddy 两步图示](docs/installation.md#workbuddy) |
| **Codex 桌面** | [下载插件包 · v0.2.10](https://github.com/dsSep/advisorfit-skill/releases/download/v0.2.10/advisorfit-skill-0.2.10.zip) | 自定义 → 插件 → 添加 → 上传插件压缩包 | [Codex 两步图示](docs/installation.md#codex) |
| **ChatGPT** | [下载插件包 · v0.2.10](https://github.com/dsSep/advisorfit-skill/releases/download/v0.2.10/advisorfit-skill-0.2.10.zip) | 支持自定义插件的环境中导入，入口依账户而异 | [ChatGPT 说明](docs/installation.md#chatgpt) |

WorkBuddy 的文件名以 `advisorfit-workbuddy-` 开头；Codex／ChatGPT 以 `advisorfit-skill-` 开头。安装 AdvisorFit 无需配置网站、MCP 或另一套 API Key。

安装后**新建任务／聊天，选择 AdvisorFit**，提供虚构或脱敏背景，再提问：

> 这是我的简历，帮我看看这位导师适不适合我，再写一封申请进组的邮件。

## 能帮你做什么

- **找导师**：背景＋学校／院系，整理值得进一步了解的候选。
- **分析一位导师**：理解论文、连接实际经历，说明匹配依据和未知条件。
- **比较几位导师**：按同一标准解释联系顺序；确定目标后继续准备项目或邮件。

建议项目不会自动变成已完成经历；未提供的能力也不应直接判断为不会。邮件由你审阅、自行发送。[使用示例与后续辅导](docs/usage.md)

<details>
<summary>实际回答的改善、已知问题与完整案例</summary>

公开案例展示了更具体的经历解释、未知能力处理和更小的起步范围，也保留归类错误、推断过强及邮件过密等问题。案例已匿名化；单次及模型条件差异不支持普遍增益、统计显著性或录取效果结论。

[看完整对照](examples/README.md) · [邮件开发试用](examples/case-003/README.md) · [WorkBuddy真实运行](examples/case-004/README.md) · [方法与改进依据](docs/why-advisorfit.md) · [证据限制](docs/limitations.md)

</details>

## 隐私与边界

请勿在公开评论或 Issue 上传真实简历、联系方式或密钥。Skill的数据处理取决于宿主及启用的工具；在线演示仅用固定虚构案例，提问发送给DeepSeek，当前不接受简历上传或实时检索真实导师。[隐私说明](docs/privacy.md)

[版本变化](CHANGELOG.md) · [反馈](CONTRIBUTING.md) · [安全问题](SECURITY.md) · [MIT许可](LICENSE)

[武汉大学数据科学专业导师选择情况与个人推荐](docs/whu-data-science-advisor-selections.md)
