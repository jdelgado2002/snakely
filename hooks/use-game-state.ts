import { useState, useCallback } from 'react'
import type { GameState } from '../lib/game-types'

export function useGameState(initialState: GameState) {
  const [state, setState] = useState<GameState>(initialState)

  const updateGameState = useCallback((updater: ((prevState: GameState) => GameState) | GameState) => {
    interface UpdaterFunction {
      (prevState: GameState): GameState
    }

    setState((prevState: GameState) => {
      // Check if this is a reset operation (explicit set of isGameOver to false)
      // or another update while already in game over state
      if (prevState.isGameOver) {
        // Allow updates that explicitly set isGameOver to false
        if (typeof updater === 'object' && updater.isGameOver === false) {
          return updater as GameState;
        }
        // For function updaters, we need to check the return value
        if (typeof updater === 'function') {
          const nextState: GameState = (updater as UpdaterFunction)(prevState);
          if (nextState.isGameOver === false) {
            return nextState;
          }
        }
        return prevState; // Block other updates when in game over state
      }
      
      return typeof updater === 'function' 
        ? (updater as UpdaterFunction)(prevState) 
        : updater as GameState
    })
  }, [])

  return [state, updateGameState] as const
}
