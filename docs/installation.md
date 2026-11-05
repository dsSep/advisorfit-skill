# 安装与打包

安装方式见 [README](../README.md)。发布包保留两个清单、整个技能目录、说明、许可证、证据摘要与评测计划，也保留离线打包检查脚本、对应测试和演示用原文数据。不包含网站依赖、简历、账户记录、密钥或模型调用服务。

在仓库根运行（仅需Python标准库）：

```text
python scripts/package_skill.py
python scripts/check_release.py
python -m unittest discover -s tests -p package_test.py
```

输出位于已忽略的 `outputs/`，不提交ZIP或运行记录。固定文件顺序、权限和时间戳确保相同输入得到相同字节。`.zip.sha256` 用于下载后校验，值随公开内容变化，以最终构建输出为准。

源码中的 `lib/skill-data.json` 供演示服务导入，结构为 `version`、`files`、`hashes`。`files`包含核心 `SKILL.md` 和五份参考的完整文本，`hashes`是对应UTF-8文本SHA256，不包含MCP执行结果或工具可用性声明。只更新演示说明可运行 `python scripts/package_skill.py --runtime-only`；源文件修改后必须重新生成，检查会拒绝过期副本。

0.2.3来源清单记录修改前原文件字节SHA256，新版字节不冒充旧版；清单不公开本地账户路径和私人会话。

技能目录中的 `scripts/check_links.py` 仅离线检查最终回答中的占位、截断链接，不验证可达、论文归属和结论。研究参考里的链接示意不当成最终报告。发布检查核对公开说明链接形状与本地目标，仍须人工确认来源实际支持结论。
