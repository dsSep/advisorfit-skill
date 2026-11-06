# WorkBuddy安装与配置

AdvisorFit可在WorkBuddy中作为本地Skill导入。研究、匹配、准备和邮件参考与ChatGPT／Codex共用一套源码；适配包增加WorkBuddy元数据、宿主说明与参考文件入口，不包含网站、真实简历、密钥或账户配置。

## 下载安装

1. 从[正式发布页](https://github.com/dsSep/advisorfit-skill/releases/tag/v0.2.9)下载 **advisorfit-workbuddy-0.2.9.zip**，不要选ChatGPT／Codex的插件包。
2. 在WorkBuddy左侧进入「专家·技能·连接器」→「技能」→「添加技能」→「上传技能」，选择ZIP。具体文字以客户端版本为准。
3. 在「已安装」中找到 **AdvisorFit 导师分析与套磁** 并启用，新建任务后通过技能选择器选择它，或输入 `/` 后选择对应技能。
4. 使用宿主当前已授权的模型、搜索与文件能力。本Skill无需额外API Key，不需要配置连接器，也不自动发送邮件。

以上上传路径依据[WorkBuddy官方技能说明](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market)。本仓库发布的是可导入的本地包，不表示已经上架WorkBuddy技能市场。

## 包结构与本地项目方式

ZIP只有一个技能根目录：

```text
advisorfit/
  SKILL.md
  references/
  scripts/check_links.py
  INSTALL.md
  LICENSE
  DISTRIBUTION.json
```

不要只上传SKILL.md，也不要把整个GitHub仓库当作技能目录。解压查看时，references应与SKILL.md同级。[开放平台技能结构说明](https://open.workbuddy.cn/docs/skill)列出了元数据和子资源格式。

进行本地项目开发时，也可将解压后的advisorfit目录放入项目的 `.codebuddy/skills/advisorfit/`。[官方项目说明](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Project)确认该项目级路径。普通使用优先选择上传入口；不同客户端的全局存储目录可能不同，不要求手改账户设置。

## 用一个短请求验收

先用虚构或脱敏背景，新建任务并选择Skill：

> 这是我的简历，帮我看看这位导师适不适合我。

然后按真实目的继续：

> 根据已确认的材料，写一封申请加入课题组的邮件。

检查任务可见过程：确有 `Skill(advisorfit)` 或等效加载记录；调研时读取研究参考，写信时读取 `references/outreach.md`；生成内容有具体来源，不把未提供经验写成不会，不把建议写成已完成。界面选中或助手自称使用，都不足以证明实际加载。

无法读PDF时，可先换成去掉身份信息的纯文本简历；无法联网时提供官方主页和论文材料，并要求标明实际阅读范围。不要为了跑通任务而放开整个磁盘权限、忽略风险提示或粘贴密钥。链接检查脚本是可选的离线检查，不会证明来源真实或论文归属。

## 已有证据与限制

[真实运行的脱敏记录](https://github.com/dsSep/advisorfit-skill/tree/main/examples/case-004)显示：WorkBuddy调用了AdvisorFit，读取研究、准备和邮件参考，恢复读取PDF后完成导师比较与完整邮件。该次安装元数据为0.2.8，三份参考文本与仓库0.2.8一致；核心做了WorkBuddy宿主和参考入口适配。它不是0.2.9新ZIP的客户端导入验收，也不是无Skill对照实验。

0.2.9适配包已检查结构、资源一致性和可重复打包；仍需在使用者客户端确认该ZIP能导入、被实际调用。不能以一次运行宣称所有模型、客户端版本或学校都验证通过。

## 隐私、更新与卸载

先去掉真实姓名、电话、邮箱、学号、身份证明、业务敏感数据和项目密钥，再上传测试材料。学校与独特经历组合仍可能识别人，去标识化不等于完全匿名。分享前同时检查简历、报告、邮件、工具记录、附件名称与下载文件。

这次案例中还观察到宿主写入了本地任务记忆。不要把任务关闭等同于数据已删除；宿主记忆、项目资料与分享权限请在WorkBuddy中分别查看。本适配说明要求不主动把个人材料写入长期记忆，但不能保证覆盖宿主自动保留机制。

更新时下载对应版本包，通过客户端更新或按其提示重新导入，启用后新建任务。官方说明提醒：已载入的技能可能在旧会话中继续有效，关闭状态要在新任务中验收。无需更改现有ChatGPT／Codex安装；GitHub发布不会自动更新它们。

卸载通过「已安装」的技能管理菜单进行。不要手动删除项目资料或真实简历来代替卸载。

## 从源码构建

```text
python scripts/package_skill.py
python scripts/check_release.py
python -m unittest discover -s tests -p "*_test.py"
```

脚本同时产出ChatGPT／Codex包和WorkBuddy包及各自SHA256文件。WorkBuddy包由 `skills/advisorfit/` 与 `adapters/workbuddy/metadata.json` 生成，避免维护两份逐渐分叉的研究和邮件规则。
