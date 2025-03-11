import { useEffect, useRef } from 'react'

export function useGameLoop(
  isRunning: boolean,
  onUpdate: () => void,
  onRender: () => void,
  dependencies: any[] = []
) {
  const animationFrameRef = useRef<number>(0)
  const lastUpdateTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!isRunning) return

    const gameLoop = (timestamp: number) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = timestamp
      }

      lastUpdateTimeRef.current = timestamp
      onUpdate()
      onRender()

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationFrameRef.current)
      lastUpdateTimeRef.current = 0
    }
  }, [isRunning, onUpdate, onRender, ...dependencies])
}
