'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX } from 'lucide-react'

interface GameIntroProps {
  onStart: () => void
}

export default function GameIntro({ onStart }: GameIntroProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [bgMusic, setBgMusic] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio
    const audio = new Audio('/bg-music.wav')
    audio.loop = true
    audio.volume = 0.5
    setBgMusic(audio)

    // Start fade in animation after a short delay
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const toggleMute = () => {
    if (bgMusic) {
      if (isMuted) {
        bgMusic.play().catch(console.error)
      } else {
        bgMusic.pause()
      }
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black">
      <div 
        className={`transition-opacity duration-1000 ease-in-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } flex flex-col items-center gap-8`}
      >
        {/* Logo/Title Image */}
        <div className="relative w-96 h-96 mb-8">
          <Image
            src="/snakely.jpg"
            alt="Snakely Game Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Start Button */}
        <Button 
          onClick={onStart}
          size="lg" 
          className="text-2xl px-8 py-6 bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
        >
          Start Game
        </Button>

        {/* Sound Toggle */}
        <Button
          onClick={toggleMute}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6" />
          ) : (
            <Volume2 className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  )
}