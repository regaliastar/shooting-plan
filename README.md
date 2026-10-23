# BLUE HOUR · 摄影企划展示站

面向客人的个人摄影展示网站：拍摄企划集、每份方案的独立页面、摄影理念、拍摄流程与约拍沟通清单。纯静态内容驱动，无管理后台、账号系统、数据库或真实表单提交。收藏与勾选仅在访客本机浏览器保存。

## 本版内容

- `/plans/ryo-industrial/`：山田凉 · 东郊工业散步（主推，约 3 小时）
- `/plans/ryo-riverside/`：山田凉 · 望平街蓝调（约 2.5 小时）
- `/plans/ryo-rehearsal/`：山田凉 · 排练室独白（约 2 小时，场地待预约）

均包含选景路线、相对日落时间表、六组分镜、Sony α7C II + 50mm F1.4 GM 参数起点、准备清单、雨天方案和建议交付目标。12 张精修为建议目标，不构成已确认报价或交付承诺。拍摄日期未指定，不编造天气和绝对日落时刻。

图片由内置 Imagegen 工具生成，仅为 AI 构图与色调参考，非摄影师实拍客片。河岸图为成都氛围示意，不能当成望平街实地点位照片。替换真实照片时须确认肖像公开展示授权，并同步修改内容和图片说明。

## GitHub 维护内容

本版已提供 GitHub 可用的源码与工作流，尚未关联用户 GitHub 仓库。GPT Sites 的源码仓库由 Sites 提供，不是用户 GitHub 仓库；两个部署源不会自动同步。

1. 上传本目录内容到自己的 GitHub 仓库（包括隐藏的 `.github/`，不上传 `node_modules/`、`dist/`、`.git/`）。如果仅用 GitHub Pages，可省略 `.openai/hosting.json`。
2. 日常在 GitHub 网页直接编辑 `content/plans/<slug>.json`，提交即可。每个 JSON 是一份完整企划，构建器自动生成首页卡片及 `/plans/<slug>/index.html`。
3. 新增企划：复制现有 JSON，修改唯一 `slug`、排序 `number` 和全部内容，上传新图到 `assets/`，设置 `image` 为 `/assets/文件名.webp`。删除 JSON 后该企划会从新构建中移除。
4. `content/site.json` 维护品牌、简介、联系方式。`name` 为站点名称；`contact.label`、`contact.value` 填展示信息；`contact.url` 可选 HTTPS 联系页面或 `mailto:` 地址。留空时显示沟通清单，不伪造可用联系方式。
5. 修改后构建并重新发布。GitHub Pages 可自动部署；GPT Sites 的现有发布不会因修改 GitHub 自动更新，需要从 GitHub 拉取最新内容后在 Sites 重新发布。

### GitHub Pages 自动部署

仓库 Settings → Pages → Source 选择 **GitHub Actions**，默认分支使用 `main`，随后运行仓库内 `Build and publish photography site` 工作流。工作流执行安装、typecheck、内容校验与静态构建，再发布 `dist/`。支持 `用户名.github.io/仓库名/` 子路径，也支持根域名。

如果想以 GitHub 为唯一内容源、同时保留 GPT Sites 域名，需要接入具体 GitHub 仓库并选择后续发布方式。本版没有放置长期访问令牌或虚构自动同步服务。

## 本地运行

```bash
npm ci
npm run build
npm run dev
```

预览 `http://127.0.0.1:4173`。内容变更后重新运行 `npm run build` 即可刷新页面。最终检查使用 `npm run typecheck`；本项目不设置 lint。源码不依赖浏览器运行时框架。

项目网站部署到子目录时：

```bash
BASE_PATH=/your-repository npm run build
```

GPT Sites 根域名部署时不要设置 `BASE_PATH`。

## 文件与约定

- `content/site.json`：品牌与联系配置。
- `content/plans/*.json`：唯一拍摄方案数据源。
- `scripts/build.mjs`：静态生成器；验证唯一 slug、核心字段与图片存在。
- `assets/style.css`：响应式样式；系统字体降级保证外部字体不可用时仍可阅读。
- `assets/app.js`：筛选、搜索、收藏、弹窗、复制和本地勾选。
- `dist/briefs/*.txt`：自动生成的完整拍摄清单，可供客人下载。
- `.github/workflows/pages.yml`：GitHub Pages 自动构建与部署。
- `.openai/hosting.json`：本次 GPT Sites 身份，后续更新应保留，不复制为新站点身份。

所有方案都是真正的静态页面，复制地址后可直接访问和刷新，无前端路由兜底需求。默认静态服务请开启目录 `index.html`。页面全部相对根路径资源可由 `BASE_PATH` 自动处理。

## 核实资料

- [角色官方介绍](https://bocchi.rocks/omnibus/character/ryo.html)
- [东郊记忆背景与地址](https://www.thepaper.cn/newsDetail_forward_22928401)
- [望平街本地介绍](https://news.chengdu.cn/2024/1206/2458097.shtml?phone=yes)
- [Sony α7C II 帮助指南](https://helpguide.sony.net/ilc/2360/v1/en/index.html)
- [Sony 关于灯光频闪的说明](https://www.sony.ca/en/electronics/support/cameras-camcorders/articles/00122281)

资料核实日期：2026-10-23。开放情况、费用与拍摄许可仍需在预约前向场地方确认。
