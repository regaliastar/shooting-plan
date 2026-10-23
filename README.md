# BLUE HOUR · 摄影企划展示站

面向客人的个人摄影展示网站：拍摄企划集、每份方案的独立页面、摄影理念与拍摄流程。纯静态内容驱动，不设联系方式、约拍入口、管理后台、账号系统或数据库。收藏与勾选仅保存在访客本机浏览器。

GitHub 内容仓库：<https://github.com/regaliastar/shooting-plan>

GPT 站点：<https://blue-hour-ryo-chengdu.earthybow3.chatgpt.site>

## 本版内容

- `/plans/ryo-industrial/`：山田凉 · 东郊工业散步（主推，约 3 小时）
- `/plans/ryo-riverside/`：山田凉 · 望平街蓝调（约 2.5 小时）
- `/plans/ryo-rehearsal/`：山田凉 · 排练室独白（约 2 小时，场地待预约）

均包含选景路线、相对日落时间表、六组分镜、Sony α7C II + 50mm F1.4 GM 参数起点、准备清单、雨天方案和建议交付目标。12 张精修为建议目标，不构成已确认报价或交付承诺。拍摄日期未指定，不编造天气和绝对日落时刻。

图片由内置 Imagegen 工具生成，仅为 AI 构图与色调参考，非摄影师实拍客片。河岸图为成都氛围示意，不能当成望平街实地点位照片。替换真实照片时须确认肖像公开展示授权，并同步修改内容和图片说明。

## 在 GitHub 维护内容

1. 编辑 [`content/plans/`](https://github.com/regaliastar/shooting-plan/tree/main/content/plans) 下的 JSON 文件并提交。每个 JSON 是一份完整企划，构建器自动生成首页卡片及 `/plans/<slug>/index.html`。
2. 新增企划：复制现有 JSON，修改唯一 `slug`、排序 `number` 和全部内容，上传新图到 `assets/`，设置 `image` 为 `/assets/文件名.webp`。删除 JSON 后该企划会从新构建中移除。
3. [`content/site.json`](https://github.com/regaliastar/shooting-plan/blob/main/content/site.json) 维护品牌、简介、设备与图片声明。本站按纯展示设计，不包含联系信息字段。
4. 图片与排版分别在 `assets/`、`assets/style.css` 维护；浏览器交互位于 `assets/app.js`。

### GitHub 自动构建

推送 `main` 或发起 Pull Request 后，仓库的 `Build photography site` 工作流会执行安装、typecheck、内容校验与静态构建。成功后可在 Actions 下载 `photography-site` 静态文件产物。

工作流只构建，不开启 GitHub Pages，也不向其他托管平台自动发布。这样保持用户指定的 GPT Sites 托管方式，无需在 GitHub 保存发布凭证。

### 更新 GPT 站点

**GitHub 提交不会自动更新已经发布的 GPT 站点。** GitHub 是用户维护内容的仓库；GPT Sites 使用独立的发布源。后续修改后，需要将 GitHub 最新内容同步到这份站点源码、重新构建并通过 Sites 发布，保留 `.openai/hosting.json` 的原有 `project_id`。

在本聊天中提供最新提交或要求“按 GitHub 最新内容更新站点”即可继续执行同步与发布。不要把用户 GitHub 凭证或 Sites 短期写入凭证提交进仓库。

当前发布访问级别以 Sites 设置为准；GitHub 仓库的可见性不会改变 GPT 站点的访问权限。

## 本地运行

```bash
npm ci
npm run build
npm run dev
```

预览 `http://127.0.0.1:4173`。内容变更后重新运行 `npm run build` 即可刷新页面。最终检查使用 `npm run typecheck`；本项目不设置 lint。源码不依赖浏览器运行时框架。

如果部署到子目录，可设置：

```bash
BASE_PATH=/shooting-plan npm run build
```

GPT Sites 根域名部署时不要设置 `BASE_PATH`。

## 文件与约定

- `content/site.json`：品牌与展示配置。
- `content/plans/*.json`：拍摄方案数据源，一个文件对应一个独立页面。
- `scripts/build.mjs`：静态生成器；验证唯一 slug、核心字段与图片存在。
- `assets/style.css`：响应式样式；系统字体降级保证外部字体不可用时仍可阅读。
- `assets/app.js`：筛选、搜索、收藏、图片查看、复制链接和本地勾选。
- `dist/briefs/*.txt`：自动生成的完整拍摄清单，可供客人下载。
- `.github/workflows/build.yml`：GitHub 自动校验与构建。
- `.openai/hosting.json`：GPT Sites 身份，后续更新应保留，不复制为新站点身份。

所有方案都是真正的静态页面，复制地址后可直接访问和刷新，无前端路由兜底需求。默认静态服务请开启目录 `index.html`。页面根路径资源可由 `BASE_PATH` 自动处理。

## 核实资料

- [角色官方介绍](https://bocchi.rocks/omnibus/character/ryo.html)
- [东郊记忆背景与地址](https://www.thepaper.cn/newsDetail_forward_22928401)
- [望平街本地介绍](https://news.chengdu.cn/2024/1206/2458097.shtml?phone=yes)
- [Sony α7C II 帮助指南](https://helpguide.sony.net/ilc/2360/v1/en/index.html)
- [Sony 关于灯光频闪的说明](https://www.sony.ca/en/electronics/support/cameras-camcorders/articles/00122281)

资料核实日期：2026-10-23。开放情况、费用与拍摄许可仍需在预约前向场地方确认。
