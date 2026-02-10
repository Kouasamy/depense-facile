import { useState } from 'react'
import { useExpenseStore } from '../stores/expenseStore'
import { formatAmount } from '../core/nlp/parser'
import './OnboardingPage.css'

const incomeTypes = [
  { id: 'salary', icon: 'work', label: 'Salaire' },
  { id: 'business', icon: 'store', label: 'Commerce' },
  { id: 'gift', icon: 'redeem', label: 'Don/Cadeau' },
  { id: 'other', icon: 'more_horiz', label: 'Autre' },
]

const features = [
  { icon: 'mic', title: 'Voix Intelligente', desc: 'Parle naturellement en Français ou Nouchi' },
  { icon: 'bolt', title: 'Mode Hors-ligne', desc: 'Fonctionne même sans internet' },
  { icon: 'shield', title: '100% Privé', desc: 'Tes données restent sur ton appareil' },
]

interface IncomeEntry {
  id: string
  type: string
  description: string
  amount: string
}

export function OnboardingPage() {
  const { completeOnboarding, addNewIncome } = useExpenseStore()
  const [step, setStep] = useState<'welcome' | 'income'>('welcome')
  const [incomes, setIncomes] = useState<IncomeEntry[]>([
    { id: '1', type: 'salary', description: '', amount: '' }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const addIncomeEntry = () => {
    setIncomes([
      ...incomes,
      { id: Date.now().toString(), type: 'salary', description: '', amount: '' }
    ])
  }

  const removeIncomeEntry = (id: string) => {
    if (incomes.length > 1) {
      setIncomes(incomes.filter(i => i.id !== id))
    }
  }

  const updateIncomeEntry = (id: string, field: keyof IncomeEntry, value: string) => {
    setIncomes(incomes.map(i =>
      i.id === id ? { ...i, [field]: value } : i
    ))
    setError('')
  }

  const totalIncome = incomes.reduce((sum, i) => {
    const amount = parseInt(i.amount.replace(/\s/g, ''), 10) || 0
    return sum + amount
  }, 0)

  const handleSubmit = async () => {
    const validIncomes = incomes.filter(i => i.amount && parseInt(i.amount.replace(/\s/g, ''), 10) > 0)

    if (validIncomes.length === 0) {
      setError('Ajoute au moins un revenu pour continuer')
      return
    }

    setIsSubmitting(true)
    try {
      for (const income of validIncomes) {
        const typeLabel = incomeTypes.find(t => t.id === income.type)?.label || income.type
        await addNewIncome({
          source: typeLabel,
          description: income.description || typeLabel,
          amount: parseInt(income.amount.replace(/\s/g, ''), 10),
          date: new Date(),
        })
      }
      await completeOnboarding()
    } catch {
      setError('Une erreur est survenue')
      setIsSubmitting(false)
    }
  }

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <div className="onboarding-page">
        <header className="onboarding-header">
          <div className="onboarding-logo">
            <div className="onboarding-logo-icon">
              <img
                src="/logo-gtd.png"
                alt="Logo GèreTonDjai"
                className="app-logo-image"
              />
            </div>
            <span className="onboarding-logo-text">GèreTonDjai</span>
          </div>
        </header>

        <main className="onboarding-main">
          <div className="onboarding-card animate-scale-in">
            {/* Illustration */}
            <div className="onboarding-illustration">
              <svg viewBox="0 0 400 200" className="onboarding-illustration-svg">
                <defs>
                  <linearGradient id="skyGradOnb" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#87CEEB', stopOpacity:0.3}} />
                    <stop offset="100%" style={{stopColor:'#f48c25', stopOpacity:0.2}} />
                  </linearGradient>
                </defs>
                <rect width="400" height="200" fill="url(#skyGradOnb)"/>
                <rect x="20" y="80" width="60" height="120" fill="#D2691E" opacity="0.8" rx="5"/>
                <rect x="90" y="100" width="50" height="100" fill="#CD853F" opacity="0.9" rx="5"/>
                <rect x="150" y="70" width="70" height="130" fill="#DEB887" opacity="0.85" rx="5"/>
                <rect x="230" y="90" width="55" height="110" fill="#F4A460" opacity="0.8" rx="5"/>
                <rect x="295" y="110" width="65" height="90" fill="#D2B48C" opacity="0.9" rx="5"/>
                <rect x="370" y="130" width="8" height="70" fill="#8B4513"/>
                <ellipse cx="374" cy="125" rx="25" ry="15" fill="#228B22" opacity="0.8"/>
              </svg>
              <div className="onboarding-illustration-overlay"></div>
              <div className="onboarding-illustration-badge">
                <span className="material-symbols-outlined">storefront</span>
                <span>Le marché Ivoirien</span>
              </div>
            </div>

            {/* Content */}
            <div className="onboarding-content">
              <h1 className="onboarding-title">Bienvenue sur GèreTonDjai</h1>
              <p className="onboarding-subtitle">Gère ton djai comme un boss, en Nouchi !</p>

              <div className="onboarding-features">
                {features.map(({ icon, title, desc }, index) => (
                  <div
                    key={title}
                    className="onboarding-feature animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="onboarding-feature-icon">
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div>
                      <h3 className="onboarding-feature-title">{title}</h3>
                      <p className="onboarding-feature-desc">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep('income')} className="btn btn-primary btn-lg onboarding-cta">
                <span>Commencer l'aventure</span>
                <span className="material-symbols-outlined">rocket_launch</span>
              </button>

              <p className="onboarding-meta">Configuration rapide • 2 minutes</p>
            </div>
          </div>
        </main>

        <footer className="onboarding-footer">
          <p>© 2024 GèreTonDjai. Tous droits réservés.</p>
        </footer>
      </div>
    )
  }

  // Income Setup Screen
  return (
    <div className="onboarding-page">
      <header className="onboarding-header">
        <div className="onboarding-logo">
          <div className="onboarding-logo-icon">
            <img
              src="/logo-gtd.png"
              alt="Logo GèreTonDjai"
              className="app-logo-image"
            />
          </div>
          <span className="onboarding-logo-text">GèreTonDjai</span>
        </div>
        <button onClick={() => setStep('welcome')} className="btn btn-secondary btn-sm">
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Retour</span>
        </button>
      </header>

      <main className="onboarding-main">
        <div className="onboarding-card onboarding-card-form animate-scale-in">
          <div className="onboarding-form-header">
            <h1 className="onboarding-title">Définissez vos revenus</h1>
            <p className="onboarding-subtitle">
              Cela nous aide à calculer votre limite de dépenses quotidienne.
            </p>
          </div>

          <div className="onboarding-form-body">
            {/* Income Entries */}
            <div className="onboarding-incomes">
              {incomes.map((income, index) => (
                <div key={income.id} className="onboarding-income-entry animate-scale-in">
                  <div className="onboarding-income-header">
                    <span className="onboarding-income-number">Revenu #{index + 1}</span>
                    {incomes.length > 1 && (
                      <button
                        onClick={() => removeIncomeEntry(income.id)}
                        className="onboarding-income-delete"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </div>

                  {/* Type Selection */}
                  <div className="onboarding-income-types">
                    {incomeTypes.map(({ id, icon, label }) => (
                      <button
                        key={id}
                        onClick={() => updateIncomeEntry(income.id, 'type', id)}
                        className={`onboarding-type-btn ${income.type === id ? 'active' : ''}`}
                      >
                        <span className="material-symbols-outlined">{icon}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Description */}
                  <div className="form-input-wrapper">
                    <span className="material-symbols-outlined form-input-icon">description</span>
                    <input
                      type="text"
                      value={income.description}
                      onChange={(e) => updateIncomeEntry(income.id, 'description', e.target.value)}
                      placeholder="Description (optionnel)"
                      className="form-input form-input-with-icon"
                    />
                  </div>

                  {/* Amount */}
                  <div className="onboarding-amount-wrapper">
                    <span className="material-symbols-outlined form-input-icon">payments</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={income.amount}
                      onChange={(e) => updateIncomeEntry(income.id, 'amount', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Montant mensuel"
                      className="form-input form-input-with-icon onboarding-amount-input"
                    />
                    <span className="onboarding-currency">FCFA</span>
                  </div>
                </div>
              ))}

              {/* Add Income Button */}
              <button onClick={addIncomeEntry} className="onboarding-add-income">
                <span className="material-symbols-outlined">add_circle</span>
                <span>Ajouter une source de revenu</span>
              </button>
            </div>

            {/* Total Card */}
            <div className="onboarding-total">
              <div className="onboarding-total-info">
                <p className="onboarding-total-label">Total mensuel</p>
                <p className="onboarding-total-value">
                  {formatAmount(totalIncome)} <span>FCFA</span>
                </p>
              </div>
              <div className="onboarding-total-icon">
                <span className="material-symbols-outlined">savings</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="onboarding-error animate-scale-in">
                <span className="material-symbols-outlined">error</span>
                <p>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary btn-lg onboarding-cta"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined spinning">progress_activity</span>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <span>Terminer la configuration</span>
                  <span className="material-symbols-outlined">check_circle</span>
                </>
              )}
            </button>

            <p className="onboarding-meta">
              Vous pourrez modifier ces informations dans les paramètres.
            </p>
          </div>
        </div>
      </main>

      <footer className="onboarding-footer">
        <p>© 2024 GèreTonDjai. Tous droits réservés.</p>
      </footer>
    </div>
  )
}

export default OnboardingPage
