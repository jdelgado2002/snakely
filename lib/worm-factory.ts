import { WORM, COLORS, NAMES } from "./constants"
import type { Worm, Segment } from "./game-types"

export function createNewWorm(
  x: number,
  y: number,
  scaleFactor: number,
  isPlayer: boolean,
  speedMultiplier = 1.0
): Worm {
  const angle = Math.random() * Math.PI * 2
  const segments: Segment[] = []
  const sizeFactor = isPlayer ? 1.0 : WORM.MIN_SEGMENT_SIZE_FACTOR + 
    Math.random() * (WORM.MAX_SEGMENT_SIZE_FACTOR - WORM.MIN_SEGMENT_SIZE_FACTOR)

  // Add segments
  const numSegments = isPlayer ? WORM.INITIAL_SEGMENTS_PLAYER : 
    Math.floor(WORM.MIN_CPU_SEGMENTS + Math.random() * (WORM.MAX_CPU_SEGMENTS - WORM.MIN_CPU_SEGMENTS))

  for (let i = 0; i < numSegments; i++) {
    const segmentAngle = angle + Math.PI
    segments.push({
      x: x - Math.cos(segmentAngle) * (i + 1) * WORM.SEGMENT_SPACING * sizeFactor * scaleFactor,
      y: y - Math.sin(segmentAngle) * (i + 1) * WORM.SEGMENT_SPACING * sizeFactor * scaleFactor,
      radius: WORM.SEGMENT_RADIUS_BASE * sizeFactor * scaleFactor
    })
  }

  return {
    id: isPlayer ? 'player' : `cpu-${Math.random().toString(36).substr(2, 9)}`,
    isPlayer,
    isAlive: true,
    color: isPlayer ? COLORS.PLAYER[0] : COLORS.PLAYER[Math.floor(Math.random() * COLORS.PLAYER.length)],
    name: isPlayer ? NAMES.PLAYER[0] : NAMES.CPU[Math.floor(Math.random() * NAMES.CPU.length)],
    head: {
      x,
      y,
      radius: WORM.HEAD_RADIUS_BASE * sizeFactor * scaleFactor
    },
    angle,
    segments,
    score: numSegments,
    controls: {
      left: isPlayer ? "ArrowLeft" : "",
      right: isPlayer ? "ArrowRight" : ""
    },
    sizeFactor,
    speedMultiplier
  }
}

export function createCPUWorm(
  worldWidth: number,
  worldHeight: number,
  scaleFactor: number,
  index: number,
  speedMultiplier = 1.0
): Worm {
  const padding = 100
  const x = Math.random() * (worldWidth - padding * 2) + padding
  const y = Math.random() * (worldHeight - padding * 2) + padding
  
  return createNewWorm(x, y, scaleFactor, false, speedMultiplier)
}
