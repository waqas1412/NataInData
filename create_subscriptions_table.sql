CREATE TABLE subscriptions (id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,stripe_customer_id text,stripe_subscription_id text UNIQUE,stripe_price_id text,status text,current_period_end timestamp with time zone,created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())); ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY; CREATE POLICY \
Users
can
view
own
subscription\ ON subscriptions FOR SELECT USING (auth.uid() = user_id); CREATE POLICY \Service
role
can
manage
all
subscriptions\ ON subscriptions USING (auth.jwt()->>'role' = 'service_role');
