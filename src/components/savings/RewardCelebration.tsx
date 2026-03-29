import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import type { RewardTier } from '../../config/rewardsTiers'

interface RewardCelebrationProps {
  tier: RewardTier
  bonusAmount: number
  onClose: () => void
}

export function RewardCelebration({ tier, bonusAmount, onClose }: RewardCelebrationProps) {
  useEffect(() => {
    const duration = 2 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 }
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  return (
    <div className="vault-celebration-overlay" onClick={onClose}>
      <div className="vault-celebration-card animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="vault-celebration-badge">
          <span className="vault-celebration-emoji">{tier.badge}</span>
        </div>
        <h2>Bravo ! Nouveau badge débloqué 🎉</h2>
        <p className="vault-celebration-title">{tier.name}</p>
        <p className="vault-celebration-bonus">
          Bonus gagné :{' '}
          <strong>
            {bonusAmount.toLocaleString('fr-FR')} XOF (+{tier.bonusPercent}%)
          </strong>
        </p>
        <p className="vault-celebration-text">
          Ton coffre-fort vient d&apos;être crédité de ce bonus. Continue à épargner pour débloquer
          les prochains badges !
        </p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Continuer
        </button>
      </div>
    </div>
  )
}

export default RewardCelebration

