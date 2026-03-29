-- ============================================================
-- À exécuter dans Supabase : Dashboard → SQL Editor → New query
-- Colle ce script puis clique sur "Run"
-- ============================================================

-- 1. Extension UUID (si pas déjà activée)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Fonction pour updated_at (si pas déjà créée par une autre migration)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Table subscriptions (Premium)
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

-- 4. Table payment_history
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    amount INTEGER NOT NULL,
    payment_method TEXT DEFAULT 'wave',
    confirmation_code VARCHAR(20),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'waiting_verification')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_confirmation_code ON subscriptions(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription ON payment_history(subscription_id);

-- 6. RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- 7. Policies subscriptions (éviter erreur si déjà existantes)
DROP POLICY IF EXISTS "Users see own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users create own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users update own subscriptions" ON subscriptions;
CREATE POLICY "Users see own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- 8. Policies payment_history
DROP POLICY IF EXISTS "Users see own payments" ON payment_history;
DROP POLICY IF EXISTS "Users create own payments" ON payment_history;
DROP POLICY IF EXISTS "Users update own payments" ON payment_history;
CREATE POLICY "Users see own payments" ON payment_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own payments" ON payment_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own payments" ON payment_history FOR UPDATE USING (auth.uid() = user_id);

-- 9. Triggers updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_history_updated_at ON payment_history;
CREATE TRIGGER update_payment_history_updated_at
    BEFORE UPDATE ON payment_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
