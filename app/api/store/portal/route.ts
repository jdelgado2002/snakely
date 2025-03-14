import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Retrieve customer ID using email
    const customers = await stripe.customers.list({ email })
    const customer = customers.data[0]

    if (!customer) {
      return NextResponse.json(
        { error: 'No customer found with this email' },
        { status: 404 }
      )
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/store`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Portal error:', err)
    return NextResponse.json(
      { error: 'Portal creation failed' },
      { status: 500 }
    )
  }
}