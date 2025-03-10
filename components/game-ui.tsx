import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import type { GameState } from "@/lib/game-types"

interface GameUIProps {
  gameState: GameState
  isMobile: boolean
  isMuted: boolean
  numCPUWorms: number
  onStartClick: () => void
  onMuteToggle: () => void
  onCPUWormsChange: (value: number) => void
}

export function GameUI({
  gameState,
  isMobile,
  isMuted,
  numCPUWorms,
  onStartClick,
  onMuteToggle,
  onCPUWormsChange,
}: GameUIProps) {
  return (
    <>
      {!gameState.isRunning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center p-4">
            <h2 className="text-3xl font-bold text-white mb-4">Worm Battle</h2>
            <p className="text-white mb-6">
              {isMobile
                ? "Touch the left or right side of the screen to control your worm"
                : "Use the left and right arrow keys to control your worm"}
            </p>
            <div className="mb-6">
              <label className="text-white block mb-2">Number of CPU Worms: {numCPUWorms}</label>
              <input
                type="range"
                min="5"
                max="50"
                value={numCPUWorms}
                onChange={(e) => onCPUWormsChange(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <Button
              onClick={onStartClick}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xlÍ font-bold rounded-lg"
            >
              Start Game
            </Button>
          </div>
        </div>
      )}

      <Button
        onClick={onMuteToggle}
        className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full"
        size="icon"
        variant="ghost"
      >
        {isMuted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
      </Button>

      {gameState.isRunning && (
        <div className="mt-4">
          <Button
            onClick={onStartClick}
            className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
          >
            {gameState.isGameOver ? "Play Again" : "Restart"}
          </Button>
        </div>
      )}

      <div className="mt-4 text-white text-center max-w-2xl px-4">
        <h2 className="text-xl font-bold mb-2">How to Play</h2>
        {isMobile ? (
          <p className="mb-2">
            Touch the <span className="bg-gray-800 px-2 py-1 rounded">left</span> or{" "}
            <span className="bg-gray-800 px-2 py-1 rounded">right</span> side of the screen to control your worm.
          </p>
        ) : (
          <p className="mb-2">
            Use the <span className="bg-gray-800 px-2 py-1 rounded">←</span> and{" "}
            <span className="bg-gray-800 px-2 py-1 rounded">→</span> arrow keys to control your worm.
          </p>
        )}
        <p className="mb-2">If your head hits another worm's body, you lose and they win that round.</p>
        <p className="mb-2">When a worm is eliminated, their segments scatter and can be collected to grow longer.</p>
        <p>The last worm standing wins the game!</p>
      </div>
    </>
  )
}
