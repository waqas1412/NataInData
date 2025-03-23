# Stripe Subscription Integration

This document explains how to set up and use the Stripe subscription integration in your Next.js application.

## Setup

### 1. Create Subscriptions Table in Supabase

Run the SQL in `database/subscriptions_table.sql` in your Supabase SQL Editor to create the necessary table and security policies.

### 2. Configure Stripe Webhook

1. In your Stripe Dashboard, go to Developers > Webhooks
2. Add a new endpoint: `https://your-domain.com/api/webhook`
3. Add the following events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the signing secret and add it to your `.env.local` file as `STRIPE_WEBHOOK_SECRET`

### 3. Test Locally with Stripe CLI

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run: `stripe login`
3. Forward events to your local webhook endpoint:
   ```
   stripe listen --forward-to http://localhost:3000/api/webhook
   ```

## How It Works

### Client Side

1. The `useSubscriptionStore` Zustand store tracks the subscription status
2. The `AuthProvider` automatically redirects users without an active subscription to the Stripe payment link
3. All protected routes check for an active subscription

### Server Side

1. The Stripe webhook endpoint processes subscription events
2. When a subscription is created, updated, or cancelled, the `subscriptions` table is updated
3. The app reads this table to determine if a user has access to premium features

## Environment Variables

Make sure the following variables are set in your `.env.local` file:

```
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://your-stripe-payment-link
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Testing the Integration

1. Sign up a new user
2. They will be redirected to the Stripe payment link
3. Complete the payment
4. The webhook will update the subscription
5. The user will now have access to premium features 