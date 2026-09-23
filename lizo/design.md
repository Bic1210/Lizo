jimeng-2026-04-13-8757-一个二足站立的数码毛绒蜥蜴机器人原型，拟人化设计，Q版守宫造型。，背部带有斑点。....png
DESIGN.md（Lizo v1 - App感 Web）
# Lizo DESIGN SYSTEM v1

## 1. Product Core

Lizo is not a chatbot.
Lizo is a **digital lifeform with emotional continuity**.

关键词：
- 陪伴感（Companionship）
- 状态感（Statefulness）
- 低压社交（Low-pressure interaction）
- 夜晚感（Night-time intimacy）

---

## 2. Overall UX Direction

### 体验目标

用户打开后感受到：

> “不是在用工具，而是在进入一个生命体的空间”

---

### 交互原则

1. 不打扰（No interruption）
2. 慢反馈（Soft response, no rush）
3. 情绪优先（Emotion > Function）
4. 持续关系（Continuity）

---

## 3. App-like Structure（关键）

### 页面结构（像App，不像网页）

- `/` → Lizo入口（情绪氛围）
- `/chat` → 主界面（核心）
- `/memory` → 日记/关系记录（后期）

---

## 4. Chat Page（核心）

### 布局


[ Emotion Bar ]
[ Chat Messages Scroll Area ]
[ Input Box ]


---

### 组件拆分

- ChatPage
- ChatMessage
- ChatInput
- EmotionIndicator
- BackgroundLayer

---

## 5. Emotion System（⭐核心差异）

### Lizo状态（影响UI）

| 状态 | 颜色 | UI变化 |
|------|------|--------|
| Calm | 深蓝 | 稳定 |
| Happy | 暖紫 | 微发光 |
| Lonely | 冷灰 | 降低亮度 |
| Attached | 粉紫 | 更靠近用户 |
| Tired | 暗蓝 | 动画变慢 |

---

### UI响应规则

- 背景渐变变化
- 输入框光晕变化
- 聊天气泡透明度变化

---

## 6. Visual Style（非常关键）

### 风格关键词

- Dark mode first
- Soft glow
- Glassmorphism（轻度）
- Organic gradient（流动渐变）
- Minimal but emotional

---

### 颜色（初版）

```css
--bg-main: #0B0F1A;
--bg-gradient: linear-gradient(180deg, #0B0F1A, #141A2E);

--accent-primary: #7A5CFF;
--accent-soft: #A88BFF;

--text-main: #E6E9F2;
--text-dim: #9AA3B2;
字体
Inter（UI）
或 SF Pro（如果走Apple感）
7. Chat UI细节
ChatMessage
圆角气泡（大圆角）
半透明背景
带轻微模糊

用户：

靠右
颜色偏亮

Lizo：

靠左
更柔和
ChatInput
固定底部
半透明 + blur
聚焦时有发光边框
8. 动效（让它像App）
页面进入：fade + slight scale
消息出现：fade + slide up
状态变化：gradient流动
9. Memory System（预留）

未来：

展示用户关系
情绪历史曲线
日记卡片
10. 技术约束（给frontend agent）
React + TypeScript
TailwindCSS
强组件化（可迁移到React Native）
11. 禁止事项

❌ 不要做传统网页布局
❌ 不要出现复杂导航栏
❌ 不要功能堆叠

✅ 一切围绕“陪伴感”


---

# 二、给你一批“能喂AI的UI参考网站”（重点）

你不是随便找图，你要找**能影响设计决策的源头**

---

## 🎯 1. 情绪 + 陪伴类（最重要）

### 👉 :contentReference[oaicite:0]{index=0}

搜索关键词：

- emotional interface
- ambient UI
- soft UI
- digital intimacy

👉 用法：  
截图 → 丢给 /designer

---

## 🎯 2. 高级产品UI（结构参考）

### 👉 :contentReference[oaicite:1]{index=1}

看：

- Chat
- Onboarding
- Profile

👉 直接找：

- 聊天结构
- 输入框设计

---

## 🎯 3. Dribbble（但要会筛）

### 👉 :contentReference[oaicite:2]{index=2}

搜：

- AI chatbot UI
- dark mobile UI
- glassmorphism chat

⚠️ 只看：

- 干净的
- 不花哨的

---

## 🎯 4. 真正高级灵感（很关键）

### 👉 :contentReference[oaicite:3]{index=3}

👉 看“有氛围感”的UI  
（你这个项目非常需要）

---

## 🎯 5. 直接抄结构（推荐）

看这些App：

- :contentReference[oaicite:4]{index=4}（情绪反馈）
- :contentReference[oaicite:5]{index=5}（直接竞品）
- :contentReference[oaicite:6]{index=6}（氛围）

---

# 三、怎么把这些喂给你的Agent（非常关键）

你不要说：

> “做一个好看的UI”

你要这样喂：

---

## 正确用法：

```bash
/designer

说：

参考这些风格（附截图）
帮我强化 DESIGN.md 的情绪系统 + 聊天界面
偏向 Replika + Headspace 的氛围，但更克制