import { useState } from 'react'
import { Check, X, Edit3, ChevronDown } from 'lucide-react'
import { categoryMeta, paymentMethodMeta, type ExpenseCategory, type PaymentMethod } from '../../db/schema'
import { formatAmount } from '../../core/nlp/parser'

interface ExpenseCardProps {
  expense: {
    amount: number
    category: ExpenseCategory
    description: string
    paymentMethod: PaymentMethod
    confidence: number
  }
  onConfirm: () => void
  onCancel: () => void
  onEdit: (updates: Partial<{
    amount: number
    category: ExpenseCategory
    paymentMethod: PaymentMethod
  }>) => void
}

export function ExpenseCard({ expense, onConfirm, onCancel, onEdit }: ExpenseCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editAmount, setEditAmount] = useState(expense.amount.toString())
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false)

  const meta = categoryMeta[expense.category]
  const paymentMeta = paymentMethodMeta[expense.paymentMethod]

  const handleAmountChange = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '')
    setEditAmount(numValue)
    if (numValue) {
      onEdit({ amount: parseInt(numValue, 10) })
    }
  }

  const handleCategorySelect = (category: ExpenseCategory) => {
    onEdit({ category })
    setShowCategoryDropdown(false)
  }

  const handlePaymentSelect = (method: PaymentMethod) => {
    onEdit({ paymentMethod: method })
    setShowPaymentDropdown(false)
  }

  return (
    <div className="card animate-bounce-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="badge badge-primary">
          Nouvelle dépense
        </span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`btn btn-ghost btn-sm ${isEditing ? 'text-[var(--color-primary)]' : ''}`}
        >
          <Edit3 className="w-4 h-4" />
          {isEditing ? 'Terminer' : 'Modifier'}
        </button>
      </div>

      {/* Amount */}
      <div className="text-center mb-6">
        {isEditing ? (
          <div className="relative inline-block">
            <input
              type="text"
              inputMode="numeric"
              value={editAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="text-4xl font-bold text-center bg-transparent border-b-2 border-[var(--color-primary)] text-[var(--color-text-primary)] w-40 outline-none"
            />
            <span className="text-xl text-[var(--color-text-muted)] ml-2">F</span>
          </div>
        ) : (
          <p className="text-4xl font-bold text-[var(--color-text-primary)]">
            {formatAmount(expense.amount)} <span className="text-xl text-[var(--color-text-muted)]">F</span>
          </p>
        )}
        <p className="text-sm text-[var(--color-text-muted)] mt-2 truncate max-w-xs mx-auto">
          "{expense.description}"
        </p>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6">
        {/* Category */}
        <div className="relative">
          <button
            onClick={() => isEditing && setShowCategoryDropdown(!showCategoryDropdown)}
            disabled={!isEditing}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
              isEditing 
                ? 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] cursor-pointer' 
                : 'bg-[var(--color-bg-tertiary)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{meta?.icon}</span>
              <div className="text-left">
                <p className="text-xs text-[var(--color-text-muted)]">Catégorie</p>
                <p className="font-medium text-[var(--color-text-primary)]">{meta?.label}</p>
              </div>
            </div>
            {isEditing && <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />}
          </button>

          {showCategoryDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto animate-fade-in-down">
              {Object.entries(categoryMeta).map(([key, catMeta]) => (
                <button
                  key={key}
                  onClick={() => handleCategorySelect(key as ExpenseCategory)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-all ${
                    expense.category === key ? 'bg-[var(--color-primary)]/10' : ''
                  }`}
                >
                  <span className="text-xl">{catMeta.icon}</span>
                  <span className="text-sm text-[var(--color-text-primary)]">{catMeta.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="relative">
          <button
            onClick={() => isEditing && setShowPaymentDropdown(!showPaymentDropdown)}
            disabled={!isEditing}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
              isEditing 
                ? 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] cursor-pointer' 
                : 'bg-[var(--color-bg-tertiary)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div className="text-left">
                <p className="text-xs text-[var(--color-text-muted)]">Paiement</p>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {paymentMeta?.label || expense.paymentMethod}
                </p>
              </div>
            </div>
            {isEditing && <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />}
          </button>

          {showPaymentDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-xl z-10 animate-fade-in-down">
              {Object.entries(paymentMethodMeta).map(([key, payMeta]) => (
                <button
                  key={key}
                  onClick={() => handlePaymentSelect(key as PaymentMethod)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-all ${
                    expense.paymentMethod === key ? 'bg-[var(--color-primary)]/10' : ''
                  }`}
                >
                  <span className="text-xl">{payMeta.icon}</span>
                  <span className="text-sm text-[var(--color-text-primary)]">{payMeta.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="flex gap-1">
          {[1, 2, 3].map((level) => (
            <div
              key={level}
              className={`w-2 h-2 rounded-full transition-all ${
                expense.confidence >= level * 0.33
                  ? 'bg-[var(--color-success)]'
                  : 'bg-[var(--color-bg-tertiary)]'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">
          {expense.confidence >= 0.8 ? 'Haute confiance' : 
           expense.confidence >= 0.5 ? 'Confiance moyenne' : 'Vérifier les détails'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="btn btn-secondary flex-1"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className="btn btn-success flex-1"
        >
          <Check className="w-4 h-4" />
          Confirmer
        </button>
      </div>
    </div>
  )
}

export default ExpenseCard
