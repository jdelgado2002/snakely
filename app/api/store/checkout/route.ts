import { NextResponse } from "next/server"
import Stripe from "stripe"
import { skins } from "@/lib/store"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const skin = skins.find(s => s.id === body.skinId)

    if (!skin) {
      return NextResponse.json(
        { error: "Invalid skin selection" },
        { status: 400 }
      )
    }

    // Create Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: skin.name,
              description: skin.description,
            },
            unit_amount: Math.round(skin.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: body.email, // Add this line to collect email
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/store?skin=${skin.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/store`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Checkout error:", err)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
