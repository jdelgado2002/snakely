import { useCallback } from 'react'
import { WORM, WORLD } from '@/lib/constants'
import type { Worm } from '@/lib/game-types'

interface WormMovement {
  updateWormPositions: (worms: Worm[], deltaTime: number) => void
}

export function useWormMovement(
  scaleFactorRef: React.MutableRefObject<number>
): WormMovement {
  const updateWormPositions = useCallback((worms: Worm[], deltaTime: number) => {
    worms.forEach(worm => {
      // Store previous head position
      const prevHeadX = worm.head.x
      const prevHeadY = worm.head.y

      // Calculate speed factor based on size and type
      const speedFactor = worm.sizeFactor ? 1 / worm.sizeFactor : 1
      const baseSpeed = WORM.MOVEMENT_SPEED * scaleFactorRef.current * speedFactor
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

      if (worm.head.y < worm.head.radius) {
        worm.head.y = worm.head.radius
        worm.angle = -worm.angle
      } else if (worm.head.y > WORLD.HEIGHT - worm.head.radius) {
        worm.head.y = WORLD.HEIGHT - worm.head.radius
        worm.angle = -worm.angle
      }

      // Update segments
      if (worm.segments.length > 0) {
        let prevX = prevHeadX
        let prevY = prevHeadY

        worm.segments.forEach(segment => {
          const tempX = segment.x
          const tempY = segment.y

          // Calculate direction to previous segment
          const dx = prevX - segment.x
          const dy = prevY - segment.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Move segment towards previous position
          const segmentSpacing = WORM.SEGMENT_SPACING * (worm.sizeFactor || 1) * scaleFactorRef.current
          if (distance > segmentSpacing) {
            const ratio = segmentSpacing / distance
            segment.x += dx * ratio
            segment.y += dy * ratio
          }

          prevX = tempX
          prevY = tempY
        })
      }
    })
  }, [scaleFactorRef])

  return { updateWormPositions }
}
