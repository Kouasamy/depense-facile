import type { SavingsVault } from '../../hooks/useSavingsVault'
import type { RewardTier } from '../../config/rewardsTiers'

interface VaultBalanceCardProps {
  vault: SavingsVault
  currentTier: RewardTier | null
  nextTier: RewardTier | null
  progressPercent: number
}

export function VaultBalanceCard({
  vault,
  currentTier,
  nextTier,
  progressPercent
}: VaultBalanceCardProps) {
  const total = Number(vault.current_amount || 0)
  const bonusTotal = Number(vault.total_bonus_earned || 0)

  return (
    <section className="settings-section card animate-fade-in-up">
      <div className="settings-section-header">
        <span className="material-symbols-outlined">savings</span>
        <h2>Coffre-fort d&apos;épargne</h2>
      </div>

      <div className="vault-balance-card">
        <div className="vault-balance-main">
          <div className="vault-balance-amount">
            <p className="vault-balance-label">Solde total du coffre</p>
            <p className="vault-balance-value">
              {total.toLocaleString('fr-FR')} {vault.currency || 'XOF'}
            </p>
            {bonusTotal > 0 && (
              <p className="vault-balance-bonus">
                Bonus cumulés : +{bonusTotal.toLocaleString('fr-FR')} {vault.currency || 'XOF'}
              </p>
            )}
          </div>

          <div className="vault-badge">
            <div className="vault-badge-inner">
              <span className="vault-badge-emoji">
                {currentTier?.badge || '🌱'}
              </span>
              <span className="vault-badge-label">
                {currentTier?.name || 'Épargnant Débutant'}
              </span>
            </div>
          </div>
        </div>

        {nextTier && (
          <div className="vault-progress">
            <div className="vault-progress-text">
              <span>
                Plus que{' '}
                <strong>
                  {(nextTier.threshold - total > 0 ? nextTier.threshold - total : 0).toLocaleString(
                    'fr-FR'
                  )}{' '}
                  {vault.currency || 'XOF'}
                </strong>{' '}
                pour le badge {nextTier.badge} {nextTier.name}
              </span>
            </div>
            <div className="vault-progress-bar">
              <div
                className="vault-progress-fill"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default VaultBalanceCard

