import { useCallback, useEffect, useRef } from 'react'
import { useGameRenderer } from './use-game-renderer'
import { useWormMovement } from './use-worm-movement'
import { useCollisionDetection } from './use-collision-detection'
import type { GameState } from '@/lib/game-types'

interface GameLoopOptions {
  canvasSize: { width: number; height: number }
  scaleFactorRef: React.MutableRefObject<number>
  backgroundLoaded: boolean
  worldBackgroundRef: React.MutableRefObject<HTMLImageElement | null>
  showTouchControls: boolean
  touchFeedback: { left: boolean; right: boolean }
  consumptionEffects: Array<{
    x: number
    y: number
    color: string
    size: number
    alpha: number
    timestamp: number
  }>
  onCollision: (winner: string) => void
  onSegmentAbsorbed: (wormId: string, segmentIndex: number) => void
}

export function useGameLoop(
  ctx: CanvasRenderingContext2D | null,
  gameState: GameState,
  options: GameLoopOptions
) {
  const { renderGame } = useGameRenderer()
  const { updateWormPositions } = useWormMovement(options.scaleFactorRef)
  const { checkWormCollisions, checkSegmentAbsorption } = useCollisionDetection(options.scaleFactorRef)
  const frameIdRef = useRef<number>(0)
  const lastUpdateTimeRef = useRef<number>(0)

  const gameLoop = useCallback((timestamp: number) => {
    if (!ctx || !gameState.isRunning) return

    // Calculate delta time
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp
    }
    const deltaTime = timestamp - lastUpdateTimeRef.current
    lastUpdateTimeRef.current = timestamp

    // Update game state
    const aliveWorms = gameState.worms.filter(worm => worm.isAlive)
    
    // Update worm positions
    updateWormPositions(aliveWorms, deltaTime)

    // Check collisions
    for (const worm of aliveWorms) {
      const collidedWith = checkWormCollisions(worm, aliveWorms)
      if (collidedWith) {
        options.onCollision(collidedWith.id)
        break
      }

      // Check segment absorption
      const absorbedSegments = checkSegmentAbsorption(worm, gameState.scatteredSegments)
      if (absorbedSegments.length > 0) {
        absorbedSegments.forEach(segmentIndex => {
          options.onSegmentAbsorbed(worm.id, segmentIndex)
        })
      }
    }

    // Render frame
    renderGame(gameState, {
      ctx,
      canvasSize: options.canvasSize,
      scaleFactorRef: options.scaleFactorRef,
      backgroundLoaded: options.backgroundLoaded,
      worldBackgroundRef: options.worldBackgroundRef,
      showTouchControls: options.showTouchControls,
      touchFeedback: options.touchFeedback,
      consumptionEffects: options.consumptionEffects,
    })

    // Schedule next frame
    frameIdRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, ctx, options, renderGame, updateWormPositions, checkWormCollisions, checkSegmentAbsorption])

  useEffect(() => {
    if (gameState.isRunning && ctx) {
      frameIdRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
    }
  }, [gameState.isRunning, ctx, gameLoop])

  return {
    stopGameLoop: () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
    }
  }
}
