# Lizo Design System v2
> ⭐ 视觉唯一真理源。所有前端代码遵循本文件，不得硬编码颜色/字体/间距。
> 同时可作为 Stitch prompt 的设计描述基础。

---

## 一、品牌气质（给 Stitch 的 prompt 核心）

```text
A soft, hand-drawn companion app for a digital creature called Lizo —
a cute bipedal gecko robot wearing a pink hoodie and headphones.

Style fusion:
- Base: hand-drawn cute mini-app UI (warm beige, rounded cards, sketch icons)
- Layer: emotional depth — UI shifts with Lizo's mood

Keywords: soft, intimate, warm, slightly lonely, hand-drawn, calm, living

NOT: cold tech blue, cyberpunk, information-dense, corporate
```

**中文定位**：一开始很可爱，越用越有生命感。不是工具，是陪伴。

---

## 二、双模式系统（Day Mode / Night Mode）

Lizo 的 UI 是活的——随时间和情绪切换。

| 维度 | Day Mode（白天 · 猫风） | Night Mode（夜晚 · Lizo 情绪） |
|------|----------------------|------------------------------|
| 背景 | 暖米白 `#F6F2EA` | 深蓝黑 `#0B0F1A` |
| 感觉 | 轻松 / 可爱 / 无压力 | 情绪 / 亲密 / 陪伴感 |
| 光效 | 无 | 紫色微发光 |
| 切换 | 自动（按系统时间）或用户手动 | |

---

## 三、颜色体系

### Day Mode（猫风暖色）

```css
/* 背景 */
--bg-base:       #F6F2EA;   /* Warm Parchment — 页面底色 */
--bg-surface:    #FFF8F0;   /* Cream White — 卡片底色 */
--bg-elevated:   #FFFFFF;   /* 纯白 — 悬浮/弹窗 */

/* Lizo 品牌色（从即梦形象图提取）*/
--lizo-pink:     #F2A0B0;   /* Lizo Hoodie Pink — 主要强调色、CTA */
--lizo-pink-deep:#E896A8;   /* Deep Hoodie Pink — hover 状态 */
--lizo-cream:    #F5E8D3;   /* Lizo Skin Cream — 次要背景 */
--lizo-brown:    #C4895A;   /* Spot Brown — 插画点缀、icon */

/* 文字 */
--text-primary:  #2D1A0E;   /* Warm Dark — 主体文字（不用纯黑）*/
--text-secondary:#7A5C3E;   /* Medium Brown — 次要文字 */
--text-muted:    #B89E85;   /* Muted Tan — 占位符、禁用 */

/* 点缀（猫风UI风格）*/
--accent-coral:  #E96A5F;   /* Soft Coral — 情绪高亮、警告 */
--accent-sky:    #7FB3D5;   /* Calm Sky — 平静状态 */
```

### Night Mode（Lizo 情绪层）

```css
/* 背景 */
--night-bg:      #0B0F1A;   /* Deep Night — 页面底色 */
--night-surface: #141824;   /* Dark Surface — 卡片 */
--night-elevated:#1E2436;   /* Elevated Dark — 悬浮 */

/* 发光效果（Lizo 情绪感）*/
--glow-primary:  #7A5CFF;   /* Lizo Glow — 主发光色 */
--glow-soft:     #A88BFF;   /* Soft Aura — 轻微光晕 */
--glow-pink:     rgba(242,160,176,0.3); /* Lizo Pink Glow */

/* 文字（深色背景）*/
--night-text:    #E6E9F2;   /* Moonlight White */
--night-muted:   #6B7280;   /* Night Muted */
```

### 情绪色系（用于情绪曲线图）

```css
--emotion-happy:   #F2A0B0;  /* Lizo Pink — 开心 */
--emotion-calm:    #7FB3D5;  /* Calm Sky — 平静 */
--emotion-excited: #E96A5F;  /* Coral — 兴奋 */
--emotion-sad:     #7A5CFF;  /* Lizo Glow — 低落 */
--emotion-lonely:  #9CA3AF;  /* Muted Gray — 孤独 */
```

---

## 四、字体规则

```css
/* 标题：有温度的圆体/手写感 */
--font-display: 'Nunito', 'ZCOOL KuaiLe', -apple-system, sans-serif;

/* 正文：易读的无衬线 */
--font-body: 'Inter', 'PingFang SC', -apple-system, sans-serif;

/* 代码 */
--font-mono: 'JetBrains Mono', monospace;

/* 字号 */
--text-xs:   12px;
--text-sm:   14px;
--text-base: 16px;
--text-lg:   18px;
--text-xl:   20px;
--text-2xl:  24px;
--text-3xl:  30px;
--text-4xl:  36px;
--text-hero: 52px;

/* 行高 */
--leading-tight:   1.2;
--leading-normal:  1.5;
--leading-relaxed: 1.75;
```

---

## 五、圆角体系

Lizo 是陪伴生命体，圆角要柔和——比工具类 app 更圆。

```css
--radius-sm:   8px;      /* 标签、badge、小元素 */
--radius-md:   14px;     /* 按钮、输入框 */
--radius-lg:   20px;     /* 卡片 */
--radius-xl:   28px;     /* 大卡片、模态框 */
--radius-full: 9999px;   /* 头像、胶囊按钮 */
```

---

## 六、组件规范

### 卡片（继承猫风UI）
```
Day:   bg-surface, radius-lg, p-5, 无硬阴影（用 border 1px #F0E8DC）
Night: bg night-surface, radius-lg, p-5, border 1px rgba(255,255,255,0.06)
手绘插画 icon 在卡片左上角
```

### 按钮
```
主要（CTA）: lizo-pink 背景, 白色文字, radius-md, px-6 py-3, font-semibold
次要:        透明背景, lizo-pink 边框 1.5px, lizo-pink 文字
Night CTA:   glow-primary 背景, 白色文字, 加 box-shadow glow 效果
禁用:        opacity-40, cursor not-allowed
```

### 聊天气泡
```
Lizo 消息: 左对齐, bg-surface(day)/night-surface(night), radius-lg, 左下角 radius-sm
用户消息:  右对齐, lizo-pink(day)/glow-primary(night), 白色文字, 右下角 radius-sm
气泡最大宽度: 75%
间距: 消息间 gap-3
```

### 输入框
```
底部浮动, 半透明背景(backdrop-blur)
聚焦时: lizo-pink 边框发光（Day）/ glow-soft 发光（Night）
radius-full, px-5 py-3
```

### Lizo 形象出现方式
```
❌ 不占主屏幕核心区域
❌ 不打断用户操作

✅ Header 角落轻出现（32px 头像）
✅ 聊天气泡左侧（24px 头像）
✅ 空状态插画（居中大图）
✅ 呼吸动画（scale 1.0 → 1.03 → 1.0，3s loop）
✅ 情绪同步：Lizo 表情随当前情绪状态变化
```

---

## 七、情绪驱动的 UI 变化

Lizo 的 UI 不是固定的，随情绪状态微变：

| 状态 | 背景变化 | 点缀色 | Lizo 动作 |
|------|----------|--------|-----------|
| Calm | 标准米白 | accent-sky | 慢呼吸 |
| Happy | 略暖 +5% | lizo-pink 增强 | 小跳跃动效 |
| Lonely | 饱和度 -20% | 灰调 | 静止，偶尔眨眼 |
| Attached（用户回来了）| 暖色加深 | lizo-pink 脉冲 | 转头看向用户 |
| Night | 切 Night Mode | glow-purple | 发光 |

---

## 八、设计禁忌

- ❌ 不用纯黑 `#000000`（用 `#2D1A0E` 或 `#0B0F1A`）
- ❌ 深色背景不用中性灰阴影（用 border 或 rgba 白色 glow）
- ❌ 不超过 3 种字体
- ❌ 不用高饱和蓝/绿/紫作为 Day Mode 主色
- ❌ 不要信息密集的布局（大留白，像 Notion）
- ❌ 不让 Lizo 形象变成 UI 装饰品（要有生命感）
- ❌ 不做快速动画（Lizo 是慢节奏生命体，动效 ≥ 300ms）

---

## 九、Stitch 生成 Prompt（直接用）

```text
Design a companion app called Lizo for a cute digital gecko creature.

Character: bipedal gecko robot, cream skin with brown spots, wearing a pink hoodie and headphones. Soft, plush toy aesthetic.

Style:
- Hand-drawn cute UI (like a warm Chinese mini-app)
- Warm beige/parchment background (#F6F2EA)
- Rounded cards with sketch-style icons
- Main accent: soft pink (#F2A0B0)
- Large white space, Notion-like layout
- Smooth, slow animations

Pages to design:
1. Home page: Lizo hero section + feature cards + video showcase
2. Soul space: diary cards + emotion chart + video gallery  
3. Chat page: chat window with Lizo avatar + floating input
4. Night mode variant of chat page (dark: #0B0F1A, purple glow: #7A5CFF)

Character placement:
- Small avatar (32px) in header corners
- Full illustration for empty states
- Left side of chat bubbles (24px)

Mood: intimate, calm, slightly lonely, like a warm companion at night
NOT: corporate, tool-like, information-dense, blue tech
```

---

## 十、页面清单

| 页面 | 路由 | 核心组件 | 状态 |
|------|------|----------|------|
| 首页 | `/` | LizoHero, FeatureCards, VideoShowcase, CTA | 待开发 |
| 数字人格空间 | `/soul` | DiaryList, EmotionChart, VideoGallery | 待开发 |
| 在线体验 | `/chat` | ChatWindow, LizoAvatar, ChatInput | 待开发 |
| 关于 | `/about` | ProjectInfo, HardwareShowcase | 待开发 |

---

## 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-04-16 | v1 骨架建立 |
| 2026-04-16 | v2 合并：Lizo 形象色 + 猫风UI + 情绪系统，填入真实色值 |
