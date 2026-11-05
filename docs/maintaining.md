# 仓库维护参考与发布标准

2026-11-05查看原仓库，并按本项目规模采用可复用做法；关注度不是质量认证，也不照抄其他仓库的许可证或宿主兼容承诺。

- [Anthropic Skills](https://github.com/anthropics/skills)：核心是完整技能目录（指令、脚本、资源）与安装/示例说明。对应本项目保留完整references与脚本，避免只复制SKILL.md。
- [Superpowers](https://github.com/obra/superpowers)：公开维护技能、文档、测试、插件适配及版本记录。对应本项目分离Skill与演示、列明兼容边界、提供更新记录和可重建ZIP；不承诺它支持的所有宿主都适配本项目。
- [Agent Skills规范](https://agentskills.io/specification)：用于检查技能目录及入口格式，不能代替实际宿主安装或效果验证。

本仓库维护：README作为入口；CHANGELOG记录版本变化；MIT许可；CONTRIBUTING和问题模板收集可复现的脱敏失败；SECURITY明确密钥/身份边界；GitHub Actions运行离线完整性、服务端测试和类型检查。发布完整ZIP、SHA256及站点源码提交对应关系。

以后每次修改先保留真实失败，再做最小修正，重跑受影响检查。正式效果测试保存完整匿名材料、评审与映射，不以演示生成次数充当实验样本。尚未通过的项目写清，不用徽章或星数暗示已证明优越。
