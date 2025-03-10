import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Camera } from "./game-types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const shadeColor = (color: string, percent: number): string => {
  let R = parseInt(color.substring(1, 3), 16)
  let G = parseInt(color.substring(3, 5), 16)
  let B = parseInt(color.substring(5, 7), 16)

  R = Math.floor((R * (100 + percent)) / 100)
  G = Math.floor((G * (100 + percent)) / 100)
  B = Math.floor((B * (100 + percent)) / 100)

  R = Math.min(255, Math.max(0, R))
  G = Math.min(255, Math.max(0, G))
  B = Math.min(255, Math.max(0, B))

  return `#${[R, G, B].map(x => x.toString(16).padStart(2, "0")).join("")}`
}

export const isInViewport = (
  x: number,
  y: number,
  radius: number,
  camera: Camera,
  viewportWidth: number,
  viewportHeight: number
): boolean => {
  return (
    x + radius >= camera.x &&
    x - radius <= camera.x + viewportWidth &&
    y + radius >= camera.y &&
    y - radius <= camera.y + viewportHeight
  )
}

export const loadAudio = (src: string, volume = 0.5): HTMLAudioElement | null => {
  try {
    const audio = new Audio()
    audio.volume = volume

    audio.addEventListener("error", (e) => {
      console.warn(`Could not load audio file: ${src}`, e)
    })

    if (typeof window !== "undefined") {
      audio.src = src
    }

    return audio
  } catch (err) {
    console.warn(`Error creating audio element for ${src}:`, err)
    return null
  }
}
