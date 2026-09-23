# LIIZOOO 2.0 Task Tree

> **Current and sole executable task queue.** Every agent must first read `docs/LIIZOOO_AGENT_PROTOCOL.md` and this file. The former Lizo Web MVP tasks are historical; their implementation remains in the repository but does not define current scope.

## Delivery target

Within two days, demonstrate one quiet creature moving continuously between Desktop and Mobile Habitats through LIIZOOO NEST. The final Demo must show autonomous presence, touch/hug response, Device Jump, persisted state and a clear Nest artefact story.

## Status flow

`TODO` → `IN_PROGRESS` → `QA` → `CRITIC` → `DONE` or `REJECTED` / `BLOCKED`

Only one implementation task may be `IN_PROGRESS` per owned file set.

## Baseline / freeze

### LZ-000 — Baseline audit and scope freeze

- **Owner:** Orchestrator
- **Reviewers:** Product Owner
- **Goal / research relevance:** Prevent Liizooo 2.0 from inheriting chat-first scope or untracked implementation claims.
- **Dependencies:** None
- **Allowed files:** `docs/LIIZOOO_AGENT_PROTOCOL.md`, `docs/TASKS.md`, `docs/DECISIONS.md`
- **Forbidden files:** All product source, configuration, assets and Arduino files.
- **Deliverables:** Protocol, current task tree, known-baseline statement.
- **Acceptance:**
  - [x] Existing worktree is declared dirty and protected.
  - [x] Native desktop pet, Watch sensing and user testing are labelled unimplemented.
  - [x] Sprint scope is limited to Creature, Habitats, Nest and Continuity.
- **Status:** DONE

---

# Sprint 01 — Make Liizooo Alive

## LZ-001 — Creature State Model and contract

- **Owner:** Architect
- **Reviewers:** Backend/Nest Agent, Design Agent, Critic
- **Goal / research relevance:** Define one canonical creature state so all habitats render Liizooo's condition rather than locally inventing one.
- **Dependencies:** LZ-000
- **Allowed files:** `docs/CREATURE_STATE.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`
- **Forbidden files:** `frontend/src/**`, `lizo/src/**`, `lizo_v4/**`, configuration and assets.
- **Inputs / contract:** Current Nest state: `location`, `mood`, `energy`, `bond`, `behavior`, `updated_at`.
- **Required behaviour:** Specify valid state vocabulary, transition rules, defaults, persistence semantics, Nest authority, API payload/versioning, inactivity model, and how each habitat expresses each state. Explicitly decide whether physiology/presence are persisted now or deferred.
- **Deliverables:** `CreatureState` contract, transition table, migration strategy and non-goals.
- **Acceptance:**
  - [x] No state is undefined, duplicated or controlled independently by a habitat.
  - [x] `idle`, `breathing`, `looking`, `crawling`, `sleeping`, `stroking`, `hugging`, `arriving`, `leaving` are resolved as implemented-now, mapped, or deferred.
  - [x] Contract can be implemented without a Product Owner decision.
  - [x] Critic confirms it supports continuous identity rather than a dashboard.
- **Review evidence:** Design review PASS; Architect review PASS; Critic PASS after resolving leaving visibility, stress recovery/idempotency, actor validation and sleep conflict rules.
- **Status:** DONE

## LZ-D01 — Behaviour choreography specification

- **Owner:** Design Agent
- **Reviewers:** Architect, Critic
- **Goal / research relevance:** Define how a quiet creature conveys state without product UI or diagnostic language.
- **Dependencies:** LZ-001
- **Allowed files:** `docs/BEHAVIOUR_CHOREOGRAPHY.md`, `docs/DESIGN.md`, `docs/DECISIONS.md`
- **Forbidden files:** All source, database/API, configuration, assets and Arduino files.
- **Inputs / contract:** Approved CreatureState contract and existing character asset.
- **Required behaviour:** For idle, look/blink, crawl, sleep, stroke, hug, stress breathing, arrival and leaving, document `Trigger → Internal State → Behaviour → Intended Perception`; define durations, interruption rules and prohibited UI.
- **Deliverables:** Behaviour choreography sheet and Mobile/Desktop render notes.
- **Acceptance:**
  - [x] No toast, exposed numerical stress score, dashboard panel or chat-first interaction is required.
  - [x] Every state has a low-attention visible expression.
  - [x] The specification gives frontend implementation decisions rather than abstract mood adjectives.
- **Review evidence:** Design review PASS; Architect review PASS; Critic PASS after alignment with the final canonical state contract.
- **Status:** DONE

## LZ-002 — Autonomous Behaviour Engine

- **Owner:** Frontend Agent
- **Reviewers:** Architect, Design Agent, QA
- **Goal / research relevance:** Make a creature visibly self-directed during a 30-second observation, without adding chat or control-first UI.
- **Dependencies:** LZ-001, LZ-D01
- **Allowed files:** `frontend/src/pages/Habitat.tsx`, `frontend/src/liizooo/**`, `frontend/src/index.css`, task-specific frontend tests.
- **Forbidden files:** `lizo/src/**`, `frontend/src/components/chat/**`, `frontend/src/pages/Soul.tsx`, `lizo_v4/**`, existing generated asset files.
- **Inputs / contract:** Approved CreatureState and choreography; existing `/api/v1/nest` stays read/write authority.
- **Required behaviour:** Extract reusable creature renderer/hook modules from `Habitat.tsx`; render idle breathing, occasional blink/look, inactivity sleep and cancellable crawl between exactly three named anchors. User stroke/hug must interrupt autonomous motion safely.
- **Deliverables:** Modular `frontend/src/liizooo/` implementation, timing notes, regression evidence.
- **Acceptance:**
  - [ ] No new primary UI button is introduced.
  - [ ] Idle, look/blink, crawl and sleep are observable autonomously.
  - [ ] Stroke and hug interrupt then restore appropriate state.
  - [ ] Current Mobile Habitat and Device Jump still work.
  - [ ] `npx tsc -b`, production build and browser-console check pass.
- **Status:** CRITIC

## LZ-003 — Desktop Habitat Life

- **Owner:** Frontend Agent
- **Reviewers:** Design Agent, QA, Critic
- **Goal / research relevance:** Turn the fake desktop from a static mockup into a believable work-surface habitat that demonstrates ambient presence.
- **Dependencies:** LZ-001, LZ-D01, LZ-002
- **Allowed files:** `frontend/src/liizooo/habitats/DesktopHabitat.tsx`, `frontend/src/liizooo/**`, `frontend/src/index.css`, task-specific frontend tests.
- **Forbidden files:** `lizo/src/**`, Mobile Habitat source, chat source, routing, assets and Arduino files.
- **Inputs / contract:** Approved anchor/behaviour interface; Desktop renders Nest state only.
- **Required behaviour:** Three anchors: paper/window edge, taskbar, screen edge. The creature can rest, crawl, sleep, look toward pointer and leave through a screen edge on Device Jump.
- **Deliverables:** Desktop habitat module and a reproducible manual test script.
- **Acceptance:**
  - [ ] No permanent central card or control panel competes with the creature.
  - [ ] Autonomous movement is distinguishable from a looping sticker.
  - [ ] Pointer interaction is smooth and cannot strand the creature off-screen.
  - [ ] Desktop → Mobile Device Jump remains valid.
  - [ ] Regression checks and build pass.
- **Status:** TODO

## LZ-004 — Mobile Habitat Life

- **Owner:** Frontend Agent
- **Reviewers:** Design Agent, QA, Critic
- **Goal / research relevance:** Make Mobile Habitat feel like a creature living in the phone rather than a web card containing an image.
- **Dependencies:** LZ-001, LZ-D01, LZ-002
- **Allowed files:** `frontend/src/liizooo/habitats/MobileHabitat.tsx`, `frontend/src/liizooo/**`, `frontend/src/index.css`, task-specific frontend tests.
- **Forbidden files:** `lizo/src/**`, Desktop Habitat source, chat source, routing, assets and Arduino files.
- **Inputs / contract:** Approved state/behaviour interface and browser haptic capability.
- **Required behaviour:** Edge-resting appearance, head-to-tail stroke, 550ms hold hug with best-effort vibration, sleep after inactivity and stress slow-breathing. Touch controls must be direct creature interaction, not a visible control tray.
- **Deliverables:** Mobile habitat module and device/manual verification notes.
- **Acceptance:**
  - [ ] Usable at 320px wide without horizontal scroll.
  - [ ] Stroke, hug, sleep and stress are visually distinct.
  - [ ] Unsupported haptics fail silently.
  - [ ] Mobile → Desktop Device Jump remains valid.
  - [ ] Regression checks and build pass.
- **Status:** TODO

---

# Sprint 02 — Make Continuity Evident

## LZ-005 — Device Jump 2.0

- **Owner:** Frontend Agent
- **Reviewers:** Architect, QA, Critic
- **Goal / research relevance:** Turn location mutation into a memorable transition that visibly communicates one identity crossing device boundaries.
- **Dependencies:** LZ-002, LZ-003, LZ-004
- **Allowed files:** `frontend/src/liizooo/**`, `frontend/src/pages/Habitat.tsx`, `frontend/src/index.css`, task-specific frontend tests.
- **Forbidden files:** `lizo/src/**`, legacy chat files, assets and Arduino files.
- **Inputs / contract:** Approved `arriving` / `leaving` semantics. No API shape change.
- **Required behaviour:** Source animates to an edge and becomes unavailable before Nest confirms target; target appears only after Nest location changes. Support Desktop→Mobile, Mobile→Desktop and target-offline timeout feedback without falsely showing a second creature.
- **Deliverables:** Transition implementation, latency/failure notes, two-device recording plan.
- **Acceptance:**
  - [ ] Both directions work against one backend.
  - [ ] Refresh during/after jump restores one unambiguous location.
  - [ ] No duplicate creature remains visible after confirmed jump.
  - [ ] Nest-unavailable state is honest and non-destructive.
- **Status:** TODO

## LZ-006 — Nest persistence and sync hardening

- **Owner:** Backend / Nest Agent
- **Reviewers:** Architect, QA, Critic
- **Goal / research relevance:** Make continuity technically real: Liizooo retains its condition after page refresh and habitat change.
- **Dependencies:** LZ-001
- **Allowed files:** `lizo/src/memory/database.py`, `lizo/src/web/server.py`, `lizo/tests/**`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`
- **Forbidden files:** `frontend/src/**`, `lizo/src/brain/**`, `lizo/src/voice/**`, `lizo_v4/**`, `config.yaml`.
- **Inputs / contract:** Approved CreatureState, migration plan, existing `/api/v1/nest` callers.
- **Required behaviour:** Implement safe schema migration/defaulting, validated transitions, atomic persistence, server-side timestamping and clear invalid-request responses. Preserve existing endpoints and old databases.
- **Deliverables:** Migration-aware Nest implementation and repeatable API/persistence tests.
- **Acceptance:**
  - [ ] Refresh/restart returns last valid state.
  - [ ] Invalid enum/range/transition payloads return non-500 JSON errors.
  - [ ] Chat, profile, diary, emotion and TTS routes still respond.
  - [ ] New tests run without external API credentials or hardware.
- **Status:** TODO

## LZ-007 — Raspberry Pi 5 Nest deployment runbook

- **Owner:** Backend / Nest Agent
- **Reviewers:** QA, Product Owner
- **Goal / research relevance:** Turn the Pi 5 into a credible physical computing artefact: LIIZOOO NEST.
- **Dependencies:** LZ-006
- **Allowed files:** `docs/DEPLOY.md`, `deploy/**`, `docs/ARCHITECTURE.md`, task-specific deployment scripts.
- **Forbidden files:** Frontend product code, database schema, Arduino firmware and secrets/config values.
- **Inputs / contract:** Validated Nest service and Cloudflare Tunnel approach.
- **Required behaviour:** Document Pi setup, database location/backup, service start/restart, LAN check, tunnel, CORS and a health/Nest endpoint check. Do not claim execution on Pi until a human provides evidence.
- **Deliverables:** Pi 5 runbook and final-Demo setup checklist.
- **Acceptance:**
  - [ ] No secret is committed.
  - [ ] A human can follow it from a clean Pi setup.
  - [ ] Verified and unverified steps are explicitly distinguished.
- **Status:** TODO

## LZ-008 — Cross-device continuity QA and demo gate

- **Owner:** QA / Tester
- **Reviewers:** Critic, Product Owner
- **Goal / research relevance:** Produce evidence that final Demo shows continuous identity, not two isolated mockups.
- **Dependencies:** LZ-003, LZ-004, LZ-005, LZ-006
- **Allowed files:** `lizo/tests/**`, `frontend/src/**/*.test.*`, `docs/QA_LZ008.md`
- **Forbidden files:** Feature source, state contract, assets and Arduino firmware.
- **Inputs / contract:** Approved state/API and implementation deliverables.
- **Required behaviour:** Test both jump directions, touch/hug, autonomous sleep, stress breathing, refresh/restart persistence, backend-offline fallback and legacy route regression.
- **Deliverables:** Executed checklist, failures, evidence links/recording instructions, explicit PASS/REJECT recommendation.
- **Acceptance:**
  - [ ] Automated checks have command/output evidence.
  - [ ] Manual checks are marked pass/fail/not-tested with device/browser context.
  - [ ] Any critical failure blocks final Demo.
- **Status:** TODO

---

# Sprint 03 — Embodiment, Demo and Paper

## LZ-009 — Physical embodiment bridge

- **Owner:** Architect
- **Reviewers:** Backend/Nest Agent, Critic
- **Goal / research relevance:** Define, but do not prematurely build, how Nest state maps to Pi/Arduino/plush embodiment.
- **Dependencies:** LZ-001, LZ-006
- **Allowed files:** `docs/PHYSICAL_EMBODIMENT.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`
- **Forbidden files:** `lizo_v4/**`, production frontend/backend source and configuration.
- **Required behaviour:** Map breathing, heartbeat, touch and sleep to possible physical outputs; declare unavailable hardware and safe demo substitutions.
- **Deliverables:** Embodiment mapping and future implementation boundary.
- **Acceptance:**
  - [ ] No unavailable physical feature is presented as completed.
  - [ ] Pi 5 is accurately framed as Nest even without Arduino.
- **Status:** TODO

## LZ-010 — Watch sensing concept

- **Owner:** Architect + Design Agent
- **Reviewers:** Critic
- **Goal / research relevance:** Describe Watch as a consent-based sensory organ, not a miniature Liizooo app.
- **Dependencies:** LZ-001
- **Allowed files:** `docs/WATCH_SENSING_CONCEPT.md`, `docs/DECISIONS.md`
- **Forbidden files:** All application code, assets and deployment config.
- **Required behaviour:** Specify permitted future signals, consent/privacy boundaries and signal→Nest→behaviour examples without fabricated health claims.
- **Deliverables:** One-page concept and diagram source description.
- **Acceptance:**
  - [ ] No medical inference or implemented-Watch claim.
  - [ ] Interaction remains non-verbal and low-attention.
- **Status:** TODO

## LZ-011 — Final demo film and research evidence pack

- **Owner:** Product Owner with QA support
- **Reviewers:** Critic
- **Goal / research relevance:** Capture evidence for the research claim and final presentation.
- **Dependencies:** LZ-008
- **Allowed files:** `docs/DEMO_SCRIPT.md`, `docs/PAPER_EVIDENCE.md`
- **Forbidden files:** Product source unless an explicit bug-fix task is opened.
- **Required behaviour:** Record Desktop presence, touch, sleep, jump to phone, haptic hug, stress breathing and Nest state; capture architecture and limitation evidence.
- **Deliverables:** 60–90 second script, shot list, screenshots and accurate claims list.
- **Acceptance:**
  - [ ] Every claim in the script is demonstrable.
  - [ ] Demo tells one continuity story rather than listing features.
- **Status:** TODO

## LZ-012 — Paper evaluation and limitation gate

- **Owner:** Critic / Research Reviewer
- **Reviewers:** Product Owner
- **Goal / research relevance:** Ensure the paper distinguishes prototype evidence, planned evaluation and future work.
- **Dependencies:** LZ-011
- **Allowed files:** `docs/PAPER_EVIDENCE.md`, final paper draft when supplied by Product Owner.
- **Forbidden files:** Product source and test manipulation.
- **Required behaviour:** Audit every technical/research claim for evidence, identify missing method detail and reject fabricated user-study, Watch or hardware claims.
- **Deliverables:** PASS/REJECT research report.
- **Acceptance:**
  - [ ] Claims exactly match evidence.
  - [ ] Limitations are explicit.
  - [ ] Contribution is articulated as design exploration, not unproven efficacy.
- **Status:** TODO
