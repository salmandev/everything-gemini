---
name: stripe-integration
description: >-
  Use this skill when implementing Stripe checkout sessions, managing subscription billing lifecycles, verifying webhook signatures, or configuring customer billing portals.
---

# Stripe Payments & Subscription Architecture

## Overview
This skill guides the implementation of PCI-compliant payment flows, webhook signature verification, idempotent charge processing, and customer portal session generation using the official Stripe SDK.

## Procedural Workflow

### 1. Robust Webhook Signature Verification
Never process webhooks without verifying the cryptographic signature against your endpoint secret:
```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function handleStripeWebhook(rawBody: string | Buffer, signature: string) {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  // Handle idempotent events using database transaction
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscriptionStatus(event.data.object as Stripe.Subscription);
      break;
  }
}
```

### 2. Idempotency & Concurrency Safety
- Always store `event.id` in an `idempotency_keys` table or set a unique constraint. If Stripe retries a webhook, discard duplicates immediately.
- Use `client_reference_id` or `metadata` to link Stripe customers with your internal user IDs.

### 3. Customer Billing Portal
Generate pre-authenticated portal sessions so users can update payment methods and invoices self-service without custom frontend form logic:
```typescript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
});
```

## Verification Checklist
- [ ] Raw body buffer preserved for webhook cryptographic verification
- [ ] Idempotency key checked before applying database mutations
- [ ] Webhook handler returns HTTP 200 promptly before long-running async tasks
- [ ] Stripe secret keys read strictly from environment variables
