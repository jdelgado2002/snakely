import type { StoreState, Skin } from "@/types/store"

const STORE_KEY = "snakely-store"

export const defaultStoreState: StoreState = {
  purchasedSkins: []
}

export function getStoreState(): StoreState {
  if (typeof window === 'undefined') return defaultStoreState
  
  const stored = localStorage.getItem(STORE_KEY)
  if (!stored) return defaultStoreState

  try {
    return JSON.parse(stored)
  } catch {
    return defaultStoreState
  }
}

export function saveSkinPurchase(skinId: string) {
  const state = getStoreState()
  if (!state.purchasedSkins.includes(skinId)) {
    state.purchasedSkins.push(skinId)
    localStorage.setItem(STORE_KEY, JSON.stringify(state))
  }
}

// Available skins to purchase
export const skins: Skin[] = [
  {
    id: "rainbow-snake",
    name: "Rainbow Snake", 
    price: 2.99,
    image: "/skins/rainbow-snake.png",
    description: "A colorful, mesmerizing snake skin!",
    color: "#FF5733"
  },
  {
    id: "golden-snake",
    name: "Golden Snake",
    price: 4.99,
    image: "/skins/golden-snake.png",
    description: "The most luxurious snake skin!",
    color: "#FFD700"
  },
  {
    id: "neon-snake",
    name: "Neon Snake",
    price: 3.99,
    image: "/skins/neon-snake.png",
    description: "Glow in style with this neon skin!",
    color: "#39FF14"
  }
]
