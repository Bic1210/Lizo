/**
 * Framework-independent mirror of the LZ-001 CreatureState contract.
 * The Nest remains the persistence authority; this module has no I/O.
 */
export type Location = 'mobile' | 'desktop' | 'nest' | 'physical'
export type HabitatActor = Extract<Location, 'mobile' | 'desktop'>
export type Mood = 'calm' | 'happy' | 'sleepy' | 'stressed'
export type Behavior =
  | 'idle'
  | 'breathing'
  | 'looking'
  | 'crawling'
  | 'sleeping'
  | 'stroking'
  | 'hugging'
  | 'arriving'
  | 'leaving'

export interface Presence {
  lastInteractionAt: string | null
  lastLocationChangeAt: string
}

export interface Journey {
  target: HabitatActor | null
  startedAt: string | null
}

export interface CreatureState {
  schemaVersion: 1
  stateRevision: number
  location: Location
  mood: Mood
  behavior: Behavior
  behaviorStartedAt: string
  energy: number
  bond: number
  presence: Presence
  journey: Journey
  updatedAt: string
}

export interface EngineTime {
  /** RFC 3339 UTC time supplied by the caller/Nest boundary. */
  iso: string
  /** The same instant in milliseconds, supplied to make tests deterministic. */
  epochMs: number
}

export interface EngineClock {
  now(): EngineTime
}

export type RandomSource = () => number

export function createInitialCreatureState(time: EngineTime): CreatureState {
  return {
    schemaVersion: 1,
    stateRevision: 1,
    location: 'desktop',
    mood: 'calm',
    behavior: 'idle',
    behaviorStartedAt: time.iso,
    energy: 72,
    bond: 64,
    presence: { lastInteractionAt: null, lastLocationChangeAt: time.iso },
    journey: { target: null, startedAt: null },
    updatedAt: time.iso,
  }
}
