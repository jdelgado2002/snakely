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
          // More aggressive filtering to ensure effects are removed
          .filter((effect) => (
            effect.alpha > 0 && 
            Date.now() - effect.timestamp < 2000
          ))
      )
    }
  
    const effectInterval = setInterval(updateEffects, 50)
    
    return () => {
      clearInterval(effectInterval)
      // Clear effects when game stops or component unmounts
      setEffects([])
    }
  }, [isGameRunning, effects.length])

  const addEffect = (x: number, y: number, color: string, size: number) => {
    // Limit the maximum number of effects to prevent performance issues
    setEffects((prev) => {
      const newEffect = {
        x,
        y,
        color,
        size,
        alpha: 1,
        timestamp: Date.now(),
      }
      
      // If we have too many effects, replace the oldest
      if (prev.length > 30) {
        const withoutOldest = [...prev.slice(1)]
        return [...withoutOldest, newEffect]
      }
      
      return [...prev, newEffect]
    })
  }

  return { effects, addEffect }
}
