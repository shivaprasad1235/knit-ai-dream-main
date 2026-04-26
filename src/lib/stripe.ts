/**
 * Stripe Payment Integration
 * Initialize and handle payment processing
 */

import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

let stripePromise: ReturnType<typeof loadStripe> | null = null;

/**
 * Initialize Stripe
 */
async function getStripe() {
  if (!STRIPE_PUBLIC_KEY) {
    console.warn("Stripe public key not configured");
    return null;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }

  return stripePromise;
}

/**
 * Create payment intent
 */
export async function createPaymentIntent(
  amount: number,
  description: string,
  orderId: string,
): Promise<string | null> {
  try {
    const response = await fetch("/.netlify/functions/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        description,
        orderId,
      }),
    });

    if (!response.ok) throw new Error("Payment intent failed");

    const { clientSecret } = await response.json();
    return clientSecret;
  } catch (error) {
    console.error("Payment intent error:", error);
    return null;
  }
}

/**
 * Initialize card element
 */
export async function confirmPayment(clientSecret: string) {
  const stripe = await getStripe();
  if (!stripe) throw new Error("Stripe not initialized");

  return stripe.confirmCardPayment(clientSecret);
}

export async function createCheckoutSession(
  items: Array<{ product_id: string; quantity: number; price: number }>,
  orderId: string,
): Promise<string | null> {
  try {
    const response = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        orderId,
        successUrl: `${window.location.origin}/orders/${orderId}?status=success`,
        cancelUrl: `${window.location.origin}/cart`,
      }),
    });

    if (!response.ok) throw new Error("Checkout session failed");

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error("Checkout session error:", error);
    return null;
  }
}

export async function redirectToCheckout(sessionId: string) {
  const stripe = await getStripe();
  if (!stripe) throw new Error("Stripe not initialized");

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) throw new Error(error.message);
}
