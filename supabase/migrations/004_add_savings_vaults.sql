-- Migration: Add savings vaults and rewards system
-- Run this migration in your Supabase SQL editor or migration pipeline

-- Savings vaults table
CREATE TABLE IF NOT EXISTS savings_vaults (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'Mon Coffre-fort',
    target_amount DECIMAL(12,2),
    current_amount DECIMAL(12,2) DEFAULT 0,
    total_bonus_earned DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'XOF',
    current_badge VARCHAR(50) DEFAULT 'starter',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vault transactions table
CREATE TABLE IF NOT EXISTS vault_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vault_id UUID REFERENCES savings_vaults(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- deposit, bonus_reward, withdrawal
    description TEXT,
    confirmation_code VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vault rewards table
CREATE TABLE IF NOT EXISTS vault_rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vault_id UUID REFERENCES savings_vaults(id) ON DELETE CASCADE,
    badge_name VARCHAR(50) NOT NULL,
    badge_level VARCHAR(20) NOT NULL,
    threshold_reached DECIMAL(12,2) NOT NULL,
    bonus_percentage DECIMAL(5,2) NOT NULL,
    bonus_amount DECIMAL(12,2) NOT NULL,
    rewarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_savings_vaults_user
ON savings_vaults(user_id);

CREATE INDEX IF NOT EXISTS idx_vault_transactions_vault
ON vault_transactions(vault_id);

CREATE INDEX IF NOT EXISTS idx_vault_transactions_user
ON vault_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_vault_transactions_status
ON vault_transactions(status);

CREATE INDEX IF NOT EXISTS idx_vault_rewards_user
ON vault_rewards(user_id);

CREATE INDEX IF NOT EXISTS idx_vault_rewards_vault
ON vault_rewards(vault_id);

-- Enable Row Level Security
ALTER TABLE savings_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for savings_vaults
CREATE POLICY "Users manage own vaults"
    ON savings_vaults FOR ALL
    USING (auth.uid() = user_id);

-- RLS policies for vault_transactions
CREATE POLICY "Users manage own transactions"
    ON vault_transactions FOR ALL
    USING (auth.uid() = user_id);

-- RLS policies for vault_rewards
CREATE POLICY "Users see own rewards"
    ON vault_rewards FOR SELECT
    USING (auth.uid() = user_id);

-- updated_at trigger for savings_vaults
CREATE TRIGGER update_savings_vaults_updated_at
    BEFORE UPDATE ON savings_vaults
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

