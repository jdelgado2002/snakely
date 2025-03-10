import { useEffect, useRef, useCallback } from "react"
import { loadAudio } from "@/lib/utils"

export const useGameAudio = (isMuted: boolean) => {
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const consumeSoundRef = useRef<HTMLAudioElement | null>(null)
  const explosionSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
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

  const playBgMusic = useCallback(() => {
    if (bgMusicRef.current && !isMuted) {
      try {
        bgMusicRef.current.currentTime = 0
        bgMusicRef.current.play().catch(err => {
          console.warn("Error playing background music:", err)
        })
      } catch (err) {
        console.warn("Error playing background music:", err)
      }
    }
  }, [isMuted])

  const playConsumeSound = useCallback(() => {
    if (consumeSoundRef.current && !isMuted) {
      try {
        consumeSoundRef.current.currentTime = 0
        consumeSoundRef.current.play().catch(err => {
          console.warn("Error playing consume sound:", err)
        })
      } catch (err) {
        console.warn("Error playing consume sound:", err)
      }
    }
  }, [isMuted])

  const playExplosionSound = useCallback(() => {
    if (explosionSoundRef.current && !isMuted) {
      try {
        explosionSoundRef.current.currentTime = 0
        explosionSoundRef.current.play().catch(err => {
          console.warn("Error playing explosion sound:", err)
        })
      } catch (err) {
        console.warn("Error playing explosion sound:", err)
      }
    }
  }, [isMuted])

  const updateMuteState = useCallback((muted: boolean) => {
    if (bgMusicRef.current) bgMusicRef.current.muted = muted
    if (consumeSoundRef.current) consumeSoundRef.current.muted = muted
    if (explosionSoundRef.current) explosionSoundRef.current.muted = muted
  }, [])

  return {
    playBgMusic,
    playConsumeSound,
    playExplosionSound,
    updateMuteState,
  }
}
