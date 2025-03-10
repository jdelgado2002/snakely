"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import type { GameState, Worm, Segment, ScatteredSegment, Camera } from "@/lib/game-types"
import { generateGrassBackground } from "@/lib/background-generator"
import { useMobile } from "@/hooks/use-mobile"
import { useToast } from "@/components/ui/use-toast"
import { Volume2, VolumeX } from "lucide-react"

// Game constants
const BASE_CANVAS_WIDTH = 800
const BASE_CANVAS_HEIGHT = 600
const WORLD_WIDTH = 3000
const WORLD_HEIGHT = 3000
const HEAD_RADIUS_BASE = 12
const SEGMENT_RADIUS_BASE = 10
const PLAYER_COLORS = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#F033FF",
  "#FFFC33",
  "#FF33A8",
  "#33FFC5",
  "#C533FF",
  "#FFB533",
  "#33FFFC",
  "#FF336E",
  "#33FF8C",
  "#8C33FF",
  "#FFD133",
  "#33C5FF",
]
const PLAYER_NAMES = ["Player"]
const CPU_NAMES = [
  "CPU 1",
  "CPU 2",
  "CPU 3",
  "CPU 4",
  "CPU 5",
  "CPU 6",
  "CPU 7",
  "CPU 8",
  "CPU 9",
  "CPU 10",
  "CPU 11",
  "CPU 12",
  "CPU 13",
  "CPU 14",
  "CPU 15",
  "CPU 16",
  "CPU 17",
  "CPU 18",
  "CPU 19",
  "CPU 20",
  "CPU 21",
  "CPU 22",
  "CPU 23",
  "CPU 24",
  "CPU 25",
  "CPU 26",
  "CPU 27",
  "CPU 28",
  "CPU 29",
  "CPU 30",
  "CPU 31",
  "CPU 32",
  "CPU 33",
  "CPU 34",
  "CPU 35",
  "CPU 36",
  "CPU 37",
  "CPU 38",
  "CPU 39",
  "CPU 40",
  "CPU 41",
  "CPU 42",
  "CPU 43",
  "CPU 44",
  "CPU 45",
  "CPU 46",
  "CPU 47",
  "CPU 48",
  "CPU 49",
  "CPU 50",
]
const INITIAL_SEGMENTS_PLAYER = 10
const MIN_CPU_SEGMENTS = 5
const MAX_CPU_SEGMENTS = 15
const MIN_SEGMENT_SIZE_FACTOR = 0.7
const MAX_SEGMENT_SIZE_FACTOR = 1.3
const MOVEMENT_SPEED = 2
const TURN_SPEED = 0.1
const SEGMENT_SPACING = 15
const SCATTERED_SEGMENT_SPEED = 3
const ABSORPTION_DISTANCE = 20

// Add new constants for dynamic spawning
const POINTS_TO_SPAWN = 5 // Spawn new CPU every 5 points
const MAX_DYNAMIC_CPU_WORMS = 20 // Maximum number of additional CPU worms
const BASE_CPU_SPEED = 1.0 // Base movement speed multiplier for CPU worms
const DIFFICULTY_SPEED_INCREASE = 0.1 // Speed increase per difficulty level

function WormGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: BASE_CANVAS_WIDTH, height: BASE_CANVAS_HEIGHT })
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    isGameOver: false,
    winner: null,
    worms: [],
    scatteredSegments: [],
    roundWinner: null,
    camera: { x: 0, y: 0 },
    worldSize: { width: WORLD_WIDTH, height: WORLD_HEIGHT },
  })


  const animationFrameRef = useRef<number>(0)
  const lastUpdateTimeRef = useRef<number>(0)
  const keyStatesRef = useRef<{ [key: string]: boolean }>({})
  const touchControlsRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false })
  const [showTouchControls, setShowTouchControls] = useState(false)
  const [touchFeedback, setTouchFeedback] = useState({ left: false, right: false })
  const [isMuted, setIsMuted] = useState(false)
  const isMobile = useMobile()
  const { toast } = useToast()
  const scaleFactorRef = useRef(1)
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const consumeSoundRef = useRef<HTMLAudioElement | null>(null)
  const explosionSoundRef = useRef<HTMLAudioElement | null>(null)
  const [numCPUWorms, setNumCPUWorms] = useState(15)
  const [consumptionEffects, setConsumptionEffects] = useState<
    {
      x: number
      y: number
      color: string
      size: number
      alpha: number
      timestamp: number
    }[]
  >([])

  // Update GameState type to include difficulty tracking
  const [difficultyLevel, setDifficultyLevel] = useState(1)
  const [lastSpawnScore, setLastSpawnScore] = useState(0)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const worldBackgroundRef = useRef<HTMLImageElement | null>(null)

  // Initialize audio
  useEffect(() => {
    // Helper function to safely load audio
    const loadAudio = (src: string, volume = 0.5): HTMLAudioElement | null => {
      try {
        const audio = new Audio()
        audio.volume = volume

        // Add error handling for audio loading
        audio.addEventListener("error", (e) => {
          console.warn(`Could not load audio file: ${src}`, e)
        })

        // Only set the source if we're in a browser environment
        if (typeof window !== "undefined") {
          audio.src = src
        }

        return audio
      } catch (err) {
        console.warn(`Error creating audio element for ${src}:`, err)
        return null
      }
    }

    // Load audio files with error handling
    bgMusicRef.current = loadAudio("/bg-music.wav", 0.5)
    if (bgMusicRef.current) bgMusicRef.current.loop = true

    consumeSoundRef.current = loadAudio("/consume.wav", 0.7)
    explosionSoundRef.current = loadAudio("/consume.wav", 0.8)

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause()
        bgMusicRef.current = null
      }
      consumeSoundRef.current = null
      explosionSoundRef.current = null
    }
  }, [])

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = !isMuted
    }
    if (consumeSoundRef.current) {
      consumeSoundRef.current.muted = !isMuted
    }
    if (explosionSoundRef.current) {
      explosionSoundRef.current.muted = !isMuted
    }
  }

  // Play consume sound
  const playConsumeSound = () => {
    if (consumeSoundRef.current && !isMuted) {
      try {
        consumeSoundRef.current.currentTime = 0
        const playPromise = consumeSoundRef.current.play()

        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Error playing consume sound:", err)
          })
        }
      } catch (err) {
        console.warn("Error playing consume sound:", err)
      }
    }
  }

  // Play explosion sound
  const playExplosionSound = () => {
    if (explosionSoundRef.current && !isMuted) {
      try {
        explosionSoundRef.current.currentTime = 0
        const playPromise = explosionSoundRef.current.play()

        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Error playing explosion sound:", err)
          })
        }
      } catch (err) {
        console.warn("Error playing explosion sound:", err)
      }
    }
  }

  // Add consumption visual effect
  const addConsumptionEffect = (x: number, y: number, color: string, size: number) => {
    setConsumptionEffects((prev) => [
      ...prev,
      {
        x,
        y,
        color,
        size,
        alpha: 1,
        timestamp: Date.now(),
      },
    ])
  }

  // Initialize game
  const initializeGame = () => {
    setDifficultyLevel(1)
    setLastSpawnScore(0)

    // Start background music
    if (bgMusicRef.current && !isMuted) {
      try {
        bgMusicRef.current.currentTime = 0
        const playPromise = bgMusicRef.current.play()

        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Error playing background music:", err)
            // Game can continue without music
          })
        }
      } catch (err) {
        console.warn("Error playing background music:", err)
        // Game can continue without music
      }
    }

    // Create player worms
    const worms: Worm[] = []

    // Player worm starts in the center of the world
    const playerWorm: Worm = {
      id: `worm-player`,
      isPlayer: true,
      isAlive: true,
      color: PLAYER_COLORS[0],
      name: PLAYER_NAMES[0],
      head: {
        x: WORLD_WIDTH / 2,
        y: WORLD_HEIGHT / 2,
        radius: HEAD_RADIUS_BASE * scaleFactorRef.current,
      },
      angle: Math.random() * Math.PI * 2,
      segments: [],
      score: INITIAL_SEGMENTS_PLAYER,
      controls: { left: "ArrowLeft", right: "ArrowRight" },
      sizeFactor: 1.0,
    }

    // Add segments to player worm
    for (let j = 0; j < INITIAL_SEGMENTS_PLAYER; j++) {
      const segmentAngle = playerWorm.angle + Math.PI // Opposite direction of head
      playerWorm.segments.push({
        x: playerWorm.head.x - Math.cos(segmentAngle) * (j + 1) * SEGMENT_SPACING * scaleFactorRef.current,
        y: playerWorm.head.y - Math.sin(segmentAngle) * (j + 1) * SEGMENT_SPACING * scaleFactorRef.current,
        radius: SEGMENT_RADIUS_BASE * scaleFactorRef.current,
      })
    }

    worms.push(playerWorm)

    // Initialize camera to center on player in CSS pixels
    const camera: Camera = {
      x: (WORLD_WIDTH / 2) - (canvasSize.width / 2),
      y: (WORLD_HEIGHT / 2) - (canvasSize.height / 2)
    }

    // Create CPU worms
    for (let i = 0; i < numCPUWorms; i++) {
      // Random position in the world
      const x = Math.random() * (WORLD_WIDTH - 200) + 100
      const y = Math.random() * (WORLD_HEIGHT - 200) + 100

      // Random size factor for this worm
      const sizeFactor = MIN_SEGMENT_SIZE_FACTOR + Math.random() * (MAX_SEGMENT_SIZE_FACTOR - MIN_SEGMENT_SIZE_FACTOR)

      // Random number of segments
      const numSegments = Math.floor(MIN_CPU_SEGMENTS + Math.random() * (MAX_CPU_SEGMENTS - MIN_CPU_SEGMENTS))

      const cpuWorm: Worm = {
        id: `worm-cpu-${i}`,
        isPlayer: false,
        isAlive: true,
        color: PLAYER_COLORS[(i + 1) % PLAYER_COLORS.length],
        name: CPU_NAMES[i],
        head: {
          x: x,
          y: y,
          radius: HEAD_RADIUS_BASE * sizeFactor * scaleFactorRef.current,
        },
        angle: Math.random() * Math.PI * 2,
        segments: [],
        score: numSegments,
        controls: { left: "", right: "" },
        sizeFactor: sizeFactor,
      }

      // Add segments to CPU worm
      for (let j = 0; j < numSegments; j++) {
        const segmentAngle = cpuWorm.angle + Math.PI // Opposite direction of head
        cpuWorm.segments.push({
          x: cpuWorm.head.x - Math.cos(segmentAngle) * (j + 1) * SEGMENT_SPACING * sizeFactor * scaleFactorRef.current,
          y: cpuWorm.head.y - Math.sin(segmentAngle) * (j + 1) * SEGMENT_SPACING * sizeFactor * scaleFactorRef.current,
          radius: SEGMENT_RADIUS_BASE * sizeFactor * scaleFactorRef.current,
        })
      }

      worms.push(cpuWorm)
    }

    // Set initial game state
    setGameState({
      isRunning: true,
      isGameOver: false,
      winner: null,
      worms,
      scatteredSegments: [],
      roundWinner: null,
      camera,
      worldSize: { width: WORLD_WIDTH, height: WORLD_HEIGHT },
    })

    // Show toast notification
    toast({
      title: "Game Started!",
      description: isMobile
        ? "Touch left/right sides of the screen to control your worm"
        : "Use arrow keys to control your worm",
    })
  }

  // Handle window resize and background generation
  useEffect(() => {
    const handleResize = async () => {
      if (!canvasRef.current || !containerRef.current) return

      const canvas = canvasRef.current
      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      
      // Get window dimensions for better mobile handling
      const windowHeight = window.innerHeight
      const maxHeight = Math.min(windowHeight * 0.7, BASE_CANVAS_HEIGHT) // Limit to 70% of window height

      // Calculate dimensions maintaining aspect ratio
      const aspectRatio = BASE_CANVAS_WIDTH / BASE_CANVAS_HEIGHT
      let width = rect.width
      let height = width / aspectRatio

      // If height exceeds maxHeight, recalculate width to maintain aspect ratio
      if (height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio
      }

      // Calculate device pixel ratio and size ratio
      const dpr = window.devicePixelRatio || 1
      const sizeRatio = width / BASE_CANVAS_WIDTH // Use display width for size calculations

      // Set canvas display size (css pixels)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      
      // Set canvas internal size (actual pixels)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      
      // Store the canvas size for rendering
      setCanvasSize({ width: canvas.width / dpr, height: canvas.height / dpr }) // Divide by dpr to get CSS pixels
      
      // Initialize context scale
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(dpr, dpr)
        scaleFactorRef.current = sizeRatio // Update scale factor based on size ratio
      }

      // Update game state camera if it exists
      setGameState(prevState => {
        if (!prevState.isRunning) return prevState
        
        const playerWorm = prevState.worms.find(w => w.isPlayer)
        if (playerWorm) {
          return {
            ...prevState,
            camera: {
              x: playerWorm.head.x - (canvas.width / dpr) / 2,
              y: playerWorm.head.y - (canvas.height / dpr) / 2
            }
          }
        }
        return prevState
      })

      try {
        // Generate new background
        const worldBgImage = await generateGrassBackground(WORLD_WIDTH, WORLD_HEIGHT)
        worldBackgroundRef.current = worldBgImage
        setBackgroundLoaded(true)
      } catch (err) {
        console.error("Failed to generate background:", err)
        // Set a fallback background color
        if (ctx) {
          ctx.fillStyle = "#2d5a27" // Fallback dark green
          ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
        }
      }

      // Set touch controls visibility based on device
      setShowTouchControls(isMobile)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobile])

  // Set up keyboard controls
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

  // Set up touch controls
  useEffect(() => {
    if (!canvasRef.current) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const touchX = e.touches[0].clientX - rect.left

      // Determine if touch is on left or right half
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

      // Determine if touch is on left or right half
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

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  },)

  // Start game loop
  useEffect(() => {
    if (!gameState.isRunning) return

    const gameLoop = (timestamp: number) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = timestamp
      }

      const deltaTime = timestamp - lastUpdateTimeRef.current
      lastUpdateTimeRef.current = timestamp

      updateGame(deltaTime)
      renderGame()

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, )

  // Update consumption effects
  useEffect(() => {
    if (!gameState.isRunning || consumptionEffects.length === 0) return

    const updateEffects = () => {
      setConsumptionEffects((prev) =>
        prev
          .map((effect) => ({
            ...effect,
            alpha: effect.alpha - 0.02,
            size: effect.size * 1.03,
          }))
          .filter((effect) => effect.alpha > 0),
      )
    }

    const effectInterval = setInterval(updateEffects, 50)
    return () => clearInterval(effectInterval)
  }, [gameState.isRunning, consumptionEffects.length])

  // Add function to spawn a new CPU worm with scaled difficulty
  const spawnNewCPUWorm = (gameState: GameState) => {
    // Calculate a safe spawn position away from other worms
    const findSafePosition = (): { x: number; y: number } => {
      let attempts = 0
      const maxAttempts = 50
      const safeDistance = 200 * scaleFactorRef.current

      while (attempts < maxAttempts) {
        const x = Math.random() * (WORLD_WIDTH - 200) + 100
        const y = Math.random() * (WORLD_HEIGHT - 200) + 100
        let isSafe = true

        // Check distance from all existing worms
        for (const worm of gameState.worms) {
          if (!worm.isAlive) continue
          const dx = worm.head.x - x
          const dy = worm.head.y - y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < safeDistance) {
            isSafe = false
            break
          }
        }

        if (isSafe) {
          return { x, y }
        }
        attempts++
      }

      // Fallback to random position if no safe spot found
      return {
        x: Math.random() * (WORLD_WIDTH - 200) + 100,
        y: Math.random() * (WORLD_HEIGHT - 200) + 100,
      }
    }

    const safePos = findSafePosition()
    const cpuIndex = gameState.worms.length

    // Scale difficulty based on current level
    const speedMultiplier = BASE_CPU_SPEED + DIFFICULTY_SPEED_INCREASE * (difficultyLevel - 1)
    const sizeFactor = Math.max(0.7, Math.min(1.3, 1.0 - difficultyLevel * 0.05)) // Smaller = faster
    const numSegments = Math.floor(MIN_CPU_SEGMENTS + (difficultyLevel * 2))

    const newCPUWorm: Worm = {
      id: `worm-cpu-dynamic-${cpuIndex}`,
      isPlayer: false,
      isAlive: true,
      color: PLAYER_COLORS[cpuIndex % PLAYER_COLORS.length],
      name: `CPU ${cpuIndex}`,
      head: {
        x: safePos.x,
        y: safePos.y,
        radius: HEAD_RADIUS_BASE * sizeFactor * scaleFactorRef.current,
      },
      angle: Math.random() * Math.PI * 2,
      segments: [],
      score: numSegments,
      controls: { left: "", right: "" },
      sizeFactor: sizeFactor,
      speedMultiplier: speedMultiplier, // Add this to your Worm type
    }

    // Add segments
    for (let j = 0; j < numSegments; j++) {
      const segmentAngle = newCPUWorm.angle + Math.PI
      newCPUWorm.segments.push({
        x: newCPUWorm.head.x - Math.cos(segmentAngle) * (j + 1) * SEGMENT_SPACING * sizeFactor * scaleFactorRef.current,
        y: newCPUWorm.head.y - Math.sin(segmentAngle) * (j + 1) * SEGMENT_SPACING * sizeFactor * scaleFactorRef.current,
        radius: SEGMENT_RADIUS_BASE * sizeFactor * scaleFactorRef.current,
      })
    }

    return newCPUWorm
  }

  // Update game state
  const updateGame = () => {
    setGameState((prevState) => {
      // If game is over, don't update
      if (prevState.isGameOver) return prevState

      // Create a copy of the game state to modify
      const newState = { ...prevState }
      const aliveWorms = newState.worms.filter((worm) => worm.isAlive)

      // Check if game is over (only one worm left)
      if (aliveWorms.length === 1) {
        const winner = aliveWorms[0]


        // Show win/lose message
        if (winner.isPlayer) {
          toast({
            title: "🎉 You Win! 🎉",
            description: `You've defeated all other worms with a score of ${winner.score}!`,
            variant: "success",
          })
        } else {
          toast({
            title: "😢 Game Over",
            description: `${winner.name} has won the game.`,
            variant: "destructive",
          })
        }
        return {
          ...newState,
          isGameOver: true,
          winner: aliveWorms[0].id,
        }
      }

      // Update player worm direction based on keyboard or touch input
      aliveWorms.forEach((worm) => {
        if (worm.isPlayer) {
          // Check keyboard controls
          const leftPressed = keyStatesRef.current[worm.controls.left] || touchControlsRef.current.left
          const rightPressed = keyStatesRef.current[worm.controls.right] || touchControlsRef.current.right

          if (leftPressed) {
            worm.angle -= TURN_SPEED
          }
          if (rightPressed) {
            worm.angle += TURN_SPEED
          }
        } else {
          // CPU AI logic
          // Find closest target (player or scattered segment)
          let closestTarget = { x: 0, y: 0, distance: Number.POSITIVE_INFINITY, isSegment: false }

          // Check player worm
          const playerWorm = aliveWorms.find((w) => w.isPlayer)
          if (playerWorm) {
            const dx = playerWorm.head.x - worm.head.x
            const dy = playerWorm.head.y - worm.head.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Only target player if within reasonable distance
            if (distance < 800) {
              closestTarget = { x: playerWorm.head.x, y: playerWorm.head.y, distance, isSegment: false }
            }
          }

          // Check scattered segments
          newState.scatteredSegments.forEach((segment) => {
            const dx = segment.x - worm.head.x
            const dy = segment.y - worm.head.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < closestTarget.distance) {
              closestTarget = { x: segment.x, y: segment.y, distance, isSegment: true }
            }
          })

          // If no close target, move randomly
          if (closestTarget.distance === Number.POSITIVE_INFINITY) {
            // Occasionally change direction
            if (Math.random() < 0.02) {
              worm.angle += (Math.random() - 0.5) * TURN_SPEED * 5
            }
          } else {
            // Adjust angle to target
            const targetAngle = Math.atan2(closestTarget.y - worm.head.y, closestTarget.x - worm.head.x)

            // Determine shortest direction to turn
            let angleDiff = targetAngle - worm.angle
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI

            // Turn towards target
            if (angleDiff > 0) {
              worm.angle += Math.min(TURN_SPEED, angleDiff)
            } else {
              worm.angle -= Math.min(TURN_SPEED, -angleDiff)
            }
          }
        }
      })

      // Move all worms
      aliveWorms.forEach((worm) => {
        // Store previous head position for segment movement
        const prevHeadX = worm.head.x
        const prevHeadY = worm.head.y

        // Move head
        const speedFactor = worm.sizeFactor ? 1 / worm.sizeFactor : 1 // Smaller worms move faster
        if (!worm.isPlayer) {
          const speedMultiplier = worm.speedMultiplier || BASE_CPU_SPEED
          worm.head.x += Math.cos(worm.angle) * MOVEMENT_SPEED * speedMultiplier * speedFactor * scaleFactorRef.current
          worm.head.y += Math.sin(worm.angle) * MOVEMENT_SPEED * speedMultiplier * speedFactor * scaleFactorRef.current
        } else {
          worm.head.x += Math.cos(worm.angle) * MOVEMENT_SPEED * speedFactor * scaleFactorRef.current
          worm.head.y += Math.sin(worm.angle) * MOVEMENT_SPEED * speedFactor * scaleFactorRef.current
        }

        // World boundary checking
        if (worm.head.x < worm.head.radius) {
          worm.head.x = worm.head.radius
          worm.angle = Math.PI - worm.angle
        } else if (worm.head.x > WORLD_WIDTH - worm.head.radius) {
          worm.head.x = WORLD_WIDTH - worm.head.radius
          worm.angle = Math.PI - worm.angle
        }

        if (worm.head.y < worm.head.radius) {
          worm.head.y = worm.head.radius
          worm.angle = -worm.angle
        } else if (worm.head.y > WORLD_HEIGHT - worm.head.radius) {
          worm.head.y = WORLD_HEIGHT - worm.head.radius
          worm.angle = -worm.angle
        }

        // Move segments (follow the leader)
        if (worm.segments.length > 0) {
          const newSegments: Segment[] = []
          let prevX = prevHeadX
          let prevY = prevHeadY

          worm.segments.forEach((segment) => {
            const tempX = segment.x
            const tempY = segment.y

            // Calculate direction to previous segment
            const dx = prevX - segment.x
            const dy = prevY - segment.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Move segment towards previous segment/head
            const segmentSpacing = SEGMENT_SPACING * (worm.sizeFactor || 1) * scaleFactorRef.current
            if (distance > segmentSpacing) {
              const ratio = segmentSpacing / distance
              segment.x += dx * ratio
              segment.y += dy * ratio
            }

            newSegments.push(segment)
            prevX = tempX
            prevY = tempY
          })

          worm.segments = newSegments
        }
      })

      // Update camera to follow player
      const playerWorm = aliveWorms.find((worm) => worm.isPlayer)
      if (playerWorm) {
        // Calculate target camera position (centered on player)
        const targetCameraX = playerWorm.head.x - canvasSize.width / 2
        const targetCameraY = playerWorm.head.y - canvasSize.height / 2

        // Smooth camera movement
        newState.camera.x += (targetCameraX - newState.camera.x) * 0.1
        newState.camera.y += (targetCameraY - newState.camera.y) * 0.1

        // Ensure camera stays within world bounds
        newState.camera.x = Math.max(0, Math.min(newState.camera.x, WORLD_WIDTH - canvasSize.width))
        newState.camera.y = Math.max(0, Math.min(newState.camera.y, WORLD_HEIGHT - canvasSize.height))
      }

      // Move scattered segments
      const newScatteredSegments: ScatteredSegment[] = []
      newState.scatteredSegments.forEach((segment) => {
        // Move segment
        segment.x += segment.velocityX * scaleFactorRef.current
        segment.y += segment.velocityY * scaleFactorRef.current

        // Apply friction
        segment.velocityX *= 0.98
        segment.velocityY *= 0.98

        // Boundary checking
        if (
          segment.x > segment.radius &&
          segment.x < WORLD_WIDTH - segment.radius &&
          segment.y > segment.radius &&
          segment.y < WORLD_HEIGHT - segment.radius
        ) {
          newScatteredSegments.push(segment)
        }
      })
      newState.scatteredSegments = newScatteredSegments

      // Check for collisions between worm heads and other worms' bodies
      let roundWinnerFound = false

      aliveWorms.forEach((worm1) => {
        if (roundWinnerFound) return

        aliveWorms.forEach((worm2) => {
          if (roundWinnerFound || worm1.id === worm2.id) return

          // Check if worm1's head collides with worm2's body
          worm2.segments.forEach((segment) => {
            if (roundWinnerFound) return

            const dx = worm1.head.x - segment.x
            const dy = worm1.head.y - segment.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < worm1.head.radius + segment.radius) {
              // Collision with body - worm2 (body owner) wins, worm1 (head) explodes
              worm1.isAlive = false
              roundWinnerFound = true
              newState.roundWinner = worm2.id

              // Create explosion effect
              createExplosionEffect(newState, worm1)

              // Play explosion sound
              playExplosionSound()

              // Show round winner notification
              const isPlayerWinner = worm2.isPlayer
              const isPlayerLoser = worm1.isPlayer

              if (isPlayerWinner) {
                toast({
                  title: "Round Won! 🎉",
                  description: `You eliminated ${worm1.name}!`,
                  variant: "success",
                })
              } else if (isPlayerLoser) {
                toast({
                  title: "Round Lost! 😢",
                  description: `You crashed into ${worm2.name}'s body!`,
                  variant: "destructive",
                })
              }
            }
          })
        })
      })

      // Check for absorption of scattered segments
      aliveWorms.forEach((worm) => {
        const absorbedSegments: number[] = []

        newState.scatteredSegments.forEach((segment, index) => {
          const dx = worm.head.x - segment.x
          const dy = worm.head.y - segment.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const absorptionDistance = ABSORPTION_DISTANCE * (worm.sizeFactor || 1) * scaleFactorRef.current

          if (distance < worm.head.radius + absorptionDistance) {
            // Absorb segment
            absorbedSegments.push(index)
            worm.score++

            // Add consumption effect
            addConsumptionEffect(segment.x, segment.y, segment.color, segment.radius * 2)

            // Play consume sound
            playConsumeSound()

            // Show feedback for player
            if (worm.isPlayer) {
              toast({
                title: "Segment Absorbed!",
                description: `Size increased to ${worm.score}`,
                variant: "default",
              })

              // Check if player has gained enough points for new CPU spawn
              const pointsSinceLastSpawn = worm.score - lastSpawnScore
              if (pointsSinceLastSpawn >= POINTS_TO_SPAWN) {
                setLastSpawnScore(worm.score)
                setDifficultyLevel((prev) => prev + 1)

                // Only spawn if below max limit
                const currentCPUs = newState.worms.filter((w) => !w.isPlayer).length
                if (currentCPUs < MAX_DYNAMIC_CPU_WORMS) {
                  const newCPU = spawnNewCPUWorm(newState)
                  newState.worms.push(newCPU)

                  // Show notification
                  toast({
                    title: "New Challenger!",
                    description: `A level ${difficultyLevel} CPU worm has appeared!`,
                    variant: "default",
                  })
                }
              }
            }

            // Add new segment to worm
            if (worm.segments.length > 0) {
              const lastSegment = worm.segments[worm.segments.length - 1]
              worm.segments.push({
                x: lastSegment.x,
                y: lastSegment.y,
                radius: (worm.sizeFactor || 1) * SEGMENT_RADIUS_BASE * scaleFactorRef.current,
              })
            } else {
              // If no segments, add one behind the head
              const angle = worm.angle + Math.PI
              const segmentSpacing = SEGMENT_SPACING * (worm.sizeFactor || 1) * scaleFactorRef.current
              worm.segments.push({
                x: worm.head.x + Math.cos(angle) * segmentSpacing,
                y: worm.head.y + Math.sin(angle) * segmentSpacing,
                radius: (worm.sizeFactor || 1) * SEGMENT_RADIUS_BASE * scaleFactorRef.current,
              })
            }
          }
        })

        // Remove absorbed segments
        if (absorbedSegments.length > 0) {
          newState.scatteredSegments = newState.scatteredSegments.filter(
            (_, index) => !absorbedSegments.includes(index),
          )
        }
      })

      return newState
    })
  }

  // Create explosion effect when a worm is eliminated
  const createExplosionEffect = (gameState: GameState, worm: Worm) => {
    // Scatter segments
    worm.segments.forEach((segment) => {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * SCATTERED_SEGMENT_SPEED
      gameState.scatteredSegments.push({
        x: segment.x,
        y: segment.y,
        radius: segment.radius,
        color: worm.color,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
      })
    })

    // Add explosion particles from the head
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * SCATTERED_SEGMENT_SPEED * 1.5
      gameState.scatteredSegments.push({
        x: worm.head.x,
        y: worm.head.y,
        radius: Math.random() * 5 * scaleFactorRef.current + 2,
        color: worm.color,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
      })
    }

    // Add visual effect
    addConsumptionEffect(worm.head.x, worm.head.y, worm.color, worm.head.radius * 3)
  }

  // Render game
  const renderGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas using CSS pixel dimensions
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

    // Draw background
    if (backgroundLoaded && worldBackgroundRef.current) {
      // Apply camera transform for background
      ctx.save()
      ctx.translate(-gameState.camera.x, -gameState.camera.y)
      
      // Draw the background image
      ctx.drawImage(worldBackgroundRef.current, 0, 0)
      
      // Restore transform
      ctx.restore()
    }

    // Draw world boundaries
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
    ctx.lineWidth = 5
    ctx.strokeRect(-gameState.camera.x, -gameState.camera.y, WORLD_WIDTH, WORLD_HEIGHT)

    // Draw touch control indicators if active
    if (showTouchControls) {
      // Left control
      ctx.fillStyle = touchFeedback.left ? "rgba(255, 87, 51, 0.3)" : "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(0, 0, canvasSize.width / 2, canvasSize.height)

      // Right control
      ctx.fillStyle = touchFeedback.right ? "rgba(51, 87, 255, 0.3)" : "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(canvasSize.width / 2, 0, canvasSize.width / 2, canvasSize.height)

      // Draw arrows
      const arrowSize = 30 * scaleFactorRef.current

      // Left arrow
      ctx.fillStyle = touchFeedback.left ? "#FF5733" : "rgba(255, 255, 255, 0.5)"
      ctx.beginPath()
      ctx.moveTo(canvasSize.width / 4 + arrowSize, canvasSize.height / 2)
      ctx.lineTo(canvasSize.width / 4 - arrowSize, canvasSize.height / 2)
      ctx.lineTo(canvasSize.width / 4, canvasSize.height / 2 - arrowSize)
      ctx.closePath()
      ctx.fill()

      // Right arrow
      ctx.fillStyle = touchFeedback.right ? "#3357FF" : "rgba(255, 255, 255, 0.5)"
      ctx.beginPath()
      ctx.moveTo((canvasSize.width / 4) * 3 - arrowSize, canvasSize.height / 2)
      ctx.lineTo((canvasSize.width / 4) * 3 + arrowSize, canvasSize.height / 2)
      ctx.lineTo((canvasSize.width / 4) * 3, canvasSize.height / 2 - arrowSize)
      ctx.closePath()
      ctx.fill()
    }

    // Draw mini-map
    const miniMapSize = 150 * scaleFactorRef.current
    const miniMapX = canvasSize.width - miniMapSize - 10
    const miniMapY = 10
    const miniMapScale = miniMapSize / WORLD_WIDTH

    // Draw mini-map background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize * (WORLD_HEIGHT / WORLD_WIDTH))

    // Draw current view area on mini-map
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
    ctx.lineWidth = 2
    ctx.strokeRect(
      miniMapX + gameState.camera.x * miniMapScale,
      miniMapY + gameState.camera.y * miniMapScale,
      canvasSize.width * miniMapScale,
      canvasSize.height * miniMapScale,
    )

    // Draw worms on mini-map
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

    // Apply camera transform for main rendering
    ctx.save()
    ctx.translate(-Math.floor(gameState.camera.x), -Math.floor(gameState.camera.y))

    // Draw scattered segments
    gameState.scatteredSegments.forEach((segment) => {
      // Skip rendering if outside visible area
      if (!isInViewport(segment.x, segment.y, segment.radius)) return

      ctx.fillStyle = segment.color
      ctx.beginPath()
      ctx.arc(segment.x, segment.y, segment.radius, 0, Math.PI * 2)
      ctx.fill()

      // Add shine effect
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.beginPath()
      ctx.arc(segment.x - segment.radius * 0.3, segment.y - segment.radius * 0.3, segment.radius * 0.3, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw worms
    gameState.worms.forEach((worm) => {
      if (!worm.isAlive) return

      // Skip rendering if completely outside visible area
      if (!isWormInViewport(worm)) return

      // Draw segments
      worm.segments.forEach((segment) => {
        // Skip rendering if outside visible area
        if (!isInViewport(segment.x, segment.y, segment.radius)) return

        // Gradient for segments to create depth
        const gradient = ctx.createRadialGradient(segment.x, segment.y, 0, segment.x, segment.y, segment.radius)
        gradient.addColorStop(0, worm.color)
        gradient.addColorStop(0.7, worm.color)
        gradient.addColorStop(1, shadeColor(worm.color, -20))

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(segment.x, segment.y, segment.radius, 0, Math.PI * 2)
        ctx.fill()

        // Add highlight for 3D effect
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

        // Add border for better visibility
        ctx.strokeStyle = shadeColor(worm.color, -30)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(segment.x, segment.y, segment.radius, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Skip head rendering if outside visible area
      if (!isInViewport(worm.head.x, worm.head.y, worm.head.radius)) return

      // Draw head
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

      // Add border for better visibility
      ctx.strokeStyle = shadeColor(worm.color, -30)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(worm.head.x, worm.head.y, worm.head.radius, 0, Math.PI * 2)
      ctx.stroke()

      // Add highlight for 3D effect
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

      // Draw eyes
      ctx.fillStyle = "white"
      const eyeOffsetX = Math.cos(worm.angle) * (worm.head.radius * 0.5)
      const eyeOffsetY = Math.sin(worm.angle) * (worm.head.radius * 0.5)
      const eyeRadius = worm.head.radius * 0.3

      // Left eye
      ctx.beginPath()
      ctx.arc(
        worm.head.x + eyeOffsetX - Math.sin(worm.angle) * eyeRadius,
        worm.head.y + eyeOffsetY + Math.cos(worm.angle) * eyeRadius,
        eyeRadius,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      // Right eye
      ctx.beginPath()
      ctx.arc(
        worm.head.x + eyeOffsetX + Math.sin(worm.angle) * eyeRadius,
        worm.head.y + eyeOffsetY - Math.cos(worm.angle) * eyeRadius,
        eyeRadius,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      // Draw pupils
      ctx.fillStyle = "black"

      // Left pupil
      ctx.beginPath()
      ctx.arc(
        worm.head.x + eyeOffsetX * 1.2 - Math.sin(worm.angle) * eyeRadius,
        worm.head.y + eyeOffsetY * 1.2 + Math.cos(worm.angle) * eyeRadius,
        eyeRadius * 0.5,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      // Right pupil
      ctx.beginPath()
      ctx.arc(
        worm.head.x + eyeOffsetX * 1.2 + Math.sin(worm.angle) * eyeRadius,
        worm.head.y + eyeOffsetY * 1.2 - Math.cos(worm.angle) * eyeRadius,
        eyeRadius * 0.5,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      // Draw player indicator and score
      ctx.fillStyle = "white"
      ctx.font = `${14 * scaleFactorRef.current}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Draw name and score
      const nameY = worm.head.y - worm.head.radius - 20 * scaleFactorRef.current

      // Draw background for better visibility
      const textWidth = ctx.measureText(worm.name).width
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(worm.head.x - textWidth / 2 - 5, nameY - 10, textWidth + 10, 20)

      // Draw text
      ctx.fillStyle = worm.color
      ctx.fillText(worm.name, worm.head.x, nameY)

      // Draw score
      ctx.fillStyle = "white"
      ctx.fillText(`Size: ${worm.score}`, worm.head.x, nameY + 15 * scaleFactorRef.current)

      // Add crown to player worm for better visibility
      if (worm.isPlayer) {
        const crownSize = worm.head.radius * 0.8
        const crownY = worm.head.y - worm.head.radius - 5 * scaleFactorRef.current

        // Draw crown
        ctx.fillStyle = "#FFD700" // Gold
        ctx.beginPath()
        ctx.moveTo(worm.head.x - crownSize, crownY)
        ctx.lineTo(worm.head.x - crownSize / 2, crownY - crownSize)
        ctx.lineTo(worm.head.x, crownY - crownSize / 2)
        ctx.lineTo(worm.head.x + crownSize / 2, crownY - crownSize)
        ctx.lineTo(worm.head.x + crownSize, crownY)
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = "#B8860B" // Dark gold
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })

    // Draw consumption effects
    consumptionEffects.forEach((effect) => {
      // Skip rendering if outside visible area
      if (!isInViewport(effect.x, effect.y, effect.size)) return

      ctx.globalAlpha = effect.alpha

      // Draw ripple effect
      ctx.strokeStyle = effect.color
      ctx.lineWidth = 3 * scaleFactorRef.current
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2)
      ctx.stroke()

      // Draw particles
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

    // Restore canvas transform
    ctx.restore()

    // Draw round winner notification
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

    // Draw game over message
    if (gameState.isGameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

      const winner = gameState.worms.find((worm) => worm.id === gameState.winner)
      if (winner) {
        // Draw winner message
        if (winner.isPlayer) {
          // Player wins - splashy celebration
          ctx.fillStyle = "rgba(255, 215, 0, 0.3)" // Gold background
          ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

          // Draw confetti
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

          // Draw trophy
          const trophyX = canvasSize.width / 2
          const trophyY = canvasSize.height / 2 - 80 * scaleFactorRef.current
          const trophySize = 60 * scaleFactorRef.current

          // Trophy cup
          ctx.fillStyle = "#FFD700"
          ctx.beginPath()
          ctx.arc(trophyX, trophyY, trophySize, 0, Math.PI, true)
          ctx.fill()

          // Trophy handles
          ctx.beginPath()
          ctx.arc(trophyX - trophySize, trophyY, trophySize / 2, -Math.PI / 2, Math.PI / 2, false)
          ctx.arc(trophyX + trophySize, trophyY, trophySize / 2, Math.PI / 2, -Math.PI / 2, false)
          ctx.fill()

          // Trophy stem
          ctx.fillRect(trophyX - trophySize / 4, trophyY, trophySize / 2, trophySize * 1.5)

          // Trophy base
          ctx.beginPath()
          ctx.ellipse(trophyX, trophyY + trophySize * 1.5, trophySize, trophySize / 3, 0, 0, Math.PI * 2)
          ctx.fill()

          // Winner text
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
          // CPU wins - sad message
          ctx.fillStyle = "rgba(0, 0, 100, 0.3)" // Blue sad background
          ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

          // Draw sad face
          const faceX = canvasSize.width / 2
          const faceY = canvasSize.height / 2 - 60 * scaleFactorRef.current
          const faceSize = 50 * scaleFactorRef.current

          // Face
          ctx.fillStyle = "#FFC107"
          ctx.beginPath()
          ctx.arc(faceX, faceY, faceSize, 0, Math.PI * 2)
          ctx.fill()

          // Eyes
          ctx.fillStyle = "#333"
          ctx.beginPath()
          ctx.arc(faceX - faceSize / 3, faceY - faceSize / 5, faceSize / 8, 0, Math.PI * 2)
          ctx.arc(faceX + faceSize / 3, faceY - faceSize / 5, faceSize / 8, 0, Math.PI * 2)
          ctx.fill()

          // Sad mouth
          ctx.strokeStyle = "#333"
          ctx.lineWidth = faceSize / 10
          ctx.beginPath()
          ctx.arc(faceX, faceY + faceSize / 2, faceSize / 2, Math.PI * 0.3, Math.PI * 0.7, true)
          ctx.stroke()

          // Game over text
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
  }, )

  // Helper function to check if an object is in the viewport
  const isInViewport = (x: number, y: number, radius: number): boolean => {
    return (
      x + radius >= gameState.camera.x &&
      x - radius <= gameState.camera.x + canvasSize.width &&
      y + radius >= gameState.camera.y &&
      y - radius <= gameState.camera.y + canvasSize.height
    )
  }

  // Helper function to check if a worm is in the viewport
  const isWormInViewport = (worm: Worm): boolean => {
    // Check if head is in viewport
    if (isInViewport(worm.head.x, worm.head.y, worm.head.radius)) {
      return true
    }

    // Check if any segment is in viewport
    for (const segment of worm.segments) {
      if (isInViewport(segment.x, segment.y, segment.radius)) {
        return true
      }
    }

    return false
  }

  // Helper function to shade colors
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

  // Handle start button click
  const handleStartClick = () => {
    // Reset game state
    cancelAnimationFrame(animationFrameRef.current)
    lastUpdateTimeRef.current = 0
    initializeGame()
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div ref={containerRef} className="w-full relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="w-full h-auto border-4 border-green-700 rounded-lg shadow-lg bg-green-500 touch-none"
        />

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
                  onChange={(e) => setNumCPUWorms(Number.parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleStartClick}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg"
              >
                Start Game
              </Button>
            </div>
          </div>
        )}

        {/* Sound control button */}
        <Button
          onClick={toggleMute}
          className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full"
          size="icon"
          variant="ghost"
        >
          {isMuted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
        </Button>
      </div>

      {gameState.isRunning && (
        <div className="mt-4">
          <Button
            onClick={handleStartClick}
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
        <p className="mb-2">If your head hits another worm&apos;s body, you lose and they win that round.</p>
        <p className="mb-2">When a worm is eliminated, their segments scatter and can be collected to grow longer.</p>
        <p>The last worm standing wins the game!</p>
      </div>
    </div>
  )
}

export default WormGame
