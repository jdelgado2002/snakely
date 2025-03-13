import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST() {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: "dummy_customer_id", // TODO: Implement real customer management
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/store`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Portal error:", err)
    return NextResponse.json(
      { error: "Portal creation failed" },
      { status: 500 }
    )
  }
}
