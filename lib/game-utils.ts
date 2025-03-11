import type { GameState, Worm } from '@/lib/game-types'

export const spawnNewCPUWorm = (
  gameState: GameState,
  difficultyLevel: number,
  scaleFactor: number,
  playerColors: string[]
): Worm => {
  // Constants moved from module scope to function scope to avoid unused variable warnings
  const MIN_CPU_SEGMENTS = 5
  const HEAD_RADIUS_BASE = 12
  const SEGMENT_RADIUS_BASE = 10
  const SEGMENT_SPACING = 15
  const BASE_CPU_SPEED = 1.0
  const DIFFICULTY_SPEED_INCREASE = 1.1
  
  const WORLD_WIDTH = gameState.worldSize.width
  const WORLD_HEIGHT = gameState.worldSize.height
  
  // Safe distance from other worms
  const SAFE_DISTANCE = 200

  // Find a position not too close to existing worms
  const findSafePosition = (): { x: number; y: number } => {
    let attempts = 0
    const maxAttempts = 50
    
    while (attempts < maxAttempts) {
      // Generate random position with padding from edges
      const padding = 200
      const x = Math.random() * (WORLD_WIDTH - padding * 2) + padding
      const y = Math.random() * (WORLD_HEIGHT - padding * 2) + padding
      
      // Check distance from all existing worms
      let isSafe = true
      for (const worm of gameState.worms) {
        if (!worm.isAlive) continue
        
        const dx = worm.head.x - x
        const dy = worm.head.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < SAFE_DISTANCE) {
          isSafe = false
          break
        }
      }
      
      if (isSafe) {
        return { x, y }
      }
      
      attempts++
    }
    
    // Fallback if no safe position found
    return { 
      x: Math.random() * (WORLD_WIDTH - 400) + 200,
      y: Math.random() * (WORLD_HEIGHT - 400) + 200
    }
  }

  const safePos = findSafePosition()
  const cpuIndex = gameState.worms.filter(w => !w.isPlayer).length
  
  // Speed increases with difficulty
  const speedMultiplier = BASE_CPU_SPEED + DIFFICULTY_SPEED_INCREASE * (difficultyLevel - 1)
  
  // Size decreases with difficulty (smaller worms are harder to hit)
  const sizeFactor = Math.max(0.7, Math.min(1.3, 1.0 - difficultyLevel * 0.05))
  
  // More segments with higher difficulty
  const numSegments = Math.floor(MIN_CPU_SEGMENTS + (difficultyLevel * 2))
  
  // Random starting angle
  const angle = Math.random() * Math.PI * 2

  // CPU name with difficulty indicator
  const name = `CPU ${cpuIndex + 1} [Lvl ${difficultyLevel}]`
  
  // Pick color - avoid player's color if possible
  const color = playerColors[(cpuIndex + 1) % playerColors.length]

  const newCPUWorm: Worm = {
    id: `worm-cpu-${Date.now()}-${cpuIndex}`,
    isPlayer: false,
    isAlive: true,
    color: color,
    name: name,
    head: {
      x: safePos.x,
      y: safePos.y,
      radius: HEAD_RADIUS_BASE * sizeFactor * scaleFactor,
    },
    angle: angle,
    segments: [],
    score: numSegments,
    controls: { left: "", right: "" },
    sizeFactor: sizeFactor,
    speedMultiplier: speedMultiplier
  }

  // Add segments behind the CPU worm
  for (let j = 0; j < numSegments; j++) {
    const segmentAngle = angle + Math.PI // Opposite direction of head
    newCPUWorm.segments.push({
      x: safePos.x - Math.cos(segmentAngle) * (j + 1) * SEGMENT_SPACING * sizeFactor * scaleFactor,
      y: safePos.y - Math.sin(segmentAngle) * (j + 1) * SEGMENT_SPACING * sizeFactor * scaleFactor,
      radius: SEGMENT_RADIUS_BASE * sizeFactor * scaleFactor,
    })
  }

  return newCPUWorm
}
