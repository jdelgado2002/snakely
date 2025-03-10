import { useEffect, useRef, useState } from "react"
import type { Controls } from "@/lib/game-types"

interface InputState {
  keyStates: { [key: string]: boolean }
  touchControls: { left: boolean; right: boolean }
  touchFeedback: { left: boolean; right: boolean }
}

export function useInputControls(isMobile: boolean) {
  const keyStatesRef = useRef<{ [key: string]: boolean }>({})
  const touchControlsRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false })
  const [touchFeedback, setTouchFeedback] = useState({ left: false, right: false })
  const [showTouchControls, setShowTouchControls] = useState(false)

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keyStatesRef.current[e.key] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keyStatesRef.current[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Touch controls
  const setupTouchControls = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const touchX = e.touches[0].clientX - rect.left

      if (touchX < rect.width / 2) {
        touchControlsRef.current.left = true
        touchControlsRef.current.right = false
        setTouchFeedback({ left: true, right: false })
      } else {
        touchControlsRef.current.left = false
        touchControlsRef.current.right = true
        setTouchFeedback({ left: false, right: true })
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const touchX = e.touches[0].clientX - rect.left

      if (touchX < rect.width / 2) {
        touchControlsRef.current.left = true
        touchControlsRef.current.right = false
        setTouchFeedback({ left: true, right: false })
      } else {
        touchControlsRef.current.left = false
        touchControlsRef.current.right = true
        setTouchFeedback({ left: false, right: true })
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      touchControlsRef.current.left = false
      touchControlsRef.current.right = false
      setTouchFeedback({ left: false, right: false })
    }

    const canvas = canvasRef.current
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd)

    setShowTouchControls(isMobile)

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }

  const getInputState = (controls: Controls): { left: boolean; right: boolean } => ({
    left: keyStatesRef.current[controls.left] || touchControlsRef.current.left,
    right: keyStatesRef.current[controls.right] || touchControlsRef.current.right,
  })

  return {
    showTouchControls,
    touchFeedback,
    setupTouchControls,
    getInputState,
  }
}
