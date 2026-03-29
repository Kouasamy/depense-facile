-- Migration: Add premium subscriptions and payment history
-- Run this migration in your Supabase SQL editor or migration pipeline

-- Subscriptions table for Premium accounts
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    confirmation_code VARCHAR(20) UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
    amount INTEGER DEFAULT 1500,
    currency VARCHAR(5) DEFAULT 'XOF',
    started_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    activated_by TEXT DEFAULT 'manual',
    wave_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment history table
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    amount INTEGER NOT NULL,
    payment_method TEXT DEFAULT 'wave',
    confirmation_code VARCHAR(20),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
ON subscriptions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_confirmation_code
ON subscriptions(confirmation_code);

CREATE INDEX IF NOT EXISTS idx_payment_history_user
ON payment_history(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_history_subscription
ON payment_history(subscription_id);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Users see own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users create own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS policies for payment_history
CREATE POLICY "Users see own payments"
    ON payment_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users create own payments"
    ON payment_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own payments"
    ON payment_history FOR UPDATE
    USING (auth.uid() = user_id);

-- updated_at triggers
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_history_updated_at
    BEFORE UPDATE ON payment_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

