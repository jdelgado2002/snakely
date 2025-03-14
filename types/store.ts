export interface Skin {
  id: string
  name: string
  description: string
  price: number
  color: string
}

export interface StoreState {
  purchasedSkins: string[]
}
