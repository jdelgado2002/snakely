export interface Segment {
  x: number
  y: number
  radius: number
}

export interface ScatteredSegment extends Segment {
  color: string
  velocityX: number
  velocityY: number
}

export interface Worm {
  id: string
  isPlayer: boolean
  isAlive: boolean
  color: string
  name: string
  head: Segment
  angle: number
  segments: Segment[]
  score: number
  controls: {
    left: string
    right: string
  }
  sizeFactor?: number
}

export interface Camera {
  x: number
  y: number
}

export interface GameState {
  isRunning: boolean
  isGameOver: boolean
  winner: string | null
  roundWinner: string | null
  worms: Worm[]
  scatteredSegments: ScatteredSegment[]
  camera: Camera
  worldSize: {
    width: number
    height: number
  }
}

