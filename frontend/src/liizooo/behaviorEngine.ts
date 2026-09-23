import type {
  Behavior,
  CreatureState,
  EngineClock,
  EngineTime,
  HabitatActor,
  Location,
  Mood,
  RandomSource,
} from './creatureState.js'

export type CreatureEvent =
  | { type: 'TICK'; actor: HabitatActor }
  | { type: 'USER_INTERACTION'; actor: HabitatActor; interaction: 'stroke' | 'hug' }
  | { type: 'STROKE_START'; actor: HabitatActor }
  | { type: 'STROKE_END'; actor: HabitatActor }
  | { type: 'HUG_START'; actor: HabitatActor }
  | { type: 'HUG_END'; actor: HabitatActor }
  /** `inactiveSince` is Nest creation time when no interaction exists. */
  | { type: 'INACTIVITY_THRESHOLD'; inactiveSince: string }
  | { type: 'STRESS_SESSION_START'; actor: HabitatActor; authorized: boolean }
  | { type: 'STRESS_SESSION_END'; actor: HabitatActor; authorized: boolean }
  | { type: 'DEVICE_JUMP_REQUESTED'; actor: HabitatActor; target: HabitatActor }
  | { type: 'DEVICE_LEAVE_COMPLETED'; actor: HabitatActor; target: HabitatActor }
  | { type: 'DEVICE_ARRIVE_COMPLETED'; actor: HabitatActor }
  | { type: 'REFRESH_RESTORED'; state: CreatureState }

export type EffectCommand =
  | { type: 'BEHAVIOUR_CHANGED'; behavior: Behavior }
  | { type: 'JOURNEY_STARTED'; target: HabitatActor }
  | { type: 'JOURNEY_COMMITTED'; target: HabitatActor }
  | { type: 'JOURNEY_ROLLED_BACK' }

export interface TransitionInput {
  state: CreatureState
  event: CreatureEvent
  /** Injected: the engine never reads the wall clock itself. */
  clock: EngineClock
  /** Injected/seedable: used only for voluntary idle autonomy. */
  random: RandomSource
}

export interface TransitionResult {
  previousState: CreatureState
  nextState: CreatureState
  /** The exact accepted or rejected event; callers never infer it from state. */
  event: CreatureEvent
  accepted: boolean
  /** True only when an accepted event made a canonical state change. */
  changed: boolean
  reason: string
  commands?: readonly EffectCommand[]
}

type TransitionOutcome = Omit<TransitionResult, 'event'>

const SECOND = 1_000
const INACTIVITY_MS = 180 * SECOND
const JUMP_MS = 1_200
const MAX_DURATION_MS: Partial<Record<Behavior, number>> = {
  looking: 3 * SECOND,
  crawling: 8 * SECOND,
  stroking: 2 * SECOND,
  hugging: 3 * SECOND,
  arriving: JUMP_MS,
}

const LOCATIONS: readonly Location[] = ['mobile', 'desktop', 'nest', 'physical']
const MOODS: readonly Mood[] = ['calm', 'happy', 'sleepy', 'stressed']
const BEHAVIORS: readonly Behavior[] = [
  'idle', 'breathing', 'looking', 'crawling', 'sleeping',
  'stroking', 'hugging', 'arriving', 'leaving',
]

function timestampMs(iso: string): number | null {
  const value = Date.parse(iso)
  return Number.isFinite(value) ? value : null
}

function stateIsValid(state: CreatureState): boolean {
  if (state.schemaVersion !== 1 || !Number.isInteger(state.stateRevision) || state.stateRevision < 1) return false
  if (!LOCATIONS.includes(state.location) || !MOODS.includes(state.mood) || !BEHAVIORS.includes(state.behavior)) return false
  if (!Number.isInteger(state.energy) || state.energy < 0 || state.energy > 100) return false
  if (!Number.isInteger(state.bond) || state.bond < 0 || state.bond > 100) return false
  if (timestampMs(state.behaviorStartedAt) === null || timestampMs(state.updatedAt) === null) return false
  if (timestampMs(state.presence.lastLocationChangeAt) === null) return false
  if (state.presence.lastInteractionAt !== null && timestampMs(state.presence.lastInteractionAt) === null) return false
  if (state.behavior === 'breathing' && state.mood !== 'stressed') return false
  if (state.behavior === 'sleeping' && state.mood !== 'sleepy') return false
  if (state.behavior === 'leaving') {
    return state.journey.target !== null && state.journey.startedAt !== null && timestampMs(state.journey.startedAt) !== null
  }
  return state.journey.target === null && state.journey.startedAt === null
}

function result(
  previousState: CreatureState,
  nextState: CreatureState,
  accepted: boolean,
  reason: string,
  commands?: readonly EffectCommand[],
): TransitionOutcome {
  return { previousState, nextState, accepted, changed: previousState !== nextState, reason, ...(commands?.length ? { commands } : {}) }
}

function reject(state: CreatureState, reason: string): TransitionOutcome {
  return result(state, state, false, reason)
}

function acceptNoop(state: CreatureState, reason: string): TransitionOutcome {
  return result(state, state, true, reason)
}

function patch(state: CreatureState, now: EngineTime, changes: Partial<CreatureState>): CreatureState {
  return {
    ...state,
    ...changes,
    stateRevision: state.stateRevision + 1,
    updatedAt: now.iso,
  }
}

function behaviorPatch(
  state: CreatureState,
  now: EngineTime,
  behavior: Behavior,
  changes: Partial<CreatureState> = {},
): CreatureState {
  return patch(state, now, { ...changes, behavior, behaviorStartedAt: now.iso })
}

function actorCanAct(state: CreatureState, actor: HabitatActor): boolean {
  return state.location === actor
}

function isDue(state: CreatureState, now: EngineTime, behavior: Behavior): boolean {
  const duration = MAX_DURATION_MS[behavior]
  const started = timestampMs(state.behaviorStartedAt)
  return duration !== undefined && started !== null && now.epochMs - started >= duration
}

function settle(state: CreatureState, now: EngineTime): CreatureState {
  const behavior: Behavior = state.mood === 'stressed' ? 'breathing' : 'idle'
  const mood: Mood = state.mood === 'happy' || state.mood === 'sleepy' ? 'calm' : state.mood
  return behaviorPatch(state, now, behavior, { mood, journey: { target: null, startedAt: null } })
}

function contactStart(
  state: CreatureState,
  now: EngineTime,
  actor: HabitatActor,
  interaction: 'stroke' | 'hug',
): TransitionOutcome {
  if (!actorCanAct(state, actor)) return reject(state, 'actor is not the current habitat')
  if (state.behavior === 'leaving') return reject(state, 'active Device Jump cannot be interrupted by contact')
  const behavior: Behavior = interaction === 'stroke' ? 'stroking' : 'hugging'
  const bondIncrease = interaction === 'stroke' ? 1 : 2
  const next = behaviorPatch(state, now, behavior, {
    mood: 'happy',
    bond: Math.min(100, state.bond + bondIncrease),
    presence: { ...state.presence, lastInteractionAt: now.iso },
  })
  return result(state, next, true, `${interaction} confirmed`, [{ type: 'BEHAVIOUR_CHANGED', behavior }])
}

function contactEnd(state: CreatureState, now: EngineTime, actor: HabitatActor, interaction: 'stroke' | 'hug'): TransitionOutcome {
  if (!actorCanAct(state, actor)) return reject(state, 'actor is not the current habitat')
  const expected: Behavior = interaction === 'stroke' ? 'stroking' : 'hugging'
  if (state.behavior !== expected) return reject(state, `${interaction} is not active`)
  const next = settle(state, now)
  return result(state, next, true, `${interaction} settled`, [{ type: 'BEHAVIOUR_CHANGED', behavior: next.behavior }])
}

function inactivity(state: CreatureState, now: EngineTime, inactiveSince: string): TransitionOutcome {
  if (state.behavior === 'sleeping') return acceptNoop(state, 'sleeping episode is already active')
  if (state.behavior !== 'idle') return reject(state, 'inactivity waits for the active behaviour to settle')
  // LZ-001 requires Nest creation time when lastInteractionAt is null. That
  // value is deliberately not derivable from location-change time, so the
  // event carries it from the Nest timing boundary instead of guessing here.
  const lastInteractionMs = timestampMs(state.presence.lastInteractionAt ?? inactiveSince)
  if (lastInteractionMs === null || now.epochMs - lastInteractionMs < INACTIVITY_MS) return reject(state, 'inactivity threshold has not elapsed')
  const next = behaviorPatch(state, now, 'sleeping', {
    mood: 'sleepy',
    energy: Math.max(0, state.energy - 3),
  })
  return result(state, next, true, 'inactivity entered one sleeping episode', [{ type: 'BEHAVIOUR_CHANGED', behavior: 'sleeping' }])
}

function autonomy(state: CreatureState, now: EngineTime, actor: HabitatActor, random: RandomSource): TransitionOutcome {
  if (!actorCanAct(state, actor)) return reject(state, 'autonomy actor is not the current habitat')
  if (state.behavior !== 'idle') return reject(state, 'autonomy requires idle behaviour')
  if ((state.mood !== 'calm' && state.mood !== 'happy') || state.energy < 20) return reject(state, 'autonomy is not eligible for this mood or energy')
  const sample = Math.min(0.999_999, Math.max(0, random()))
  // Sparse decisions leave the creature quietly idle; a seeded source makes this reproducible.
  if (sample >= 0.15) return acceptNoop(state, 'autonomy chose quiet idle')
  const behavior: Behavior = sample < 0.10 ? 'looking' : 'crawling'
  const next = behaviorPatch(state, now, behavior)
  return result(state, next, true, `autonomy chose ${behavior}`, [{ type: 'BEHAVIOUR_CHANGED', behavior }])
}

function tick(state: CreatureState, now: EngineTime, actor: HabitatActor, random: RandomSource): TransitionOutcome {
  if (state.behavior === 'leaving') {
    const started = state.journey.startedAt === null ? null : timestampMs(state.journey.startedAt)
    if (started !== null && now.epochMs - started >= JUMP_MS) {
      const next = settle(state, now)
      return result(state, next, true, 'Device Jump timed out and rolled back', [{ type: 'JOURNEY_ROLLED_BACK' }, { type: 'BEHAVIOUR_CHANGED', behavior: next.behavior }])
    }
    return acceptNoop(state, 'Device Jump exit remains in progress')
  }
  if (isDue(state, now, state.behavior)) {
    const next = settle(state, now)
    return result(state, next, true, 'short behaviour reached its settlement deadline', [{ type: 'BEHAVIOUR_CHANGED', behavior: next.behavior }])
  }
  return autonomy(state, now, actor, random)
}

/**
 * Deterministic, side-effect-free life-logic reducer. A Nest adapter may use
 * accepted results to request persistence, but this function never performs I/O.
 */
export function transition(input: TransitionInput): TransitionResult {
  const { state, event, clock, random } = input
  const now = clock.now()
  const outcome = (() => {
    if (!stateIsValid(state)) return reject(state, 'current CreatureState violates the v1 contract')
    if (!Number.isFinite(now.epochMs) || timestampMs(now.iso) === null) return reject(state, 'injected clock returned an invalid time')

    switch (event.type) {
    case 'REFRESH_RESTORED':
      if (!stateIsValid(event.state)) return reject(state, 'restored CreatureState violates the v1 contract')
      return result(state, event.state, true, 'restored canonical persistent state')
    case 'TICK':
      return tick(state, now, event.actor, random)
    case 'USER_INTERACTION':
      return contactStart(state, now, event.actor, event.interaction)
    case 'STROKE_START':
      return contactStart(state, now, event.actor, 'stroke')
    case 'HUG_START':
      return contactStart(state, now, event.actor, 'hug')
    case 'STROKE_END':
      return contactEnd(state, now, event.actor, 'stroke')
    case 'HUG_END':
      return contactEnd(state, now, event.actor, 'hug')
    case 'INACTIVITY_THRESHOLD':
      return inactivity(state, now, event.inactiveSince)
    case 'STRESS_SESSION_START': {
      if (!event.authorized) return reject(state, 'stress source is not authorized')
      if (!actorCanAct(state, event.actor)) return reject(state, 'actor is not the current habitat')
      if (state.mood === 'stressed' && state.behavior === 'breathing') return acceptNoop(state, 'stress session is already active')
      if (state.behavior !== 'idle') return reject(state, 'stress cannot interrupt the active behaviour')
      const next = behaviorPatch(state, now, 'breathing', { mood: 'stressed' })
      return result(state, next, true, 'stress session started', [{ type: 'BEHAVIOUR_CHANGED', behavior: 'breathing' }])
    }
    case 'STRESS_SESSION_END': {
      if (!event.authorized) return reject(state, 'stress source is not authorized')
      if (!actorCanAct(state, event.actor)) return reject(state, 'actor is not the current habitat')
      if (state.mood !== 'stressed' || state.behavior !== 'breathing') return reject(state, 'stress session is not active')
      const next = behaviorPatch(state, now, 'idle', { mood: 'calm' })
      return result(state, next, true, 'stress session ended', [{ type: 'BEHAVIOUR_CHANGED', behavior: 'idle' }])
    }
    case 'DEVICE_JUMP_REQUESTED': {
      if (!actorCanAct(state, event.actor)) return reject(state, 'actor is not the current habitat')
      if (event.target === state.location) return reject(state, 'Device Jump target is already current location')
      if (state.behavior === 'leaving' || state.journey.target !== null) return reject(state, 'a Device Jump is already in progress')
      const next = behaviorPatch(state, now, 'leaving', { journey: { target: event.target, startedAt: now.iso } })
      return result(state, next, true, 'Device Jump exit started', [{ type: 'JOURNEY_STARTED', target: event.target }, { type: 'BEHAVIOUR_CHANGED', behavior: 'leaving' }])
    }
    case 'DEVICE_LEAVE_COMPLETED': {
      if (!actorCanAct(state, event.actor)) return reject(state, 'actor is not the retained source habitat')
      if (state.behavior !== 'leaving' || state.journey.target !== event.target || state.journey.startedAt === null) return reject(state, 'no matching Device Jump exit is active')
      const started = timestampMs(state.journey.startedAt)
      if (started === null || now.epochMs - started > JUMP_MS) return reject(state, 'Device Jump exit deadline has elapsed')
      const next = behaviorPatch(state, now, 'arriving', {
        location: event.target,
        journey: { target: null, startedAt: null },
        presence: { ...state.presence, lastLocationChangeAt: now.iso },
      })
      return result(state, next, true, 'Device Jump committed; target may arrive', [{ type: 'JOURNEY_COMMITTED', target: event.target }, { type: 'BEHAVIOUR_CHANGED', behavior: 'arriving' }])
    }
    case 'DEVICE_ARRIVE_COMPLETED': {
      if (!actorCanAct(state, event.actor)) return reject(state, 'actor is not the current habitat')
      if (state.behavior !== 'arriving') return reject(state, 'arrival is not active')
      const next = settle(state, now)
      return result(state, next, true, 'arrival settled', [{ type: 'BEHAVIOUR_CHANGED', behavior: next.behavior }])
    }
    }
  })()
  return { ...outcome, event }
}
