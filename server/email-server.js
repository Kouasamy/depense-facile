import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { mkdir } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '.env')
dotenv.config({ path: envPath })
// Fallback sur le .env racine si besoin
dotenv.config()

// Créer le dossier logs s'il n'existe pas
const logsDir = join(__dirname, 'logs')

mkdir(logsDir, { recursive: true }).catch(err => {
  if (err.code !== 'EEXIST') {
    console.warn('⚠️ Impossible de créer le dossier logs:', err.message)
  }
})

const app = express()
const PORT = process.env.EMAIL_SERVER_PORT || 3001

// Supabase service role client (obligatoire pour validations automatiques)
let supabaseClient = null
const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant pour le serveur backend')
    return null
  }

  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  })
  return supabaseClient
}

// Paliers de récompenses pour les coffres-forts (version serveur)
const REWARD_TIERS_SERVER = [
  {
    id: 'starter',
    name: 'Épargnant Débutant',
    badge: '🌱',
    color: '#A8D5A2',
    threshold: 5000,
    bonusPercent: 10,
    description: 'Premier pas vers la liberté financière !'
  },
  {
    id: 'bronze',
    name: 'Épargnant Bronze',
    badge: '🥉',
    color: '#CD7F32',
    threshold: 25000,
    bonusPercent: 15,
    description: 'Tu construis de bonnes habitudes !'
  },
  {
    id: 'silver',
    name: 'Épargnant Argent',
    badge: '🥈',
    color: '#C0C0C0',
    threshold: 75000,
    bonusPercent: 20,
    description: 'Tu es sur la bonne voie, continue !'
  },
  {
    id: 'gold',
    name: 'Épargnant Or',
    badge: '🥇',
    color: '#FFD700',
    threshold: 150000,
    bonusPercent: 30,
    description: 'Impressionnant ! Tu maîtrises ton argent !'
  },
  {
    id: 'platinum',
    name: 'Épargnant Platine',
    badge: '💎',
    color: '#E5E4E2',
    threshold: 300000,
    bonusPercent: 40,
    description: 'Tu es une référence en matière d’épargne !'
  },
  {
    id: 'diamond',
    name: 'Épargnant Diamant',
    badge: '👑',
    color: '#F97316',
    threshold: 500000,
    bonusPercent: 50,
    description: 'Le summum de l’épargne ! Tu es une légende !'
  }
]

const calculateRewardServer = (previousTotal, newTotal) => {
  const reached = REWARD_TIERS_SERVER.filter(
    tier => tier.threshold > previousTotal && tier.threshold <= newTotal
  )
  if (!reached.length) return null
  return reached.reduce((max, tier) => (tier.threshold > max.threshold ? tier : max), reached[0])
}

const calculateBonusAmountServer = (totalSaved, bonusPercent) => {
  return (totalSaved * bonusPercent) / 100
}

// Rate limiting simple en mémoire (par userId)
const rateLimitMap = new Map()
const isRateLimited = userId => {
  if (!userId) return false
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1h
  const attempts = (rateLimitMap.get(userId) || []).filter(t => now - t < windowMs)
  if (attempts.length >= 5) {
    return true
  }
  attempts.push(now)
  rateLimitMap.set(userId, attempts)
  return false
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Log toutes les requêtes pour debug
app.use((req, res, next) => {
  console.log(`========================================`)
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  console.log(`Headers:`, req.headers)
  console.log(`========================================`)
  next()
})

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' })
})

// Initialiser un abonnement Premium côté serveur (générer un code)
app.post('/api/subscription/initiate', async (req, res) => {
  console.log('[/api/subscription/initiate] Body:', req.body)
  const { userId, userEmail, userName } = req.body || {}

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'userId est requis'
    })
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return res.status(500).json({ success: false, error: 'Supabase non configuré' })
  }

  // Génération d'un code unique type GTD-XXXX-YYYY
  const generateCodePart = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let part = ''
    for (let i = 0; i < 4; i++) {
      part += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return part
  }

  let confirmationCode = `GTD-${generateCodePart()}-${generateCodePart()}`

  try {
    let subscription = null

    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          confirmation_code: confirmationCode,
          status: 'pending',
          amount: 1500,
          currency: 'XOF'
        })
        .select('*')
        .single()

      if (!error && data) {
        subscription = data
        break
      }

      // En cas de conflit sur confirmation_code, régénérer et réessayer
      if (error && typeof error.message === 'string' && error.message.includes('confirmation_code')) {
        confirmationCode = `GTD-${generateCodePart()}-${generateCodePart()}`
        continue
      }

      console.error('❌ Erreur création abonnement Premium côté serveur:', error)
      return res.status(500).json({
        success: false,
        error: error?.message || 'Erreur lors de la création de l’abonnement'
      })
    }

    if (!subscription) {
      return res.status(500).json({
        success: false,
        error: 'Impossible de générer un code d’abonnement unique'
      })
    }

    // Créer un enregistrement de paiement associé
    const { error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        user_id: userId,
        subscription_id: subscription.id,
        amount: subscription.amount,
        payment_method: 'wave',
        confirmation_code: subscription.confirmation_code,
        status: 'pending'
      })

    if (paymentError) {
      console.error('❌ Erreur création payment_history côté serveur:', paymentError)
      return res.status(500).json({
        success: false,
        error: paymentError.message || 'Erreur lors de la création du paiement'
      })
    }

    res.json({
      success: true,
      confirmation_code: subscription.confirmation_code,
      subscriptionId: subscription.id,
      wave_link: process.env.WAVE_PAYMENT_LINK || null,
      userEmail,
      userName
    })
  } catch (err) {
    console.error('❌ Erreur /api/subscription/initiate:', err)
    res.status(500).json({
      success: false,
      error: err.message
    })
  }
})

// Vérifier si un utilisateur est Premium
app.get('/api/subscription/status/:userId', async (req, res) => {
  const { userId } = req.params

  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId manquant' })
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return res.status(500).json({ success: false, error: 'Supabase non configuré' })
  }

  try {
    const nowIso = new Date().toISOString()

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', nowIso)
      .order('expires_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('❌ Erreur /api/subscription/status:', error)
      return res.status(500).json({ success: false, error: error.message })
    }

    const subscription = data && data.length > 0 ? data[0] : null

    res.json({
      success: true,
      isPremium: !!subscription,
      expiresAt: subscription ? subscription.expires_at : null
    })
  } catch (err) {
    console.error('❌ Erreur serveur /api/subscription/status:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ================================================
// ROUTE DEV : Activer Premium pour un utilisateur (test sans paiement)
// Utiliser uniquement en dev ou avec token secret.
// ================================================
const DEV_ACTIVATE_SECRET = process.env.DEV_ACTIVATE_SECRET || 'dev-premium-test'
app.post('/api/dev/activate-premium', async (req, res) => {
  const { userId, token } = req.body || {}

  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId requis' })
  }

  const isDev = process.env.NODE_ENV !== 'production'
  const tokenOk = token && token === DEV_ACTIVATE_SECRET
  if (!isDev && !tokenOk) {
    return res.status(403).json({ success: false, error: 'Non autorisé (réservé au mode test)' })
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return res.status(500).json({ success: false, error: 'Supabase non configuré' })
  }

  try {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const code = `TEST-${Date.now().toString(36).toUpperCase()}`

    const { data: sub, error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        confirmation_code: code,
        status: 'active',
        amount: 1500,
        currency: 'XOF',
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        activated_by: 'dev_test',
        auto_validated: true
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('❌ Erreur dev activate-premium:', insertError)
      return res.status(500).json({ success: false, error: insertError.message })
    }

    await supabase.from('payment_history').insert({
      user_id: userId,
      subscription_id: sub.id,
      amount: 1500,
      payment_method: 'wave',
      confirmation_code: code,
      status: 'paid',
      notes: 'Activation test (dev)'
    })

    res.json({
      success: true,
      isPremium: true,
      expiresAt: expiresAt.toISOString(),
      message: 'Premium activé en mode test (30 jours).'
    })
  } catch (err) {
    console.error('❌ Erreur /api/dev/activate-premium:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ================================================
// ROUTE : Validation abonnement Premium par ref Wave
// ================================================
app.post('/api/subscription/validate-wave', async (req, res) => {
  const { userId, waveReference, confirmationCode } = req.body || {}

  if (!userId || !waveReference || !confirmationCode) {
    return res.status(400).json({
      error: 'MISSING_FIELDS',
      message: 'Tous les champs sont requis.'
    })
  }

  if (isRateLimited(userId)) {
    return res.status(429).json({
      error: 'TOO_MANY_ATTEMPTS',
      message: 'Trop de tentatives. Réessayez dans 1 heure.'
    })
  }

  const ref = String(waveReference).trim().toUpperCase().replace(/\s+/g, '')

  if (!/^[A-Z0-9\-_]{6,30}$/.test(ref)) {
    return res.status(400).json({
      error: 'FORMAT_INVALID',
      message: 'Référence Wave invalide. Vérifie bien le reçu dans ton app Wave.'
    })
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return res.status(500).json({ error: 'SERVER_CONFIG', message: 'Supabase non configuré.' })
  }

  try {
    // Vérifier que la référence n'a jamais été utilisée
    const { data: existingRef, error: refError } = await supabase
      .from('wave_references')
      .select('id')
      .eq('reference', ref)
      .maybeSingle()

    if (refError) {
      console.error('❌ Erreur lecture wave_references:', refError)
    }

    if (existingRef) {
      return res.status(400).json({
        error: 'REFERENCE_ALREADY_USED',
        message: 'Cette référence Wave a déjà été utilisée.'
      })
    }

    // Vérifier le code d’abonnement pour cet utilisateur
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('confirmation_code', confirmationCode)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle()

    if (subError) {
      console.error('❌ Erreur lecture subscription:', subError)
    }

    if (!subscription) {
      return res.status(400).json({
        error: 'CODE_INVALID',
        message: 'Code de confirmation invalide ou déjà utilisé.'
      })
    }

    // Code valide pendant 2 heures
    const createdAt = subscription.created_at ? new Date(subscription.created_at) : null
    if (!createdAt || Date.now() - createdAt.getTime() > 2 * 60 * 60 * 1000) {
      return res.status(400).json({
        error: 'CODE_EXPIRED',
        message: 'Session expirée. Génère un nouveau code Premium.'
      })
    }

    // 1. Bloquer la référence Wave
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const { error: insertRefError } = await supabase.from('wave_references').insert({
      reference: ref,
      user_id: userId,
      payment_type: 'subscription',
      amount_declared: 1500,
      ip_address: req.ip || null
    })

    if (insertRefError) {
      console.error('❌ Erreur insertion wave_references:', insertRefError)
      return res.status(500).json({
        error: 'WAVE_REF_INSERT_FAILED',
        message: 'Erreur lors de l’enregistrement de la référence Wave.'
      })
    }

    // 2. Activer l’abonnement
    const { error: updateSubError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        wave_reference: ref,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        auto_validated: true,
        updated_at: now.toISOString()
      })
      .eq('id', subscription.id)

    if (updateSubError) {
      console.error('❌ Erreur update subscription:', updateSubError)
      return res.status(500).json({
        error: 'SUBSCRIPTION_UPDATE_FAILED',
        message: 'Erreur lors de l’activation de l’abonnement.'
      })
    }

    // 3. Historique de paiement
    const { error: paymentError } = await supabase.from('payment_history').insert({
      user_id: userId,
      subscription_id: subscription.id,
      amount: 1500,
      payment_method: 'wave',
      confirmation_code: confirmationCode,
      status: 'paid',
      notes: `Ref Wave: ${ref}`
    })

    if (paymentError) {
      console.error('❌ Erreur insertion payment_history:', paymentError)
      // On ne bloque pas pour autant : l’abonnement est déjà actif
    }

    return res.json({
      success: true,
      isPremium: true,
      expiresAt: expiresAt.toISOString(),
      message: '🎉 Abonnement Premium activé avec succès !'
    })
  } catch (err) {
    console.error('❌ Erreur /api/subscription/validate-wave:', err)
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la validation du paiement.',
      details: err.message
    })
  }
})

// ================================================
// ROUTE : Validation dépôt Coffre-fort par ref Wave
// ================================================
app.post('/api/vault/validate-wave', async (req, res) => {
  const { userId, vaultId, waveReference, amount } = req.body || {}

  if (!userId || !vaultId || !waveReference || !amount) {
    return res.status(400).json({ error: 'MISSING_FIELDS' })
  }

  if (isRateLimited(userId)) {
    return res.status(429).json({
      error: 'TOO_MANY_ATTEMPTS',
      message: 'Trop de tentatives. Réessayez dans 1 heure.'
    })
  }

  const ref = String(waveReference).trim().toUpperCase().replace(/\s+/g, '')

  if (!/^[A-Z0-9\-_]{6,30}$/.test(ref)) {
    return res.status(400).json({
      error: 'FORMAT_INVALID',
      message: 'Référence Wave invalide.'
    })
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return res.status(500).json({ error: 'SERVER_CONFIG', message: 'Supabase non configuré.' })
  }

  try {
    const depositAmount = Number(amount)
    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ error: 'AMOUNT_INVALID', message: 'Montant invalide.' })
    }

    // Référence jamais utilisée
    const { data: existingRef, error: refError } = await supabase
      .from('wave_references')
      .select('id')
      .eq('reference', ref)
      .maybeSingle()

    if (refError) {
      console.error('❌ Erreur lecture wave_references (vault):', refError)
    }

    if (existingRef) {
      return res.status(400).json({
        error: 'REFERENCE_ALREADY_USED',
        message: 'Cette référence Wave a déjà été utilisée.'
      })
    }

    // Récupérer le coffre
    const { data: vault, error: vaultError } = await supabase
      .from('savings_vaults')
      .select('*')
      .eq('id', vaultId)
      .eq('user_id', userId)
      .maybeSingle()

    if (vaultError) {
      console.error('❌ Erreur lecture savings_vaults:', vaultError)
    }

    if (!vault) {
      return res.status(400).json({ error: 'VAULT_NOT_FOUND', message: 'Coffre-fort introuvable.' })
    }

    const previousTotal = Number(vault.current_amount || 0)
    const newTotal = previousTotal + depositAmount

    const prevTier = [...REWARD_TIERS_SERVER].reverse().find(t => previousTotal >= t.threshold)
    const newTier = [...REWARD_TIERS_SERVER].reverse().find(t => newTotal >= t.threshold)

    let bonusAmount = 0
    let rewardUnlocked = null

    if (newTier && newTier.id !== (prevTier && prevTier.id)) {
      bonusAmount = Math.round(calculateBonusAmountServer(newTotal, newTier.bonusPercent))
      rewardUnlocked = {
        id: newTier.id,
        name: newTier.name,
        badge: newTier.badge,
        bonusPercent: newTier.bonusPercent,
        threshold: newTier.threshold
      }

      const { error: rewardError } = await supabase.from('vault_rewards').insert({
        user_id: userId,
        vault_id: vaultId,
        badge_name: newTier.name,
        badge_level: newTier.id,
        threshold_reached: newTier.threshold,
        bonus_percentage: newTier.bonusPercent,
        bonus_amount: bonusAmount
      })

      if (rewardError) {
        console.error('❌ Erreur insertion vault_rewards:', rewardError)
      }
    }

    const finalTotal = newTotal + bonusAmount

    // Bloquer la référence Wave
    const { error: insertRefError } = await supabase.from('wave_references').insert({
      reference: ref,
      user_id: userId,
      payment_type: 'vault_deposit',
      amount_declared: depositAmount,
      ip_address: req.ip || null
    })

    if (insertRefError) {
      console.error('❌ Erreur insertion wave_references (vault):', insertRefError)
      return res.status(500).json({
        error: 'WAVE_REF_INSERT_FAILED',
        message: 'Erreur lors de l’enregistrement de la référence Wave.'
      })
    }

    // Transaction dépôt
    const { error: depError } = await supabase.from('vault_transactions').insert({
      vault_id: vaultId,
      user_id: userId,
      amount: depositAmount,
      transaction_type: 'deposit',
      description: `Dépôt - Réf Wave: ${ref}`,
      wave_reference: ref,
      status: 'completed',
      auto_validated: true
    })

    if (depError) {
      console.error('❌ Erreur insertion vault_transactions (deposit):', depError)
      return res.status(500).json({
        error: 'DEPOSIT_INSERT_FAILED',
        message: 'Erreur lors de l’enregistrement du dépôt.'
      })
    }

    // Transaction bonus si applicable
    if (bonusAmount > 0 && rewardUnlocked) {
      const { error: bonusTxError } = await supabase.from('vault_transactions').insert({
        vault_id: vaultId,
        user_id: userId,
        amount: bonusAmount,
        transaction_type: 'bonus_reward',
        description: `🎉 Bonus ${rewardUnlocked.bonusPercent}% - Badge ${rewardUnlocked.badge} ${rewardUnlocked.name}`,
        status: 'completed'
      })

      if (bonusTxError) {
        console.error('❌ Erreur insertion vault_transactions (bonus):', bonusTxError)
      }
    }

    // Mettre à jour le coffre-fort
    const { error: updateVaultError } = await supabase
      .from('savings_vaults')
      .update({
        current_amount: finalTotal,
        total_bonus_earned: Number(vault.total_bonus_earned || 0) + bonusAmount,
        current_badge: rewardUnlocked ? rewardUnlocked.id : vault.current_badge,
        updated_at: new Date().toISOString()
      })
      .eq('id', vaultId)

    if (updateVaultError) {
      console.error('❌ Erreur update savings_vaults:', updateVaultError)
      return res.status(500).json({
        error: 'VAULT_UPDATE_FAILED',
        message: 'Erreur lors de la mise à jour du coffre-fort.'
      })
    }

    return res.json({
      success: true,
      newTotal: finalTotal,
      depositAmount,
      bonusEarned: bonusAmount,
      rewardUnlocked,
      message:
        bonusAmount > 0 && rewardUnlocked
          ? `✅ Dépôt validé ! 🎉 Badge ${rewardUnlocked.badge} ${rewardUnlocked.name} débloqué + ${bonusAmount.toLocaleString(
              'fr-FR'
            )} XOF de bonus !`
          : `✅ ${depositAmount.toLocaleString('fr-FR')} XOF ajoutés à ton Coffre-fort !`
    })
  } catch (err) {
    console.error('❌ Erreur /api/vault/validate-wave:', err)
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la validation du dépôt.',
      details: err.message
    })
  }
})

// Démarrer le serveur avec gestion du port occupé
// En production, écouter sur 0.0.0.0 pour accepter les connexions externes
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur backend démarré sur ${HOST}:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`✅ Serveur prêt à recevoir des requêtes en production`)
  }
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Le port ${PORT} est déjà utilisé`)
    console.error(`💡 Solution: Tue le processus qui utilise le port ${PORT}`)
    console.error(`   Windows: netstat -ano | findstr :${PORT}`)
    console.error(`   Puis: taskkill /PID <PID> /F`)
    process.exit(1)
  } else {
    throw error
  }
})

