export interface RewardTier {
  id: string
  name: string
  badge: string
  color: string
  threshold: number
  bonusPercent: number
  description: string
}

export const REWARD_TIERS: RewardTier[] = [
  {
    id: 'starter',
    name: 'Épargnant Débutant',
    badge: '🌱',
    color: '#A8D5A2',
    threshold: 5000, // 5 000 XOF
    bonusPercent: 10, // +10% de bonus sur l’épargne totale
    description: 'Premier pas vers la liberté financière !'
  },
  {
    id: 'bronze',
    name: 'Épargnant Bronze',
    badge: '🥉',
    color: '#CD7F32',
    threshold: 25000, // 25 000 XOF
    bonusPercent: 15,
    description: 'Tu construis de bonnes habitudes !'
  },
  {
    id: 'silver',
    name: 'Épargnant Argent',
    badge: '🥈',
    color: '#C0C0C0',
    threshold: 75000, // 75 000 XOF
    bonusPercent: 20,
    description: 'Tu es sur la bonne voie, continue !'
  },
  {
    id: 'gold',
    name: 'Épargnant Or',
    badge: '🥇',
    color: '#FFD700',
    threshold: 150000, // 150 000 XOF
    bonusPercent: 30,
    description: 'Impressionnant ! Tu maîtrises ton argent !'
  },
  {
    id: 'platinum',
    name: 'Épargnant Platine',
    badge: '💎',
    color: '#E5E4E2',
    threshold: 300000, // 300 000 XOF
    bonusPercent: 40,
    description: 'Tu es une référence en matière d’épargne !'
  },
  {
    id: 'diamond',
    name: 'Épargnant Diamant',
    badge: '👑',
    color: '#F97316',
    threshold: 500000, // 500 000 XOF
    bonusPercent: 50, // +50% de bonus !
    description: "Le summum de l'épargne ! Tu es une légende !"
  }
]

export const calculateReward = (
  previousTotal: number,
  newTotal: number
): RewardTier | null => {
  const reached = REWARD_TIERS.filter(
    tier => tier.threshold > previousTotal && tier.threshold <= newTotal
  )
  if (!reached.length) return null
  return reached.reduce((max, tier) => (tier.threshold > max.threshold ? tier : max), reached[0])
}

export const calculateBonusAmount = (totalSaved: number, bonusPercent: number): number => {
  return (totalSaved * bonusPercent) / 100
}

