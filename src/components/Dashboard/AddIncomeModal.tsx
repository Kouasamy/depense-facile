import { useState } from 'react'
import { useExpenseStore } from '../../stores/expenseStore'
import { formatAmount } from '../../core/nlp/parser'
import {
  X,
  Briefcase,
  Store,
  Gift,
  MoreHorizontal,
  Check
} from 'lucide-react'

interface AddIncomeModalProps {
  onClose: () => void
}

const incomeTypes = [
  { id: 'salary', icon: Briefcase, label: 'Salaire', color: 'var(--color-primary)' },
  { id: 'business', icon: Store, label: 'Commerce', color: 'var(--color-success)' },
  { id: 'gift', icon: Gift, label: 'Don/Cadeau', color: 'var(--color-warning)' },
  { id: 'other', icon: MoreHorizontal, label: 'Autre', color: 'var(--color-secondary)' },
]

export function AddIncomeModal({ onClose }: AddIncomeModalProps) {
  const { addNewIncome, refreshData } = useExpenseStore()
  const [selectedType, setSelectedType] = useState('salary')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    const numAmount = parseInt(amount.replace(/\s/g, ''), 10)
    
    if (!numAmount || numAmount <= 0) {
      setError('Ajoute un montant valide')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const typeLabel = incomeTypes.find(t => t.id === selectedType)?.label || selectedType
      await addNewIncome({
        source: typeLabel,
        description: description || typeLabel,
        amount: numAmount,
        date: new Date(),
      })
      await refreshData()
      onClose()
    } catch (err) {
      setError('Une erreur est survenue')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Ajouter un revenu
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Income Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
            Type de revenu
          </label>
          <div className="grid grid-cols-2 gap-3">
            {incomeTypes.map(({ id, icon: Icon, label, color }) => (
              <button
                key={id}
                onClick={() => setSelectedType(id)}
                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  selectedType === id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-light)]'
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className={`font-medium ${
                  selectedType === id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'
                }`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Description (optionnel)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Salaire janvier 2026"
            className="input"
          />
        </div>

        {/* Amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Montant
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/[^0-9]/g, ''))
                setError('')
              }}
              placeholder="0"
              className="input text-2xl font-bold pr-20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-medium">
              FCFA
            </span>
          </div>
          {amount && (
            <p className="text-sm text-[var(--color-success)] mt-2">
              = {formatAmount(parseInt(amount) || 0)} F
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 mb-6">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !amount}
            className="btn btn-success flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Ajout...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Ajouter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddIncomeModal
