# BLUE HOUR · 摄影企划展示站

面向客人的个人摄影展示网站：可搜索的计划卡片、每份方案的独立页面和效果预览。由 GitHub 内容文件驱动，GPT 站点自动读取已发布的内容包，不设联系方式、约拍入口、管理后台、账号系统或数据库。收藏仅保存在访客本机浏览器。

GitHub 内容仓库：<https://github.com/regaliastar/shooting-plan>

GPT 站点：<https://blue-hour-ryo-chengdu.earthybow3.chatgpt.site>

## 本版内容

首页是可搜索、可收藏的拍摄计划卡片列表。点击进入独立的可执行方案；没有个人介绍、营销流程、联系方式或管理后台。

- `/plans/ryo-industrial/`：山田凉 · 东郊记忆，日期待定，约 3 小时。设备 α7C II + 50mm F1.4 GM + iT32，吉他包替代贝斯包，以自然光及机顶补光拍摄。
- 河岸与排练室旧方案暂设 `published: false` 保留为草稿，补齐可执行内容后再发布。

详情页直接展示六张 AI 效果预览，每张仅保留画面、动作、光感短句。构图与灯位图默认折叠，支持点击效果图查看大图。已去掉真实照片参考、前期准备、相机参数、应变与收工模块；下载方案也仅包含相同的精简内容。

所有效果图使用内置 Imagegen 生成，非实拍。图片文件在 `assets/previews/`，生成提示词见 `assets/previews/PROMPTS.txt`。不加载外部照片。

## 在 GitHub 维护内容

1. 编辑 [`content/plans/`](https://github.com/regaliastar/shooting-plan/tree/main/content/plans) 下的 JSON 文件并提交。每个 JSON 是一份完整企划，构建器自动生成首页卡片及 `/plans/<slug>/index.html`。设置 `published: false` 可保存草稿而不显示。
2. 新增企划：复制现有 JSON，修改唯一 `slug`、排序 `number`、`published: true` 和全部内容，上传新图到 `assets/`，设置 `image` 为 `/assets/文件名.webp`。删除 JSON 后该企划会从新构建中移除。
3. [`content/site.json`](https://github.com/regaliastar/shooting-plan/blob/main/content/site.json) 维护品牌、简介、设备与图片声明。本站按纯展示设计，不包含联系信息字段。
4. 图片与排版分别在 `assets/`、`assets/style.css` 维护；浏览器交互位于 `assets/app.js`。

### 自动同步到 GPT 站点

提交到 `main` 后，`Build and sync photography site` 工作流会自动：

1. 安装依赖、构建所有页面与配图、运行测试和 typecheck。
2. 将完整内容打包成一个 `catalog.json`，写入自动维护的 `site-content` 分支。
3. GPT 站点在下一次访问时读取该内容包，缓存每 60 秒重新检查一次；通常在工作流成功后的 1–3 分钟内可见。GitHub、网络或缓存异常时可能更久，已经打开的页面需刷新后查看。

**日常修改、新增、删除方案、替换配图、调整文案和页面样式，都无需重新发布 GPT 站点。** 每份方案仍有 `/plans/<slug>/` 独立链接，新方案也能直接访问。只维护 `main` 的源码文件，不要手动编辑 `site-content`，该分支由工作流生成。

浏览 [GitHub Actions](https://github.com/regaliastar/shooting-plan/actions) 可查看同步结果。若 JSON 格式错误、图片缺失或校验失败，该次更新不会上线，网站继续显示上一次成功内容。修正文件并提交会自动重试。

同步使用 GitHub Actions 内置的短期 `GITHUB_TOKEN`，仅发布任务拥有仓库内容写权限，无需提供 PAT 或 GPT Sites 发布密钥。Pull Request 只校验，合入 `main` 后才更新线上内容。本方案要求仓库及生成内容分支保持公开可读。

### 缓存、回退与诊断

GPT 站点通过标准 Git 智能 HTTP 协议发现最新发布提交，再用不可变提交地址读取公开内容包，避开移动分支的 CDN 陈旧缓存；整份内容校验通过后原子替换；文字、页面和图片来自同一份构建。每个边缘节点的缓存检查间隔为 60 秒，访客无需连接 GitHub 或登录 GitHub。

GitHub 暂时不可用时，优先保留节点内存或边缘缓存中的上一次成功内容（边缘备份有效期 24 小时）；均不可用时使用最后一次 GPT 部署附带的基础内容。网络恢复后自动更新。不会把明确删除的页面从基础内容中重新补回来。

[`/__sync`](https://blue-hour-ryo-chengdu.earthybow3.chatgpt.site/__sync) 提供只读诊断：当前 `sourceCommit`、构建时间、最近检查时间和是否处于回退状态。该地址不修改状态或提供管理功能，不在客人浏览页面展示技术信息。

GPT 站点运行一个轻量 Worker 读取内容包；首次启用本机制需要更新一次 GPT 部署。之后只有修改 `worker/index.js` 的同步机制或托管配置时才需再次发布 GPT 运行时代码。仅修改 `content/`、`assets/`、页面模板并提交 `main` 即可自动同步。GitHub 仓库的可见性不会改变 GPT 站点的访问权限。

### 效果展示字段

复制 `content/plans/ryo-industrial.json` 并修改：

- `slug`、`number`、`published`：独立网址、排序与是否发布。
- `title`、`subtitle`、`summary`、`character`、`city`、`location`、`duration`、`props`、`tags`：卡片与标题信息；文案保持简短。
- `image`、`imageAlt`：首页封面；`execution.dateLabel`：日期说明。
- `coreShots`：每张含 `id`、`title`、`frame`、`preview` 和 `diagram`。
- `preview.image`：效果图路径；`preview.effect`、`preview.pose`、`preview.light`：画面、动作、光感各一句。
- `diagram`：折叠展示的构图与灯位数据，沿用现有格式。

公开方案必须包含效果图及三句短说明。准备、曝光参数、实拍参考等旧字段不再需要。下载文本由同一内容生成。

## 本地运行

```bash
npm ci
npm run build
npm run dev
```

预览 `http://127.0.0.1:4173`。内容变更后重新运行 `npm run build` 即可刷新页面。最终检查使用 `npm run typecheck`；本项目不设置 lint。源码不依赖浏览器运行时框架。预览使用与线上相同的 Worker：远端内容包可用时读取它；离线时使用本次构建快照。要单独预览未提交的本地内容，可运行 `npm run build:static` 后通过任意静态服务器查看 `dist/`。

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
- `assets/app.js`：筛选、搜索、收藏、图片查看与复制链接。
- `dist/briefs/*.txt`：自动生成的完整拍摄清单，可供客人下载。
- `.github/workflows/build.yml`：GitHub 自动校验、构建与内容发布。
- `scripts/build-worker.mjs`：复用静态构建，生成完整内容包与可部署 Worker。
- `scripts/publish-content.cjs`：通过 GitHub 内置令牌发布 `site-content/catalog.json`。
- `worker/index.js`：读取远端内容、缓存、回退、独立页面和清单路由。
- `tests/worker.test.mjs`：同步、增删页面、配图、缓存、失败回退与恢复测试。
- `.openai/hosting.json`：GPT Sites 身份，后续更新应保留，不复制为新站点身份。

方案正文仍由原静态生成器生成，不依赖客户端渲染。线上 Worker 根据最新内容包处理路径，复制独立链接后可直接访问和刷新。`BASE_PATH` 只用于另行导出的静态站点；GPT 根域名部署请保持为空。

## 核实资料

- [角色官方介绍](https://bocchi.rocks/omnibus/character/ryo.html)
- [东郊记忆背景与地址](https://www.thepaper.cn/newsDetail_forward_22928401)
- [望平街本地介绍](https://news.chengdu.cn/2024/1206/2458097.shtml?phone=yes)
- [Sony α7C II 帮助指南](https://helpguide.sony.net/ilc/2360/v1/en/index.html)
- [Sony 关于灯光频闪的说明](https://www.sony.ca/en/electronics/support/cameras-camcorders/articles/00122281)

资料核实日期：2026-10-23。开放情况、费用与拍摄许可仍需在预约前向场地方确认。
