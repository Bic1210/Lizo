# Lizo Agent 协议文档

> 所有 Agent 在执行任务前必须读取本文件和 TASKS.md。

## Agent 角色一览

### `/designer` — 设计 Agent
**职责**：将视觉参考和 Stitch 产出转化为可执行的设计规则  
**读取**：`references/`, `stitch-exports/`, `docs/DESIGN.md`（现有内容）  
**写入**：`docs/DESIGN.md`, `docs/DECISIONS.md`（设计决策区）  
**不得**：碰任何代码文件

**触发时机**：
- Stitch 新导出了设计稿
- 用户新增了参考截图
- 前端开发中遇到设计歧义

**输出标准**：DESIGN.md 每次更新后，前端 Agent 无需询问设计问题即可直接写代码

---

### `/frontend` — 前端 Agent
**职责**：用 React + TypeScript + Tailwind 实现 Lizo Web 界面  
**读取**：`docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md`, `frontend/src/`  
**写入**：`frontend/src/**`  
**不得**：修改 DESIGN.md（有设计问题就停下来叫 `/designer`）

**开发规范**：
- 组件文件名：PascalCase（`LizoHero.tsx`）
- 样式：仅用 Tailwind，不写内联 style
- 类型：所有 props 必须有 TypeScript 接口
- 颜色/字体：只用 DESIGN.md 里定义的变量，不硬编码

---

### `/backend` — 后端 Agent
**职责**：维护和扩展 Python 后端，提供 Web API  
**读取**：`docs/ARCHITECTURE.md`, `docs/TASKS.md`, `lizo/src/`  
**写入**：`lizo/src/web/server.py` 为主，谨慎修改其他模块  
**不得**：修改 `lizo_v4/`（Arduino 固件），不重构已有工作代码

**后端规范**：
- API 路径统一用 `/api/v1/` 前缀
- 所有 API 返回 JSON，包含 `status` 和 `data` 字段
- 新 endpoint 先在 ARCHITECTURE.md 里记录再实现

---

### `/reviewer` — 审查 Agent
**职责**：检查代码质量、设计一致性、安全问题  
**读取**：指定的改动文件 + `docs/DESIGN.md`（前端审查时）  
**写入**：`docs/DECISIONS.md`（仅追加，在「代码审查」区域）  
**不得**：直接修改任何代码，只输出报告

**检查清单**：
- [ ] TypeScript 类型完整（无 `any`）
- [ ] 颜色/字体与 DESIGN.md 一致
- [ ] API 端点有错误处理
- [ ] 无硬编码密钥/路径
- [ ] 组件可在移动端正常显示

---

### `/integrator` — 整合 Agent
**职责**：将大需求拆解成可执行任务卡片，维护 TASKS.md  
**读取**：所有 `docs/` 文件，理解全局状态  
**写入**：`docs/TASKS.md`, `docs/DECISIONS.md`（架构决策区）  
**不得**：写代码，不做具体实现

**任务卡片格式**（写入 TASKS.md 时使用）：
```
### TASK-XXX: 任务标题
- **Agent**: /frontend | /backend | /designer
- **读取**: 需要读的文件
- **输入**: 具体要做什么
- **完成标准**: 明确可验证的完成条件
- **状态**: TODO | IN_PROGRESS | DONE
```

---

## 全局规则

1. **先读 TASKS.md**，找到自己的任务，确认状态是 TODO 再开始
2. **任务开始前**，在 TASKS.md 把状态改为 IN_PROGRESS
3. **任务完成后**，在 TASKS.md 把状态改为 DONE，并在 DECISIONS.md 记录关键决策
4. **遇到阻塞**，在 TASKS.md 任务下写 `- **阻塞**: 原因` 并停下，等用户决策
5. **不跨越职责**，不确定的事情停下来问，不要自作主张
