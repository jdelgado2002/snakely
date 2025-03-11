import { useState, useCallback } from 'react'
import type { GameState } from '@/lib/game-types'

export function useGameState(initialState: GameState) {
  const [state, setState] = useState<GameState>(initialState)

  const updateGameState = useCallback((updater: GameState | ((prevState: GameState) => GameState)) => {
    setState(prevState => {
      if (prevState.isGameOver) return prevState
      return typeof updater === 'function' 
        ? (updater as (prevState: GameState) => GameState)(prevState)
        : updater
    })
  }, [])

  return [state, updateGameState] as const
}
