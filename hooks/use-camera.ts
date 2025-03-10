import { useCallback } from "react"
import type { GameState, Worm } from "@/lib/game-types"

export function useCamera(gameState: GameState, canvasSize: { width: number; height: number }, scaleFactorRef: React.MutableRefObject<number>) {
  const updateCamera = useCallback((playerWorm: Worm) => {
    const targetCameraX = playerWorm.head.x - canvasSize.width / 2
    const targetCameraY = playerWorm.head.y - canvasSize.height / 2

    gameState.camera.x += (targetCameraX - gameState.camera.x) * 0.1
    gameState.camera.y += (targetCameraY - gameState.camera.y) * 0.1

    gameState.camera.x = Math.max(0, Math.min(gameState.camera.x, gameState.worldSize.width - canvasSize.width))
    gameState.camera.y = Math.max(0, Math.min(gameState.camera.y, gameState.worldSize.height - canvasSize.height))
  }, [gameState, canvasSize])

  const renderCamera = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.translate(-Math.floor(gameState.camera.x), -Math.floor(gameState.camera.y))
  }, [gameState])

  return { updateCamera, renderCamera }
}
