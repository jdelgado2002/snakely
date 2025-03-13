import { NextResponse } from "next/server"
import Stripe from "stripe"
import { skins } from "@/lib/store"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    // Validate request
    if (!req.headers.get("Content-Type")?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 415 }
      )
    }

    const { skinId } = await req.json()
    
    if (!skinId) {
      return NextResponse.json(
        { error: "Skin ID is required" },
        { status: 400 }
      )
    }

    const skin = skins.find(s => s.id === skinId)
    
    if (!skin) {
      return NextResponse.json(
        { error: "Skin not found" },
        { status: 404 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      metadata: {
        skinId: skin.id,
      },
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { 
            name: skin.name,
            description: skin.description,
            images: [skin.image],
            metadata: {
              skinId: skin.id,
            }
          },
          unit_amount: Math.round(skin.price * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/store?skin=${skin.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/store`,
    })

    if (!session.url) {
      throw new Error("Failed to create checkout session")
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Checkout error:", err)
    return NextResponse.json(
      { error: "Checkout creation failed" },
      { status: 500 }
    )
  }
}
