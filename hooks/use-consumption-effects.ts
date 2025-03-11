import { useState, useEffect } from 'react'

export type ConsumptionEffect = {
  x: number
  y: number
  color: string
  size: number
  alpha: number
  timestamp: number
}

export function useConsumptionEffects(isGameRunning: boolean) {
  const [effects, setEffects] = useState<ConsumptionEffect[]>([])

  useEffect(() => {
    if (!isGameRunning || effects.length === 0) return

    const updateEffects = () => {
      setEffects((prev) =>
        prev
          .map((effect) => ({
            ...effect,
            alpha: effect.alpha - 0.02,
            size: effect.size * 1.03,
          }))
          // Remove effects that are too old or fully transparent
          .filter((effect) => (
            effect.alpha > 0 && 
            Date.now() - effect.timestamp < 2000
          ))
      )
    }

    const effectInterval = setInterval(updateEffects, 50)
    return () => {
      clearInterval(effectInterval)
      // Clear effects when game stops
      if (!isGameRunning) {
        setEffects([])
      }
    }
  }, [isGameRunning, effects.length])

  const addEffect = (x: number, y: number, color: string, size: number) => {
    setEffects((prev) => [
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
  }

  return { effects, addEffect }
}
