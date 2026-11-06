# 在线体验源码

页面以固定虚构案例的DeepSeek实时生成为主，提供Skill下载、安装入口和仓库历史对照链接。历史材料保存在 `../examples/`，不是预写实时答案。

## 本地运行

先在仓库根运行 `python scripts/package_skill.py` 同步完整Skill运行文件，再进入本目录：

```text
npm ci --ignore-scripts
npm run dev
```

实时生成需要Sites环境中的ChatGPT身份、D1额度存储和服务端 `DEEPSEEK_API_KEY`。本地页面可查看公开案例；未配置服务时生成会明确报错。不要把密钥写入源码或公开日志。

## 检查与构建

```text
npm test
npx tsc --noEmit
npm run build
```

网站使用Vinext／React及Sites托管。保留 `.openai/hosting.json` 的站点身份和D1绑定，通过Sites支持的源码／构建发布流程部署。现有每日限额为每个登录用户5次、全站100次；发送模型请求后计一次，失败不自动重试。

更多说明：[隐私](../docs/privacy.md)、[效果与限制](../docs/limitations.md)。
