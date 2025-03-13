export interface Skin {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  color: string;
}

export interface StoreState {
  purchasedSkins: string[];
}
