import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useExpenseStore } from '../../stores/expenseStore'
import { categoryMeta, paymentMethodMeta } from '../../db/schema'
import { formatAmount } from '../../core/nlp/parser'
import './SearchModal.css'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { expenses } = useExpenseStore()

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    if (!isOpen) {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // Search expenses
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchTerm = query.toLowerCase()
    const filtered = expenses.filter(expense => {
      const catMeta = categoryMeta[expense.category]
      const payMeta = paymentMethodMeta[expense.paymentMethod]
      
      return (
        expense.description?.toLowerCase().includes(searchTerm) ||
        catMeta?.label.toLowerCase().includes(searchTerm) ||
        payMeta?.label.toLowerCase().includes(searchTerm) ||
        expense.amount.toString().includes(searchTerm)
      )
    }).slice(0, 10) // Limit to 10 results

    setResults(filtered)
  }, [query, expenses])

  // Quick actions
  const quickActions = [
    { icon: 'add', label: 'Ajouter dépense', path: '/', action: 'add' },
    { icon: 'history', label: 'Historique', path: '/history' },
    { icon: 'query_stats', label: 'Statistiques', path: '/analytics' },
    { icon: 'account_balance', label: 'Budgets', path: '/budgets' },
    { icon: 'psychology', label: 'Conseiller IA', path: '/advisor' },
    { icon: 'settings', label: 'Paramètres', path: '/settings' },
  ]

  const handleQuickAction = (action: typeof quickActions[0]) => {
    onClose()
    navigate(action.path)
  }

  const handleResultClick = () => {
    onClose()
    navigate('/history')
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div className="search-input-container">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher des dépenses, catégories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          {query && (
            <button onClick={() => setQuery('')} className="search-clear">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
          <kbd className="search-shortcut">ESC</kbd>
        </div>

        {/* Results or Quick Actions */}
        <div className="search-content">
          {query ? (
            <>
              {results.length > 0 ? (
                <div className="search-results">
                  <p className="search-section-title">
                    {results.length} résultat{results.length > 1 ? 's' : ''}
                  </p>
                  {results.map((expense) => {
                    const catMeta = categoryMeta[expense.category as keyof typeof categoryMeta]
                    const expDate = new Date(expense.date)
                    
                    return (
                      <button
                        key={expense.id}
                        className="search-result-item"
                        onClick={handleResultClick}
                      >
                        <div 
                          className="search-result-icon"
                          style={{ backgroundColor: `${catMeta?.color}20`, color: catMeta?.color }}
                        >
                          {catMeta?.icon}
                        </div>
                        <div className="search-result-info">
                          <p className="search-result-title">
                            {expense.description || catMeta?.label}
                          </p>
                          <p className="search-result-meta">
                            {catMeta?.label} • {expDate.toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <p className="search-result-amount">
                          {formatAmount(expense.amount)} F
                        </p>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="search-no-results">
                  <span className="material-symbols-outlined">search_off</span>
                  <p>Aucun résultat pour "{query}"</p>
                  <p className="text-small text-muted">Essayez avec d'autres termes</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="search-quick-actions">
                <p className="search-section-title">Actions rapides</p>
                <div className="search-actions-grid">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="search-action-btn"
                      onClick={() => handleQuickAction(action)}
                    >
                      <span className="material-symbols-outlined">{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches Hint */}
              <div className="search-hint">
                <span className="material-symbols-outlined">lightbulb</span>
                <p>Tapez pour rechercher dans vos dépenses, catégories ou montants</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="search-footer">
          <div className="search-footer-item">
            <kbd>↑↓</kbd>
            <span>Naviguer</span>
          </div>
          <div className="search-footer-item">
            <kbd>↵</kbd>
            <span>Sélectionner</span>
          </div>
          <div className="search-footer-item">
            <kbd>ESC</kbd>
            <span>Fermer</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchModal

