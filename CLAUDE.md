# Lizo — AI Companion Platform · 多 Agent 协作规则

## 项目定位

Lizo 是「跨次元情感生命体」：软件是灵魂的栖息地，硬件是灵魂的物理容器。

**软件层**（面向所有人）：Web 平台——品牌展示 + 数字人格空间 + 在线陪伴 + 社区  
**硬件层**（付费体验）：实体树莓派机器人，更多感知与物理交互

---

## 多 Agent 协作模式

本项目采用 **Shared State + Orchestrator-Subagent 混合模式**：

- **Shared State（骨架）**：`docs/` 下的文件是所有 Agent 的共享大脑，Agent 之间通过读写文件协作，而非互相对话（零 token 浪费）
- **Orchestrator-Subagent（流程）**：你（人类）是 Orchestrator，slash command 是 Subagents，你手动决定何时调用谁
- **Generator-Verifier（设计子流程）**：Stitch 生成 UI → `/designer` 验证精炼 → 写入 DESIGN.md

### 核心原则：文件是唯一通信渠道

```
你（提需求）
  → /integrator 拆任务 → TASKS.md
  → /designer   精炼设计 → DESIGN.md
  → /frontend   写组件 → frontend/src/
  → /backend    写API  → lizo/src/web/
  → /reviewer   检查 → DECISIONS.md（备注区）
  → 你（确认完成）
```

### 文件所有权（防止冲突）

| 文件 | 写入者 | 读取者 |
|------|--------|--------|
| `docs/DESIGN.md` | `/designer` | `/frontend`, `/reviewer` |
| `docs/TASKS.md` | `/integrator`, 你 | 所有 Agent |
| `docs/DECISIONS.md` | `/integrator`, `/reviewer` | 所有 Agent |
| `docs/ARCHITECTURE.md` | `/backend`, 你 | `/frontend`, `/reviewer` |
| `frontend/src/**` | `/frontend` | `/reviewer` |
| `lizo/src/web/**` | `/backend` | `/reviewer` |

### 防止 Reactive Loop（重要）
- Agent **不自动触发**下一个 Agent，由你手动调用
- 每个任务在 TASKS.md 里有明确的「完成标准」
- `/reviewer` 只输出检查报告，不主动修改代码

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + TypeScript + Tailwind CSS v4 + Vite |
| 后端 | Python 3.11 + Flask（已有） |
| AI 接口 | OpenRouter API（GPT-4o-mini 省钱 / Claude Sonnet 高质量）|
| 数据库 | SQLite（已有）|
| 硬件 | Arduino + 树莓派（已有）|
| 部署 | Vercel（前端）+ 树莓派（后端）|

---

## 目录结构

```
Lizoallhere/
├── CLAUDE.md                ← 你在这里，所有 Agent 必读
├── docs/
│   ├── DESIGN.md            ← ⭐ 视觉唯一真理源（Stitch 导出后填入）
│   ├── AGENTS.md            ← Agent 角色说明与协议
│   ├── ARCHITECTURE.md      ← 系统架构
│   ├── TASKS.md             ← 当前任务队列
│   └── DECISIONS.md         ← 关键决策记录
├── .claude/commands/        ← Slash 命令（/designer /frontend 等）
├── references/              ← 视觉参考截图
├── stitch-exports/          ← Stitch 导出的 HTML/CSS
├── frontend/                ← React + TypeScript（待建）
├── lizo/                    ← Python 后端（已有，谨慎修改）
└── lizo_v4/                 ← Arduino 固件（已有，不动）
```

---

## 当前进度

- [x] Python 后端：brain / voice / memory / hardware / web 模块
- [x] Arduino 固件 v4
- [x] Lizo 即梦形象图
- [ ] DESIGN.md（等 Stitch 导出）
- [ ] React 前端骨架
- [ ] Web 首页
- [ ] 在线聊天页面
- [ ] 部署上线
