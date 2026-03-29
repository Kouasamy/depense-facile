import { useCallback, useEffect, useState } from 'react'
import { getSupabaseClient } from '../lib/supabase'
import { REWARD_TIERS, RewardTier, calculateReward, calculateBonusAmount } from '../config/rewardsTiers'

export interface SavingsVault {
  id: string
  user_id: string
  name: string
  target_amount: number | null
  current_amount: number
  total_bonus_earned: number
  currency: string
  current_badge: string
  status: string
  created_at: string
  updated_at: string
}

export type VaultTransactionType = 'deposit' | 'bonus_reward' | 'withdrawal'

export interface VaultTransaction {
  id: string
  vault_id: string
  user_id: string
  amount: number
  transaction_type: VaultTransactionType
  description: string | null
  confirmation_code: string | null
  status: string
  created_at: string
}

export interface VaultReward {
  id: string
  user_id: string
  vault_id: string
  badge_name: string
  badge_level: string
  threshold_reached: number
  bonus_percentage: number
  bonus_amount: number
  rewarded_at: string
}

interface UseSavingsVaultState {
  vault: SavingsVault | null
  transactions: VaultTransaction[]
  rewards: VaultReward[]
  isLoading: boolean
  error: string | null
  lastDepositCode: string | null
  lastWaveLink: string | null
  lastInstructions: string | null
}

interface UseSavingsVaultResult extends UseSavingsVaultState {
  refresh: () => Promise<void>
  initierDepot: (amount: number) => Promise<void>
  confirmerDepot: (code: string, amount: number) => Promise<void>
  getPotentialRewardForDeposit: (
    amount: number
  ) => { tier: RewardTier; bonusAmount: number } | null
}

const getBackendBaseUrl = () => {
  const base = import.meta.env.VITE_EMAIL_SERVER_URL || 'https://xn--gretondjai-z6a.com'
  return base.replace(/\/$/, '')
}

export function useSavingsVault(userId: string | undefined): UseSavingsVaultResult {
  const [state, setState] = useState<UseSavingsVaultState>({
    vault: null,
    transactions: [],
    rewards: [],
    isLoading: false,
    error: null,
    lastDepositCode: null,
    lastWaveLink: null,
    lastInstructions: null
  })

  const loadVault = useCallback(async () => {
    if (!userId) {
      setState(prev => ({
        ...prev,
        vault: null,
        transactions: [],
        rewards: [],
        error: null
      }))
      return
    }

    const client = getSupabaseClient()
    if (!client) {
      setState(prev => ({
        ...prev,
        error: 'Supabase non initialisé côté client.'
      }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Récupérer (ou créer) le coffre principal de l’utilisateur
      let vault: SavingsVault | null = null

      const { data: vaults, error: vaultError } = await client
        .from('savings_vaults')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)

      if (vaultError) {
        console.error('Erreur chargement savings_vaults:', vaultError)
        throw new Error(vaultError.message)
      }

      if (!vaults || vaults.length === 0) {
        const { data: created, error: createError } = await client
          .from('savings_vaults')
          .insert({
            user_id: userId,
            name: 'Mon Coffre-fort'
          })
          .select('*')
          .single()

        if (createError || !created) {
          console.error('Erreur création coffre-fort:', createError)
          throw new Error(
            createError?.message || 'Impossible de créer ton coffre-fort pour le moment.'
          )
        }

        vault = created as SavingsVault
      } else {
        vault = vaults[0] as SavingsVault
      }

      // Historique des transactions
      const { data: txs, error: txError } = await client
        .from('vault_transactions')
        .select('*')
        .eq('vault_id', vault.id)
        .order('created_at', { ascending: false })

      if (txError) {
        console.error('Erreur chargement vault_transactions:', txError)
        throw new Error(txError.message)
      }

      // Récompenses
      const { data: rewards, error: rewardsError } = await client
        .from('vault_rewards')
        .select('*')
        .eq('vault_id', vault.id)
        .order('rewarded_at', { ascending: false })

      if (rewardsError) {
        console.error('Erreur chargement vault_rewards:', rewardsError)
        throw new Error(rewardsError.message)
      }

      setState(prev => ({
        ...prev,
        vault,
        transactions: (txs || []) as VaultTransaction[],
        rewards: (rewards || []) as VaultReward[],
        isLoading: false,
        error: null
      }))
    } catch (error) {
      console.error('Erreur loadVault:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Impossible de charger les données du coffre-fort.'
      }))
    }
  }, [userId])

  useEffect(() => {
    loadVault()
  }, [loadVault])

  const initierDepot = useCallback(
    async (amount: number) => {
      if (!userId || !state.vault) return

      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        lastDepositCode: null,
        lastWaveLink: null,
        lastInstructions: null
      }))

      try {
        const backendUrl = getBackendBaseUrl()
        const res = await fetch(`${backendUrl}/api/vault/initiate-deposit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            amount,
            vaultId: state.vault.id
          })
        })

        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Erreur lors de la création du dépôt.')
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          lastDepositCode: data.deposit_code || null,
          lastWaveLink: data.wave_link || null,
          lastInstructions: data.instructions || null
        }))
      } catch (error) {
        console.error('Erreur initierDepot:', error)
        setState(prev => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Impossible de démarrer le dépôt. Réessaie plus tard.'
        }))
      }
    },
    [state.vault, userId]
  )

  const confirmerDepot = useCallback(
    async (code: string, amount: number) => {
      if (!userId || !state.vault || !code) return

      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }))

      try {
        const backendUrl = getBackendBaseUrl()
        const res = await fetch(`${backendUrl}/api/vault/confirm-deposit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            depositCode: code,
            amount,
            vaultId: state.vault.id
          })
        })

        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Erreur lors de la confirmation du dépôt.')
        }

        // On recharge les données pour voir la transaction en pending / waiting_verification
        await loadVault()

        setState(prev => ({
          ...prev,
          isLoading: false
        }))
      } catch (error) {
        console.error('Erreur confirmerDepot:', error)
        setState(prev => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Impossible de confirmer le dépôt. Réessaie plus tard.'
        }))
      }
    },
    [state.vault, userId, loadVault]
  )

  const getPotentialRewardForDeposit = useCallback(
    (amount: number): { tier: RewardTier; bonusAmount: number } | null => {
      if (!state.vault || amount <= 0) return null
      const previousTotal = Number(state.vault.current_amount || 0)
      const newTotal = previousTotal + amount

      const tier = calculateReward(previousTotal, newTotal)
      if (!tier) return null

      const bonusAmount = calculateBonusAmount(newTotal, tier.bonusPercent)
      return { tier, bonusAmount }
    },
    [state.vault]
  )

  return {
    ...state,
    refresh: loadVault,
    initierDepot,
    confirmerDepot,
    getPotentialRewardForDeposit
  }
}

