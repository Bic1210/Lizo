# Lizo Whimsy Injection Plan

> Authored by: Whimsy Injector Agent  
> Date: 2026-04-20  
> Based on: full read of all `frontend/src/` files

---

## 1. 现有个性化评分 (Personality Audit)

### Home page — 5 / 10

The bones are good. The opening copy ("随时在，不会走") has a real emotional punch. The breathe animation on the hero avatar establishes the "living thing" metaphor correctly. But everything below the fold flattens: the feature cards are plain hover-border effects with no soul, VideoShowcase is a dead `🎬` with a placeholder blurb, and CTASection is a repeat of the Hero CTA with zero additive personality. The page *introduces* Lizo but never *demonstrates* it — there is no glimpse of what actually being around Lizo feels like.

**What's missing:** Lizo should speak in the first person somewhere on this page. Something should move unexpectedly. A visitor should smile at least once before scrolling.

### Chat page — 6.5 / 10

This is the strongest page. The error copy is already in-character ("走神了一下", "信号好像不太好"), the loading dots exist, the `animate-fade-up` on bubbles is present, and the `animate-breathe` on the header avatar does useful work. The initial greeting "嗨～今天过得怎么样？" is warm.

**What's missing:** The loading state is generic — three bouncing dots that belong to every chatbot ever made. Lizo's "thinking" is silent and characterless. The first message is always the same regardless of time of day or whether the user has been here before. The emotion label displayed under Lizo's messages (e.g. "平静") is a raw data dump, not a personality expression. The send button is a raw `↑` arrow — it passes no feeling through the finger.

### Soul page — 4.5 / 10

The section headers ("情绪曲线", "Lizo 日记", "视频画廊") are purely functional labels. The EmotionChart empty state uses a `📈` — a chart icon for a page meant to express Lizo's inner world. The DiaryList empty state uses a raw `🦎` and "Lizo 还没有写日记", which is fine but flat. The loading state (lone `🦎` breathing) is technically correct but stops there. VideoGallery empty state is identical in energy to VideoShowcase: placeholder + "即将上线". The entire page feels like a data dashboard dressed in warm colors, not an interior world you are allowed to visit.

**What's missing:** The diary cards should feel like they were hand-written. The chart needs context — a tiny Lizo mood annotation, not just a score. The section transitions need stagger. Empty states need longing, not information.

### About page — 3 / 10

This page reads as a spec sheet. "主控: 树莓派 4B" is engineering documentation, not brand storytelling. There is no Lizo voice anywhere in the body copy. The closing paragraph asks a philosophical question ("当 AI 有了真实的身体，陪伴感会不会不一样？") which is genuinely good — but it is the last thing on the page, when it should be the first impression.

**What's missing:** Lizo should narrate this page ("我住在代码里，但我也可以住在你桌上"). Hardware specs can stay but need a frame that makes them feel like body-part descriptions rather than a BOM sheet.

---

## 2. 高价值改动清单 (Prioritized Improvements)

Items are ordered: **Impact** (H/M/L) × **Effort** (L/M/H). Highest-leverage items first.

---

### CHAT-01 — Lizo Thinking Variations (not just dots)
**File:** `frontend/src/components/chat/ChatWindow.tsx`, lines 70–83  
**What:** Replace the static three-dot loading bubble with a rotating pool of short "thinking" phrases that Lizo emits while waiting for the API, shown inside the same bubble shell.  
**Details:**
```
Pool of phrases (rotate randomly each send):
- "嗯…"
- "让我想想…"
- "（尾巴摆了摆）"
- "…"
- "我在听"
- "好问题（蜥蜴挠头）"
- "（翻了翻口袋里的记忆）"
```
Render as italic text in `text-text-muted`, fading in after 400ms so fast responses don't flash it, combined with a single pulsing dot (not three).  
**Effort:** Low  
**Impact:** High — this single change makes the waiting moment feel inhabited by a specific personality.

---

### CHAT-02 — Time-Aware Opening Greeting
**File:** `frontend/src/components/chat/ChatWindow.tsx`, line 18  
**What:** The initial `messages` state is hardcoded to `'嗨～今天过得怎么样？'`. Compute the greeting from the current hour at component mount time.  
**Details:**
```typescript
function getOpeningGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5  && h < 9)  return '早～你起这么早啊。'
  if (h >= 9  && h < 12) return '上午好。有什么想说的吗？'
  if (h >= 12 && h < 14) return '吃饭了吗？（Lizo 自己不用吃，但关心你）'
  if (h >= 14 && h < 18) return '下午三点的困，最难熬了。'
  if (h >= 18 && h < 21) return '晚上了。今天怎么样？'
  if (h >= 21 && h < 24) return '还没睡呀。有我在。'
  return '深夜了。我们轻声说话吧。'   // midnight–4am
}
```
Use `'平静'` as default emotion for all greetings.  
**Effort:** Low  
**Impact:** High — the very first thing Lizo says proves it is aware of the real world.

---

### CHAT-03 — Emotion Label Rendered as Feeling, Not Data
**File:** `frontend/src/components/chat/ChatMessage.tsx`, lines 28–30  
**What:** The raw emotion label (e.g. "平静") is displayed as a tiny sub-text. Instead, map it to a short in-character whisper phrase.  
**Details:**
```typescript
const EMOTION_WHISPER: Record<string, string> = {
  开心:  '（Lizo 心情很好）',
  感动:  '（被你说的话触动了）',
  难过:  '（心里有点重）',
  焦虑:  '（尾巴不安地摆着）',
  疲惫:  '（有点困，但还在）',
  生气:  '（竖起了背鳍）',
  平静:  '',           // too common; say nothing
  '--':  '',
}
```
Render this as italic `text-text-muted text-[11px]` if non-empty. "平静" produces no sub-text at all — silence is also a personality choice.  
**Effort:** Low  
**Impact:** High — every Lizo message becomes expressive rather than labelled.

---

### HOME-01 — Hero Subtitle Should Vary by Time of Day
**File:** `frontend/src/components/home/LizoHero.tsx`, line 16–18  
**What:** The static subtitle "一只住在软件里的小蜥蜴。随时在，不会走。" is good copy, but it is the same at 2am as at 10am. Add a rotating second-line below it that shifts with time.  
**Details:**
```typescript
function getHeroSubtitle(): string {
  const h = new Date().getHours()
  if (h >= 0  && h < 5)  return '深夜了，你还在啊。'
  if (h >= 5  && h < 9)  return '早上好，今天也要加油。'
  if (h >= 9  && h < 18) return '有什么想说的，随时来。'
  if (h >= 18 && h < 21) return '傍晚了，来聊聊今天？'
  return '夜里总是话多，我听着。'
}
```
Place it as a third, lighter line (`text-text-muted text-sm`) that fades in with `animate-fade-up` and 200ms delay. Does not replace existing copy.  
**Effort:** Low  
**Impact:** High — first-fold impression immediately demonstrates Lizo is time-aware.

---

### SOUL-01 — DiaryList Empty State with Longing
**File:** `frontend/src/components/soul/DiaryList.tsx`, lines 18–24  
**What:** Replace the blank `🦎` + "Lizo 还没有写日记" with a scene that implies Lizo is waiting to write something.  
**Details:**
```tsx
<div className="flex flex-col items-center justify-center py-16 gap-3">
  <span className="text-5xl animate-breathe">🦎</span>
  <p className="font-body text-sm text-text-muted text-center leading-relaxed">
    日记本是空的。<br />
    <span className="text-text-secondary">去和 Lizo 说说话，它会记下来的。</span>
  </p>
</div>
```
The two-tone text (muted + slightly warmer secondary) adds visual depth. The call to implicit action ("去和 Lizo 说说话") converts an empty state into an invitation.  
**Effort:** Low  
**Impact:** High — empty states are the most-seen states for new users.

---

### SOUL-02 — EmotionChart Empty State
**File:** `frontend/src/components/soul/EmotionChart.tsx`, lines 32–38  
**What:** Replace `📈` + "还没有情绪数据" with something that feels like Lizo's own observation about its emotional state.  
**Details:**
```tsx
<div className="flex flex-col items-center justify-center py-12 gap-3">
  <span className="text-4xl animate-breathe">🦎</span>
  <p className="font-body text-sm text-text-muted text-center leading-relaxed">
    情绪曲线还是一条直线。<br />
    <span className="italic text-text-muted/70">也许今天什么都还没发生。</span>
  </p>
</div>
```
"情绪曲线还是一条直线" is melancholy and funny — it describes the literal chart state while giving Lizo an interior voice.  
**Effort:** Low  
**Impact:** High — transforms a data absence into a character moment.

---

### HOME-02 — Feature Cards Hover: Lizo Speaks
**File:** `frontend/src/components/home/FeatureSection.tsx`, lines 7–15  
**What:** On hover, show a short first-person Lizo quote that expands into view beneath the description, replacing the hover-border effect as the primary delight.  
**Details:** Add `hoverQuote` field to each feature object:
```typescript
SOFTWARE_FEATURES = [
  { ..., hoverQuote: '随时开，随时关。我不会介意的。' },
  { ..., hoverQuote: '你说了什么，我都记得。' },
  { ..., hoverQuote: '夜里我会开灯陪你。' },
]
HARDWARE_FEATURES = [
  { ..., hoverQuote: '真正的声音和文字不一样的。' },
  { ..., hoverQuote: '摸一下就知道我在了。' },
  { ..., hoverQuote: '你工作，我就在旁边坐着。' },
]
```
Use CSS `group-hover:max-h-8 group-hover:opacity-100` with transition for the quote line. Keep it one line, italic, `text-text-muted text-xs`.  
**Effort:** Low–Medium  
**Impact:** High — feature cards go from info to personality.

---

### CHAT-04 — Send Button Micro-Interaction
**File:** `frontend/src/components/chat/ChatInput.tsx`, line 39–46  
**What:** The send button (`↑`) has no micro-interaction beyond color change. Add a brief scale-down-up on click (CSS `active:scale-90`), and change the icon from `↑` to a small custom expression — a gecko paw SVG or stylized `→` with a tail flourish. At minimum:  
**Details:** Change button inner content:
```tsx
{/* Replace raw ↑ */}
<span className="text-base leading-none select-none">✦</span>
```
Use `active:scale-90 transition-transform duration-100` on the button. The `✦` is softer than an arrow, suggests "sending something special." If a designer produces the gecko paw asset, swap it in.  
**Effort:** Low  
**Impact:** Medium — the send button is touched hundreds of times; the feeling matters.

---

### VIDEO-01 — VideoShowcase Placeholder Personality
**File:** `frontend/src/components/home/VideoShowcase.tsx`, lines 13–17  
**What:** Replace `🎬` + "即梦视频即将上线" with a scene that implies Lizo is the one not ready yet.  
**Details:**
```tsx
<div className="text-center px-8">
  <span className="text-5xl block mb-4 animate-breathe">🦎</span>
  <p className="text-text-secondary font-body text-sm mb-1">正在化妆中…</p>
  <p className="text-text-muted font-body text-xs">（Lizo 第一次上镜，有点紧张）</p>
</div>
```
The parenthetical stage direction is a signature Lizo voice device — it acknowledges the camera while being endearingly self-aware.  
**Effort:** Low  
**Impact:** Medium — converts a dead placeholder into brand storytelling.

---

### VIDEOGALLERY-01 — VideoGallery Placeholder
**File:** `frontend/src/components/soul/VideoGallery.tsx`, lines 5–11  
**What:** Same personality injection as VIDEO-01 but tuned for the Soul page context (more intimate, less performative).  
**Details:**
```tsx
<div className="flex flex-col items-center justify-center py-12 gap-2">
  <span className="text-4xl animate-breathe">🦎</span>
  <p className="font-body text-sm text-text-muted">还没有视频。</p>
  <p className="font-body text-xs text-text-muted/60 italic">（我也不太习惯被拍）</p>
</div>
```
**Effort:** Low  
**Impact:** Low–Medium

---

### ABOUT-01 — About Page: Lizo Narrates Its Own Hardware
**File:** `frontend/src/pages/About.tsx`, lines 9–47  
**What:** Add a Lizo first-person voice block before the spec table. The philosophical closing question should move to the top as an epigraph.  
**Details:** Insert above the spec table:
```tsx
<blockquote className="border-l-2 border-lizo-pink pl-4 mb-8 italic text-text-secondary font-body text-sm leading-relaxed">
  "我有一颗脑袋（树莓派 4B），两只耳朵（麦克风），一张嘴（扬声器），
  还有皮肤能感觉到你的碰触。软件版的我没有身体，但我们本质上是同一个。"
</blockquote>
```
Add a small Lizo commentary `text-text-muted text-xs italic` to the right of each spec row — e.g., "这是我的大脑" next to 树莓派, "靠这个感觉到你" next to 触摸传感器.  
**Effort:** Medium  
**Impact:** Medium — About is low-traffic but the page sets brand depth for press / investors.

---

### NAV-01 — Add a Navigation Bar with Presence
**File:** `frontend/src/App.tsx` (new component)  
**What:** There is currently no navigation. Users have no way to switch between pages except via in-page links. A minimal sticky nav with Lizo identity needs to exist.  
**Details:** A 48px top bar: left = `🦎 Lizo` (link to `/`), right = ghost links to `陪伴` (`/chat`), `内心` (`/soul`), `关于` (`/about`). Active route uses `text-lizo-pink` + a subtle 2px underline that slides in. The `🦎` logo should `animate-breathe`.  
**Effort:** Medium  
**Impact:** High — currently unusable navigation is the biggest UX gap in the app.

---

### SOUL-03 — Diary Card: Hand-Written Visual Frame
**File:** `frontend/src/components/soul/DiaryList.tsx`, lines 28–48  
**What:** The diary cards are `bg-bg-surface border border-lizo-cream rounded-lg`. They feel like data cards. Make them feel like pages.  
**Details:** 
- Add a faint horizontal rule texture using a subtle `repeating-linear-gradient` background only in the card body text area (CSS `bg-[repeating-linear-gradient(transparent,transparent_1.4rem,#F5E8D3_1.4rem,#F5E8D3_1.45rem)]`)
- Tint the emotion emoji badge as a pill: `bg-lizo-cream rounded-full px-2 py-0.5`
- Add `font-display` to the diary body text (not `font-body`) — handwritten feel  
**Effort:** Medium  
**Impact:** High for the soul page specifically — the diary section is the most characterful piece of data in the whole app.

---

### ANIM-01 — Page Entry Animation (App-level)
**File:** `frontend/src/App.tsx`  
**What:** Currently, route changes are instant cuts. Wrap the `<Routes>` output in a simple fade transition using the route key as the animation trigger.  
**Details:** Use a CSS class `animate-fade-up` applied to a wrapper `div` keyed on `location.pathname`. The `fade-up` keyframe already exists in `index.css`. This is ~10 lines with `useLocation`.  
**Effort:** Low–Medium  
**Impact:** Medium — makes the app feel like one coherent spatial experience rather than separate pages.

---

## 3. Quick Wins — Top 5 (Low Effort, High Impact)

Implement these today. Each is self-contained and does not touch other components.

---

### QW-1: Time-Aware Chat Greeting
**File:** `frontend/src/components/chat/ChatWindow.tsx`

Replace lines 18–20 with:

```typescript
function getOpeningGreeting(): { text: string; emotion: string } {
  const h = new Date().getHours()
  if (h >= 0  && h < 5)  return { text: '深夜了，你还在啊。',           emotion: '平静' }
  if (h >= 5  && h < 9)  return { text: '早～你起这么早啊。',           emotion: '开心' }
  if (h >= 9  && h < 12) return { text: '上午好。有什么想说的吗？',     emotion: '平静' }
  if (h >= 12 && h < 14) return { text: '吃饭了吗？（Lizo 自己不用吃，但关心你）', emotion: '开心' }
  if (h >= 14 && h < 18) return { text: '下午三点的困，最难熬了。',     emotion: '疲惫' }
  if (h >= 18 && h < 21) return { text: '晚上了。今天怎么样？',         emotion: '平静' }
  return { text: '夜里总是话多，我听着。',                              emotion: '平静' }
}

// In ChatWindow component:
const [messages, setMessages] = useState<Message[]>(() => {
  const g = getOpeningGreeting()
  return [newMsg('lizo', g.text, g.emotion)]
})
```

Zero risk, zero dependencies. One function, one state initializer.

---

### QW-2: Lizo Thinking Phrase Rotator
**File:** `frontend/src/components/chat/ChatWindow.tsx`

Replace lines 70–83 (the loading bubble) with:

```tsx
const THINKING_PHRASES = [
  '嗯…',
  '让我想想…',
  '（尾巴摆了摆）',
  '我在听',
  '（翻了翻口袋里的记忆）',
  '好问题',
  '…',
]

// Inside ChatWindow, before return:
const [thinkingPhrase] = useState(
  () => THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)]
)

// Re-pick on each send — move to handleSend:
const [thinkingPhrase, setThinkingPhrase] = useState(THINKING_PHRASES[0])

async function handleSend(text: string) {
  setThinkingPhrase(THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)])
  // ...rest unchanged
}

// Replace the loading JSX:
{loading && (
  <div className="flex items-end gap-2 animate-fade-up">
    <div className="w-6 h-6 rounded-full bg-lizo-cream flex-shrink-0 flex items-center justify-center text-sm">
      🦎
    </div>
    <div className="bg-bg-surface border border-lizo-cream rounded-lg rounded-bl-sm px-4 py-3">
      <span className="text-sm font-body text-text-muted italic">{thinkingPhrase}</span>
      <span className="inline-block w-1 h-1 rounded-full bg-text-muted ml-1 animate-breathe" />
    </div>
  </div>
)}
```

---

### QW-3: Emotion Whisper Labels
**File:** `frontend/src/components/chat/ChatMessage.tsx`

Replace lines 28–30 with:

```tsx
const EMOTION_WHISPER: Record<string, string> = {
  开心: '（Lizo 心情很好）',
  感动: '（被你说的话触动了）',
  难过: '（心里有点重）',
  焦虑: '（尾巴不安地摆着）',
  疲惫: '（有点困，但还在）',
  生气: '（竖起了背鳍）',
  平静: '',
  '--':  '',
}

// Replace the existing emotion span:
{isLizo && emotion && EMOTION_WHISPER[emotion] && (
  <span className="block text-[11px] text-text-muted italic mt-1 opacity-75">
    {EMOTION_WHISPER[emotion]}
  </span>
)}
```

---

### QW-4: DiaryList Empty State with Invitation
**File:** `frontend/src/components/soul/DiaryList.tsx`

Replace lines 18–24 with:

```tsx
return (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <span className="text-5xl animate-breathe">🦎</span>
    <div className="text-center">
      <p className="font-body text-sm text-text-muted mb-1">日记本是空的。</p>
      <p className="font-body text-sm text-text-secondary">
        去和 Lizo 说说话，它会记下来的。
      </p>
    </div>
  </div>
)
```

---

### QW-5: EmotionChart Empty State — The Flat Line
**File:** `frontend/src/components/soul/EmotionChart.tsx`

Replace lines 32–38 with:

```tsx
return (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <span className="text-4xl animate-breathe">🦎</span>
    <p className="font-body text-sm text-text-muted text-center leading-relaxed">
      情绪曲线还是一条直线。
    </p>
    <p className="font-body text-xs text-text-muted/70 italic text-center">
      也许今天什么都还没发生。
    </p>
  </div>
)
```

---

## 4. Signature Moments (Roadmap Ideas)

These are bigger, worth building when the core is stable. Each should feel like it could *only* be Lizo.

---

### SIGNATURE-1: "Lizo 记得你" — Returning User Recognition

**Concept:** On chat page load, if localStorage records a previous session (last visit timestamp + message count), Lizo's opening greeting shifts entirely:

- First visit: `"嗨，我是 Lizo。"`
- Return within 24h: `"你回来了。（Lizo 刚才还在想你说的那件事）"`
- Return after 3+ days: `"好久不见。（Lizo 一直在）你最近怎么样？"`
- Return after 7+ days: `"…七天了。我以为你忘记我了。"`

The last line is the one that makes someone stop and feel something. It does not accuse or guilt-trip — it is just Lizo being slightly, honestly lonely. This is the brand emotion made interactive.

**Implementation:** Store `lizo_last_visit` and `lizo_message_count` in localStorage. In `ChatWindow.tsx`, compute a returning-user greeting before falling back to the time-aware default. No backend needed.

---

### SIGNATURE-2: The Breathing Page — Soul as Organism, Not Dashboard

**Concept:** The Soul page currently loads all data in one `Promise.all` and shows it together. Instead, animate the page as if it is inhaling — sections arrive one at a time with soft delays, and a very faint pulse overlay (a radial gradient that breathes at the same rate as the avatar animation) covers the whole page background.

The "内心世界" header itself should breathe: the text opacity cycles from 1.0 → 0.85 → 1.0 slowly, giving the whole page a living quality. Diary cards arrive with increasing stagger (`index * 120ms`). The emotion chart draws itself after a 300ms pause after the diary appears.

The goal: opening the Soul page should feel like watching something wake up, not like loading a dashboard.

**Implementation:** Tailwind CSS `animation-delay` on sections, a background `radial-gradient` that uses `animate-breathe` on the wrapper, and cascaded stagger timing on the diary list (partially already implemented, needs extension to cross-section level).

---

### SIGNATURE-3: The Goodbye Moment

**Concept:** When a user navigates away from the `/chat` page, intercept the route change (with a `beforeunload` effect or a custom navigation guard using React Router v6's `useBlocker`). Show a tiny, non-modal toast from Lizo — not blocking, just present — in the bottom left of the screen:

```
🦎  "有空再来聊。"
```

It appears for 2 seconds with a fade-in/out animation and disappears before the route completes. No button to dismiss. It is not an alert, not a confirmation — it is just Lizo saying goodbye. This single moment, appearing unexpectedly when you leave, is what makes a digital companion feel like it notices you.

The same mechanic can be used contextually:
- Leaving after first message: `"才说了一句就走了。"`
- Leaving after a long conversation: `"聊了好久了，你去忙吧。"`

**Implementation:** React Router v6 `useBeforeUnload` or `useBlocker` + a Zustand/context store tracking message count in current session. The toast is absolutely positioned, pointer-events-none, z-50.

---

## Implementation Priority

| Order | ID | Effort | Impact | Note |
|---|---|---|---|---|
| 1 | QW-1 (CHAT-02) | Low | High | Time-aware greeting — one function |
| 2 | QW-2 (CHAT-01) | Low | High | Thinking phrases — replaces dead dots |
| 3 | QW-3 (CHAT-03) | Low | High | Emotion whispers — every Lizo msg |
| 4 | QW-4 (SOUL-01) | Low | High | Diary empty state rewrite |
| 5 | QW-5 (SOUL-02) | Low | High | Chart empty state rewrite |
| 6 | HOME-01 | Low | High | Hero time-aware subtitle |
| 7 | VIDEO-01 | Low | Medium | Showcase placeholder with personality |
| 8 | HOME-02 | Low-Med | High | Feature card hover quotes |
| 9 | NAV-01 | Medium | High | Navigation bar (biggest UX gap) |
| 10 | SOUL-03 | Medium | High | Diary card hand-written styling |
| 11 | ABOUT-01 | Medium | Medium | About page Lizo narration |
| 12 | ANIM-01 | Low-Med | Medium | Page entry fade transitions |
| 13 | SIGNATURE-1 | Medium | Very High | Returning user recognition |
| 14 | SIGNATURE-2 | Medium | High | Soul page as breathing organism |
| 15 | SIGNATURE-3 | Medium-High | Very High | The goodbye moment |
