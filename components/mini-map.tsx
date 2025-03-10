import { WORLD } from "@/lib/constants"
import type { GameState } from "@/lib/game-types"

interface MiniMapProps {
  gameState: GameState
  canvasSize: { width: number; height: number }
  scaleFactorRef: React.MutableRefObject<number>
}

export function MiniMap({ gameState, canvasSize, scaleFactorRef }: MiniMapProps) {
  const miniMapSize = 150 * scaleFactorRef.current
  const miniMapScale = miniMapSize / WORLD.WIDTH

  return (
    <div 
      className="absolute top-2 right-2 bg-black/50 rounded-lg"
      style={{
        width: miniMapSize,
        height: miniMapSize * (WORLD.HEIGHT / WORLD.WIDTH)
      }}
    >
      {/* Current view area */}
      <div
        className="absolute border border-white/80"
        style={{
          left: gameState.camera.x * miniMapScale,
          top: gameState.camera.y * miniMapScale,
          width: canvasSize.width * miniMapScale,
          height: canvasSize.height * miniMapScale,
        }}
      />

      {/* Worm dots */}
      {gameState.worms.map((worm) => 
        worm.isAlive && (
          <div
            key={worm.id}
            className="absolute rounded-full"
            style={{
              left: worm.head.x * miniMapScale,
              top: worm.head.y * miniMapScale,
              width: worm.isPlayer ? 6 : 4,
              height: worm.isPlayer ? 6 : 4,
              backgroundColor: worm.color,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      )}
    </div>
  )
}
