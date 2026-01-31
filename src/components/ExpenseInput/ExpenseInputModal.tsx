import { useState, useEffect } from 'react'
import { useExpenseStore } from '../../stores/expenseStore'
import { useAuthStore } from '../../stores/authStore'
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition'
import { parseExpenseText, formatAmount } from '../../core/nlp/parser'
import { 
  categoryMeta, 
  paymentMethodMeta, 
  type ExpenseCategory, 
  type PaymentMethod,
  type Expense 
} from '../../db/schema'
import './ExpenseInputModal.css'

interface ExpenseInputModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExpenseInputModal({ isOpen, onClose }: ExpenseInputModalProps) {
  const { addNewExpense, refreshData } = useExpenseStore()
  const { user } = useAuthStore()
  const { isRecording, transcript, startRecording, stopRecording, resetTranscript, isAvailable } = useVoiceRecognition()

  // Form state
  const [mode, setMode] = useState<'manual' | 'voice'>('manual')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('nourriture')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Voice parsed expense
  const [voiceParsed, setVoiceParsed] = useState<Partial<Expense> | null>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

  // Process voice transcript
  useEffect(() => {
    if (transcript && !isRecording && mode === 'voice') {
      const result = parseExpenseText(transcript)
      if (result.success && result.expense && result.expense.amount > 0) {
        const { expense } = result
        setVoiceParsed({
          amount: expense.amount,
          category: expense.category,
          paymentMethod: expense.paymentMethod,
          description: transcript,
          date: new Date()
        })
        // Also fill the manual form
        setAmount(expense.amount.toString())
        setCategory(expense.category)
        setPaymentMethod(expense.paymentMethod)
        setDescription(transcript)
      }
    }
  }, [transcript, isRecording, mode])

  const resetForm = () => {
    setAmount('')
    setCategory('nourriture')
    setPaymentMethod('cash')
    setDescription('')
    setError('')
    setSuccess(false)
    setVoiceParsed(null)
    resetTranscript()
  }

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      resetTranscript()
      setVoiceParsed(null)
      startRecording()
    }
  }

  const handleSubmit = async () => {
    // Validation
    const numAmount = parseFloat(amount.replace(/\s/g, '').replace(',', '.'))
    
    if (!numAmount || numAmount <= 0) {
      setError('Veuillez entrer un montant valide')
      return
    }

    if (numAmount > 100000000) {
      setError('Le montant semble trop élevé')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await addNewExpense({
        amount: numAmount,
        category,
        paymentMethod,
        description: description || categoryMeta[category].label,
        date: new Date(),
        userId: user?.id || '',
        localId: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'pending'
      })

      await refreshData()
      setSuccess(true)
      
      // Auto close after success
      setTimeout(() => {
        onClose()
        resetForm()
      }, 1500)

    } catch (err) {
      setError('Erreur lors de l\'enregistrement')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const categories = Object.entries(categoryMeta) as [ExpenseCategory, typeof categoryMeta[ExpenseCategory]][]
  const paymentMethods = Object.entries(paymentMethodMeta) as [PaymentMethod, typeof paymentMethodMeta[PaymentMethod]][]

  return (
    <div className="expense-modal-overlay" onClick={onClose}>
      <div className="expense-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="expense-modal-header">
          <div className="expense-modal-title-row">
            <div className="expense-modal-icon">
              <span className="material-symbols-outlined">add_shopping_cart</span>
            </div>
            <div>
              <h2 className="expense-modal-title">Nouvelle Dépense</h2>
              <p className="expense-modal-subtitle">Ajouter une dépense à votre suivi</p>
            </div>
          </div>
          <button onClick={onClose} className="expense-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="expense-modal-success">
            <div className="success-icon-container">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <h3>Dépense enregistrée !</h3>
            <p>{formatAmount(parseFloat(amount))} FCFA</p>
          </div>
        ) : (
          <>
            {/* Mode Selector */}
            <div className="expense-mode-selector">
              <button 
                className={`expense-mode-btn ${mode === 'manual' ? 'active' : ''}`}
                onClick={() => setMode('manual')}
              >
                <span className="material-symbols-outlined">edit</span>
                <span>Saisie manuelle</span>
              </button>
              <button 
                className={`expense-mode-btn ${mode === 'voice' ? 'active' : ''}`}
                onClick={() => setMode('voice')}
                disabled={!isAvailable}
              >
                <span className="material-symbols-outlined">mic</span>
                <span>Saisie vocale</span>
              </button>
            </div>

            {/* Voice Mode */}
            {mode === 'voice' && (
              <div className="expense-voice-section">
                <div className="expense-voice-container">
                  <button 
                    onClick={handleVoiceToggle}
                    className={`expense-voice-btn ${isRecording ? 'recording' : ''}`}
                  >
                    <span className="material-symbols-outlined">
                      {isRecording ? 'stop' : 'mic'}
                    </span>
                  </button>
                  <p className="expense-voice-status">
                    {isRecording 
                      ? 'Parlez maintenant...' 
                      : transcript 
                        ? 'Dépense détectée !' 
                        : 'Appuyez et dites votre dépense'}
                  </p>
                </div>
                
                {transcript && (
                  <div className="expense-voice-result">
                    <p className="expense-voice-transcript">"{transcript}"</p>
                    {voiceParsed && (
                      <div className="expense-voice-parsed">
                        <div className="expense-parsed-item">
                          <span className="expense-parsed-label">Montant</span>
                          <span className="expense-parsed-value">{formatAmount(voiceParsed.amount || 0)} F</span>
                        </div>
                        <div className="expense-parsed-item">
                          <span className="expense-parsed-label">Catégorie</span>
                          <span className="expense-parsed-value">
                            {categoryMeta[voiceParsed.category || 'autre'].icon} {categoryMeta[voiceParsed.category || 'autre'].label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="expense-voice-hint">
                  <span className="material-symbols-outlined">lightbulb</span>
                  Exemple: "J'ai dépensé 2000 francs pour le transport en taxi"
                </p>
              </div>
            )}

            {/* Manual Mode or Voice with parsed data */}
            {(mode === 'manual' || voiceParsed) && (
              <div className="expense-form">
                {/* Amount Input */}
                <div className="expense-field">
                  <label className="expense-label">Montant (FCFA)</label>
                  <div className="expense-amount-input">
                    <span className="expense-currency">F</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '')
                        setAmount(val)
                      }}
                      className="expense-input-amount"
                    />
                  </div>
                </div>

                {/* Category Selector */}
                <div className="expense-field">
                  <label className="expense-label">Catégorie</label>
                  <div className="expense-categories">
                    {categories.map(([key, meta]) => (
                      <button
                        key={key}
                        onClick={() => setCategory(key)}
                        className={`expense-category-btn ${category === key ? 'active' : ''}`}
                        style={{
                          '--cat-color': meta.color,
                          '--cat-bg': `${meta.color}15`
                        } as React.CSSProperties}
                      >
                        <span className="expense-category-icon">{meta.icon}</span>
                        <span className="expense-category-label">{meta.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="expense-field">
                  <label className="expense-label">Mode de paiement</label>
                  <div className="expense-payment-methods">
                    {paymentMethods.map(([key, meta]) => (
                      <button
                        key={key}
                        onClick={() => setPaymentMethod(key)}
                        className={`expense-payment-btn ${paymentMethod === key ? 'active' : ''}`}
                      >
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="expense-field">
                  <label className="expense-label">Description (optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Déjeuner au maquis"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="expense-input"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="expense-error">
                    <span className="material-symbols-outlined">error</span>
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="expense-modal-footer">
              <button onClick={onClose} className="btn btn-secondary">
                Annuler
              </button>
              <button 
                onClick={handleSubmit} 
                className="btn btn-primary"
                disabled={isSubmitting || !amount}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined spinning">progress_activity</span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check</span>
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ExpenseInputModal

