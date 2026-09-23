# LZ-D01 — LIIZOOO Behaviour Choreography

**Status:** submitted for Architect / Critic review  
**Scope:** the nine canonical behaviours in `CREATURE_STATE.md`. This is a
rendering and interaction choreography sheet, not a UI, API, or state-contract
change.

## Choreographic contract

The Nest is the source of every `CreatureState`. A habitat reads that state,
passes it through the Behaviour Engine and Behaviour Controller, and renders
the resulting choreography in its own geometry:

```text
CreatureState -> Behaviour Engine -> Behaviour Controller -> Habitat Renderer
```

Local pointer position, anchor coordinates, animation progress and timers may
shape a pose but must never create a second mood, location, behaviour, energy,
bond, journey, or transition. `location` decides which habitat may render the
creature. During `leaving`, its retained source alone renders the actual exit;
the source hides only on commit, while the target waits for committed
`arriving`. This continuity is part of the behaviour, not a UI notification.

The state model has one primary `behavior`; therefore the listed behaviours
are mutually exclusive. Renderer details such as a tail curl, an eyelid pose,
or a breathing scale are not independent state values. A short behaviour that
is stale on read is settled by the Nest/engine as specified by LZ-001; a
renderer never replays it merely because it mounted late.

### Readable, low-attention state cues

These are continuous render parameters, not meters, labels, badges, toasts, or
controls:

| Canonical value | Perceptible consequence |
|---|---|
| `mood: calm` | open, neutral posture and unhurried pacing |
| `mood: happy` | warmer, more receptive contact-settle pose; no numeric reward |
| `mood: sleepy` + `behavior: sleeping` | closed eyes, curled compact rest pose |
| `mood: stressed` + `behavior: breathing` | visibly slower, deeper breathing and guarded posture |
| `energy: 80..100` | voluntary crawl may occur more often |
| `energy: 45..79` | ordinary rest/crawl rhythm |
| `energy: 20..44` | longer rests and no voluntary crawl urgency |
| `energy: 0..19` | inactivity can resolve into sleep; energy itself is never displayed |
| `bond: 0..34 / 35..69 / 70..100` | respectively guarded/brief, ordinary, or warm/lingering contact-settle envelope |
| `location`, `journey`, `presence` | one unambiguous habitat and a continuous, naturally timed departure, arrival, and rest cycle across refresh/reconnect |

`schemaVersion`, `stateRevision`, `behaviorStartedAt`, `updatedAt`, and the
timestamp members of `presence`/`journey` are continuity metadata rather than
emotional signals. Their visible necessity is that a habitat restores the
correct ongoing or settled behaviour instead of inventing a new creature after
refresh. They must not be exposed as diagnostic UI.

## Shared renderer and accessibility rules

- **No diagnostic language:** do not add a state panel, numerical stress or
  bond score, toast, chat prompt, control tray, or text narration to explain a
  behaviour. Direct touch of the creature is the interaction surface.
- **Mobile:** retain a comfortable edge-resting silhouette and keep all motion
  inside the visible safe area. Use the same canonical state; do not make a
  mobile-only mood or touch state.
- **Desktop:** use the habitat's approved local anchors (paper/window edge,
  taskbar, screen edge). Anchors are presentation only and are never persisted.
- **Reduced motion:** when `prefers-reduced-motion: reduce` is active, retain
  the canonical duration and settlement/interrupt timing but replace travel,
  loops, scaling, and repeated blinking with one immediate or gently faded
  static key pose. Examples: sleeping is closed-eye/curl; stress is a slightly
  expanded chest; arriving is a short opacity fade at the destination edge;
  leaving is a near-edge exit pose that remains on the source until commit or
  rollback. Do not substitute a label, and do not skip the Nest transition.
- **Interaction alternatives:** stroke and hug require direct pointer/touch
  interaction with the creature. Keyboard activation of a focused creature
  may submit the same canonical interaction intent; it must not introduce a
  separate behaviour. Focus indication may be visible around the creature but
  is not a status control.
- **Absent/offline state:** if the Nest cannot confirm state, do not locally
  claim a contact or Device Jump completed. An existing last-confirmed pose can
  remain visually quiet only when it is plainly non-confirmatory; it must not
  turn into a second creature.

## Canonical behaviour sheets

### 1. Idle

**Trigger**  
Nest state is `behavior: "idle"` at the current `location`, whether from
creation, normal settlement, or a previously restored valid state.

**Internal State Change**  
No new change is made by the renderer. The settled state is `behavior: "idle"`;
`mood`, `energy`, `bond`, and presence values remain as supplied by the Nest.

**Visible Behaviour**  
An open, settled posture with a very small, unforced chest/body rise and fall.
The creature remains anchored rather than seeking attention. The ordinary
breathing here is the idle baseline and is not `behavior: "breathing"`.

**Duration**  
Indefinite, until a legal Nest transition starts another canonical behaviour.

**Interrupt Condition**  
Any accepted higher-priority contact, jump, approved stress state, or legal
engine request for `looking`/`crawling`. Inactivity can enter sleep only under
the canonical 180-second rule.

**User Perception**  
“It is quietly here,” not “the page is waiting for input.”

**Mobile / Desktop Renderer Notes**  
On mobile, rest along a screen edge with enough body visible to read the
breath. On desktop, rest at the currently selected local anchor; no anchor is
saved into creature state.

### 2. Look / blink

**Trigger**  
The Behaviour Engine requests `autonomy.behavior` with `behavior: "looking"`
only while Nest state is `idle`, mood is `calm` or `happy`, energy is at least
20, and its `actor` equals the current mobile/desktop `location`.

**Internal State Change**  
On Nest acceptance, `behavior` becomes `looking` and `behaviorStartedAt` is
server-issued. Mood, energy, bond, location, and presence do not change.

**Visible Behaviour**  
One gentle eye close/open (or a small head/upper-body turn toward a local
pointer direction when available), then a return to the idle facing. The
pointer only supplies a local direction; it does not create a persistent
“watching” state.

**Duration**  
At most 3 seconds, then canonical due settlement to `idle`.

**Interrupt Condition**  
Accepted stroke, hug, jump, or normal due settlement. A stress request during
`looking` is rejected rather than queued. A second autonomous look/crawl is
not layered on top.

**User Perception**  
“It noticed something,” without demanding a response.

**Mobile / Desktop Renderer Notes**  
On mobile, use a small gaze/head shift that stays inside the edge-rest pose.
On desktop, gaze may orient toward the pointer but must not chase it or leave
the current anchor.

### 3. Crawl

**Trigger**  
The Behaviour Engine requests `autonomy.behavior` with `behavior: "crawling"`
only from `idle`, with mood `calm` or `happy`, energy at least 20, its `actor`
equal to the current mobile/desktop `location`, and approved local anchors
providing a valid destination.

**Internal State Change**  
On Nest acceptance, `behavior` becomes `crawling` with server-issued
`behaviorStartedAt`. Anchor identity, path, and progress remain local-only.

**Visible Behaviour**  
One measured, short movement from the current presentation anchor to one other
approved local anchor. The body leads, feet/tail follow, and it pauses in a
settled posture at the destination. It is never a continuous roaming loop.

**Duration**  
At most 8 seconds, including the destination settle, then canonical due
settlement to `idle`. Higher energy permits a more frequent future crawl, not
a faster gait.

**Interrupt Condition**  
An accepted stroke, hug, or jump halts the path at the nearest safe visible
pose before rendering the newly accepted behaviour. A stress request during
`crawling` is rejected rather than queued. Due settlement also stops the path;
the renderer must place a safe local rest pose rather than leave the creature
between anchors.

**User Perception**  
“It chose a different place to be,” rather than “an illustration is looping.”

**Mobile / Desktop Renderer Notes**  
Mobile movement is a short edge-to-edge reposition entirely within its safe
area. Desktop movement is only among paper/window edge, taskbar, and screen
edge; these are renderer anchors, never `CreatureState` values.

### 4. Sleep

**Trigger**  
The Nest's first eligible inactivity check occurs at least 180 seconds after
`presence.lastInteractionAt` (or creation when null), the current behaviour is
interruptible or idle, and the canonical once-per-sleeping-episode rule allows
it.

**Internal State Change**  
Atomically reduce `energy` by 3 (floor 0), set `mood: "sleepy"`, set
`behavior: "sleeping"`, and issue `behaviorStartedAt`. No renderer makes this
decision locally.

**Visible Behaviour**  
Eyes ease closed, the body settles lower and more compact, and the tail curls
nearer to the body. Breathing becomes visibly quieter/smaller than idle, not
absent. Nothing asks the person to wake it.

**Duration**  
Indefinite until a legal interaction or confirmed Device Jump. Refresh and
reconnect restore the same sleep pose when the habitat equals `location`.

**Interrupt Condition**  
Only an accepted stroke, accepted hug, or confirmed jump. Contact takes
priority: it changes state to `stroking`/`hugging` and `mood: "happy"`; after
that contact settles it becomes `idle`/`calm`. Autonomous look or crawl cannot
wake sleep.

**User Perception**  
“It fell asleep while things were quiet,” not “an inactivity timeout fired.”

**Mobile / Desktop Renderer Notes**  
On mobile, sleep in a compact edge-safe resting pose. On desktop, sleep at the
last valid local anchor; a restored sleep must not jump to a new anchor merely
because the page reloaded.

### 5. Stroke

**Trigger**  
The current habitat directly confirms a stroke with `actor` equal to the
current mobile/desktop `location`, and the creature is not `leaving`.

**Internal State Change**  
The Nest sets `behavior: "stroking"`, `mood: "happy"`, increments `bond` by 1
(maximum 100), updates `presence.lastInteractionAt`, and issues
`behaviorStartedAt`. If the prior state was `stressed`/`breathing`, this is an
explicit calm: contact end or cap settles to `calm`/`idle`, never back to
`breathing`.

**Visible Behaviour**  
The body leans gently into the stroke direction; eyes soften or briefly close;
the tail loosens toward the user. The response is direct and small, never a
reward burst. Bond controls its settle envelope: guarded/brief at 0–34,
ordinary at 35–69, warm/lingering at 70–100.

**Duration**  
Until `interaction.end` from the same actor that still equals current `location`,
or at most 2 seconds; it then settles to `idle` and `calm` unless a later
accepted transition says otherwise.

**Interrupt Condition**  
An accepted jump has priority. A new accepted hug replaces the current contact
under the state model's active-confirmed-contact priority. Due settlement or
input end returns it as above; an autonomous behaviour never overlays it.

**User Perception**  
“It felt my touch and relaxed into it,” without a visible affection score.

**Mobile / Desktop Renderer Notes**  
Mobile accepts a direct head-to-tail stroke across the creature. Desktop maps
the same direct pointer stroke to the body, with no separate control. In both,
the route is local input only; the Nest-confirmed response is the truth.

### 6. Hug

**Trigger**  
The current habitat directly confirms a hug with `actor` equal to the current
mobile/desktop `location`, and the creature is not `leaving`. For Mobile
Habitat, the existing task contract defines this as a 550 ms hold; desktop can
use the equivalent confirmed direct hold on the creature.

**Internal State Change**  
The Nest sets `behavior: "hugging"`, `mood: "happy"`, increments `bond` by 2
(maximum 100), updates `presence.lastInteractionAt`, and issues
`behaviorStartedAt`. If the prior state was `stressed`/`breathing`, this is an
explicit calm: contact end or cap settles to `calm`/`idle`, never back to
`breathing`.

**Visible Behaviour**  
The body gathers inward toward the held point, arms/forebody close in, then
rests with a small, warm settling breath. At high bond the release lingers;
at low bond it remains gentle but shorter and more guarded. Mobile may provide
best-effort vibration after confirmed hug; failure is silent and does not
change canonical state.

**Duration**  
Until `interaction.end` from the same actor that still equals current `location`,
or at most 3 seconds; it then settles to `idle` and `calm` unless another
accepted transition has intervened.

**Interrupt Condition**  
An accepted jump has priority. A valid contact transition can replace it;
otherwise input end or due settlement ends it. No autonomous movement occurs
while hugging.

**User Perception**  
“It accepted a brief closeness,” not “I activated a feature.”

**Mobile / Desktop Renderer Notes**  
Mobile uses the 550 ms hold and optional haptic only as confirmation texture,
not a separate state. Desktop uses an equivalent direct hold and renders the
same inward settle without adding a button or modal.

### 7. Stress breathing

**Trigger**  
An explicit Nest-approved and separately authorised source submits the stress
event with `actor` equal to the current mobile/desktop `location`, while the
canonical behaviour is exactly `idle`. Stress is neither inferred from the
clock nor from user data. If state is already `stressed`/`breathing`, the same
event is an idempotent no-op with no revision change. Every other state
(`looking`, `crawling`, `stroking`, `hugging`, `arriving`, `sleeping`, or
`leaving`) rejects it with no queued write; the source may submit again only
when a later state is `idle`.

**Internal State Change**  
The Nest atomically changes mood to `stressed` and behaviour to `breathing`.
A repeated `stressed`/`breathing` event is an idempotent no-op with no revision
change, never a queued state. Energy, bond, location, and presence do not
change merely because stress is rendered.

**Visible Behaviour**  
Breaths are slower and deeper than idle, with a restrained chest/body expansion
and a slightly guarded, lower posture. It stays present and quiet: no shaking,
alarm colour, flashing, or distress message. It is visibly distinct from
ordinary idle breathing by depth and held exhale, not by frantic speed.

**Duration**  
Indefinite while `mood: "stressed"` and `behavior: "breathing"`. It survives
refresh/reconnect as a continuous state.

**Interrupt Condition**  
An accepted stroke or hug deterministically calms stress: it enters the normal
`happy` contact state and settles to `calm`/`idle` on input end or cap; it
never resumes `breathing` from an unrepresented pending stress state. An
accepted jump also takes priority; normal `looking` or `crawling` does not
replace stress breathing.

**User Perception**  
“Something feels a little tense, so it is taking slow breaths,” without a
diagnosis, score, or explanation.

**Mobile / Desktop Renderer Notes**  
On mobile, make depth legible through a contained body/chest change rather
than large scaling. On desktop, preserve the current anchor and use the same
slow rhythm; stress never causes unprompted travel.

### 8. Arrive

**Trigger**  
The retained source submits `jump.commit(target)` with `actor` equal to the
retained source `location`, while state is `leaving`, the target matches
`journey.target`, and the 1.2-second deadline remains valid.

**Internal State Change**  
Atomically set `location` to the target, clear `journey`, set
`behavior: "arriving"`, update `presence.lastLocationChangeAt`, and issue
`behaviorStartedAt`. The source no longer renders; only the committed target
may render.

**Visible Behaviour**  
The creature appears just inside a habitat-appropriate edge and makes one
small settling step/breath inward. It does not pop into a central card or show
a “connected” message.

**Duration**  
At most 1.2 seconds, then canonical due settlement to `idle` (or `breathing`
when the applicable stressed settlement rule requires it).

**Interrupt Condition**  
Normal due settlement. A new accepted interaction or later legal transition
uses LZ-001's priority rules; the old source cannot continue an exit after the
commit.

**User Perception**  
“The same creature has come here,” not “another device loaded a copy.”

**Mobile / Desktop Renderer Notes**  
Mobile enters from a screen edge into its edge-rest zone. Desktop enters from
the screen edge then settles to a local approved anchor. A target that has not
yet observed committed `location` remains empty; it must never pre-play this
behaviour.

### 9. Leave

**Trigger**  
The source habitat submits `jump.start(target)` with `actor` equal to the
current source `location` (`mobile` or `desktop`) and no current journey.

**Internal State Change**  
The Nest preserves source `location`, records the target and start time in
`journey`, and sets `behavior: "leaving"` with server-issued
`behaviorStartedAt`. The target's location is not set yet.

**Visible Behaviour**  
On the source only, the creature turns toward the nearest appropriate exit edge
and visibly plays its one exit. It may reach and hold a near-edge exit pose,
but remains rendered on the retained source until commit or rollback. The
target stays absent throughout this state.

**Duration**  
Commit or rollback must occur within 1.2 seconds. On a valid commit, the
source hides and arrival begins at the target. On cancel/timeout, the Nest
retains source location, clears journey, and visibly settles the source to
`idle` (or `breathing` if stressed); the target remains absent.

**Interrupt Condition**  
The active journey controls the state: arbitrary contact and autonomous
behaviours are rejected while leaving. The only permitted resolution is
`jump.commit` or `jump.cancel` from the retained-source actor, or timeout
rollback as defined by LZ-001.

**User Perception**  
“It left this place before appearing somewhere else,” including an honest,
visible settling back at the source if the transfer cannot complete.

**Mobile / Desktop Renderer Notes**  
Mobile exits through a screen edge; desktop exits through its screen edge, not
through an unrelated UI element. If reduced motion is enabled, fade toward a
near-edge exit pose but retain it on the source until the same Nest
commit/rollback sequence resolves; never use that fade to hide early.

## LZ-001 design cross-review

**PASS**

**Evidence:**

- Each of the nine required visible behaviours maps to a single legal
  canonical `behavior`, its state transition authority, duration, and
  interruption path in LZ-001.
- `mood`, `energy`, `bond`, `location`, `presence`, and `journey` each have a
  low-attention perceptual consequence without adding a metric or diagnostic
  surface; technical version/revision/timing data preserve continuity rather
  than ask the user to interpret them.
- The one-primary-behaviour invariant resolves all specified conflicts,
  including sleeping versus contact and departure versus rendering, while the
  Device Jump contract prevents duplicate creatures during refresh or timeout.
- The contract keeps renderer-only values (pointer direction, anchors, paths,
  timers, and poses) outside the Nest, allowing separate Mobile and Desktop
  choreography without divergent creature state.

**Implementation handoff constraints:** LZ-002 must consume canonical state
and actions only, retain these duration/interrupt ceilings, and use local
geometry solely in the final renderer. No new mood, behaviour, persistent
field, screen, or control is authorised by this specification.
