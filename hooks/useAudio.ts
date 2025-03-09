import { useEffect, useRef, useCallback } from 'react';

export function useAudio(src: string) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    // Create AudioContext
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Fetch and decode audio file
    fetch(src)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContextRef.current!.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        audioBufferRef.current = audioBuffer;
      })
      .catch(error => {
        console.error('Error loading audio:', error);
      });

    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, [src]);

  const play = useCallback(() => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    try {
      // Create a new buffer source for each play
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, []);

  return { play };
}
