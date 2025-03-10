"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { useKeyboardControls } from "@/hooks/use-keyboard-controls"

// Game constants
const PLAYER_SIZE = 40
const CAKE_SIZE = 20
const ICE_CREAM_SIZE = 30
const PLAYER_SPEED = 4
const CAKE_SPEED = 7
const SLIP_FACTOR = 2.5

interface Player {
  color(arg0: number, color: unknown): unknown
  health: number
  direction: unknown
  isSlipping: unknown
  name(name: unknown, x: number, arg2: number): unknown
  id: string
  x: number
  y: number
  // Add other player properties as needed
}

interface GameCanvasProps {
  players: Player[]
  localPlayerId: string
  updatePlayerPosition: (id: string, x: number, y: number) => void
  handlePlayerHit: (id: string) => void
  makePlayerSlip: (id: string) => void
  incrementScore: (id: string) => void
}

export default function GameCanvas({
  players,
  localPlayerId,
  updatePlayerPosition,
  handlePlayerHit,
  makePlayerSlip,
  incrementScore,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [cakes, setCakes] = useState<{
    velocityX: number
    velocityY: number; x: number; y: number 
}[]>([])
  const [iceCreams, setIceCreams] = useState<{ x: number; y: number }[]>([])
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)
  const [playerSprites, setPlayerSprites] = useState<{ [key: string]: HTMLImageElement }>({})
  const [cakeSprite, setCakeSprite] = useState<HTMLImageElement | null>(null)
  const [iceCreamSprite, setIceCreamSprite] = useState<HTMLImageElement | null>(null)
  const collisionsRef = useRef<{
    targetId(targetId: unknown): unknown
    sourceId(sourceId: unknown): unknown; x: number; y: number 
}[]>([]) // Initialize collisionsRef here
  const [gameRunning] = useState(true)

  const { keys } = useKeyboardControls()

  // Initialize game assets
  useEffect(() => {
    // In a real game, we would load actual sprite images
    // For now, we'll create placeholder images
    const bg = new Image()
    bg.src = "/grass.png?height=500&width=800"
    bg.onload = () => setBackgroundImage(bg)

    // Create colored player sprites
    const playerImages = {}
    players.forEach((player) => {
      // Create separate sprites for left and right facing
      const directions = ["left", "right"]

      directions.forEach((direction) => {
        const canvas = document.createElement("canvas")
        canvas.width = PLAYER_SIZE
        canvas.height = PLAYER_SIZE
        const ctx = canvas.getContext("2d")

        if (ctx) {
          // Draw player body (3D-like circle with shading)
          const gradient = ctx.createRadialGradient(
            PLAYER_SIZE / 2,
            PLAYER_SIZE / 2,
            0,
            PLAYER_SIZE / 2,
            PLAYER_SIZE / 2,
            PLAYER_SIZE / 2,
          )
          gradient.addColorStop(0, player.color)
          gradient.addColorStop(0.8, player.color)
          gradient.addColorStop(1, `${player.color}80`) // Semi-transparent edge for 3D effect

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(PLAYER_SIZE / 2, PLAYER_SIZE / 2, PLAYER_SIZE / 2 - 2, 0, Math.PI * 2)
          ctx.fill()

          // Add highlight for 3D effect
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
          ctx.beginPath()
          ctx.arc(PLAYER_SIZE / 2 - 5, PLAYER_SIZE / 2 - 5, PLAYER_SIZE / 3, 0, Math.PI / 2)
          ctx.fill()

          // Draw face based on direction
          const faceOffset = direction === "left" ? -5 : 5

          // Draw eyes
          ctx.fillStyle = "white"
          ctx.beginPath()
          ctx.arc(PLAYER_SIZE / 2 - faceOffset, PLAYER_SIZE / 2 - 5, 6, 0, Math.PI * 2)
          ctx.arc(PLAYER_SIZE / 2 + faceOffset, PLAYER_SIZE / 2 - 5, 6, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = "black"
          ctx.beginPath()
          // Adjust eye position based on direction
          const eyeXOffset = direction === "left" ? -1 : 1
          ctx.arc(PLAYER_SIZE / 2 - faceOffset + eyeXOffset, PLAYER_SIZE / 2 - 5, 2.5, 0, Math.PI * 2)
          ctx.arc(PLAYER_SIZE / 2 + faceOffset + eyeXOffset, PLAYER_SIZE / 2 - 5, 2.5, 0, Math.PI * 2)
          ctx.fill()

          // Draw mouth
          ctx.beginPath()
          ctx.arc(PLAYER_SIZE / 2, PLAYER_SIZE / 2 + 8, 6, 0, Math.PI)
          ctx.stroke()

          // Draw chef hat
          ctx.fillStyle = "white"
          ctx.beginPath()
          ctx.ellipse(PLAYER_SIZE / 2, PLAYER_SIZE / 4, PLAYER_SIZE / 3, PLAYER_SIZE / 6, 0, 0, Math.PI * 2)
          ctx.fill()
        }

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = canvas.toDataURL()

        if (!playerImages[player.id]) {
          playerImages[player.id] = {}
        }
        playerImages[player.id][direction] = img
      })
    })
    setPlayerSprites(playerImages)

    // Create cake sprite with more detail
    const cakeCanvas = document.createElement("canvas")
    cakeCanvas.width = CAKE_SIZE
    cakeCanvas.height = CAKE_SIZE
    const cakeCtx = cakeCanvas.getContext("2d")

    // Draw cake base
    cakeCtx.fillStyle = "#F9E4B7"
    cakeCtx.beginPath()
    cakeCtx.arc(CAKE_SIZE / 2, CAKE_SIZE / 2, CAKE_SIZE / 2 - 1, 0, Math.PI * 2)
    cakeCtx.fill()

    // Draw frosting
    cakeCtx.fillStyle = "#FF9999"
    cakeCtx.beginPath()
    cakeCtx.arc(CAKE_SIZE / 2, CAKE_SIZE / 2, CAKE_SIZE / 2 - 2, 0, Math.PI)
    cakeCtx.closePath()
    cakeCtx.fill()

    // Add sprinkles
    const sprinkleColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"]
    for (let i = 0; i < 8; i++) {
      cakeCtx.fillStyle = sprinkleColors[i % sprinkleColors.length]
      cakeCtx.fillRect(
        CAKE_SIZE / 4 + (Math.random() * CAKE_SIZE) / 2,
        CAKE_SIZE / 4 + (Math.random() * CAKE_SIZE) / 4,
        2,
        2,
      )
    }

    const cakeImg = new Image()
    cakeImg.crossOrigin = "anonymous"
    cakeImg.src = cakeCanvas.toDataURL()
    setCakeSprite(cakeImg)

    // Create ice cream sprite
    const iceCreamCanvas = document.createElement("canvas")
    iceCreamCanvas.width = ICE_CREAM_SIZE
    iceCreamCanvas.height = ICE_CREAM_SIZE
    const iceCreamCtx = iceCreamCanvas.getContext("2d")

    // Draw ice cream
    iceCreamCtx.fillStyle = "#B3E5FC"
    iceCreamCtx.beginPath()
    iceCreamCtx.arc(ICE_CREAM_SIZE / 2, ICE_CREAM_SIZE / 2, ICE_CREAM_SIZE / 2 - 1, 0, Math.PI * 2)
    iceCreamCtx.fill()

    // Draw drips
    iceCreamCtx.fillStyle = "white"
    iceCreamCtx.beginPath()
    iceCreamCtx.arc(ICE_CREAM_SIZE / 2, ICE_CREAM_SIZE / 2, ICE_CREAM_SIZE / 2 - 5, 0, Math.PI * 2)
    iceCreamCtx.fill()

    const iceCreamImg = new Image()
    iceCreamImg.src = iceCreamCanvas.toDataURL()
    setIceCreamSprite(iceCreamImg)

    // Initialize ice cream hazards
    const initialIceCreams = []
    for (let i = 0; i < 5; i++) {
      initialIceCreams.push({
        id: `ice-${i}`,
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50,
      })
    }
    setIceCreams(initialIceCreams)
  }, [players])

  // Game loop
  useEffect(() => {
    if (!gameRunning) return

    const gameLoop = setInterval(() => {
      // Clear previous collisions
      collisionsRef.current = []

      // Update cake positions
      setCakes((prevCakes) =>
        prevCakes
          .map((cake) => ({
            ...cake,
            x: cake.x + cake.velocityX,
            y: cake.y + cake.velocityY,
          }))
          .filter((cake) => {
            // Check if cake is still on screen
            if (cake.x < 0 || cake.x > 800 || cake.y < 0 || cake.y > 500) {
              return false
            }

            // Check for collisions with players
            for (const player of players) {
              if (player.id !== cake.playerId && player.health > 0) {
                const dx = cake.x - player.x
                const dy = cake.y - player.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < PLAYER_SIZE / 2 + CAKE_SIZE / 2) {
                  // Record collision to handle outside of render
                  collisionsRef.current.push({
                    targetId: player.id,
                    sourceId: cake.playerId,
                  })
                  return false
                }
              }
            }

            return true
          }),
      )
    }, 1000 / 60) // 60 FPS

    return () => clearInterval(gameLoop)
  }, [players, gameRunning])

  // Handle collisions in a separate effect
  useEffect(() => {
    if (collisionsRef.current.length > 0) {
      // Process all collisions
      collisionsRef.current.forEach((collision) => {
        handlePlayerHit(collision.targetId)
        incrementScore(collision.sourceId)
      })

      // Clear collisions after processing
      collisionsRef.current = []
    }
  }, [handlePlayerHit, incrementScore])

  // Handle player movement
  useEffect(() => {
    if (!localPlayerId || !gameRunning) return

    const moveInterval = setInterval(() => {
      const player = players.find((p) => p.id === localPlayerId)
      if (!player || player.health <= 0) return

      let dx = 0
      let dy = 0
      let direction = player.direction

      if (keys.ArrowUp || keys.w) dy -= PLAYER_SPEED
      if (keys.ArrowDown || keys.s) dy += PLAYER_SPEED
      if (keys.ArrowLeft || keys.a) {
        dx -= PLAYER_SPEED
        direction = "left"
      }
      if (keys.ArrowRight || keys.d) {
        dx += PLAYER_SPEED
        direction = "right"
      }

      // Apply slipping effect
      if (player.isSlipping) {
        dx *= SLIP_FACTOR
        dy *= SLIP_FACTOR
      }

      // Boundary checking
      const newX = Math.max(PLAYER_SIZE / 2, Math.min(800 - PLAYER_SIZE / 2, player.x + dx))
      const newY = Math.max(PLAYER_SIZE / 2, Math.min(500 - PLAYER_SIZE / 2, player.y + dy))

      // Check for ice cream collisions
      let shouldSlip = false
      for (const iceCream of iceCreams) {
        const iceDx = newX - iceCream.x
        const iceDy = newY - iceCream.y
        const iceDistance = Math.sqrt(iceDx * iceDx + iceDy * iceDy)

        if (iceDistance < PLAYER_SIZE / 2 + ICE_CREAM_SIZE / 2) {
          shouldSlip = true
          break
        }
      }

      // Update position first
      updatePlayerPosition(localPlayerId, newX, newY, direction)

      // Then handle slipping if needed (outside the render phase)
      if (shouldSlip) {
        setTimeout(() => makePlayerSlip(localPlayerId), 0)
      }
    }, 1000 / 60)

    return () => clearInterval(moveInterval)
  }, [localPlayerId, players, keys, iceCreams, updatePlayerPosition, makePlayerSlip, gameRunning])

  // Define handleShoot with useCallback
  const handleShoot = useCallback(
    (e) => {
      if (e.code === "Space" && localPlayerId) {
        e.preventDefault() // Prevent page scrolling
        const player = players.find((p) => p.id === localPlayerId)
        if (!player || player.health <= 0) return

        // Calculate direction based on player's facing direction
        const velocityX = player.direction === "right" ? CAKE_SPEED : -CAKE_SPEED
        let velocityY = 0

        // Add some randomness to the throw
        velocityY = (Math.random() - 0.5) * (CAKE_SPEED / 2)

        // Add new cake
        setCakes((prevCakes) => [
          ...prevCakes,
          {
            id: Date.now().toString(),
            playerId: localPlayerId,
            x: player.x + (player.direction === "right" ? PLAYER_SIZE / 2 : -PLAYER_SIZE / 2),
            y: player.y,
            velocityX,
            velocityY,
          },
        ])

        console.log("Cake thrown!", velocityX, velocityY)
      }
    },
    [localPlayerId, players],
  )

  // Handle shooting cakes
  useEffect(() => {
    window.addEventListener("keydown", handleShoot)
    return () => window.removeEventListener("keydown", handleShoot)
  }, [handleShoot])

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
    } else {
      // Fallback background
      ctx.fillStyle = "#E6F7FF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw some cartoon clouds
      ctx.fillStyle = "white"
      for (let i = 0; i < 5; i++) {
        const x = (i * 200) % canvas.width
        const y = 50 + ((i * 30) % 100)
        const size = 40 + ((i * 10) % 30)

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.arc(x + size * 0.7, y - size * 0.2, size * 0.8, 0, Math.PI * 2)
        ctx.arc(x + size * 1.3, y, size * 0.9, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Draw ice creams
    if (iceCreamSprite) {
      iceCreams.forEach((iceCream) => {
        ctx.drawImage(
          iceCreamSprite,
          iceCream.x - ICE_CREAM_SIZE / 2,
          iceCream.y - ICE_CREAM_SIZE / 2,
          ICE_CREAM_SIZE,
          ICE_CREAM_SIZE,
        )
      })
    }

    // Draw players
    players.forEach((player) => {
      if (player.health <= 0) return // Don't draw dead players

      if (playerSprites[player.id] && playerSprites[player.id][player.direction]) {
        ctx.drawImage(
          playerSprites[player.id][player.direction],
          player.x - PLAYER_SIZE / 2,
          player.y - PLAYER_SIZE / 2,
          PLAYER_SIZE,
          PLAYER_SIZE,
        )

        // Draw player name
        ctx.fillStyle = "black"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(player.name, player.x, player.y - PLAYER_SIZE / 2 - 5)

        // Draw slipping effect
        if (player.isSlipping) {
          ctx.strokeStyle = "#B3E5FC"
          ctx.lineWidth = 2
          ctx.beginPath()
          for (let i = 0; i < 5; i++) {
            const angle = (Date.now() / 100 + i * 72) % 360
            const radius = PLAYER_SIZE / 2 + 5
            const x = player.x + Math.cos((angle * Math.PI) / 180) * radius
            const y = player.y + Math.sin((angle * Math.PI) / 180) * radius
            ctx.moveTo(player.x, player.y)
            ctx.lineTo(x, y)
          }
          ctx.stroke()
        }
      }
    })

    // Draw cakes
    if (cakeSprite) {
      cakes.forEach((cake) => {
        ctx.drawImage(cakeSprite, cake.x - CAKE_SIZE / 2, cake.y - CAKE_SIZE / 2, CAKE_SIZE, CAKE_SIZE)
      })
    }
  }, [players, cakes, iceCreams, backgroundImage, playerSprites, cakeSprite, iceCreamSprite])

  return <canvas ref={canvasRef} width={800} height={500} className="w-full h-auto" />
}

