import { useState, useEffect, useCallback } from "react"
import type { ConsumptionEffect, Worm } from "@/lib/game-types"
import { WORM } from "@/lib/constants"

export function useEffectsSystem(scaleFactorRef: React.MutableRefObject<number>) {
  const [consumptionEffects, setConsumptionEffects] = useState<ConsumptionEffect[]>([])

  // Update effects
  useEffect(() => {
    if (consumptionEffects.length === 0) return

    const updateEffects = () => {
      setConsumptionEffects((prev) =>
        prev
          .map((effect) => ({
            ...effect,
            alpha: effect.alpha - 0.02,
            size: effect.size * 1.03,
          }))
          .filter((effect) => effect.alpha > 0),
      )
    }

    const effectInterval = setInterval(updateEffects, 50)
    return () => clearInterval(effectInterval)
  }, [consumptionEffects.length])

  const addConsumptionEffect = useCallback((x: number, y: number, color: string, size: number) => {
    setConsumptionEffects((prev) => [
      ...prev,
      {
        x,
        y,
        color,
        size,
        alpha: 1,
        timestamp: Date.now(),
      },
    ])
  }, [])

  const createExplosionEffect = useCallback((worm: Worm) => {
    // Add explosion particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * WORM.SCATTERED_SEGMENT_SPEED * 1.5
      addConsumptionEffect(
        worm.head.x,
        worm.head.y,
        worm.color,
        Math.random() * 5 * scaleFactorRef.current + 2
      )
    }

    // Add central explosion
    addConsumptionEffect(worm.head.x, worm.head.y, worm.color, worm.head.radius * 3)
  }, [addConsumptionEffect, scaleFactorRef])

  return {
    consumptionEffects,
    addConsumptionEffect,
    createExplosionEffect,
  }
}
