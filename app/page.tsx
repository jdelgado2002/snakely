import WormGame from "@/components/worm-game"
import RestorePurchasesForm from '@/components/restore-purchases-form'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-green-900">
      <h1 className="text-4xl font-bold text-white mb-4 text-center">Worm Battle</h1>
      <WormGame />
      <h1 className="text-4xl font-bold text-white mt-8">Store</h1>
      <p className="text-white text-center mb-8">Buy skins to customize your worm.</p>
      <div className="flex gap-4">
        <a href="/store?skin=bronze" className="bg-green-500 text-white px-4 py-2 rounded-lg">Buy Bronze</a>
        <a href="/store?skin=silver" className="bg-green-500 text-white px-4 py-2 rounded-lg">Buy Silver</a>
        <a href="/store?skin=gold" className="bg-green-500 text-white px-4 py-2 rounded-lg">Buy Gold</a>
      </div>
      <h1 className="text-4xl font-bold mb-8">Restore Purchases</h1>
      <RestorePurchasesForm />
    </main>
  )
}

