import { useCallback } from "react"
import { WORM } from "@/lib/constants"
import type { GameState, Worm, ScatteredSegment } from "@/lib/game-types"

export function useCollisionDetection(scaleFactorRef: React.MutableRefObject<number>) {
  const checkWormCollisions = useCallback((worm: Worm, otherWorms: Worm[]): Worm | null => {
    for (const otherWorm of otherWorms) {
      if (worm.id === otherWorm.id || !otherWorm.isAlive) continue

      for (const segment of otherWorm.segments) {
        const dx = worm.head.x - segment.x
        const dy = worm.head.y - segment.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < worm.head.radius + segment.radius) {
          return otherWorm // Return the worm that was hit
        }
      }
    }
    return null
  }, [])

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
