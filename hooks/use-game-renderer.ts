import { useCallback } from "react"
import { shadeColor, isInViewport } from "@/lib/utils"
import type { GameState, Worm } from "@/lib/game-types"

interface RenderOptions {
  ctx: CanvasRenderingContext2D
  canvasSize: { width: number; height: number }
  scaleFactorRef: React.MutableRefObject<number>
  backgroundLoaded: boolean
  worldBackgroundRef: React.MutableRefObject<HTMLImageElement | null>
  showTouchControls: boolean
  touchFeedback: { left: boolean; right: boolean }
  consumptionEffects: {
    x: number
    y: number
    color: string
    size: number
    alpha: number
    timestamp: number
  }[]
}

export function useGameRenderer() {
  const renderGame = useCallback((gameState: GameState, options: RenderOptions) => {
    const { ctx, canvasSize, scaleFactorRef, backgroundLoaded, worldBackgroundRef, showTouchControls, touchFeedback, consumptionEffects } = options

    // Clear canvas
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

    // Draw background
    if (backgroundLoaded && worldBackgroundRef.current) {
      ctx.save()
      ctx.translate(-gameState.camera.x, -gameState.camera.y)
      ctx.drawImage(worldBackgroundRef.current, 0, 0)
      ctx.restore()
    }

    // Draw world boundaries
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
    ctx.lineWidth = 5
    ctx.strokeRect(-gameState.camera.x, -gameState.camera.y, gameState.worldSize.width, gameState.worldSize.height)

    // Draw touch controls if active
    if (showTouchControls) {
      // ...existing touch control rendering code...
    }

    // Apply camera transform
    ctx.save()
    ctx.translate(-Math.floor(gameState.camera.x), -Math.floor(gameState.camera.y))

    // Draw scattered segments
    // ...existing scattered segments rendering code...

    // Draw worms
    // ...existing worms rendering code...

    // Draw consumption effects
    // ...existing consumption effects rendering code...

    // Restore canvas transform
    ctx.restore()

    // Draw game overlay (winner notification, game over message, etc)
    // ...existing overlay rendering code...
  }, [])

  return { renderGame }
}
