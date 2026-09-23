import assert from 'node:assert/strict'
import test from 'node:test'
import { createInitialCreatureState, type CreatureState, type EngineTime } from '../src/liizooo/creatureState.js'
import { transition, type CreatureEvent } from '../src/liizooo/behaviorEngine.js'

const START: EngineTime = { iso: '2026-09-23T12:00:00.000Z', epochMs: Date.parse('2026-09-23T12:00:00.000Z') }

function at(offsetMs = 0): EngineTime {
  return { iso: new Date(START.epochMs + offsetMs).toISOString(), epochMs: START.epochMs + offsetMs }
}

function run(state: CreatureState, event: CreatureEvent, time = at(), random = () => 0.99) {
  return transition({ state, event, clock: { now: () => time }, random })
}

test('same state, event, clock, and seed produce the same result', () => {
  const state = createInitialCreatureState(START)
  const event: CreatureEvent = { type: 'TICK', actor: 'desktop' }
  const first = run(state, event, at(1_000), () => 0.05)
  const second = run(state, event, at(1_000), () => 0.05)
  assert.deepEqual(first, second)
  assert.equal(first.nextState.behavior, 'looking')
})

test('illegal transitions are rejected without state corruption', () => {
  const state = createInitialCreatureState(START)
  const result = run(state, { type: 'DEVICE_LEAVE_COMPLETED', actor: 'desktop', target: 'mobile' })
  assert.equal(result.accepted, false)
  assert.strictEqual(result.nextState, state)
  assert.deepEqual(result.nextState, state)
})

test('user interaction wakes sleep and settles correctly', () => {
  const state = { ...createInitialCreatureState(START), mood: 'sleepy' as const, behavior: 'sleeping' as const }
  const stroke = run(state, { type: 'STROKE_START', actor: 'desktop' }, at(1_000))
  assert.equal(stroke.accepted, true)
  assert.equal(stroke.nextState.behavior, 'stroking')
  assert.equal(stroke.nextState.mood, 'happy')
  const settled = run(stroke.nextState, { type: 'STROKE_END', actor: 'desktop' }, at(1_100))
  assert.equal(settled.nextState.behavior, 'idle')
  assert.equal(settled.nextState.mood, 'calm')
})

test('stroke and hug follow contact recovery and stress-calming rules', () => {
  const state = { ...createInitialCreatureState(START), mood: 'stressed' as const, behavior: 'breathing' as const }
  const hug = run(state, { type: 'HUG_START', actor: 'desktop' }, at(1_000))
  assert.equal(hug.nextState.behavior, 'hugging')
  assert.equal(hug.nextState.mood, 'happy')
  assert.equal(hug.nextState.bond, 66)
  const settled = run(hug.nextState, { type: 'HUG_END', actor: 'desktop' }, at(1_500))
  assert.deepEqual([settled.nextState.mood, settled.nextState.behavior], ['calm', 'idle'])
})

test('Device Jump is leave, then location commit, then arrival', () => {
  const state = createInitialCreatureState(START)
  const leaving = run(state, { type: 'DEVICE_JUMP_REQUESTED', actor: 'desktop', target: 'mobile' }, at(10))
  assert.equal(leaving.nextState.location, 'desktop')
  assert.equal(leaving.nextState.behavior, 'leaving')
  assert.equal(leaving.nextState.journey.target, 'mobile')
  const committed = run(leaving.nextState, { type: 'DEVICE_LEAVE_COMPLETED', actor: 'desktop', target: 'mobile' }, at(500))
  assert.equal(committed.nextState.location, 'mobile')
  assert.equal(committed.nextState.behavior, 'arriving')
  assert.deepEqual(committed.nextState.journey, { target: null, startedAt: null })
  const arrived = run(committed.nextState, { type: 'DEVICE_ARRIVE_COMPLETED', actor: 'mobile' }, at(700))
  assert.equal(arrived.nextState.behavior, 'idle')
})

test('arrive and leave reject low-priority autonomous behaviour', () => {
  const leaving = run(createInitialCreatureState(START), { type: 'DEVICE_JUMP_REQUESTED', actor: 'desktop', target: 'mobile' }, at(10)).nextState
  const leaveTick = run(leaving, { type: 'TICK', actor: 'desktop' }, at(20), () => 0.05)
  assert.equal(leaveTick.nextState.behavior, 'leaving')
  const arriving = run(leaving, { type: 'DEVICE_LEAVE_COMPLETED', actor: 'desktop', target: 'mobile' }, at(500)).nextState
  const arriveTick = run(arriving, { type: 'TICK', actor: 'mobile' }, at(600), () => 0.05)
  assert.equal(arriveTick.nextState.behavior, 'arriving')
})

test('refresh restoration preserves the complete persistent CreatureState', () => {
  const existing = {
    ...createInitialCreatureState(START),
    location: 'mobile' as const,
    mood: 'sleepy' as const,
    behavior: 'sleeping' as const,
    energy: 17,
    bond: 91,
    stateRevision: 8,
  }
  const staleLocal = createInitialCreatureState(at(10_000))
  const restored = run(staleLocal, { type: 'REFRESH_RESTORED', state: existing }, at(10_001))
  assert.equal(restored.accepted, true)
  assert.strictEqual(restored.nextState, existing)
  assert.deepEqual(restored.nextState, existing)
})

test('autonomous behaviour cannot overwrite an active direct interaction', () => {
  const active = run(createInitialCreatureState(START), { type: 'STROKE_START', actor: 'desktop' }, at(100)).nextState
  const tick = run(active, { type: 'TICK', actor: 'desktop' }, at(200), () => 0.12)
  assert.equal(tick.accepted, false)
  assert.strictEqual(tick.nextState, active)
  assert.equal(tick.nextState.behavior, 'stroking')
})

test('documented energy and bond bounds remain intact at both edges', () => {
  const sleepEligible = {
    ...createInitialCreatureState(START),
    energy: 0,
    bond: 100,
    presence: { lastInteractionAt: at(-180_000).iso, lastLocationChangeAt: START.iso },
  }
  const sleep = run(sleepEligible, { type: 'INACTIVITY_THRESHOLD', inactiveSince: at(-180_000).iso }, at())
  assert.equal(sleep.nextState.energy, 0)
  const pet = run(sleep.nextState, { type: 'STROKE_START', actor: 'desktop' }, at(1))
  assert.equal(pet.nextState.bond, 100)
  assert.ok(pet.nextState.energy >= 0 && pet.nextState.energy <= 100)
  assert.ok(pet.nextState.bond >= 0 && pet.nextState.bond <= 100)
})

test('stress start/end and all required event variants have legal deterministic handling', () => {
  const state = createInitialCreatureState(START)
  const stress = run(state, { type: 'STRESS_SESSION_START', actor: 'desktop', authorized: true }, at(1))
  assert.equal(stress.nextState.behavior, 'breathing')
  const noOpStress = run(stress.nextState, { type: 'STRESS_SESSION_START', actor: 'desktop', authorized: true }, at(2))
  assert.equal(noOpStress.changed, false)
  const calm = run(stress.nextState, { type: 'STRESS_SESSION_END', actor: 'desktop', authorized: true }, at(3))
  assert.equal(calm.nextState.mood, 'calm')

  const stroked = run(state, { type: 'USER_INTERACTION', actor: 'desktop', interaction: 'stroke' }, at(4))
  assert.equal(stroked.nextState.behavior, 'stroking')
  const hugged = run(stroked.nextState, { type: 'HUG_START', actor: 'desktop' }, at(5))
  assert.equal(hugged.nextState.behavior, 'hugging')
  assert.equal(run(hugged.nextState, { type: 'HUG_END', actor: 'desktop' }, at(6)).nextState.behavior, 'idle')
})
