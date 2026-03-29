import { getSupabaseClient } from '../lib/supabase'

export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'cancelled'

export interface Subscription {
  id: string
  user_id: string
  confirmation_code: string
  status: SubscriptionStatus
  amount: number
  currency: string
  started_at: string | null
  expires_at: string | null
  activated_by: string | null
  wave_reference: string | null
  created_at: string
  updated_at: string
}

export interface PaymentHistory {
  id: string
  user_id: string
  subscription_id: string | null
  amount: number
  payment_method: string
  confirmation_code: string | null
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
}

const generateCodePart = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let part = ''
  for (let i = 0; i < 4; i++) {
    part += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return part
}

export const generateConfirmationCode = (): string => {
  return `GTD-${generateCodePart()}-${generateCodePart()}`
}

export const createPendingSubscription = async (
  userId: string
): Promise<{ subscription: Subscription; payment: PaymentHistory }> => {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase client not initialised')
  }

  let code = generateConfirmationCode()

  // Essayer quelques fois en cas de collision sur confirmation_code
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await client
      .from('subscriptions')
      .insert({
        user_id: userId,
        confirmation_code: code,
        status: 'pending',
        amount: 1500,
        currency: 'XOF'
      })
      .select('*')
      .single()

    if (!error && data) {
      const subscription = data as Subscription

      const { data: payment, error: paymentError } = await client
        .from('payment_history')
        .insert({
          user_id: userId,
          subscription_id: subscription.id,
          amount: subscription.amount,
          payment_method: 'wave',
          confirmation_code: subscription.confirmation_code,
          status: 'pending'
        })
        .select('*')
        .single()

      if (paymentError || !payment) {
        throw new Error(paymentError?.message || 'Erreur lors de la création du paiement')
      }

      return { subscription, payment: payment as PaymentHistory }
    }

    // Si duplication sur confirmation_code, on regénère et on réessaie
    if (error && typeof error.message === 'string' && error.message.includes('confirmation_code')) {
      code = generateConfirmationCode()
      continue
    }

    throw new Error(error?.message || 'Erreur lors de la création de l’abonnement')
  }

  throw new Error('Impossible de générer un code d’abonnement unique')
}

export const getCurrentSubscription = async (
  userId: string
): Promise<Subscription | null> => {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase client not initialised')
  }

  const { data, error } = await client
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Erreur récupération abonnement:', error)
    return null
  }

  if (!data || data.length === 0) return null
  return data[0] as Subscription
}

