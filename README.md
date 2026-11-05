# AdvisorFit 0.2.4

让通用助手更有条理地找导师、分析研究匹配，并准备真实的进组邮件。目标是减少用户反复写长提示的负担，让来源、未知信息和申请目的处理更可靠；目前没有足够证据证明它普遍优于普通助手。完整、清楚的提示也可以让普通助手表现很好。

## 三个使用场景

- **没有目标导师**：背景＋学校或院系 → 检索候选并核对身份 → 解释推荐理由和未知。
- **已有一位导师**：背景＋姓名、学校、院系 → 理解研究与论文 → 分析匹配 → 设计能开始的小项目 → 按真实申请阶段写邮件。
- **已有多位导师**：使用同一标准比较，解释联系顺序；只比较时不自动写邮件或安排项目。

后续可以只改邮件，或说“每天30分钟，带我做第一步”，不必重跑完整报告。学校按输入确定，不设白名单；这不表示所有学校都已验证。

## 安装：完整插件或直接 Skill

在仓库根运行 `python scripts/package_skill.py`，生成 `outputs/advisorfit-skill-0.2.4.zip` 和同名 `.sha256`。运行 `python scripts/check_release.py` 检查版本、文件与演示说明是否同步。

**完整插件**：在支持本地插件目录或插件ZIP的宿主中选择本仓库目录或生成的ZIP，按宿主实际安装入口完成。包内有根 `plugin.json`、`.codex-plugin/plugin.json` 和完整 `skills/advisorfit/`。宿主支持情况以实际界面为准；ZIP生成不等于安装成功。开新聊天，检查能否读取核心与所需参考文件。

**直接 Skill**：把整个 `skills/advisorfit/` 复制到宿主支持的技能目录，例如项目 `.agents/skills/advisorfit/`，或宿主支持的个人技能目录。一起保留五份 `references/`、`scripts/check_links.py` 和 `evals/cases.json`；只复制 `SKILL.md` 会丢失方法细节。实际启用方式由宿主决定。

没有安装入口时，可把完整技能目录内文件作为材料提供并要求按需读取，这是手动提供说明，不等于原生插件安装。宿主负责搜索、阅读原文、理解和写作；缺联网能力时只能按已给材料分析并说明限制。

这里交付 Skill（给助手的工作说明），不包含已连接的 MCP（让助手调用项目工具的接口）服务。MCP参考只在对应工具真实可用时使用；不要求安装旧Python后端、隧道或第二套模型。

## 试一句

> 使用 AdvisorFit。我会提供简历和目标学校，请先确认影响推荐的关键问题，按可核查来源找候选；未知单列，不编招生名额。选定导师后，再帮我准备能开始的小项目和真实进组邮件。

简历未写某技能不等于不会，建议项目不等于已完成。邮件由你审阅并自行发送；研究匹配不代表录取概率。

## Sites在线演示

仓库同时含独立演示源码。[演示说明](docs/demo.md)解释如何实际加载核心与五份参考，使用 DeepSeek V4.1 Flash 处理固定虚构案例。登录后运行；每日每用户5次、全站100次。不实时联网，也不是ChatGPT原生插件。[打开在线体验](https://advisorfit-demo.l978542784.chatgpt.site)。已确认登录后可生成并扣减额度；平台配置为公开，但当前匿名请求仍收到登录页，免登录浏览尚未验收通过。

密钥 `DEEPSEEK_API_KEY` 只放在服务端环境，不提交密钥、真实简历或私人记录。登录、配额与模型服务须在发布环境验证，本地打包通过不代表线上已验证。

## 证据与参考

[公开证据摘要](docs/evidence.md)区分旧版测试、用户报告和未验证项。0.2.4结构检查不证明模型稳定遵守；18次未来模型测试尚未运行，见[评测说明](evals/README.md)。

[更新记录](CHANGELOG.md) · [安装与打包](docs/installation.md) · [推广草稿](docs/promotion.md) · [MIT许可](LICENSE)

设计参考：[Anthropic Skills](https://github.com/anthropics/skills)、[Superpowers](https://github.com/obra/superpowers)、[Agent Skills规范](https://agentskills.io/specification)。这些是参考，不代表认证或背书。发布含 AI 生成内容时参考 [B站官方公告](https://www.bilibili.com/opus/1202507670848798745)。


