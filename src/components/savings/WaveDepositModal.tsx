import type { RewardTier } from '../../config/rewardsTiers'

interface WaveDepositModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  onAmountChange: (value: number) => void
  suggestedAmounts?: number[]
  potentialReward: { tier: RewardTier; bonusAmount: number } | null
  lastDepositCode: string | null
  lastWaveLink: string | null
  lastInstructions: string | null
  depositCodeInput: string
  onDepositCodeChange: (value: string) => void
  onInitierDepot: () => void
  onConfirmerDepot: () => void
  isLoading: boolean
  error: string | null
  info: string | null
}

export function WaveDepositModal({
  isOpen,
  onClose,
  amount,
  onAmountChange,
  suggestedAmounts = [5000, 10000, 25000, 50000],
  potentialReward,
  lastDepositCode,
  lastWaveLink,
  lastInstructions,
  depositCodeInput,
  onDepositCodeChange,
  onInitierDepot,
  onConfirmerDepot,
  isLoading,
  error,
  info
}: WaveDepositModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = () => {
    if (!isLoading) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal animate-scale-in vault-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-title">Déposer de l&apos;épargne</h2>
        </div>

        <div className="modal-body">
          <div className="vault-modal-section">
            <label className="vault-modal-label">Montant à déposer</label>
            <div className="vault-amount-input">
              <span className="vault-amount-prefix">XOF</span>
              <input
                type="number"
                min={0}
                value={amount || ''}
                onChange={e => onAmountChange(Number(e.target.value || 0))}
                placeholder="Ex: 10 000"
              />
            </div>
            <div className="vault-amount-suggestions">
              {suggestedAmounts.map(v => (
                <button
                  key={v}
                  type="button"
                  className="vault-amount-chip"
                  onClick={() => onAmountChange(v)}
                >
                  {v.toLocaleString('fr-FR')} XOF
                </button>
              ))}
            </div>
          </div>

          {potentialReward && (
            <div className="vault-modal-highlight">
              <span className="vault-modal-badge">{potentialReward.tier.badge}</span>
              <div>
                <p>
                  Avec ce dépôt tu peux gagner le badge{' '}
                  <strong>{potentialReward.tier.name}</strong> et un bonus de{' '}
                  <strong>
                    {potentialReward.bonusAmount.toLocaleString('fr-FR')} XOF (+{' '}
                    {potentialReward.tier.bonusPercent}%)
                  </strong>
                  .
                </p>
              </div>
            </div>
          )}

          <div className="vault-modal-section">
            {!lastDepositCode ? (
              <>
                <p className="settings-subtitle">
                  1. Choisis un montant puis clique sur &quot;Déposer via Wave&quot; pour générer un
                  code de dépôt.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onInitierDepot}
                  disabled={isLoading || !amount}
                >
                  {isLoading ? 'Génération du code...' : 'Déposer via Wave'}
                </button>
              </>
            ) : (
              <>
                <div className="settings-export-status">
                  <span className="material-symbols-outlined">key</span>
                  <span>
                    Ton code de dépôt : <strong>{lastDepositCode}</strong>
                  </span>
                </div>
                {lastWaveLink && (
                  <a
                    href={lastWaveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                  >
                    Ouvrir Wave pour payer
                  </a>
                )}
                {lastInstructions && (
                  <p className="settings-subtitle" style={{ marginTop: '0.75rem' }}>
                    {lastInstructions}
                  </p>
                )}
                <p className="settings-subtitle" style={{ marginTop: '0.75rem' }}>
                  2. Après le paiement, copie le même code ci-dessous pour confirmer ton dépôt.
                </p>

                <div className="vault-code-input">
                  <label className="vault-modal-label">Code de dépôt Wave</label>
                  <input
                    type="text"
                    value={depositCodeInput}
                    onChange={e => onDepositCodeChange(e.target.value.toUpperCase())}
                    placeholder="Ex: DEP-ABCD-1234"
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={onConfirmerDepot}
                  disabled={isLoading || !depositCodeInput}
                >
                  {isLoading ? 'Envoi en cours...' : 'Confirmer mon dépôt'}
                </button>
              </>
            )}
          </div>

          {info && (
            <div className="settings-export-status" style={{ marginTop: '0.75rem' }}>
              <span className="material-symbols-outlined">info</span>
              <span>{info}</span>
            </div>
          )}

          {error && (
            <div
              className="settings-export-status"
              style={{ marginTop: '0.75rem', borderColor: 'var(--color-danger)' }}
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
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default WaveDepositModal

