import { useCallback, useEffect, useRef } from "react"
import type { GameState, Segment, ScatteredSegment, Worm } from "@/lib/game-types"

const useRenderGame = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  canvasSize: { width: number; height: number },
  gameState: GameState,
  showTouchControls: boolean,
  touchFeedback: { left: boolean; right: boolean },
  backgroundLoaded: boolean,
  worldBackgroundRef: React.RefObject<HTMLImageElement | null>,
  consumptionEffects: {
    x: number
    y: number
    color: string
    size: number
    alpha: number
    timestamp: number
  }[],
  scaleFactorRef: React.RefObject<number>,
  renderCamera: (ctx: CanvasRenderingContext2D) => void
) => {
  const shadeColor = (color: string, percent: number): string => {
    let R = Number.parseInt(color.substring(1, 3), 16)
    let G = Number.parseInt(color.substring(3, 5), 16)
    let B = Number.parseInt(color.substring(5, 7), 16)

    R = Math.floor((R * (100 + percent)) / 100)
    G = Math.floor((G * (100 + percent)) / 100)
    B = Math.floor((B * (100 + percent)) / 100)

    R = R < 255 ? R : 255
    G = R < 255 ? G : 255
    B = G < 255 ? G : 255

    R = R > 0 ? R : 0
    G = R > 0 ? G : 0
    B = G > 0 ? G : 0

    const RR = R.toString(16).padStart(2, "0")
    const GG = G.toString(16).padStart(2, "0")
    const BB = B.toString(16).padStart(2, "0")

    return `#${RR}${GG}${BB}`
  }

  const isInViewport = (x: number, y: number, radius: number): boolean => {
    return (
      x + radius >= gameState.camera.x &&
      x - radius <= gameState.camera.x + canvasSize.width &&
      y + radius >= gameState.camera.y &&
      y - radius <= gameState.camera.y + canvasSize.height
    )
  }

  const isWormInViewport = (worm: Worm): boolean => {
    if (isInViewport(worm.head.x, worm.head.y, worm.head.radius)) {
      return true
    }

    for (const segment of worm.segments) {
      if (isInViewport(segment.x, segment.y, segment.radius)) {
        return true
      }
    }

    return false
  }

  const renderGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

    if (backgroundLoaded && worldBackgroundRef.current) {
      ctx.save()
      ctx.translate(-gameState.camera.x, -gameState.camera.y)
      ctx.drawImage(worldBackgroundRef.current, 0, 0)
      ctx.restore()
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
    ctx.lineWidth = 5
    ctx.strokeRect(-gameState.camera.x, -gameState.camera.y, WORLD_WIDTH, WORLD_HEIGHT)

    if (showTouchControls) {
      ctx.fillStyle = touchFeedback.left ? "rgba(255, 87, 51, 0.3)" : "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(0, 0, canvasSize.width / 2, canvasSize.height)

      ctx.fillStyle = touchFeedback.right ? "rgba(51, 87, 255, 0.3)" : "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(canvasSize.width / 2, 0, canvasSize.width / 2, canvasSize.height)

      const arrowSize = 30 * scaleFactorRef.current

      ctx.fillStyle = touchFeedback.left ? "#FF5733" : "rgba(255, 255, 255, 0.5)"
      ctx.beginPath()
      ctx.moveTo(canvasSize.width / 4 + arrowSize, canvasSize.height / 2)
      ctx.lineTo(canvasSize.width / 4 - arrowSize, canvasSize.height / 2)
      ctx.lineTo(canvasSize.width / 4, canvasSize.height / 2 - arrowSize)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = touchFeedback.right ? "#3357FF" : "rgba(255, 255, 255, 0.5)"
      ctx.beginPath()
      ctx.moveTo((canvasSize.width / 4) * 3 - arrowSize, canvasSize.height / 2)
      ctx.lineTo((canvasSize.width / 4) * 3 + arrowSize, canvasSize.height / 2)
      ctx.lineTo((canvasSize.width / 4) * 3, canvasSize.height / 2 - arrowSize)
      ctx.closePath()
      ctx.fill()
    }

    const miniMapSize = 150 * scaleFactorRef.current
    const miniMapX = canvasSize.width - miniMapSize - 10
    const miniMapY = 10
    const miniMapScale = miniMapSize / WORLD_WIDTH

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize * (WORLD_HEIGHT / WORLD_WIDTH))

    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
    ctx.lineWidth = 2
    ctx.strokeRect(
      miniMapX + gameState.camera.x * miniMapScale,
      miniMapY + gameState.camera.y * miniMapScale,
      canvasSize.width * miniMapScale,
      canvasSize.height * miniMapScale,
    )

    gameState.worms.forEach((worm) => {
      if (!worm.isAlive) return

      ctx.fillStyle = worm.color
      ctx.beginPath()
      ctx.arc(
        miniMapX + worm.head.x * miniMapScale,
        miniMapY + worm.head.y * miniMapScale,
        worm.isPlayer ? 3 : 2,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    })

    ctx.save()
    renderCamera(ctx)

    gameState.scatteredSegments.forEach((segment) => {
      if (!isInViewport(segment.x, segment.y, segment.radius)) return

      ctx.fillStyle = segment.color
      ctx.beginPath()
      ctx.arc(segment.x, segment.y, segment.radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.beginPath()
      ctx.arc(segment.x - segment.radius * 0.3, segment.y - segment.radius * 0.3, segment.radius * 0.3, 0, Math.PI * 2)
      ctx.fill()
    })

    gameState.worms.forEach((worm) => {
      if (!worm.isAlive) return

      if (!isWormInViewport(worm)) return

      worm.segments.forEach((segment) => {
        if (!isInViewport(segment.x, segment.y, segment.radius)) return

        const gradient = ctx.createRadialGradient(segment.x, segment.y, 0, segment.x, segment.y, segment.radius)
        gradient.addColorStop(0, worm.color)
        gradient.addColorStop(0.7, worm.color)
        gradient.addColorStop(1, shadeColor(worm.color, -20))

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(segment.x, segment.y, segment.radius, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
        ctx.beginPath()
        ctx.arc(
          segment.x - segment.radius * 0.3,
          segment.y - segment.radius * 0.3,
          segment.radius * 0.4,
          0,
          Math.PI * 2,
        )
        ctx.fill()

        ctx.strokeStyle = shadeColor(worm.color, -30)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(segment.x, segment.y, segment.radius, 0, Math.PI * 2)
        ctx.stroke()
      })

      if (!isInViewport(worm.head.x, worm.head.y, worm.head.radius)) return

      const headGradient = ctx.createRadialGradient(
        worm.head.x,
        worm.head.y,
        0,
        worm.head.x,
        worm.head.y,
        worm.head.radius,
      )
      headGradient.addColorStop(0, worm.color)
      headGradient.addColorStop(0.7, worm.color)
      headGradient.addColorStop(1, shadeColor(worm.color, -20))

      ctx.fillStyle = headGradient
      ctx.beginPath()
      ctx.arc(worm.head.x, worm.head.y, worm.head.radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = shadeColor(worm.color, -30)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(worm.head.x, worm.head.y, worm.head.radius, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.beginPath()
      ctx.arc(
        worm.head.x - worm.head.radius * 0.3,
        worm.head.y - worm.head.radius * 0.3,
        worm.head.radius * 0.4,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      ctx.fillStyle = "white"
      const eyeOffsetX = Math.cos(worm.angle) * (worm.head.radius * 0.5)
      const eyeOffsetY = Math.sin(worm.angle) * (worm.head.radius * 0.5)
      const eyeRadius = worm.head.radius * 0.3

      ctx.beginPath()
      ctx.arc(
        worm.head.x + eyeOffsetX - Math.sin(worm.angle) * eyeRadius,
        worm.head.y + eyeOffsetY + Math.cos(worm.angle) * eyeRadius,
        eyeRadius,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      ctx.beginPath()
      ctx.arc(
        worm.head.x + eyeOffsetX + Math.sin(worm.angle) * eyeRadius,
        worm.head.y + eyeOffsetY - Math.cos(worm.angle) * eyeRadius,
        eyeRadius,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      ctx.fillStyle = "black"

      ctx.beginPath()
      ctx.arc(
        worm.head.x + eyeOffsetX * 1.2 - Math.sin(worm.angle) * eyeRadius,
        worm.head.y + eyeOffsetY * 1.2 + Math.cos(worm.angle) * eyeRadius,
        eyeRadius * 0.5,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      ctx.beginPath()
      ctx.arc(
        worm.head.x + eyeOffsetX * 1.2 + Math.sin(worm.angle) * eyeRadius,
        worm.head.y + eyeOffsetY * 1.2 - Math.cos(worm.angle) * eyeRadius,
        eyeRadius * 0.5,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      ctx.fillStyle = "white"
      ctx.font = `${14 * scaleFactorRef.current}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const nameY = worm.head.y - worm.head.radius - 20 * scaleFactorRef.current

      const textWidth = ctx.measureText(worm.name).width
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(worm.head.x - textWidth / 2 - 5, nameY - 10, textWidth + 10, 20)

      ctx.fillStyle = worm.color
      ctx.fillText(worm.name, worm.head.x, nameY)

      ctx.fillStyle = "white"
      ctx.fillText(`Size: ${worm.score}`, worm.head.x, nameY + 15 * scaleFactorRef.current)

      if (worm.isPlayer) {
        const crownSize = worm.head.radius * 0.8
        const crownY = worm.head.y - worm.head.radius - 5 * scaleFactorRef.current

        ctx.fillStyle = "#FFD700"
        ctx.beginPath()
        ctx.moveTo(worm.head.x - crownSize, crownY)
        ctx.lineTo(worm.head.x - crownSize / 2, crownY - crownSize)
        ctx.lineTo(worm.head.x, crownY - crownSize / 2)
        ctx.lineTo(worm.head.x + crownSize / 2, crownY - crownSize)
        ctx.lineTo(worm.head.x + crownSize, crownY)
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = "#B8860B"
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })

    consumptionEffects.forEach((effect) => {
      if (!isInViewport(effect.x, effect.y, effect.size)) return

      ctx.globalAlpha = effect.alpha

      ctx.strokeStyle = effect.color
      ctx.lineWidth = 3 * scaleFactorRef.current
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2)
      ctx.stroke()

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const distance = effect.size * 0.7
        const particleX = effect.x + Math.cos(angle) * distance
        const particleY = effect.y + Math.sin(angle) * distance
        const particleSize = effect.size * 0.15

        ctx.fillStyle = effect.color
        ctx.beginPath()
        ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
    })

    ctx.restore()

    if (gameState.roundWinner && !gameState.isGameOver) {
      const winner = gameState.worms.find((worm) => worm.id === gameState.roundWinner)
      if (winner) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(
          canvasSize.width / 2 - 150 * scaleFactorRef.current,
          20,
          300 * scaleFactorRef.current,
          60 * scaleFactorRef.current,
        )

        ctx.fillStyle = winner.color
        ctx.font = `${24 * scaleFactorRef.current}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${winner.name} wins this round!`, canvasSize.width / 2, 50 * scaleFactorRef.current)
      }
    }

    if (gameState.isGameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

      const winner = gameState.worms.find((worm) => worm.id === gameState.winner)
      if (winner) {
        if (winner.isPlayer) {
          ctx.fillStyle = "rgba(255, 215, 0, 0.3)"
          ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

          for (let i = 0; i < 100; i++) {
            ctx.fillStyle = ["#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FFFC33", "#33FFFC"][
              Math.floor(Math.random() * 6)
            ]

            const x = Math.random() * canvasSize.width
            const y = Math.random() * canvasSize.height
            const size = Math.random() * 10 * scaleFactorRef.current + 5

            ctx.beginPath()
            ctx.rect(x, y, size, size)
            ctx.fill()
          }

          const trophyX = canvasSize.width / 2
          const trophyY = canvasSize.height / 2 - 80 * scaleFactorRef.current
          const trophySize = 60 * scaleFactorRef.current

          ctx.fillStyle = "#FFD700"
          ctx.beginPath()
          ctx.arc(trophyX, trophyY, trophySize, 0, Math.PI, true)
          ctx.fill()

          ctx.beginPath()
          ctx.arc(trophyX - trophySize, trophyY, trophySize / 2, -Math.PI / 2, Math.PI / 2, false)
          ctx.arc(trophyX + trophySize, trophyY, trophySize / 2, Math.PI / 2, -Math.PI / 2, false)
          ctx.fill()

          ctx.fillRect(trophyX - trophySize / 4, trophyY, trophySize / 2, trophySize * 1.5)

          ctx.beginPath()
          ctx.ellipse(trophyX, trophyY + trophySize * 1.5, trophySize, trophySize / 3, 0, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = "#FFD700"
          ctx.font = `bold ${36 * scaleFactorRef.current}px Arial`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText("YOU WIN! 🎉", canvasSize.width / 2, canvasSize.height / 2 + 40 * scaleFactorRef.current)

          ctx.fillStyle = "white"
          ctx.font = `${24 * scaleFactorRef.current}px Arial`
          ctx.fillText(
            `Final Score: ${winner.score}`,
            canvasSize.width / 2,
            canvasSize.height / 2 + 80 * scaleFactorRef.current,
          )
        } else {
          ctx.fillStyle = "rgba(0, 0, 100, 0.3)"
          ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

          const faceX = canvasSize.width / 2
          const faceY = canvasSize.height / 2 - 60 * scaleFactorRef.current
          const faceSize = 50 * scaleFactorRef.current

          ctx.fillStyle = "#FFC107"
          ctx.beginPath()
          ctx.arc(faceX, faceY, faceSize, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = "#333"
          ctx.beginPath()
          ctx.arc(faceX - faceSize / 3, faceY - faceSize / 5, faceSize / 8, 0, Math.PI * 2)
          ctx.arc(faceX + faceSize / 3, faceY - faceSize / 5, faceSize / 8, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = "#333"
          ctx.lineWidth = faceSize / 10
          ctx.beginPath()
          ctx.arc(faceX, faceY + faceSize / 2, faceSize / 2, Math.PI * 0.3, Math.PI * 0.7, true)
          ctx.stroke()

          ctx.fillStyle = "#FF5733"
          ctx.font = `bold ${36 * scaleFactorRef.current}px Arial`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText("GAME OVER 😢", canvasSize.width / 2, canvasSize.height / 2 + 40 * scaleFactorRef.current)

          ctx.fillStyle = "white"
          ctx.font = `${24 * scaleFactorRef.current}px Arial`
          ctx.fillText(
            `${winner.name} has won with score: ${winner.score}`,
            canvasSize.width / 2,
            canvasSize.height / 2 + 80 * scaleFactorRef.current,
          )
        }
      } else {
        ctx.fillStyle = "white"
        ctx.font = `${36 * scaleFactorRef.current}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("Game Over", canvasSize.width / 2, canvasSize.height / 2 - 40 * scaleFactorRef.current)
      }

      ctx.fillStyle = "white"
      ctx.font = `${24 * scaleFactorRef.current}px Arial`
      ctx.fillText(
        "Press Start to play again",
        canvasSize.width / 2,
        canvasSize.height / 2 + 120 * scaleFactorRef.current,
      )
    }
  }, [canvasSize, gameState, showTouchControls, touchFeedback, backgroundLoaded, consumptionEffects])

  useEffect(() => {
    renderGame()
  }, [renderGame])
}

export default useRenderGame