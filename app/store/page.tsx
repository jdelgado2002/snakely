import { Metadata } from "next"
import StoreComponent from "@/components/store"

export const metadata: Metadata = {
  title: "Snakely Store - Get Awesome Skins!",
  description: "Purchase cool snake skins to customize your Snakely experience!", 
}

export default function StorePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-green-900">
      <StoreComponent />
    </main>
  )
}
