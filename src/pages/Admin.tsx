import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import './SettingsPage.css'

interface AdminSubscription {
  id: string
  user_id: string
  confirmation_code: string
  status: string
  amount: number
  currency: string
  created_at: string
}

interface AdminVaultDeposit {
  id: string
  vault_id: string
  user_id: string
  amount: number
  confirmation_code: string | null
  status: string
  created_at: string
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL
const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY

const getBackendBaseUrl = () => {
  const base = import.meta.env.VITE_EMAIL_SERVER_URL || 'https://xn--gretondjai-z6a.com'
  return base.replace(/\/$/, '')
}

export function AdminPage() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([])
  const [deposits, setDeposits] = useState<AdminVaultDeposit[]>([])
  const [stats, setStats] = useState<{
    premiumUsers: number
    totalSaved: number
    totalBadges: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const secret = searchParams.get('secret')

  const hasAccess = useMemo(() => {
    if (!ADMIN_SECRET_KEY || !ADMIN_EMAIL) return false
    if (!user) return false
    if (user.email !== ADMIN_EMAIL) return false
    if (secret !== ADMIN_SECRET_KEY) return false
    return true
  }, [user, secret])

  const loadData = async () => {
    if (!hasAccess) return
    setIsLoading(true)
    setError(null)
    setInfo(null)

    try {
      const backendUrl = getBackendBaseUrl()

      // Abonnements en attente
      const subRes = await fetch(
        `${backendUrl}/api/admin/subscriptions/pending?token=${encodeURIComponent(
          ADMIN_SECRET_KEY || ''
        )}`
      )
      const subData = await subRes.json()
      if (!subRes.ok || !subData.success) {
        throw new Error(subData.error || 'Erreur lors du chargement des abonnements.')
      }
      setSubscriptions(subData.data || [])

      // Dépôts coffre-fort en attente de validation (via Supabase direct ou route dédiée)
      // Ici on utilise une route dédiée sur le backend si elle existe, sinon fallback simple.
      try {
        const depRes = await fetch(
          `${backendUrl}/api/admin/vault/deposits/pending?secret=${encodeURIComponent(
            ADMIN_SECRET_KEY || ''
          )}`
        )
        if (depRes.ok) {
          const depData = await depRes.json()
          if (depData.success) {
            setDeposits(depData.data || [])
          }
        }
      } catch {
        // Silencieux si la route n'existe pas encore
      }

      // Statistiques rapides (si la route existe)
      try {
        const statsRes = await fetch(
          `${backendUrl}/api/admin/stats?secret=${encodeURIComponent(
            ADMIN_SECRET_KEY || ''
          )}`
        )
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          if (statsData.success) {
            setStats(statsData.data)
          }
        }
      } catch {
        // Silencieux si la route n'existe pas encore
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur inconnue lors du chargement des données.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess])

  const handleActivateSubscription = async (id: string) => {
    setIsLoading(true)
    setError(null)
    setInfo(null)
    try {
      const backendUrl = getBackendBaseUrl()
      const res = await fetch(
        `${backendUrl}/api/admin/subscriptions/${id}/activate?token=${encodeURIComponent(
          ADMIN_SECRET_KEY || ''
        )}`,
        { method: 'POST' }
      )
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l’activation de l’abonnement.')
      }
      setInfo('Abonnement activé avec succès.')
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur inconnue lors de l’activation.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidateDeposit = async (code: string | null) => {
    if (!code) return
    setIsLoading(true)
    setError(null)
    setInfo(null)
    try {
      const backendUrl = getBackendBaseUrl()
      const res = await fetch(
        `${backendUrl}/api/admin/validate-deposit?code=${encodeURIComponent(
          code
        )}&secret=${encodeURIComponent(ADMIN_SECRET_KEY || '')}`
      )
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Erreur lors de la validation du dépôt.')
      }
      setInfo('Dépôt validé avec succès.')
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur inconnue lors de la validation du dépôt.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasAccess) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <header className="settings-header animate-fade-in">
            <div className="settings-header-info">
              <div className="settings-logo">
                <img
                  src="/logo-gtd.png"
                  alt="Logo GèreTonDjai"
                  className="app-logo-image"
                />
              </div>
              <div>
                <h1 className="settings-title">Accès refusé</h1>
                <p className="settings-subtitle">
                  Cette page est réservée à l&apos;administrateur de la plateforme.
                </p>
              </div>
            </div>
          </header>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <header className="settings-header animate-fade-in">
          <div className="settings-header-info">
            <div className="settings-logo">
              <img
                src="/logo-gtd.png"
                alt="Logo GèreTonDjai"
                className="app-logo-image"
              />
            </div>
            <div>
              <h1 className="settings-title">Panneau Admin</h1>
              <p className="settings-subtitle">
                Gère les abonnements Premium, les dépôts dans les coffres-forts et les statistiques
                globales.
              </p>
            </div>
          </div>
        </header>

        <section className="settings-section card animate-fade-in-up">
          <div className="settings-section-header">
            <span className="material-symbols-outlined">workspace_premium</span>
            <h2>Abonnements Premium en attente</h2>
          </div>

          <button
            className="btn btn-outline"
            onClick={loadData}
            disabled={isLoading}
            style={{ marginBottom: '1rem' }}
          >
            {isLoading ? 'Actualisation...' : 'Rafraîchir'}
          </button>

          {info && (
            <div className="settings-export-status">
              <span className="material-symbols-outlined">info</span>
              <span>{info}</span>
            </div>
          )}

          {error && (
            <div
              className="settings-export-status"
              style={{ borderColor: 'var(--color-danger)', marginTop: '0.75rem' }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: 'var(--color-danger)' }}
              >
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          {subscriptions.length === 0 && !isLoading && (
            <p className="settings-subtitle">Aucun abonnement en attente pour le moment.</p>
          )}

          <div className="settings-options">
            {subscriptions.map(sub => (
              <div key={sub.id} className="settings-option">
                <div className="settings-option-info">
                  <span className="material-symbols-outlined">key</span>
                  <span>
                    Code : <strong>{sub.confirmation_code}</strong>
                  </span>
                </div>
                <p className="settings-subtitle">
                  Utilisateur ID : <code>{sub.user_id}</code>
                </p>
                <p className="settings-subtitle">
                  Créé le : {new Date(sub.created_at).toLocaleString()} — Montant :{' '}
                  {sub.amount} {sub.currency}
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleActivateSubscription(sub.id)}
                  disabled={isLoading}
                >
                  Activer cet abonnement
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="settings-section card animate-fade-in-up">
          <div className="settings-section-header">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <h2>Dépôts coffre-fort en attente</h2>
          </div>

          {deposits.length === 0 && (
            <p className="settings-subtitle">
              Aucun dépôt en attente de validation (ou la route backend n&apos;est pas encore
              configurée).
            </p>
          )}

          <div className="settings-options">
            {deposits.map(dep => (
              <div key={dep.id} className="settings-option">
                <div className="settings-option-info">
                  <span className="material-symbols-outlined">payments</span>
                  <span>
                    Dépôt : <strong>{Number(dep.amount).toLocaleString('fr-FR')} XOF</strong>
                  </span>
                </div>
                <p className="settings-subtitle">
                  Utilisateur ID : <code>{dep.user_id}</code> — Coffre ID :{' '}
                  <code>{dep.vault_id}</code>
                </p>
                <p className="settings-subtitle">
                  Créé le : {new Date(dep.created_at).toLocaleString()} — Code :{' '}
                  <code>{dep.confirmation_code || 'N/A'}</code>
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleValidateDeposit(dep.confirmation_code)}
                  disabled={isLoading}
                >
                  Valider le dépôt
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="settings-section card animate-fade-in-up">
          <div className="settings-section-header">
            <span className="material-symbols-outlined">insights</span>
            <h2>Statistiques rapides</h2>
          </div>

          {!stats && (
            <p className="settings-subtitle">
              Les statistiques détaillées seront disponibles une fois la route backend configurée
              (ou après quelques utilisateurs actifs).
            </p>
          )}

          {stats && (
            <div className="settings-export-grid">
              <div className="settings-export-btn">
                <span className="material-symbols-outlined">workspace_premium</span>
                <span>Utilisateurs Premium</span>
                <strong>{stats.premiumUsers}</strong>
              </div>
              <div className="settings-export-btn">
                <span className="material-symbols-outlined">savings</span>
                <span>Total épargné</span>
                <strong>{stats.totalSaved.toLocaleString('fr-FR')} XOF</strong>
              </div>
              <div className="settings-export-btn">
                <span className="material-symbols-outlined">military_tech</span>
                <span>Badges distribués</span>
                <strong>{stats.totalBadges}</strong>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminPage

