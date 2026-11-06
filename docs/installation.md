# 安装与更新

AdvisorFit面向ChatGPT和Codex。完整技能包含核心说明、按任务读取的研究／准备／邮件参考，以及链接检查脚本；请保留整个目录。

## ChatGPT

下载[最新发布包](https://github.com/dsSep/advisorfit-skill/releases/latest)。在支持自定义插件的ChatGPT环境中，使用Plugin Creator导入完整包或仓库，创建只包含Skill的插件，再在新聊天中选择AdvisorFit。具体可用入口和权限以账户界面为准；普通文件上传不等于安装原生Skill。

若账户没有插件安装入口，可把完整Skill文件作为聊天参考，并明确要求按任务读取。此时属于手动提供工作说明，不应称为原生插件安装。

## Codex

可通过Codex的Skill Installer提供下列目录链接：

```text
https://github.com/dsSep/advisorfit-skill/tree/main/skills/advisorfit
```

也可把整个 `skills/advisorfit/` 目录复制到项目的 `.agents/skills/advisorfit/`，或个人的 `~/.agents/skills/advisorfit/`。在新会话中检查AdvisorFit是否可用，并明确调用 `$advisorfit`。

需要以插件分发时，仓库及发布包保留 `plugin.json` 和 `.codex-plugin/plugin.json`。仅使用Skill目录时无需安装网站依赖。

## 检查是否生效

用虚构背景提问：“使用AdvisorFit，分析这位导师适不适合我。”检查助手能否读取核心及相关参考，能否给出有来源的匹配解释。脚本运行、文件复制或界面选中本身都不能证明回答质量。

## 更新

下载新的完整发布包，按原安装方式更新并开启新聊天。GitHub版本更新不会自动更新已安装的账户插件。历史案例始终保留测试时的版本号。

## 从源码打包

在仓库根运行：

```text
python scripts/package_skill.py
python scripts/check_release.py
python -m unittest discover -s tests -p "*_test.py"
```

输出为 `outputs/advisorfit-skill-0.2.7.zip` 及SHA256校验文件。网站构建和部署见[网站说明](https://github.com/dsSep/advisorfit-skill/tree/main/website)。

格式参考：[OpenAI插件打包](https://developers.openai.com/plugins/build/plugins)、[Codex Skills](https://developers.openai.com/codex/skills)。平台能力可能变化，请以官方说明及实际入口为准。
