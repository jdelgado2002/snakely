import { useMemo } from 'react'
import type { Worm, ScatteredSegment } from '@/lib/game-types'

const CELL_SIZE = 100 // Size of each grid cell

interface SpatialHash {
  insert: (x: number, y: number, radius: number, id: string) => void
  query: (x: number, y: number, radius: number) => Set<string>
  clear: () => void
}

export function useSpatialHash() {
  const hash = useMemo(() => {
    const grid = new Map<string, Set<string>>()

    const getCells = (x: number, y: number, radius: number) => {
      const minX = Math.floor((x - radius) / CELL_SIZE)
      const maxX = Math.floor((x + radius) / CELL_SIZE)
      const minY = Math.floor((y - radius) / CELL_SIZE)
      const maxY = Math.floor((y + radius) / CELL_SIZE)
      const cells: string[] = []

      for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++) {
          cells.push(`${i},${j}`)
        }
      }
      return cells
    }

    const spatialHash: SpatialHash = {
      insert(x, y, radius, id) {
        const cells = getCells(x, y, radius)
        cells.forEach(cell => {
          if (!grid.has(cell)) {
            grid.set(cell, new Set())
          }
          grid.get(cell)!.add(id)
        })
      },

      query(x, y, radius) {
        const cells = getCells(x, y, radius)
        const result = new Set<string>()
        
        cells.forEach(cell => {
          const ids = grid.get(cell)
          if (ids) {
            ids.forEach(id => result.add(id))
          }
        })

        return result
      },

      clear() {
        grid.clear()
      }
    }

    return spatialHash
  }, [])

  return hash
}
