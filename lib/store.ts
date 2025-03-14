import type { Skin, StoreState } from "@/types/store"

const STORE_KEY = "snakely_store_state"

export const defaultStoreState: StoreState = {
  purchasedSkins: []
}

export function getStoreState(): StoreState {
  if (typeof window === "undefined") return { purchasedSkins: [] }
  
  const stored = localStorage.getItem(STORE_KEY)
  if (!stored) {
    const initial = { purchasedSkins: [] }
    localStorage.setItem(STORE_KEY, JSON.stringify(initial))
    return initial
  }

  return JSON.parse(stored)
}

export function saveSkinPurchase(skinId: string): void {
  const state = getStoreState()
  if (!state.purchasedSkins.includes(skinId)) {
    state.purchasedSkins.push(skinId)
    localStorage.setItem(STORE_KEY, JSON.stringify(state))
  }
}

// Available skins to purchase
export const skins: Skin[] = [
  {
    id: "bronze",
    name: "Bronze Snake",
    description: "A sleek bronze-colored snake skin",
    price: 1.99,
    color: "#CD7F32"
  },
  {
    id: "silver",
    name: "Silver Snake",
    description: "A shiny silver snake skin",
    price: 2.99,
    color: "#C0C0C0"
  },
  {
    id: "gold",
    name: "Gold Snake",
    description: "A luxurious gold snake skin",
    price: 5.99,
    color: "#FFD700"
  }
]
