import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'

type WaveFlowType = 'subscription' | 'vault_deposit'

interface WavePaymentFlowProps {
  type: WaveFlowType
  amount: number
  confirmationCode?: string
  vaultId?: string
  onSuccess: (result: any) => void
  onError: (message: string) => void
}

type Step = 'ready' | 'enter_ref' | 'validating' | 'success'

const getBackendBaseUrl = () => {
  const base = import.meta.env.VITE_EMAIL_SERVER_URL || window.location.origin
  return base.replace(/\/$/, '')
}

export function WavePaymentFlow({
  type,
  amount,
  confirmationCode,
  vaultId,
  onSuccess,
  onError
}: WavePaymentFlowProps) {
  const { user } = useAuthStore()
  const [step, setStep] = useState<Step>('ready')
  const [waveRef, setWaveRef] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const waveLink = import.meta.env.VITE_WAVE_PAYMENT_LINK || ''

  useEffect(() => {
    if (step === 'ready') {
      setWaveRef('')
      setLocalError(null)
      setInfo(null)
    }
  }, [step])

  const isRefFormatValid = useMemo(() => {
    if (!waveRef) return false
    const ref = waveRef.trim().toUpperCase().replace(/\s+/g, '')
    return /^[A-Z0-9\-_]{6,30}$/.test(ref)
  }, [waveRef])

  const handleOpenWave = () => {
    if (waveLink) {
      window.open(waveLink, '_blank', 'noopener,noreferrer')
    }
    setInfo('Après avoir payé sur Wave, reviens ici et colle la référence de ton reçu.')
    // On passe automatiquement à l’étape de saisie après un court délai
    setTimeout(() => setStep('enter_ref'), 4000)
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setWaveRef(text.trim())
      }
    } catch {
      setLocalError('Impossible de lire le presse-papiers. Colle la référence manuellement.')
    }
  }

  const handleValidate = async () => {
    if (!user) {
      onError("Tu dois être connecté pour valider un paiement.")
      return
    }

    if (!isRefFormatValid) {
      setLocalError('Référence Wave invalide. Vérifie bien ton reçu.')
      return
    }

    if (type === 'subscription' && !confirmationCode) {
      onError('Code Premium manquant. Génère d’abord ton code.')
      return
    }

    if (type === 'vault_deposit' && !vaultId) {
      onError('Coffre-fort introuvable.')
      return
    }

    setIsSubmitting(true)
    setLocalError(null)
    setInfo('Vérification en cours...')
    setStep('validating')

    const backendUrl = getBackendBaseUrl()
    const endpoint =
      type === 'subscription'
        ? `${backendUrl}/api/subscription/validate-wave`
        : `${backendUrl}/api/vault/validate-wave`

    try {
      const body =
        type === 'subscription'
          ? {
              userId: user.id,
              waveReference: waveRef,
              confirmationCode
            }
          : {
              userId: user.id,
              vaultId,
              waveReference: waveRef,
              amount
            }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.success) {
        const code = data?.error || 'UNKNOWN'
        let msg = data?.message || 'Erreur inconnue lors de la validation.'
        if (code === 'FORMAT_INVALID') {
          msg = 'Référence Wave incorrecte. Vérifie bien le reçu dans ton app Wave.'
        } else if (code === 'REFERENCE_ALREADY_USED') {
          msg = 'Cette référence Wave a déjà été utilisée.'
        } else if (code === 'CODE_INVALID') {
          msg = 'Code Premium invalide ou déjà utilisé. Génère un nouveau code.'
        } else if (code === 'CODE_EXPIRED') {
          msg = 'Session expirée. Génère un nouveau code Premium.'
        } else if (code === 'TOO_MANY_ATTEMPTS') {
          msg = 'Trop de tentatives. Réessaie dans 1 heure.'
        }
        setLocalError(msg)
        setStep('enter_ref')
        onError(msg)
        return
      }

      setStep('success')
      setInfo(
        data.message ||
          (type === 'subscription'
            ? '🎉 Abonnement Premium activé avec succès !'
            : '🎉 Dépôt validé avec succès !')
      )
      onSuccess(data)
    } catch (err) {
      console.error('WavePaymentFlow error:', err)
      const msg = 'Impossible de contacter le serveur. Vérifie ta connexion internet.'
      setLocalError(msg)
      setStep('enter_ref')
      onError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <p className="settings-subtitle">
        Tu dois être connecté pour utiliser le paiement Wave.
      </p>
    )
  }

  return (
    <div className="wave-flow">
      {step === 'ready' && (
        <div className="wave-flow-card">
          <p className="settings-subtitle" style={{ marginBottom: '0.75rem' }}>
            Montant : <strong>{amount.toLocaleString('fr-FR')} XOF</strong>
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenWave}
            disabled={!waveLink}
          >
            💳 Payer maintenant sur Wave
          </button>
          {!waveLink && (
            <p className="settings-subtitle" style={{ marginTop: '0.5rem', color: 'var(--color-danger)' }}>
              Le lien Wave n’est pas configuré. Vérifie VITE_WAVE_PAYMENT_LINK dans ton .env.
            </p>
          )}
        </div>
      )}

      {step === 'enter_ref' && (
        <div className="wave-flow-card">
          <p className="settings-subtitle" style={{ marginBottom: '0.5rem' }}>
            📱 Ouvre ton app Wave → Historique → choisis le paiement → copie la référence.
          </p>
          <div className="vault-code-input" style={{ marginBottom: '0.5rem' }}>
            <label className="vault-modal-label">Référence Wave</label>
            <input
              type="text"
              value={waveRef}
              onChange={e => setWaveRef(e.target.value)}
              placeholder="Ex: WAVE123ABC"
              className={waveRef ? (isRefFormatValid ? 'valid' : 'invalid') : ''}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handlePasteFromClipboard}
            >
              📋 Coller depuis le presse-papiers
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleValidate}
              disabled={isSubmitting || !isRefFormatValid}
            >
              {isSubmitting ? 'Vérification...' : '✅ Valider mon paiement'}
            </button>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setStep('ready')}
          >
            ← Pas encore payé
          </button>
          {info && (
            <p className="settings-subtitle" style={{ marginTop: '0.5rem' }}>
              {info}
            </p>
          )}
          {localError && (
            <p
              className="settings-subtitle"
              style={{ marginTop: '0.5rem', color: 'var(--color-danger)' }}
            >
              {localError}
            </p>
          )}
        </div>
      )}

      {step === 'validating' && (
        <div className="wave-flow-card">
          <p className="settings-subtitle">⏳ Vérification de ton paiement en cours...</p>
        </div>
      )}

      {step === 'success' && (
        <div className="wave-flow-card">
          <p className="settings-subtitle">
            ✅ Paiement validé !
          </p>
          {info && (
            <p className="settings-subtitle" style={{ marginTop: '0.5rem' }}>
              {info}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default WavePaymentFlow

