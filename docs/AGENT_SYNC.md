# Agent 协作对齐文件

> Claude ↔ Codex 共享状态。接手前先读这里，完成后更新这里。
> 人类（你）是 Orchestrator，决定谁干什么。

---

## 项目一句话

Lizo 是 AI 陪伴平台：Web 前端（React 19 + Vite）+ Python 后端（Flask，跑在树莓派）+ Arduino 固件。
GitHub: https://github.com/Bic1210/Lizo

---

## 当前技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 · TypeScript · Tailwind v4 · Vite · React Router v6 |
| 后端 | Python 3.11 · Flask · SQLite · OpenRouter API |
| 部署 | Vercel（前端，待配置域名）· 树莓派（后端）|

---

## 已完成（截至 2026-04-21）

| 模块 | 内容 |
|------|------|
| 前端骨架 | 4 页面路由，全站 Nav，Tailwind 设计系统 |
| 首页 | LizoHero · FeatureSection · VideoShowcase · CTASection |
| 聊天页 | ChatWindow · ChatMessage · ChatInput，对接 `/api/v1/chat` |
| 灵魂空间 | DiaryList · EmotionChart（主题感知）· VideoGallery |
| Night Mode | `useTheme` hook，CSS 变量切换，Nav 🌙/☀️ 按钮 |
| 聊天持久化 | localStorage，最多 50 条，刷新不丢失 |
| 返回识别 | SIGNATURE-1，7 天梯度问候语 |
| 后端 | 4 个 v1 API，CORS 白名单，消息长度限制 |
| 部署配置 | `vercel.json`，`VITE_API_BASE_URL` 环境变量 |
| GitHub | https://github.com/Bic1210/Lizo，main 分支 |

---

## 待完成（按优先级）

| ID | 任务 | 适合谁 | 说明 |
|----|------|--------|------|
| P1 | Vercel 上线 | 人类操作 | 填 `VITE_API_BASE_URL`，连 GitHub repo |
| P2 | HTTPS 穿透 | Codex / Claude | ngrok 或 Cloudflare Tunnel，解决 Vercel HTTPS ↔ 树莓派 HTTP 问题 |
| P3 | 聊天风格进化 | Claude | Lizo 记住用户名字，情绪影响回复风格 |
| P4 | 即梦视频接入 | 人类 + Claude | 替换 VideoShowcase / VideoGallery 占位符 |
| P5 | iOS 键盘适配 | Codex | `ChatInput` fixed bottom 被软键盘遮挡（N-1） |
| P6 | 性能优化 | Codex | `animate-fade-up` will-change，GPU 合成（N-5） |

---

## 文件所有权

| 文件/目录 | 主写 | 备注 |
|-----------|------|------|
| `frontend/src/` | Claude · Codex 均可 | 改前先读，改后 build 验证 |
| `lizo/src/` | Claude · Codex 均可 | 谨慎，跑在真实树莓派 |
| `docs/AGENT_SYNC.md` | 双方都要更新 | 完成任务后在下方写入日志 |
| `docs/TASKS.md` | Claude 维护 | 详细任务队列 |
| `docs/DESIGN.md` | Claude 读取 | 设计系统唯一真理源 |

---

## 协作规范

1. **接手前**：读本文件 + `docs/TASKS.md` + 相关组件代码
2. **完成后**：在下方"工作日志"追加一条记录
3. **build 验证**：每次修改前端必须跑 `cd frontend && npm run build`，零错误才算完成
4. **不要**：自动触发对方，由人类决定调用谁

---

## 工作日志

### 2026-04-21 · Claude
- 完成 TASK-001 ~ TASK-012（见 docs/TASKS.md）
- 建立 GitHub repo，push main 分支
- 等待：Vercel 域名配置（需人类操作）

---

_下一个接手的 Agent 在此追加 👇_
