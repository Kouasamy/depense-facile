import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { createPendingSubscription } from '../db/subscriptions'
import { WavePaymentFlow } from '../components/payments/WavePaymentFlow'
import './SettingsPage.css'

const WAVE_PAYMENT_LINK = import.meta.env.VITE_WAVE_PAYMENT_LINK || ''

export function PremiumPage() {
  const { user, isPremium, subscriptionExpiresAt, refreshSubscription } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)

  const handleCreateSubscription = async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    setInfoMessage(null)

    try {
      const { subscription } = await createPendingSubscription(user.id)
      setConfirmationCode(subscription.confirmation_code)
      setSubscriptionId(subscription.id)
      setInfoMessage(
        "Ton code Premium a été généré. Paie sur Wave puis reviens ici et clique sur \"J'ai payé\"."
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer l'abonnement. Réessaie plus tard."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async (_result: any) => {
    setInfoMessage("🎉 Ton abonnement Premium est maintenant actif. Tu peux accéder au Coffre-fort.")
    setError(null)
    await refreshSubscription()
  }

  const handlePaymentError = (message: string) => {
    setError(message)
  }

  const isDev = import.meta.env.DEV
  const handleActivateTestPremium = async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    setInfoMessage(null)
    try {
      const base = import.meta.env.VITE_EMAIL_SERVER_URL || window.location.origin
      const url = `${String(base).replace(/\/$/, '')}/api/dev/activate-premium`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          token: import.meta.env.VITE_DEV_ACTIVATE_SECRET || 'dev-premium-test'
        })
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Erreur lors de l’activation test.')
      }
      setInfoMessage('Premium activé en mode test. Tu peux accéder au Coffre-fort.')
      await refreshSubscription()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <p className="settings-subtitle">
            Tu dois être connecté pour accéder à la page Premium.
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
              <h1 className="settings-title">Premium & Coffre-fort</h1>
              <p className="settings-subtitle">
                Active l’abonnement Premium pour accéder au Coffre-fort d’épargne dans les
                prochaines mises à jour.
              </p>
            </div>
          </div>
        </header>

        <section className="settings-section card animate-fade-in-up">
          <div className="settings-section-header">
            <span className="material-symbols-outlined">workspace_premium</span>
            <h2>Abonnement Premium</h2>
          </div>
          {isPremium && subscriptionExpiresAt ? (
            <p>
              Ton abonnement Premium est <strong>actif</strong> jusqu’au{' '}
              {subscriptionExpiresAt.toLocaleDateString()}.
            </p>
          ) : (
            <p>
              Premium coûte <strong>1 500 XOF / mois</strong>. Tu soutiens le projet et tu débloques
              le Coffre-fort d’épargne avec badges et bonus automatiques.
            </p>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isDev && (
              <div className="settings-export-status" style={{ marginBottom: '0.5rem' }}>
                <span className="material-symbols-outlined">science</span>
                <span>Mode développement : active Premium sans payer pour tester le Coffre-fort.</span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleActivateTestPremium}
                  disabled={isLoading}
                >
                  {isLoading ? 'Activation...' : 'Activer Premium (test)'}
                </button>
              </div>
            )}
            {!confirmationCode ? (
              <button
                className="btn btn-primary"
                onClick={handleCreateSubscription}
                disabled={isLoading}
              >
                {isLoading ? 'Génération en cours...' : 'Générer mon code Premium'}
              </button>
            ) : (
              <>
                <div className="settings-export-status">
                  <span className="material-symbols-outlined">key</span>
                  <span>
                    Ton code Premium : <strong>{confirmationCode}</strong>
                  </span>
                </div>
                <WavePaymentFlow
                  type="subscription"
                  amount={1500}
                  confirmationCode={confirmationCode}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </>
            )}
          </div>

          {infoMessage && (
            <div className="settings-export-status" style={{ marginTop: '1rem' }}>
              <span className="material-symbols-outlined">info</span>
              <span>{infoMessage}</span>
            </div>
          )}

          {error && (
            <div className="settings-export-status" style={{ marginTop: '1rem', borderColor: 'var(--color-danger)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-danger)' }}>
                error
              </span>
              <span>{error}</span>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default PremiumPage

