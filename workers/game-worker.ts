import type { Worm, ScatteredSegment } from '@/lib/game-types'
import { WORM, WORLD } from '@/lib/constants'

interface WorkerData {
  worms: Worm[]
  scatteredSegments: ScatteredSegment[]
  scaleFactor: number
  deltaTime: number
}

self.onmessage = (e: MessageEvent<WorkerData>) => {
  const { worms, scatteredSegments, scaleFactor, deltaTime } = e.data
  
  // Update worm positions
  const updatedWorms = worms.map(worm => {
    const prevHeadX = worm.head.x
    const prevHeadY = worm.head.y

    // Calculate movement
    const speedFactor = worm.sizeFactor ? 1 / worm.sizeFactor : 1
    const baseSpeed = WORM.MOVEMENT_SPEED * scaleFactor * speedFactor
    const speed = worm.isPlayer ? baseSpeed : baseSpeed * (worm.speedMultiplier || 1)

    // Move head
    worm.head.x += Math.cos(worm.angle) * speed
    worm.head.y += Math.sin(worm.angle) * speed

    // World boundary collision
    if (worm.head.x < worm.head.radius) {
      worm.head.x = worm.head.radius
      worm.angle = Math.PI - worm.angle
    } else if (worm.head.x > WORLD.WIDTH - worm.head.radius) {
      worm.head.x = WORLD.WIDTH - worm.head.radius
      worm.angle = Math.PI - worm.angle
    }

    // Similar for Y axis...
    
    // Update segments with optimized movement
    if (worm.segments.length > 0) {
      let prevX = prevHeadX
      let prevY = prevHeadY

      worm.segments = worm.segments.map(segment => {
        const tempX = segment.x
        const tempY = segment.y

        const dx = prevX - segment.x
        const dy = prevY - segment.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        const segmentSpacing = WORM.SEGMENT_SPACING * (worm.sizeFactor || 1) * scaleFactor
        if (distance > segmentSpacing) {
          const ratio = segmentSpacing / distance
          segment.x += dx * ratio
          segment.y += dy * ratio
        }

        prevX = tempX
        prevY = tempY
        return segment
      })
    }

    return worm
  })

  // Update scattered segments
  const updatedScattered = scatteredSegments.map(segment => {
    segment.x += segment.velocityX * scaleFactor
    segment.y += segment.velocityY * scaleFactor
    segment.velocityX *= 0.98
    segment.velocityY *= 0.98
    return segment
  }).filter(segment => (
    segment.x > segment.radius &&
    segment.x < WORLD.WIDTH - segment.radius &&
    segment.y > segment.radius &&
    segment.y < WORLD.HEIGHT - segment.radius
  ))

  self.postMessage({
    worms: updatedWorms,
    scatteredSegments: updatedScattered
  })
}
