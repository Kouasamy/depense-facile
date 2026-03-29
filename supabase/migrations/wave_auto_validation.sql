-- Wave auto validation: références Wave + colonnes de suivi

-- Table anti-fraude : stocke toutes les références Wave déjà utilisées
CREATE TABLE IF NOT EXISTS wave_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_type VARCHAR(20) NOT NULL CHECK (
    payment_type IN ('subscription', 'vault_deposit')
  ),
  amount_declared INTEGER NOT NULL,
  ip_address VARCHAR(50),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wave_ref 
ON wave_references(reference);

ALTER TABLE wave_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own wave refs" ON wave_references
  FOR SELECT USING (auth.uid() = user_id);

-- Ajouter colonnes manquantes aux tables existantes
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS wave_reference VARCHAR(100),
  ADD COLUMN IF NOT EXISTS auto_validated BOOLEAN DEFAULT false;

ALTER TABLE vault_transactions
  ADD COLUMN IF NOT EXISTS wave_reference VARCHAR(100),
  ADD COLUMN IF NOT EXISTS auto_validated BOOLEAN DEFAULT false;

