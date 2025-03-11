import type { GameState, Worm } from '@/lib/game-types'

const BASE_CPU_SPEED = 1.0
const DIFFICULTY_SPEED_INCREASE = 0.1
const MIN_CPU_SEGMENTS = 5
const HEAD_RADIUS_BASE = 12
const SEGMENT_RADIUS_BASE = 10
const SEGMENT_SPACING = 15
const WORLD_WIDTH = 3000
const WORLD_HEIGHT = 3000

export const spawnNewCPUWorm = (
  gameState: GameState,
  difficultyLevel: number,
  scaleFactor: number,
  playerColors: string[]
) => {
  const findSafePosition = (): { x: number; y: number } => {
    // ...existing findSafePosition code...
  }

  const safePos = findSafePosition()
  const cpuIndex = gameState.worms.length

  const speedMultiplier = BASE_CPU_SPEED + DIFFICULTY_SPEED_INCREASE * (difficultyLevel - 1)
  const sizeFactor = Math.max(0.7, Math.min(1.3, 1.0 - difficultyLevel * 0.05))
  const numSegments = Math.floor(MIN_CPU_SEGMENTS + (difficultyLevel * 2))

  const newCPUWorm: Worm = {
    // ...existing newCPUWorm creation code...
  }

  // Add segments
  for (let j = 0; j < numSegments; j++) {
    // ...existing segment creation code...
  }

  return newCPUWorm
}
