import { useState } from 'react'
import { useExpenseStore } from '../../stores/expenseStore'
import { formatAmount } from '../../core/nlp/parser'
import '../../pages/OnboardingPage.css'

interface AddIncomeModalProps {
  onClose: () => void
}

interface IncomeEntry {
  id: string
  type: string
  description: string
  amount: string
}

const incomeTypes = [
  { id: 'salary', icon: 'work', label: 'Salaire' },
  { id: 'business', icon: 'store', label: 'Commerce' },
  { id: 'gift', icon: 'redeem', label: 'Don/Cadeau' },
  { id: 'other', icon: 'more_horiz', label: 'Autre' },
]

export function AddIncomeModal({ onClose }: AddIncomeModalProps) {
  const { addNewIncome, refreshData } = useExpenseStore()
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
    setError('')

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
      await refreshData()
      onClose()
    } catch (err) {
      setError('Une erreur est survenue')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal onboarding-card-form" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="onboarding-form-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1 className="onboarding-title">Ajouter des revenus</h1>
            <button onClick={onClose} className="btn btn-ghost btn-icon">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="onboarding-subtitle">
            Ajoutez vos sources de revenus mensuels
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
                <span>Enregistrer les revenus</span>
                <span className="material-symbols-outlined">check_circle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddIncomeModal
