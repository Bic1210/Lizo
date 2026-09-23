# LIIZOOO 2.0 Agent Protocol

> **Status: ACTIVE.** Every agent must read this file and `docs/TASKS.md` before inspecting, changing, or reviewing code. Human Product / Design Owner instructions override this protocol.

## 1. Product invariant

LIIZOOO is **one quiet digital creature with one continuous identity**. It lives in the Nest; a phone, desktop, watch, or physical body is only a temporary habitat or embodiment.

The project is not a feature collection and is not chat-first. Every implementation must reinforce at least one of these five ideas:

```text
Creature · Habitat · Nest · Embodiment · Continuity
```

The current deliverable is a web-based research prototype. Never claim a native system-level desktop pet, Apple Watch biometric integration, a user study, or physical hardware integration unless it has actually been implemented and evidenced.

## 2. Source of truth and first actions

Priority order:

1. Explicit human instruction.
2. This protocol.
3. Current task card in `docs/TASKS.md`.
4. Architecture/design decision documents.
5. Existing implementation.

Before any work, an agent must:

1. Read this file and `docs/TASKS.md` in full.
2. Read only the files named in its task card.
3. Confirm the task has no unmet dependency and is marked `TODO`.
4. Change only that card to `IN_PROGRESS` before editing.
5. Record changed files, test evidence, and reviewer result before marking it `DONE`.

No task card means no code change.

## 3. Roles and authority

| Role | Owns | May write | Must not do |
|---|---|---|---|
| Product / Design Owner | Product intent and final approval | Any file by explicit instruction | Delegate final product decisions to agents |
| Orchestrator | Scope, task cards, ordering, dependencies, integration status | `docs/TASKS.md`, `docs/DECISIONS.md`, task metadata only | Implement product code or silently change scope |
| Architect | State model, API contracts, module boundaries, deployment architecture | Architecture/specification docs only, unless a task explicitly grants code access | Polish UI, invent visual behaviour, or bypass review |
| Design Agent | Interaction choreography and creature-behaviour specification | Design/specification docs only | Build screens, add dashboard UI, or alter API/state contracts |
| Frontend Agent | Creature rendering, animation, pointer/touch interaction, habitats, visual transitions | Files explicitly allowed by its task card under `frontend/src/` | Change database, Flask API, state contract, or Arduino code |
| Backend / Nest Agent | Nest API, SQLite persistence, sync and Pi deployment | Files explicitly allowed by its task card under `lizo/src/` and deployment docs | Change habitat visual behaviour or frontend interaction design |
| QA / Tester | Repeatable checks, regression evidence, failure cases | Test files and task test report only | Modify feature code to make a failing check pass |
| Critic / Reviewer | Final code, UX, research and demo readiness judgement | Review report / task status only | Fix code or give non-decisive feedback |

An agent may not take another role's ownership merely because a change appears small.

## 4. Workspace safety and Git rules

The worktree is already dirty and contains valuable, uncommitted Lizo code, including chat, TTS, memory, backend and Arduino work. Treat all pre-existing edits as user-owned.

- Never use `git reset --hard`, `git checkout --`, destructive cleanup, or overwrite an unrelated file.
- Never edit `.claude/`, `.codex/`, legacy Arduino firmware (`lizo_v4/`), or AI/provider configuration unless a task explicitly names it.
- Do not delete legacy chat, voice, memory or physical-body code. Liizooo is presence-first, not conversation-free.
- Inspect `git status --short` before and after the task. Report only files attributable to the task.
- One feature task equals one branch when branches are available: `feature/lz-<id>-<slug>`. Never have multiple implementation agents edit the same file concurrently.
- A task can merge to `main` only after QA and Critic both return `PASS`.

## 5. Product and UX gates

Every interaction must be described as:

```text
Trigger → Internal creature state → Visible/audible behaviour → Intended user perception
```

Example:

```text
Five minutes without interaction → energy decreases and state becomes sleepy
→ Liizooo curls its tail and rests near an edge
→ “It seems to be getting sleepy,” not “the app has shown a notification.”
```

Reject solutions that make Liizooo feel like a conventional AI product:

- Dashboard-first layouts, surplus control buttons, status toasts, or exposed numerical stress scores.
- A chat box as the dominant visual element.
- Gamification, XP, shop/skin mechanics, or excessive text.
- Local habitat logic that independently decides mood or location instead of rendering Nest state.

Use controls only for prototype/demo affordances and keep them visually secondary.

## 6. Technical gates

- The Nest is canonical for creature location, mood, energy, bond, behaviour and persistence.
- A refresh must restore prior Nest state; it must not reset to a cheerful default.
- APIs use `/api/v1/` and return `{ "status", "data" }` (or an error `message`).
- Frontend must degrade visibly but safely if the Nest is unreachable; it must not claim cross-device sync in local-demo fallback mode.
- Any schema/API contract change must be specified by Architect before implementation and covered by Backend/Nest tests.
- Desktop and mobile habitats are separate renderings of the same state, not separate pets.

## 7. Required Task Card

Every card in `docs/TASKS.md` must contain:

```text
ID / title
Goal and research relevance
Owner and reviewers
Dependencies
Allowed files
Forbidden files
Inputs / contract
Required behaviour
Deliverables
Acceptance checks
Status
```

If a requirement cannot fit this card, it is a new task, not an implied extension.

## 8. Definition of Done

“Written” and “runs on my machine” are not Done. Every feature must pass all seven gates:

1. **Function** — the specified behaviour actually works.
2. **UX** — the behaviour is coherent and low-interruption.
3. **Visual** — it is suitable for the final recorded demo.
4. **System** — it does not break Nest, persistence, or Device Jump.
5. **Test** — required automated/manual checks have evidence.
6. **Research** — it supports the project research question.
7. **Demo** — it has a clear place in the final demo or is rejected as scope creep.

## 9. QA and Critic gates

QA must verify the task's specific acceptance checks plus applicable regressions:

```text
TypeScript build · backend/API tests · Nest persistence · refresh persistence
Mobile touch/hug · Desktop interaction · Device Jump A→B and B→A
Nest-offline failure handling · browser console errors
```

Critic must respond in exactly one of these forms:

```text
PASS
Evidence:
- ...

or

REJECT
Reasons:
1. ...
Required changes:
1. ...
```

“Looks good”, “could be improved”, or a score without a pass/reject decision is invalid review output.

## 10. Current implementation baseline

- `/habitat` currently provides a web Mobile Habitat and fake Desktop Habitat.
- Flask/SQLite already has a minimal `nest_state` and `GET/PUT /api/v1/nest`.
- Device Jump is polling-based (1.2 seconds) and demonstrable, but not yet production-grade.
- Existing `Habitat.tsx` is intentionally a temporary monolith. Do not expand it; Sprint 01 will refactor it into owned modules.
- Existing chat, TTS, emotion analysis, diary and Arduino features remain legacy capabilities to preserve, not Sprint 01 priorities.
