# BLUE HOUR · Coser 拍摄方案

面向客人的拍摄方案展示网站。首页搜索计划，详情页用大图展示预期画面。内容保存在 GitHub，无管理后台。

- [打开网站](https://blue-hour-ryo-chengdu.earthybow3.chatgpt.site/)
- [山田凉 · 东郊记忆](https://blue-hour-ryo-chengdu.earthybow3.chatgpt.site/plans/ryo-industrial/)
- [查看自动同步状态](https://github.com/regaliastar/shooting-plan/actions)

## 当前展示

首页提供计划卡片、关键词搜索与收藏。每份计划有独立网址，详情页包含：

- 效果大图，点击可放大。
- 每张图的画面、动作、光感，各一句短说明。
- 默认折叠的构图与灯位示意图。
- 日期、时长、道具，以及简版方案下载、链接复制。

当前公开方案为「山田凉 · 东郊记忆」：半身肖像、琴包全身、台阶坐姿、回头瞬间、日落逆光、蓝调街景。日期待定，约 3 小时，道具为吉他包。河岸、排练室旧方案保留为草稿。

效果图由 Imagegen 生成，均标注为 **AI 效果示意，非实拍**。不展示他人的真实照片，不展示前期准备、相机曝光参数、应变与收工模块。收藏仅保存在当前浏览器。

## 修改与新增方案

日常只编辑 `main` 分支。

### 修改现有方案

编辑 [`content/plans/ryo-industrial.json`](https://github.com/regaliastar/shooting-plan/blob/main/content/plans/ryo-industrial.json)，提交后等待 GitHub Actions 成功，再刷新网站。

| 内容 | 字段 / 文件 |
| --- | --- |
| 标题、副标题、卡片简介 | `title`、`subtitle`、`summary` |
| 地点、时长、道具、日期 | `location`、`duration`、`props`、`execution.dateLabel` |
| 搜索与卡片标签 | `tags`；搜索还匹配标题、副标题、地点和 `gear` |
| 首页封面 | `image`、`imageAlt`、`imageType` |
| 每张效果图及短说明 | `coreShots[].preview` |
| 折叠示意图 | `coreShots[].frame`、`coreShots[].diagram` |
| 网页标题中的站名、首页描述 | `content/site.json` 中的 `name`、`description` |

每张照片的 `preview` 格式如下：

```json
{
  "image": "/assets/previews/ryo-01.jpg",
  "effect": "冷灰墙面，蓝发和眼神成为画面重点。",
  "pose": "侧身扶包带，脸轻转向镜头。",
  "light": "柔和侧光，脸亮、背景稍暗。"
}
```

### 新增、隐藏与删除

1. 复制当前的 `ryo-industrial.json`，不要直接使用旧草稿作为模板。
2. 修改唯一的 `slug`，例如 `new-plan`；独立网址为 `/plans/new-plan/`。
3. 用字符串 `number` 排序，例如 `"01"`、`"02"`；设置 `published: true`。
4. 修改标题、封面、短说明，以及 `coreShots` 中的照片和示意图数据。镜头 `id` 沿用 `"01"`、`"02"` 这样的格式。
5. 上传所需图片并提交。

设置 `published: false` 会同时隐藏卡片和详情页。删除 JSON 文件也会移除该方案；不再使用的图片可一并删除。旧草稿需补齐当前的 `preview` 和 `diagram` 数据后才能发布。

### 图片与排版

- 图片放在 `assets/previews/`，JSON 中使用以 `/assets/` 开头的路径。支持 JPG、PNG、WebP 等格式；建议保持竖幅 4:5。
- 首页封面 `image` 与每张效果图 `preview.image` 分别维护，替换时注意两处引用。
- 当前 AI 图片的生成提示词保存在 `assets/previews/PROMPTS.txt`，替换图片后同步更新记录。
- 保持短文案：客户先看效果图，再看动作与光感。
- 页面结构、底部拍摄顺序等固定文案，以及示意图绘制逻辑在 `scripts/build.mjs`；新增不同场景时一并核对。
- 排版在 `assets/style.css`，交互在 `assets/app.js`。

## 自动同步到 GPT 站点

提交到 `main` 后，[Build and sync photography site](https://github.com/regaliastar/shooting-plan/actions) 工作流自动执行：

1. 安装依赖、构建页面与图片，运行测试及 typecheck。
2. 生成完整的 `catalog.json` 内容包，发布到 `site-content` 分支。
3. GPT 站点在访问时检查新内容，每个边缘节点的检查间隔为 60 秒。

工作流成功后通常 1–3 分钟可见，已打开的页面需要刷新。网络或缓存异常时可能更久。

**修改、新增、删除方案，以及替换图片、调整文案和样式，无需手动重新发布 GPT 站点。** `site-content` 由工作流维护，不要手动编辑。Pull Request 只校验，合入 `main` 后才更新线上内容。

JSON 错误、图片缺失或校验失败时，该次更新不会上线；修正后重新提交即可。内容包包含所有页面与图片，当前限制为 12 MiB，图片应适当压缩。

仓库和 `site-content` 分支须保持公开可读。同步使用 GitHub Actions 内置 `GITHUB_TOKEN`，无需配置 PAT 或 GPT Sites 发布密钥。

<details>
<summary>同步机制与故障排查</summary>

站点通过 Git 智能 HTTP 协议发现 `site-content` 最新提交，再从不可变提交地址读取内容包。整包校验成功后更新，保证页面与图片属于同一次构建。

GitHub 暂时不可用时，优先显示上一次成功内容；边缘备份有效期为 24 小时。没有可用缓存时使用最后一次 GPT 部署附带的基础内容，网络恢复后自动更新。

排查顺序：

1. 查看 GitHub Actions 是否成功。
2. 查看 [`/__sync`](https://blue-hour-ryo-chengdu.earthybow3.chatgpt.site/__sync) 中的 `sourceCommit` 是否对应本次源码提交，`degraded` 是否为 `false`。
3. 等待缓存检查后刷新页面。

`/__sync` 是只读诊断接口，不提供管理功能。修改 `worker/index.js` 的同步机制或托管配置时，需要重新构建并发布 GPT Sites 运行时代码；普通内容更新走上述自动同步流程。

</details>

## 本地开发

需要 Node.js 20 或兼容版本；CI 使用 Node.js 20。

先安装依赖：

```bash
npm ci
```

### 预览未提交的本地内容

```bash
npm run build:static
python3 -m http.server 4174 --bind 127.0.0.1 --directory dist
```

打开 `http://127.0.0.1:4174/`。每次修改后重新运行 `npm run build:static`，再刷新浏览器。此方式需要 Python 3，也可换成其他静态服务器。

### 验证线上 Worker 行为

```bash
npm run build
npm run dev
```

打开 `http://127.0.0.1:4173/`。此预览与线上一样，优先读取 GitHub 已发布内容；远端不可用时使用本地构建快照，因此不能用它确认尚未提交的页面改动。

最终检查：

```bash
npm run build
npm test
npm run typecheck
```

项目不设置 lint。`npm run build` 最终生成 Worker 部署包，静态页面会打包进内容包；需要直接查看静态 `dist/` 时重新运行 `npm run build:static`。

另行导出到子目录时，可使用 `BASE_PATH=/shooting-plan npm run build:static`；GPT Sites 根域名部署保持 `BASE_PATH` 为空。

## 项目结构

| 路径 | 用途 |
| --- | --- |
| `content/plans/*.json` | 一份文件对应一份计划 |
| `content/site.json` | 站点元信息 |
| `assets/previews/` | AI 效果图与提示词 |
| `scripts/build.mjs` | 生成首页、详情页、简版下载文本及 404 页 |
| `assets/style.css`、`assets/app.js` | 页面样式和浏览器交互 |
| `scripts/build-worker.mjs` | 生成内容包与 Worker 部署文件 |
| `scripts/publish-content.cjs` | 发布内容到 `site-content` |
| `.github/workflows/build.yml` | 自动构建、检查和内容同步 |
| `worker/index.js` | 内容读取、缓存、回退与路由 |
| `tests/worker.test.mjs` | 自动同步与失败恢复测试 |
| `.openai/hosting.json` | 现有 GPT Sites 身份与托管配置，更新时保留 |

构建生成的 `dist/`、`.sites-runtime/` 无需手动维护或提交。
