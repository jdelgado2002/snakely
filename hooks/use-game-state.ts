import { useState, useCallback } from "react"
import { WORLD, GAME } from "@/lib/constants"
import { createNewWorm, createCPUWorm } from "@/lib/worm-factory"
import type { GameState, Worm } from "@/lib/game-types"

export function useGameState(scaleFactorRef: React.MutableRefObject<number>) {
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    isGameOver: false,
    winner: null,
    worms: [],
    scatteredSegments: [],
    roundWinner: null,
    camera: { x: 0, y: 0 },
    worldSize: { width: WORLD.WIDTH, height: WORLD.HEIGHT },
  })

  const [difficultyLevel, setDifficultyLevel] = useState(1)
  const [lastSpawnScore, setLastSpawnScore] = useState(0)

  const initializeGame = useCallback((numCPUWorms: number) => {
    const worms: Worm[] = []
    
    // Create player worm
    const playerWorm = createNewWorm(
      WORLD.WIDTH / 2, 
      WORLD.HEIGHT / 2, 
      scaleFactorRef.current,
      true
    )
    worms.push(playerWorm)

    // Create CPU worms
    for (let i = 0; i < numCPUWorms; i++) {
      const cpuWorm = createCPUWorm(
        WORLD.WIDTH,
        WORLD.HEIGHT,
        scaleFactorRef.current,
        i
      )
      worms.push(cpuWorm)
    }

    setGameState(prev => ({
      ...prev,
      isRunning: true,
      isGameOver: false,
      winner: null,
      worms,
      scatteredSegments: [],
      camera: {
        x: (WORLD.WIDTH / 2),
        y: (WORLD.HEIGHT / 2)
      }
    }))

    setDifficultyLevel(1)
    setLastSpawnScore(0)
  }, [scaleFactorRef])

  const spawnNewCPUWorm = useCallback(() => {
    const speedMultiplier = GAME.BASE_CPU_SPEED + GAME.DIFFICULTY_SPEED_INCREASE * (difficultyLevel - 1)
    
    setGameState(prev => {
      const currentCPUs = prev.worms.filter(w => !w.isPlayer).length
      if (currentCPUs >= GAME.MAX_DYNAMIC_CPU_WORMS) return prev

      const newWorm = createCPUWorm(
        WORLD.WIDTH,
        WORLD.HEIGHT,
        scaleFactorRef.current,
        prev.worms.length,
        speedMultiplier
      )

      return {
        ...prev,
        worms: [...prev.worms, newWorm]
      }
    })
  }, [difficultyLevel, scaleFactorRef])

  return {
    gameState,
    setGameState,
    difficultyLevel,
    setDifficultyLevel,
    lastSpawnScore,
    setLastSpawnScore,
    initializeGame,
    spawnNewCPUWorm
  }
}
