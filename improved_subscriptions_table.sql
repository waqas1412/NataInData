-- Drop old table if exists (optional - be careful with this in production)
-- DROP TABLE IF EXISTS subscriptions;

-- Create enhanced subscriptions table with all Stripe fields
CREATE TABLE subscriptions (
  -- Primary key matches Stripe's subscription ID
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe IDs  
  stripe_subscription_id TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  
  -- Subscription status
  status TEXT NOT NULL,
  
  -- Pricing information
  price_id TEXT,
  product_id TEXT,
  quantity INTEGER,
  amount INTEGER,
  currency TEXT,
  interval TEXT,
  interval_count INTEGER,
  
  -- Subscription lifecycle
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  
  -- Add constraint for unique Stripe subscription ID
  CONSTRAINT unique_stripe_subscription_id UNIQUE (stripe_subscription_id)
);

-- Create indices for faster lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_product_id ON subscriptions(product_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read only their own subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for service role to manage all subscriptions (for webhook handling)
CREATE POLICY "Service role can manage all subscriptions" 
  ON subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Give anon role access to table (needed for RLS to work properly)
GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO service_role;

-- Add helpful comment to table
COMMENT ON TABLE subscriptions IS 'Stores comprehensive subscription data from Stripe'; 