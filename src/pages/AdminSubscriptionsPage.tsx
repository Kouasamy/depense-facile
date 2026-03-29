import { useEffect, useState } from 'react'
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

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL
const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY

export function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const loadPending = async () => {
    setIsLoading(true)
    setError(null)
    setInfo(null)

    try {
      const backendUrl =
        import.meta.env.VITE_EMAIL_SERVER_URL || 'https://xn--gretondjai-z6a.com'

      const res = await fetch(
        `${backendUrl.replace(
          /\/$/,
          ''
        )}/api/admin/subscriptions/pending?token=${encodeURIComponent(
          ADMIN_SECRET_KEY || ''
        )}`
      )
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors du chargement des abonnements.')
      }
      setSubscriptions(data.data || [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur inconnue lors du chargement des abonnements.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPending()
  }, [])

  const handleActivate = async (id: string) => {
    setIsLoading(true)
    setError(null)
    setInfo(null)

    try {
      const backendUrl =
        import.meta.env.VITE_EMAIL_SERVER_URL || 'https://xn--gretondjai-z6a.com'

      const res = await fetch(
        `${backendUrl.replace(
          /\/$/,
          ''
        )}/api/admin/subscriptions/${id}/activate?token=${encodeURIComponent(
          ADMIN_SECRET_KEY || ''
        )}`,
        { method: 'POST' }
      )
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l’activation.')
      }
      setInfo('Abonnement activé avec succès.')
      await loadPending()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur inconnue lors de l’activation.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Protection légère côté client : uniquement l’admin par email.
  const currentEmail = ADMIN_EMAIL
  if (!currentEmail) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <p className="settings-subtitle">
            ADMIN_EMAIL n&apos;est pas configuré. La page admin ne peut pas être utilisée.
          </p>
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
              <h1 className="settings-title">Admin - Abonnements Premium</h1>
              <p className="settings-subtitle">
                Liste des abonnements Premium en attente d’activation (vérifie les paiements
                sur Wave avant de valider).
              </p>
            </div>
          </div>
        </header>

        <section className="settings-section card animate-fade-in-up">
          <div className="settings-section-header">
            <span className="material-symbols-outlined">list</span>
            <h2>Abonnements en attente</h2>
          </div>

          <button
            className="btn btn-outline"
            onClick={loadPending}
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
            <div className="settings-export-status" style={{ borderColor: 'var(--color-danger)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-danger)' }}>
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
                  onClick={() => handleActivate(sub.id)}
                  disabled={isLoading}
                >
                  Activer cet abonnement
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminSubscriptionsPage

