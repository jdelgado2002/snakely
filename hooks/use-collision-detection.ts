import { useCallback } from "react"
import { WORM } from "@/lib/constants"
import type { GameState, Worm, ScatteredSegment } from "@/lib/game-types"
import { useSpatialHash } from './use-spatial-hash'

export function useCollisionDetection(scaleFactorRef: React.MutableRefObject<number>) {
  const spatialHash = useSpatialHash()

  const checkWormCollisions = useCallback((worm: Worm, otherWorms: Worm[]): Worm | null => {
    // Clear and rebuild spatial hash
    spatialHash.clear()
    otherWorms.forEach(other => {
      if (other.id === worm.id || !other.isAlive) return
      other.segments.forEach((segment, i) => {
        spatialHash.insert(segment.x, segment.y, segment.radius, `${other.id}-${i}`)
      })
    })

    // Query nearby segments
    const nearbyIds = spatialHash.query(worm.head.x, worm.head.y, worm.head.radius * 2)
    
    // Check only nearby segments for actual collisions
    for (const otherId of nearbyIds) {
      const [wormId, segmentIndex] = otherId.split('-')
      const otherWorm = otherWorms.find(w => w.id === wormId)
      if (!otherWorm) continue

      const segment = otherWorm.segments[Number(segmentIndex)]
      const dx = worm.head.x - segment.x
      const dy = worm.head.y - segment.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < worm.head.radius + segment.radius) {
        return otherWorm
      }
    }

    return null
  }, [spatialHash])

  const checkSegmentAbsorption = useCallback((
    worm: Worm,
    scatteredSegments: ScatteredSegment[]
  ): number[] => {
    const absorbedIndices: number[] = []
    const absorptionDistance = WORM.ABSORPTION_DISTANCE * (worm.sizeFactor || 1) * scaleFactorRef.current

    scatteredSegments.forEach((segment, index) => {
      const dx = worm.head.x - segment.x
      const dy = worm.head.y - segment.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < worm.head.radius + absorptionDistance) {
        absorbedIndices.push(index)
      }
    })

    return absorbedIndices
  }, [scaleFactorRef])

  return {
    checkWormCollisions,
    checkSegmentAbsorption,
  }
}
