import type { RewardTier } from '../../config/rewardsTiers'
import type { VaultReward } from '../../hooks/useSavingsVault'

interface BadgesGridProps {
  tiers: RewardTier[]
  rewards: VaultReward[]
}

export function BadgesGrid({ tiers, rewards }: BadgesGridProps) {
  const earnedLevels = new Set(rewards.map(r => r.badge_level))

  return (
    <section className="settings-section card animate-fade-in-up">
      <div className="settings-section-header">
        <span className="material-symbols-outlined">military_tech</span>
        <h2>Badges d&apos;épargne</h2>
      </div>

      <div className="vault-badges-grid">
        {tiers.map(tier => {
          const earned = earnedLevels.has(tier.id)

          return (
            <div
              key={tier.id}
              className={`vault-badge-card ${earned ? 'earned' : 'locked'}`}
              title={tier.description}
            >
              <div className="vault-badge-icon">
                <span>{tier.badge}</span>
              </div>
              <div className="vault-badge-info">
                <p className="vault-badge-name">{tier.name}</p>
                <p className="vault-badge-threshold">
                  Palier : {tier.threshold.toLocaleString('fr-FR')} XOF
                </p>
              </div>
              <div className="vault-badge-status">
                {earned ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>Obtenu</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">lock</span>
                    <span>À débloquer</span>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default BadgesGrid

