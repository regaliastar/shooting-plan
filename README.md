# BLUE HOUR · Coser 拍摄方案

面向客人的拍摄方案展示网站。首页搜索计划，详情页按日系写真集的章节展示预期画面。内容保存在 GitHub，由 GitHub Actions 自动构建并发布到 GitHub Pages，无管理后台。

- [打开网站](https://regaliastar.github.io/shooting-plan/)
- [山田凉 · 东郊记忆](https://regaliastar.github.io/shooting-plan/plans/ryo-industrial/)
- [查看自动同步状态](https://github.com/regaliastar/shooting-plan/actions)

## 当前展示

首页提供计划卡片、关键词搜索与收藏。每份计划有独立网址，详情页包含：

- 效果大图，点击可放大。
- 每张图的画面、动作、光感，各一句短说明。
- 默认折叠的构图与灯位示意图。
- 日期、时长、道具，以及带图片与构图信息的 PDF 下载、文字版下载、链接复制。

当前公开方案为「山田凉 · 东郊记忆」：半身肖像、琴包全身、台阶坐姿、回头瞬间、日落逆光、蓝调街景。日期待定，约 3 小时，道具为吉他包。河岸、排练室旧方案保留为草稿。

当前以「午后的光、等风经过、落日与灯火」串联六组照片，使用纸白底色、灰蓝与淡粉、错落照片排版。

效果图由 Imagegen 编辑为柔光胶片氛围，均标注为 **AI 效果示意，非实拍**。不展示他人的真实照片，不展示前期准备、相机曝光参数、应变与收工模块。收藏仅保存在当前浏览器。

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
| 三个故事章节及镜头顺序 | `story.title`、`story.kicker`、`story.intro`、`story.chapters` |
| 折叠示意图 | `coreShots[].frame`、`coreShots[].diagram` |
| 网页标题中的站名、首页描述 | `content/site.json` 中的 `name`、`description` |

每张照片的 `preview` 格式如下：

```json
{
  "image": "/assets/previews/dream-01.jpg",
  "effect": "冷灰墙面，蓝发和眼神成为画面重点。",
  "pose": "侧身扶包带，脸轻转向镜头。",
  "light": "柔和侧光，脸亮、背景稍暗。",
  "composition": "竖幅半身，人物偏右，左侧留干净墙面。"
}
```

### 新增、隐藏与删除

1. 复制当前的 `ryo-industrial.json`，不要直接使用旧草稿作为模板。
2. 修改唯一的 `slug`，例如 `new-plan`；独立网址为 `/plans/new-plan/`。
3. 用字符串 `number` 排序，例如 `"01"`、`"02"`；设置 `published: true`。
4. 修改标题、封面、短说明，以及 `coreShots` 中的照片和示意图数据。镜头 `id` 沿用 `"01"`、`"02"` 这样的格式。
5. 上传所需图片并提交。

设置 `published: false` 会同时隐藏卡片和详情页。删除 JSON 文件也会移除该方案；不再使用的图片可一并删除。旧草稿需补齐当前的 `preview` 和 `diagram` 数据后才能发布。

`story.chapters` 中每项含 `title`、`note` 和 `shots`（镜头 ID 数组）；每张镜头应出现一次。`preview.composition` 保存构图短说明，网页折叠区和 PDF 共用。

### 图片与排版

- 图片放在 `assets/previews/`，JSON 中使用以 `/assets/` 开头的路径。支持 JPG、PNG、WebP 等格式；建议保持竖幅 4:5。
- 首页封面 `image` 与每张效果图 `preview.image` 分别维护，替换时注意两处引用。
- 当前 AI 效果图的编辑提示词保存在 `assets/previews/PROMPTS.txt`，替换图片后同步更新记录。
- 保持短文案：客户先看效果图，再看动作与光感。
- 页面结构、底部拍摄顺序等固定文案，以及示意图绘制逻辑在 `scripts/build.mjs`；新增不同场景时一并核对。
- 排版在 `assets/style.css`，交互在 `assets/app.js`。

## PDF 导出

详情页顶部与底部均有「下载 PDF」。构建时为每份公开方案生成 `/briefs/<slug>.pdf`，每张照片一页，包含效果图、画面、动作、光感、构图文字、构图示意图和俯视机位灯位图。图片与中文字体嵌入文件，支持离线阅读。

PDF 直接由方案 JSON 构建；修改图片或构图后随 GitHub 内容包一起更新。生成器在 `scripts/build-pdfs.py`，依赖见 `scripts/requirements-pdf.txt`。中文字体和授权在 `scripts/fonts/`。

## 自动发布到 GitHub Pages

提交到 `main` 后，[Build and deploy GitHub Pages](https://github.com/regaliastar/shooting-plan/actions) 自动执行：

1. 安装 Node.js、Python 与依赖。
2. 构建静态页面、效果图资源和包含构图信息的 PDF。
3. 检查页面、图片、脚本、样式、PDF 链接，运行 typecheck。
4. 上传静态文件并部署到 GitHub Pages。

**修改、新增、删除方案，以及替换图片、调整文案和样式，提交后都会自动发布。** 不需要手动重新发布。Pull Request 只构建和校验，合入 `main` 后才部署。

页面、脚本、图片和 PDF 都由同一个 Pages 站点提供；访客无需登录，也不需要连接 GPT 域名或动态读取 GitHub Raw 接口。迁移后以 Pages 地址为准，原 GPT 站点不再随 `main` 自动更新。

构建失败时不会覆盖当前已上线版本。先查看 Actions 日志，修正 JSON、图片路径或 PDF 内容后重新提交即可。部署成功后刷新网页查看更新。

项目站点默认路径为 `/shooting-plan/`。工作流通过 `actions/configure-pages` 获取实际前缀，首页、独立方案、图片放大和 PDF 链接统一适配；`.nojekyll` 关闭 Jekyll 处理。以后使用自定义域名时，构建也支持根路径。

仓库 Settings → Pages 的 Source 应为 **GitHub Actions**，发布任务使用内置 `GITHUB_TOKEN` 和 OIDC，无需配置 PAT 或 GPT Sites 密钥。

迁移移除了对 GPT 站点的访问依赖；GitHub Pages 在客人实际网络下能否稳定直连，仍需实测，不能据此保证中国大陆所有网络都可访问。

## 本地开发

需要 Node.js 20、Python 3.12 或兼容版本；CI 使用 Node.js 20 与 Python 3.12。

先安装依赖：

```bash
npm ci
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r scripts/requirements-pdf.txt
```

在该虚拟环境中运行后续构建命令，或用 `PYTHON=/绝对路径/python3 npm run build` 指定已安装依赖的解释器。

### 本地预览

```bash
npm run dev
```

打开 `http://127.0.0.1:4173/`。该命令从本地 JSON 构建页面与 PDF，再启动静态服务器，不读取远端内容包。每次修改后停止并重新运行，刷新浏览器查看。

### 生产构建与最终检查

```bash
npm run build
npm test
npm run typecheck
```

`dist/` 是可直接部署的完整静态站点，含首页、方案页、图片、脚本、样式、PDF 和 404 页。`npm test` 检查路径前缀、文件链接、图片与 PDF，并确认页面不依赖 GPT 运行时。

项目默认使用 GitHub Pages 的 `/shooting-plan/` 路径。需要导出根路径版本或其他子目录时：

```bash
BASE_PATH= npm run build
BASE_PATH=/another-path npm run build
```

工作流自动传入实际路径前缀，日常维护无需手动设置。项目不设置 lint。

### 旧 GPT 运行时（保留兼容）

`worker/` 与相关脚本仅作旧部署兼容，GitHub Pages 不使用它们，也不再发布 `site-content` 分支。需要检查旧实现时可运行 `npm run build:worker` 和 `npm run test:worker`；日常只使用上面的 Pages 构建流程。

## 项目结构

| 路径 | 用途 |
| --- | --- |
| `content/plans/*.json` | 一份文件对应一份计划 |
| `content/site.json` | 站点元信息 |
| `assets/previews/` | AI 效果图与提示词 |
| `scripts/build.mjs` | 生成首页、详情页、简版下载文本及 404 页 |
| `assets/style.css`、`assets/app.js` | 页面样式和浏览器交互 |
| `scripts/build-pdfs.py` | 生成含图片与构图信息的 PDF |
| `scripts/fonts/` | 构建 PDF 使用的开源中文字体与授权 |
| `scripts/build-pages.mjs` | 生成适配 Pages 路径的静态站点与 `.nojekyll` |
| `tests/pages.test.mjs` | Pages 内部链接、静态资源与 PDF 检查 |
| `scripts/build-worker.mjs` | 旧 GPT 部署兼容构建 |
| `scripts/publish-content.cjs` | 旧 GPT 内容包发布脚本，现工作流不调用 |
| `.github/workflows/build.yml` | 自动构建、检查并部署 GitHub Pages |
| `worker/index.js` | 旧 GPT 内容读取与路由，Pages 不使用 |
| `tests/worker.test.mjs` | 自动同步与失败恢复测试 |
| `.openai/hosting.json` | 保留原 GPT Sites 身份，Pages 不使用 |

构建生成的 `dist/`、`.sites-runtime/` 无需手动维护或提交。
