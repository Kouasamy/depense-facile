import { useState, useMemo } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useSavingsVault } from '../hooks/useSavingsVault'
import { REWARD_TIERS } from '../config/rewardsTiers'
import { VaultBalanceCard } from '../components/savings/VaultBalanceCard'
import { BadgesGrid } from '../components/savings/BadgesGrid'
import { WaveDepositModal } from '../components/savings/WaveDepositModal'
import { RewardCelebration } from '../components/savings/RewardCelebration'
import './SettingsPage.css'

export function CoffreFortPage() {
  const { user, isPremium } = useAuthStore()
  const {
    vault,
    transactions,
    rewards,
    isLoading,
    error,
    lastDepositCode,
    lastWaveLink,
    lastInstructions,
    refresh,
    initierDepot,
    confirmerDepot,
    getPotentialRewardForDeposit
  } = useSavingsVault(user?.id)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState(0)
  const [depositCodeInput, setDepositCodeInput] = useState('')
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [celebration, setCelebration] = useState<{
    tierId: string
    bonusAmount: number
  } | null>(null)

  const currentTier = useMemo(() => {
    if (!vault) return null
    const total = Number(vault.current_amount || 0)
    let found = REWARD_TIERS[0]
    for (const tier of REWARD_TIERS) {
      if (total >= tier.threshold) {
        found = tier
      } else {
        break
      }
    }
    return found
  }, [vault])

  const nextTier = useMemo(() => {
    if (!vault) return null
    const total = Number(vault.current_amount || 0)
    return REWARD_TIERS.find(tier => tier.threshold > total) || null
  }, [vault])

  const progressPercent = useMemo(() => {
    if (!vault || !nextTier) return 100
    const total = Number(vault.current_amount || 0)
    const previousThreshold =
      REWARD_TIERS.findLast(t => t.threshold <= total)?.threshold ?? 0
    const range = nextTier.threshold - previousThreshold
    if (range <= 0) return 100
    return ((total - previousThreshold) / range) * 100
  }, [vault, nextTier])

  const potentialReward = useMemo(
    () => getPotentialRewardForDeposit(depositAmount),
    [depositAmount, getPotentialRewardForDeposit]
  )

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setDepositAmount(0)
    setDepositCodeInput('')
    setInfoMessage(null)
    setLocalError(null)
  }

  const handleInitierDepot = async () => {
    setLocalError(null)
    setInfoMessage(null)
    try {
      await initierDepot(depositAmount)
      setInfoMessage(
        'Ton code de dépôt a été généré. Paie via Wave puis reviens ici pour confirmer ton dépôt.'
      )
    } catch (e) {
      setLocalError(
        e instanceof Error ? e.message : 'Impossible de démarrer le dépôt. Réessaie plus tard.'
      )
    }
  }

  const handleConfirmerDepot = async () => {
    if (!depositCodeInput) return
    setLocalError(null)
    setInfoMessage(null)
    try {
      await confirmerDepot(depositCodeInput, depositAmount)
      setInfoMessage(
        'Dépôt envoyé pour vérification. Il sera validé manuellement (délai estimé 1–2h).'
      )
      // Après validation par l’admin, les rewards seront appliquées côté serveur
      // et visibles lors du prochain refresh automatique ou manuel.
      await refresh()
    } catch (e) {
      setLocalError(
        e instanceof Error
          ? e.message
          : 'Impossible de confirmer le dépôt pour le moment. Réessaie plus tard.'
      )
    }
  }

  // Détection simple d’une nouvelle récompense pour déclencher l’animation (côté client)
  const lastReward = rewards[0]
  const shouldCelebrate = lastReward && !celebration

  if (!user) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <p className="settings-subtitle">
            Tu dois être connecté pour accéder à ton coffre-fort d&apos;épargne.
          </p>
        </div>
      </div>
    )
  }

  if (!isPremium) {
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
                <h1 className="settings-title">Coffre-fort d&apos;épargne</h1>
                <p className="settings-subtitle">
                  Le Coffre-fort est réservé aux utilisateurs Premium. Active ton abonnement pour y
                  accéder.
                </p>
              </div>
            </div>
          </header>
          <section className="settings-section card animate-fade-in-up">
            <p className="settings-subtitle">
              Premium coûte <strong>1 500 XOF / mois</strong> et te donne accès en priorité au
              Coffre-fort d&apos;épargne et à ses récompenses.
            </p>
            <a href="/premium" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Découvrir Premium
            </a>
          </section>
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
              <h1 className="settings-title">Coffre-fort d&apos;épargne</h1>
              <p className="settings-subtitle">
                Mets de côté ton argent, débloque des badges et gagne des bonus d&apos;épargne.
              </p>
            </div>
          </div>
        </header>

        {vault && (
          <VaultBalanceCard
            vault={vault}
            currentTier={currentTier}
            nextTier={nextTier}
            progressPercent={progressPercent}
          />
        )}

        <section className="settings-section card animate-fade-in-up">
          <div className="settings-section-header">
            <span className="material-symbols-outlined">add_circle</span>
            <h2>Déposer de l&apos;épargne</h2>
          </div>
          <p className="settings-subtitle" style={{ marginBottom: '1rem' }}>
            Utilise Wave pour déposer manuellement de l&apos;argent dans ton Coffre-fort. Chaque
            dépôt te rapproche d&apos;un nouveau badge et de bonus supplémentaires.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenModal}
            disabled={isLoading || !vault}
          >
            Déposer via Wave
          </button>
        </section>

        <BadgesGrid tiers={REWARD_TIERS} rewards={rewards} />

        <section className="settings-section card animate-fade-in-up">
          <div className="settings-section-header">
            <span className="material-symbols-outlined">history</span>
            <h2>Historique des mouvements</h2>
          </div>

          {transactions.length === 0 && (
            <p className="settings-subtitle">
              Aucun dépôt pour l&apos;instant. Commence par alimenter ton Coffre-fort.
            </p>
          )}

          <div className="settings-options">
            {transactions.map(tx => (
              <div key={tx.id} className="settings-option">
                <div className="settings-option-info">
                  <span className="material-symbols-outlined">
                    {tx.transaction_type === 'deposit'
                      ? 'south_west'
                      : tx.transaction_type === 'bonus_reward'
                      ? 'military_tech'
                      : 'north_east'}
                  </span>
                  <span>
                    {tx.transaction_type === 'deposit'
                      ? 'Dépôt'
                      : tx.transaction_type === 'bonus_reward'
                      ? 'Bonus'
                      : 'Retrait'}{' '}
                    — {Number(tx.amount).toLocaleString('fr-FR')} XOF
                  </span>
                </div>
                <p className="settings-subtitle">
                  {new Date(tx.created_at).toLocaleString()} — Statut : {tx.status}
                  {tx.confirmation_code && (
                    <>
                      {' '}
                      — Code : <code>{tx.confirmation_code}</code>
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        {(error || localError) && (
          <section className="settings-section">
            <div
              className="settings-export-status"
              style={{ borderColor: 'var(--color-danger)' }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: 'var(--color-danger)' }}
              >
                error
              </span>
              <span>{localError || error}</span>
            </div>
          </section>
        )}
      </div>

      <WaveDepositModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={depositAmount}
        onAmountChange={setDepositAmount}
        potentialReward={potentialReward}
        lastDepositCode={lastDepositCode}
        lastWaveLink={lastWaveLink}
        lastInstructions={lastInstructions}
        depositCodeInput={depositCodeInput}
        onDepositCodeChange={setDepositCodeInput}
        onInitierDepot={handleInitierDepot}
        onConfirmerDepot={handleConfirmerDepot}
        isLoading={isLoading}
        error={localError || error}
        info={infoMessage}
      />

      {shouldCelebrate && (
        <RewardCelebration
          tier={REWARD_TIERS.find(t => t.id === lastReward.badge_level) || REWARD_TIERS[0]}
          bonusAmount={Number(lastReward.bonus_amount || 0)}
          onClose={() =>
            setCelebration({
              tierId: lastReward.badge_level,
              bonusAmount: Number(lastReward.bonus_amount || 0)
            })
          }
        />
      )}
    </div>
  )
}

export default CoffreFortPage

