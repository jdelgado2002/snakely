"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, RefreshCw, ShoppingCart } from "lucide-react"
import { skins, getStoreState, saveSkinPurchase } from "@/lib/store"
import type { Skin } from "@/types/store"
import { Input } from "@/components/ui/input"

export default function Store() {
  const { toast } = useToast()
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [purchasedSkins, setPurchasedSkins] = useState<string[]>([])
  const [previewSkin, setPreviewSkin] = useState<string | null>(null)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const { purchasedSkins } = getStoreState()
    setPurchasedSkins(purchasedSkins)

    // Handle purchase success redirect
    const urlParams = new URLSearchParams(window.location.search)
    const purchasedSkin = urlParams.get("skin")
    if (purchasedSkin) {
      saveSkinPurchase(purchasedSkin)
      toast({
        title: "Purchase Successful!",
        description: `You can now use the ${purchasedSkin} skin!`,
      })
    }
  }, [toast])

  async function purchaseSkin(skin: Skin) {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to continue with the purchase",
        variant: "destructive",
      })
      return
    }

    try {
      setPurchasing(skin.id)
      const res = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          skinId: skin.id,
          email: email 
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to initiate purchase. Please try again."
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setPurchasing(null)
    }
  }

  async function restorePurchases() {
    try {
      const res = await fetch("/api/store/portal", {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to open customer portal. Please try again."
      toast({
        title: "Error",
        description: message,
        variant: "destructive", 
      })
    }
  }

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">
          <span role="img" aria-label="Paintbrush">🎨</span> 
          Skins Store
        </h1>
        <div className="flex items-center gap-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-64"
            required
          />
          <Button 
            onClick={restorePurchases} 
            variant="outline"
            aria-label="Restore previous purchases"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Restore Purchases
          </Button>
        </div>
      </div>

      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="list"
        aria-label="Available skins"
      >
        {skins.map((skin) => (
          <Card 
            key={skin.id} 
            className="bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onMouseEnter={() => setPreviewSkin(skin.id)}
            onMouseLeave={() => setPreviewSkin(null)}
            role="listitem"
          >
            <CardHeader>
              <CardTitle className="text-white">{skin.name}</CardTitle>
              {skin.description && (
                <CardDescription className="text-white/70">{skin.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div 
                className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/20 group"
                aria-hidden="true"
              >
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    previewSkin === skin.id ? 'opacity-100' : 'opacity-50'
                  }`}
                  style={{ backgroundColor: skin.color }}
                />
                {previewSkin === skin.id && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                    Preview
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {purchasedSkins.includes(skin.id) ? (
                <Button 
                  className="w-full" 
                  variant="secondary" 
                  disabled
                  aria-label={`${skin.name} already owned`}
                >
                  <span role="img" aria-hidden="true">✨</span> Owned
                </Button>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => purchaseSkin(skin)}
                  disabled={purchasing === skin.id}
                  aria-label={`Purchase ${skin.name} for $${skin.price.toFixed(2)}`}
                >
                  {purchasing === skin.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="sr-only">Processing purchase...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Buy for ${skin.price.toFixed(2)}
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
