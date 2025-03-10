import { useCallback } from "react"
import { WORLD, GAME } from "@/lib/constants"
import type { Camera } from "@/lib/game-types"

interface CameraOptions {
  width: number
  height: number
}

export function useCamera(options: CameraOptions) {
  const updateCamera = useCallback(
    (targetX: number, targetY: number, currentCamera: Camera): Camera => {
      // Calculate target camera position (centered on target)
      const targetCameraX = targetX - options.width / 2
      const targetCameraY = targetY - options.height / 2

      // Smooth camera movement
      const newX = currentCamera.x + (targetCameraX - currentCamera.x) * 0.1
      const newY = currentCamera.y + (targetCameraY - currentCamera.y) * 0.1

      // Ensure camera stays within world bounds with buffer
      return {
        x: Math.max(
          0,
          Math.min(newX, WORLD.WIDTH - options.width - GAME.CAMERA_EDGE_BUFFER)
        ),
        y: Math.max(
          0,
          Math.min(newY, WORLD.HEIGHT - options.height - GAME.CAMERA_EDGE_BUFFER)
        ),
      }
    },
    [options.width, options.height]
  )

  return { updateCamera }
}
