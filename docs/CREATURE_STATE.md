# LZ-001 — Canonical LIIZOOO Creature State Model

**Status:** submitted for Architect / Design review; implementation is owned by LZ-006 and LZ-002.

This is the sole state contract for LIIZOOO. The Nest owns the persisted
`CreatureState`; habitats render a read of it and submit user intents. A
habitat must never create a second creature state, choose a different
location, or retain a local fallback as though it were synchronised.

The model deliberately contains no health, heart-rate, HRV, weather,
calendar, inferred emotion, Watch signal, or AI-derived field. Those are
possible future *inputs* and are not part of the creature's core life model.

## 1. Canonical schema

All persisted timestamps are server-issued UTC RFC 3339 strings ending in
`Z`. Integers are base-10 whole numbers. `stateRevision` is an opaque,
monotonically increasing Nest revision, not a user-facing score.

```ts
export type Location = "mobile" | "desktop" | "nest" | "physical";

export type Mood = "calm" | "happy" | "sleepy" | "stressed";

/** One mutually exclusive, globally meaningful choreographic intent. */
export type Behavior =
  | "idle"
  | "breathing"
  | "looking"
  | "crawling"
  | "sleeping"
  | "stroking"
  | "hugging"
  | "arriving"
  | "leaving";

export interface Presence {
  /** Null only until the first confirmed stroke or hug. */
  lastInteractionAt: string | null;
  /** Set at creation and each confirmed location change. */
  lastLocationChangeAt: string;
}

/** Exists only while `behavior === "leaving"`; otherwise both values are null. */
export interface Journey {
  target: Exclude<Location, "nest"> | null;
  startedAt: string | null;
}

export interface CreatureState {
  /** Contract/data shape, not an API-route version. Version is exactly 1. */
  schemaVersion: 1;
  /** Server increment on every accepted state transition; starts at 1. */
  stateRevision: number;

  location: Location;
  mood: Mood;
  behavior: Behavior;
  /** Start time of the current primary behaviour; never null. */
  behaviorStartedAt: string;

  /** Inclusive integer range 0..100. */
  energy: number;
  /** Inclusive integer range 0..100. */
  bond: number;

  presence: Presence;
  journey: Journey;
  /** Server time of the accepted transition; never supplied by a habitat. */
  updatedAt: string;
}

/** Deliberately non-canonical per-habitat render context. */
export interface HabitatRuntimeContext {
  /** Derived from that habitat's local clock, integer 0..23; never persisted. */
  localHour: number;
  /** The browser/device currently rendering, or null while unavailable. */
  activeDevice: "mobile" | "desktop" | null;
  /** Local-only: pointer/hold progress, animation frame, named anchor and timers. */
  transient: Record<string, never>;
}
```

`HabitatRuntimeContext` is passed alongside, never merged into,
`CreatureState`. `activeDevice` is an observation of a connected renderer;
it cannot change `location`. This prevents a second browser tab from moving
the creature simply by opening it. `location` selects the sole habitat allowed
to render a settled creature; while it is `leaving`, that source remains the
sole renderer only long enough to play its exit (see section 5).

### Defaults

For a fresh Nest, the state is:

```ts
{
  schemaVersion: 1,
  stateRevision: 1,
  location: "desktop",
  mood: "calm",
  behavior: "idle",
  behaviorStartedAt: createdAt,
  energy: 72,
  bond: 64,
  presence: { lastInteractionAt: null, lastLocationChangeAt: createdAt },
  journey: { target: null, startedAt: null },
  updatedAt: createdAt,
}
```

`createdAt` is one server-issued timestamp used consistently for the three
creation-time fields. `nest` means the creature is at its Nest with no web
habitat entitled to render it. `physical` reserves continuity for a future
embodiment; it does not claim any current hardware behaviour. Sprint 01
Device Jump may target only `mobile` and `desktop`.

## 2. Persistence boundary and why each value exists

| Value | Nest persisted? | Necessity visible to a person |
|---|---:|---|
| `schemaVersion`, `stateRevision`, `updatedAt` | Yes | safe recovery and one ordered identity rather than divergent tabs |
| `location` | Yes | exactly one settled habitat may show the creature after refresh or a jump; its source alone renders an in-progress exit |
| `mood` | Yes | calm, happy, sleepy and stressed have distinct low-attention expression |
| `behavior`, `behaviorStartedAt` | Yes | a new habitat can continue/settle the same sleep, contact, arrival or departure rather than start a fresh loop |
| `energy` | Yes | controls rest/crawl/sleep propensity without exposing a meter |
| `bond` | Yes | controls how warmly and how long touch settles; it is not displayed as a score |
| `presence.lastInteractionAt` | Yes | gives the inactivity rule a continuous clock across refreshes |
| `presence.lastLocationChangeAt` | Yes | lets recovery and a reviewer distinguish a current location from a stale local scene |
| `journey` | Yes, only while leaving | retains the requested destination long enough to either commit one jump or safely roll it back |
| `localHour`, `activeDevice`, anchors, pointer/hold progress, CSS/Web Animation timers, rendered pose | No | local geometry and presentation only; none may claim to be creature truth |

Energy is never rendered as a number. It is read as continuous pacing within
the following bands: `80..100` permits the most frequent voluntary crawl,
`45..79` is normal rest/crawl pacing, `20..44` lengthens rests and suppresses
voluntary crawl, and `0..19` makes sleep eligible at the next inactivity
check. Thus a changed value has a renderer/engine consequence, while a person
perceives a living tempo rather than a dashboard metric. Bond similarly maps
to a contact-settle envelope: `0..34` short/guarded, `35..69` normal, and
`70..100` warm/lingering. Exact choreography remains LZ-D01's responsibility.

## 3. Behaviour meanings and invariants

`behavior` is one primary global intent, not an array. There can therefore be
no simultaneous `sleeping` and `hugging`, or `crawling` and `arriving`.
Small visual details (a tail curl, blink, pose interpolation) are renderer
output, not extra state values.

| Behavior | Meaning now | Persistence and maximum/settling rule |
|---|---|---|
| `idle` | baseline quiet presence; normal slow breathing is part of this baseline | indefinite |
| `breathing` | deliberately visible slow stress-breathing; ordinary breathing does **not** need this value | valid only with `mood: "stressed"`; indefinite until mood/interaction changes it |
| `looking` | brief directed glance/look | settles to `idle` after at most 3 s |
| `crawling` | autonomous movement between a habitat's own approved anchors | settles to `idle` after at most 8 s; anchor identity is local-only |
| `sleeping` | inactive/resting creature | indefinite; only interaction or a confirmed jump interrupts it |
| `stroking` | confirmed stroke response | settles to `idle` after input end or at most 2 s |
| `hugging` | confirmed hold/hug response | settles to `idle` after input end or at most 3 s |
| `arriving` | destination has been committed and is entering its current habitat | settles to `idle` after at most 1.2 s |
| `leaving` | source is visibly exiting toward a requested destination | must have a non-null `journey`; source alone renders the exit until commit/rollback by 1.2 s |

The engine or Nest performs a due settlement using `behaviorStartedAt`, even
if the original habitat disappeared. A stale short-lived action never resumes
as a fresh animation after a long refresh: it is atomically reduced to its
settled state before/with the first successful read by a connected engine.

### Mood, energy and bond rules

- `calm` is the default and permits `idle`, `looking`, `crawling`, contact and
  jump behaviours.
- `happy` is a touch response, not a fifth animation. A stroke or hug sets it;
  it settles to `calm` when that contact behaviour settles, unless another
  accepted transition has changed mood first.
- `sleepy` is entered by the inactivity rule and must use `sleeping` after the
  current interruptible action has settled. `sleeping` requires `mood` to be
  `sleepy`; waking interaction returns mood to `calm`.
- `stressed` is only supplied by an explicit Nest-approved source in this
  sprint (for example a controlled prototype event); it is never inferred
  from clock time or user data. If current behavior is `idle`, it atomically
  becomes `stressed`/`breathing`. If it is `looking`, `crawling`, `stroking`,
  `hugging`, or `arriving`, the stress request is rejected with no queued
  write; its source may submit again only after that behavior settles. If it
  is `sleeping` or `leaving`, it is likewise rejected: stress never wakes a
  creature and never changes an active journey. A request while already
  `stressed`/`breathing` is an idempotent no-op: it returns the current state
  without a write or `stateRevision` change.
- Confirmed contact always calms stress deterministically. A stroke or hug
  changes `stressed`/`breathing` to its normal `happy` contact state; when the
  contact ends or reaches its cap, it settles to `calm`/`idle`. It never
  resumes `breathing` from a hidden, unrepresented pending-stress state.
- A confirmed stroke increments bond by 1, clamped to 100. A confirmed hug
  increments bond by 2, clamped to 100. Both set `lastInteractionAt`.
- The first inactivity check at least 180 s after `lastInteractionAt` (or
  Nest creation when it is null) may reduce energy by 3, clamped to 0, set
  mood to `sleepy`, and enter `sleeping`. It occurs once per sleeping episode,
  not on every client poll. A new interaction ends that episode; no background
  physiology or unbounded energy decay is introduced.
- Contact may wake a sleeping creature. It has priority over `sleeping`; the
  state becomes `stroking`/`hugging`, mood `happy`, and then settles to
  `idle`/`calm`. A jump may also interrupt sleep. No other autonomous action
  may do so.

The Nest timestamps and clamps these changes. Habitats may request an intent,
but cannot send client time, increments, or an arbitrary complete state.

## 4. Legal transitions and conflict resolution

Priority is deterministic: **validated jump > active confirmed contact >
explicit stress state > due settlement/inactivity > voluntary autonomy**.
Within the same priority, the request with the current `expectedRevision`
wins; a stale request is rejected rather than merged.

| Event / authority | Legal precondition | Atomic Nest result |
|---|---|---|
| Nest creates/migrates state | no valid v1 row | defaults/migrated values, `idle`, revision increment |
| Habitat reports confirmed stroke | `actor` equals current mobile/desktop `location`; not leaving | `stroking`, `happy`, bond +1, update interaction time |
| Habitat reports confirmed hug | same as stroke | `hugging`, `happy`, bond +2, update interaction time |
| Habitat reports contact end | `actor` equals current location; current behavior is stroke/hug | settle according to mood rules |
| Behaviour engine requests look/crawl | `actor` equals current location; current behavior is `idle`; mood is calm/happy; energy >=20 | requested behaviour with server start time |
| Behaviour engine performs inactivity | current behavior is interruptible/idle; inactivity >=180 s | one episode: energy -3, `sleepy`, `sleeping` |
| Nest-approved stress event | source is authorised and actor equals current location; state is either `idle` or already `stressed`/`breathing` | from `idle`, atomically enter `stressed`/`breathing`; from existing `stressed`/`breathing`, return an idempotent no-op with no write/revision change; all other states reject, never queue |
| Jump start | `actor` equals current source mobile/desktop location; no current journey | preserve source `location`; `leaving`; set journey target/start |
| Jump commit | `actor` equals the retained source location; current behavior `leaving`, target matches journey, deadline not expired | set `location` to target; clear journey; set `arriving`; set location-change time |
| Jump cancel/timeout | `actor` equals retained source for cancel; current behavior `leaving` | retain source location; clear journey; settle to `idle` (or `breathing` if stressed) |
| Due short-action settlement | current behavior has exceeded its table duration | settle to `idle`, or `breathing` for stressed; clear no additional state |

Any event not listed is rejected with no write. In particular: a habitat
cannot directly set `location`, overwrite `energy`/`bond`, set an arbitrary
behavior while another is active, or make itself active by changing runtime
context. During `leaving`, the source still visibly plays its one exit and the
target stays absent. On commit, the source hides and the new location alone
renders `arriving`; on rollback, the target remains absent and the source
settles visibly at its retained location. This is the no-duplicate rule.

## 5. Device Jump, refresh and reconnect

1. Source submits `jump.start(target)` with its `actor`. Nest validates that
   actor against the current source location, retains that location, stores
   the target in `journey`, and marks behavior `leaving`.
2. Until commit or rollback, only the source renderer visibly plays its local
   exit. The target renders nothing because `location` still names the source.
3. Source submits `jump.commit(target)` after its exit. Nest atomically sets
   the new location, clears the journey, sets `arriving`, timestamps the
   location change, and the source then hides.
4. A polling/reconnected target observes the committed location and performs
   its local arrival. It then requests due settlement to `idle`.

On refresh or reconnect, the client first discards its temporary pose,
anchor and timers, fetches the complete Nest state, and renders only if its
habitat equals `location`. It preserves location, mood, energy, bond,
presence, and any still-valid behaviour/journey. If a short behavior has
already expired, it requests/receives its deterministic settled state instead
of replaying it. A refreshed source in a still-valid `leaving` state resumes
only the remaining exit; it does not hide prematurely. If that journey cannot
commit by 1.2 s, the Nest rolls back to the original location and the source
settles visibly there; it must never guess that the target received the
creature. An unreachable Nest may render an honest offline/unconfirmed state
but may not persist a local state or claim a Device Jump succeeded.

## 6. API contract, validation and migration

The endpoint remains `GET`/`PUT /api/v1/nest`; success remains
`{ "status": "success", "data": CreatureState }` and errors remain JSON with
`status: "error"` and `message`. `GET` always returns the complete v1 state.

The canonical mutation envelope for implementation is:

```ts
type NestAction =
  | { type: "interaction.stroke" | "interaction.hug" | "interaction.end" }
  | { type: "autonomy.behavior"; behavior: "looking" | "crawling" }
  | { type: "nest.mood"; mood: "stressed" }
  | { type: "jump.start" | "jump.commit" | "jump.cancel"; target: "mobile" | "desktop" };

interface NestMutationV1 {
  schemaVersion: 1;
  expectedRevision: number;
  /** Habitat that observed and originated this action, never a target guess. */
  actor: "mobile" | "desktop";
  action: NestAction;
}
```

`expectedRevision` and `actor` are required for canonical habitat writes. The
Nest validates `actor === state.location` for contact, autonomy and every
jump phase; `jump.commit`/`jump.cancel` therefore remain source actions until
the location changes. `actor` establishes habitat locality, not an end-user
identity or an authorization system. A Nest-approved stress source must also
be separately authorised: it may atomically enter stress only from `idle`,
returns an idempotent no-op without a write/revision change from existing
`stressed`/`breathing`, and is rejected without queueing in every other state.
A revision mismatch returns HTTP 409 with the current complete `CreatureState`
in `data`; the client must refetch and deliberately retry its intent. Invalid
type, enum, range, precondition or illegal conflict returns HTTP 400 with no
write. The Nest, not a caller, emits all timestamps, clamps counters and
increments `stateRevision` in the same transaction.

The current unversioned partial `PUT` payload is a compatibility surface for
the existing Habitat during LZ-006 migration only. It must retain the endpoint
and old callers, validate every value, map legacy `behavior: "resting"` to
`idle`, and reduce valid legacy requests through the same transition rules;
it must not become a bypass for arbitrary field replacement. New LZ-002 work
uses `NestMutationV1` only.

Schema versions are explicit:

- A v1 reader rejects an incoming mutation whose `schemaVersion` is absent
  (except the compatibility path), non-integer, or not `1` with HTTP 400.
- A future incompatible shape receives a new `/api/v2/` contract; it is never
  silently coerced by a v1 client.
- LZ-006 migrates a legacy database row atomically before serving it. It maps
  `resting` to `idle`; retains valid legacy location/mood/energy/bond;
  defaults invalid/missing values; creates `presence`, `journey`, behavior
  timing and metadata; and emits a valid v1 state. Legacy timestamps are
  parsed to UTC when possible, otherwise replaced by migration time. No old
  database is discarded.

## 7. Explicit non-goals

- No Apple Watch, heart rate, HRV, physiological sensor, weather, calendar,
  AI emotion inference, or new mood vocabulary.
- No numerical state panel, state debug UI, toast-driven behavior, chat-first
  input, or new screen/control design.
- No native desktop-pet, physical actuator, hardware or network-presence
  claim. `physical` is a continuity reservation only.
- No per-habitat persistent mood/location/energy state, local Device Jump
  success, hidden random state, or parallel creature instance.
- No implementation change in this task. LZ-002 consumes the render/engine
  boundary; LZ-006 implements database/API enforcement; LZ-D01 supplies the
  visual choreography that makes these values perceptible.

## 8. Review checklist for LZ-D01 and LZ-002

- For each choreographed behaviour, can the Designer point to one legal
  `CreatureState` and event in this document?
- For every persisted variable, can its effect be noticed without displaying a
  metric? If not, remove it rather than add a diagnostic UI.
- Does the renderer use `CreatureState → Behaviour Engine → Behaviour
  Controller → Habitat Renderer`, with local context only at the final layer?
- Does a leaving source remain visibly present only for its actual exit, while
  the target stays absent until commit; does commit hide the source and does
  rollback visibly restore it? If not, reject the implementation.
- Does every habitat-issued contact/autonomy/jump action identify an `actor`
  that the Nest validates against `location`, and does stressed contact settle
  deterministically to `calm`/`idle`? If not, reject the implementation.
