# Lizo 任务队列

> `/integrator` 维护此文件。所有 Agent 执行任务前先看这里，找到自己的 TODO 任务。
> 
> 状态：`TODO` → `IN_PROGRESS` → `DONE` | `BLOCKED`

---

## 当前冲刺：Web 平台 MVP

### TASK-001: 初始化 React 前端项目
- **Agent**: `/frontend`
- **读取**: `docs/DESIGN.md`, `docs/ARCHITECTURE.md`
- **输入**: 用 Vite 初始化 React 18 + TypeScript + Tailwind 项目，在 `frontend/` 目录。配置路由（React Router v6），建立页面骨架（4个页面）。配置 Tailwind 读取 DESIGN.md 里的颜色变量。
- **完成标准**: 
  - `frontend/` 下有完整项目结构
  - `npm run dev` 能跑起来
  - 4个页面路由能访问（内容可以是占位符）
  - Tailwind 配置了自定义颜色变量
- **状态**: DONE（Vite + React 18 + TS + Tailwind v4 + React Router v6，4 页面路由，build 零错误）

---

### TASK-002: 填写 DESIGN.md（等 Stitch 导出）
- **Agent**: `/designer`
- **读取**: `stitch-exports/`, `references/`, `docs/DESIGN.md`
- **输入**: 用 Stitch 导出的设计稿内容填充 DESIGN.md 中所有 `[待填写]` 的占位符。确保颜色语义命名清晰，字体规则完整。
- **完成标准**:
  - DESIGN.md 中无 `[待填写]` 占位符
  - 颜色全部有具体 hex 值
  - 字体族名称确定
- **状态**: DONE（DESIGN.md v2 已有完整色值和字体，Stitch 可视化后续导入）

---

### TASK-003: 实现首页组件
- **Agent**: `/frontend`
- **依赖**: TASK-001, TASK-002（如 TASK-002 未完成，用 DESIGN.md 现有默认值先做）
- **读取**: `docs/DESIGN.md`, `docs/ARCHITECTURE.md`
- **输入**: 实现首页的 4 个组件：LizoHero, FeatureSection, VideoShowcase, CTASection。LizoHero 展示即梦生成的 Lizo 形象图（放在 `references/` 下）。
- **完成标准**:
  - 4 个组件存在且在首页渲染
  - 移动端响应式正常
  - 颜色/字体与 DESIGN.md 一致
  - Lizo 形象图正确显示
- **状态**: DONE（LizoHero/FeatureSection/VideoShowcase/CTASection 全部实现，UI审查 PASS 45/50，emoji 占位待真实形象图替换）

---

### TASK-004: 实现在线聊天页面
- **Agent**: `/frontend` → 然后 `/backend`
- **读取**: `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `lizo/src/web/server.py`
- **前端部分**:
  - 实现 ChatWindow, ChatMessage, ChatInput 组件
  - 完成标准：UI 可用，暂时 mock 响应
- **后端部分**:
  - 包装现有 chat.py 为 `/api/v1/chat` REST 端点
  - 开启 CORS
  - 完成标准：前端能收到真实回复
- **状态**: DONE（前端 ChatWindow/ChatMessage/ChatInput 实现，对接 /api/v1/chat，UI审查 PASS 45/50；后端 4 个端点全部实装）

---

### TASK-005: 实现数字人格空间页面
- **Agent**: `/frontend` → 然后 `/backend`
- **读取**: `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `lizo/src/memory/database.py`
- **前端部分**:
  - 实现 DiaryList, EmotionChart（用 recharts）, VideoGallery
  - 完成标准：组件存在，暂时用 mock 数据
- **后端部分**:
  - 实现 `/api/v1/diary` 和 `/api/v1/emotion` 端点
  - 完成标准：返回真实 SQLite 数据
- **状态**: DONE（DiaryList/EmotionChart/VideoGallery 实现，Soul 页接 API，UI审查 PASS 42/50，recharts 独立 chunk lazy load）

---

### TASK-006: 全站审查
- **Agent**: `/reviewer`
- **依赖**: TASK-003, TASK-004, TASK-005
- **读取**: `frontend/src/**`, `docs/DESIGN.md`
- **检查项**: 类型完整性、设计一致性、移动端适配、API 安全
- **完成标准**: DECISIONS.md 里有完整审查报告，无 Critical 级别问题
- **状态**: DONE（全站审查完成，2 Critical + 4 Major 已全部修复，5 Minor 记录在 DECISIONS.md 待后续迭代）

---

---

### TASK-007: 全站导航栏 NAV-01
- **Agent**: `/frontend`
- **读取**: `docs/DESIGN.md`
- **输入**: 创建固定顶部导航栏 `Nav.tsx`，包含 首页/聊天/灵魂空间/关于 四个链接，active 高亮，响应式。接入 App.tsx。
- **完成标准**: 所有页面顶部有可用导航，页面间可跳转，ChatWindow 高度适配
- **状态**: DONE（Nav.tsx 已创建，App.tsx 已接入，ChatWindow 改为 h-[calc(100vh-3.5rem)]）

---

### TASK-008: 返回用户识别 SIGNATURE-1
- **Agent**: `/frontend`
- **读取**: `docs/DESIGN.md`
- **输入**: 在 ChatWindow 使用 localStorage 记录首次/上次访问时间，按时间差给出差异化开场白（初次/当天回访/3天/7天+）
- **完成标准**: 刷新页面后 Lizo 问候语体现访问历史，7天未回给出 "我以为你忘记我了"
- **状态**: DONE（FIRST_VISIT_KEY / LAST_VISIT_KEY，5段时间梯度问候语）

---

---

### TASK-009: 聊天历史 localStorage 持久化
- **状态**: DONE（HISTORY_KEY，MAX_HISTORY=50，读取失败静默，写入在 useEffect）

---

### TASK-010: Night Mode 深色模式切换
- **状态**: DONE（useTheme hook，data-theme="night" CSS 变量覆盖，Nav 🌙/☀️ 按钮，localStorage 偏好持久化）

---

### TASK-011: EmotionChart 主题感知修复
- **状态**: DONE（MutationObserver 监听 data-theme 变化，切换深色模式时图表颜色实时更新）

---

### TASK-012: Vercel 部署配置
- **状态**: DONE（vercel.json，VITE_API_BASE_URL 环境变量，.env.example，.gitignore，ARCHITECTURE.md 部署说明）

---

## 完成的任务

TASK-001 ~ TASK-012

---

## 阻塞中的任务

无

---

## 下一步（v1.1）

- TASK-009: 聊天历史 localStorage 持久化（刷新不丢失）
- TASK-010: Night Mode 深色模式切换
- TASK-011: /about 页面内容填充（硬件介绍）
