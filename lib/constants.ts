export const CANVAS = {
  BASE_WIDTH: 800,
  BASE_HEIGHT: 600,
} as const

export const WORLD = {
  WIDTH: 3000,
  HEIGHT: 3000,
} as const

export const WORM = {
  HEAD_RADIUS_BASE: 12,
  SEGMENT_RADIUS_BASE: 10,
  INITIAL_SEGMENTS_PLAYER: 10,
  MIN_CPU_SEGMENTS: 5,
  MAX_CPU_SEGMENTS: 15,
  MIN_SEGMENT_SIZE_FACTOR: 0.7,
  MAX_SEGMENT_SIZE_FACTOR: 1.3,
  MOVEMENT_SPEED: 2,
  TURN_SPEED: 0.1,
  SEGMENT_SPACING: 15,
  SCATTERED_SEGMENT_SPEED: 3,
  ABSORPTION_DISTANCE: 20,
} as const

export const GAME = {
  MAX_CPU_WORMS: 50,
  CAMERA_EDGE_BUFFER: 150,
  POINTS_TO_SPAWN: 5,
  MAX_DYNAMIC_CPU_WORMS: 20,
  BASE_CPU_SPEED: 1.0,
  DIFFICULTY_SPEED_INCREASE: 1.1,
} as const

export const COLORS = {
  PLAYER: [
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
  ],
} as const

export const NAMES = {
  PLAYER: ["Player"],
  CPU: Array.from({ length: 50 }, (_, i) => `CPU ${i + 1}`),
} as const
