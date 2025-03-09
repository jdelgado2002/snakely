import WormGame from "@/components/worm-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-green-900">
      <h1 className="text-4xl font-bold text-white mb-4 text-center">Worm Battle</h1>
      <WormGame />
    </main>
  )
}

