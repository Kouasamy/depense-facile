import { useState, useEffect, useMemo } from 'react'
import { useExpenseStore } from '../stores/expenseStore'
import { categoryMeta, paymentMethodMeta, type ExpenseCategory } from '../db/schema'
import { formatAmount } from '../core/nlp/parser'
import { downloadExpensesPDF } from '../utils/export'
import './HistoryPage.css'

export function HistoryPage() {
  const { expenses, deleteExpense, refreshData } = useExpenseStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const filteredExpenses = useMemo(() => {
    let result = [...expenses]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(e =>
        e.description.toLowerCase().includes(term) ||
        categoryMeta[e.category]?.label.toLowerCase().includes(term)
      )
    }

    if (selectedCategory !== 'all') {
      result = result.filter(e => e.category === selectedCategory)
    }

    switch (sortOrder) {
      case 'newest':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case 'highest':
        result.sort((a, b) => b.amount - a.amount)
        break
      case 'lowest':
        result.sort((a, b) => a.amount - b.amount)
        break
    }

    return result
  }, [expenses, searchTerm, selectedCategory, sortOrder])

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, typeof expenses> = {}
    filteredExpenses.forEach(exp => {
      const dateKey = new Date(exp.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(exp)
    })
    return groups
  }, [filteredExpenses])

  const handleDelete = async (id: number) => {
    if (confirm('Supprimer cette dépense ?')) {
      await deleteExpense(id)
      await refreshData()
    }
  }

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="history-page">
      <div className="history-container">
        {/* Header */}
        <header className="history-header animate-fade-in">
          <div className="history-header-info">
            <div className="history-icon">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div>
              <h1 className="history-title">Historique</h1>
              <p className="history-subtitle">
                {filteredExpenses.length} transaction{filteredExpenses.length > 1 ? 's' : ''} • {formatAmount(totalFiltered)} FCFA
              </p>
            </div>
          </div>
          <button onClick={() => downloadExpensesPDF()} className="btn btn-primary btn-sm">
            <span className="material-symbols-outlined">download</span>
            <span className="desktop-only">Exporter PDF</span>
          </button>
        </header>

        {/* Search & Filters */}
        <div className="history-filters card animate-fade-in-up">
          <div className="history-filters-row">
            <div className="history-search">
              <span className="material-symbols-outlined form-input-icon">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une dépense..."
                className="form-input form-input-with-icon"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="history-search-clear">
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>

            <div className="history-filter-buttons">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn ${showFilters || selectedCategory !== 'all' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <span className="material-symbols-outlined">tune</span>
                <span>Filtres</span>
                {selectedCategory !== 'all' && <span className="filter-dot"></span>}
              </button>

              <div className="history-sort">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                  className="form-input form-select"
                >
                  <option value="newest">Plus récent</option>
                  <option value="oldest">Plus ancien</option>
                  <option value="highest">Plus élevé</option>
                  <option value="lowest">Plus bas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          {showFilters && (
            <div className="history-category-pills animate-fade-in">
              <p className="history-pills-label">Catégories</p>
              <div className="history-pills-list">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`history-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                >
                  Toutes
                </button>
                {Object.entries(categoryMeta).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as ExpenseCategory)}
                    className={`history-pill ${selectedCategory === key ? 'active' : ''}`}
                    style={{
                      backgroundColor: selectedCategory === key ? meta.color : undefined,
                      color: selectedCategory === key ? 'white' : undefined
                    }}
                  >
                    <span>{meta.icon}</span>
                    <span className="desktop-only">{meta.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Expenses List */}
        {filteredExpenses.length > 0 ? (
          <div className="history-list">
            {Object.entries(groupedExpenses).map(([date, dayExpenses], groupIndex) => (
              <div key={date} className="history-group animate-fade-in-up" style={{ animationDelay: `${groupIndex * 50}ms` }}>
                <div className="history-group-header">
                  <span className="material-symbols-outlined">calendar_today</span>
                  <h3 className="history-group-date">{date}</h3>
                  <div className="history-group-line"></div>
                  <span className="history-group-total">
                    -{formatAmount(dayExpenses.reduce((s, e) => s + e.amount, 0))} FCFA
                  </span>
                </div>

                <div className="history-group-items">
                  {dayExpenses.map((expense, index) => {
                    const catMeta = categoryMeta[expense.category]
                    const payMeta = paymentMethodMeta[expense.paymentMethod]
                    const expTime = new Date(expense.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

                    return (
                      <div
                        key={expense.id}
                        className="transaction-item animate-fade-in-up"
                        style={{ animationDelay: `${(groupIndex * 50) + (index * 30)}ms` }}
                      >
                        <div
                          className="transaction-icon"
                          style={{ backgroundColor: `${catMeta?.color}20`, color: catMeta?.color }}
                        >
                          {catMeta?.icon}
                        </div>
                        <div className="transaction-info">
                          <p className="transaction-title">{expense.description || catMeta?.label}</p>
                          <p className="transaction-meta">
                            <span>{expTime}</span>
                            <span>•</span>
                            <span>{catMeta?.label}</span>
                            <span className="desktop-only">•</span>
                            <span className="desktop-only">{payMeta?.label}</span>
                          </p>
                        </div>
                        <div className="transaction-actions">
                          <p className="transaction-amount text-danger">-{formatAmount(expense.amount)} F</p>
                          <button
                            onClick={() => expense.id && handleDelete(expense.id)}
                            className="transaction-delete"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="history-empty card animate-fade-in-up">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined">
                {searchTerm || selectedCategory !== 'all' ? 'search_off' : 'receipt_long'}
              </span>
            </div>
            <p className="font-bold">
              {searchTerm || selectedCategory !== 'all' ? 'Aucun résultat' : 'Aucune dépense'}
            </p>
            <p className="text-small text-muted">
              {searchTerm || selectedCategory !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par enregistrer votre première dépense vocalement !'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage
