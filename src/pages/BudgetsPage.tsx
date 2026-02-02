import { useState, useEffect } from 'react'
import { useExpenseStore } from '../stores/expenseStore'
import { useBudgetStore } from '../stores/budgetStore'
import { categoryMeta, type ExpenseCategory } from '../db/schema'
import { formatAmount } from '../core/nlp/parser'
import { BackButton } from '../components/common'
import './BudgetsPage.css'

export function BudgetsPage() {
  const { expenses, refreshData } = useExpenseStore()
  const { budgets, alerts, loadBudgets, setBudget, removeBudget, calculateAlerts } = useBudgetStore()
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null)
  const [newBudgetAmount, setNewBudgetAmount] = useState('')

  useEffect(() => {
    refreshData()
    loadBudgets()
  }, [refreshData, loadBudgets])

  useEffect(() => {
    calculateAlerts(expenses)
  }, [expenses, budgets, calculateAlerts])

  const handleSaveBudget = async () => {
    if (editingCategory && newBudgetAmount) {
      const amount = parseInt(newBudgetAmount.replace(/\s/g, ''), 10)
      if (amount > 0) {
        await setBudget(editingCategory, amount)
        setShowModal(false)
        setEditingCategory(null)
        setNewBudgetAmount('')
      }
    }
  }

  const handleEditBudget = (category: ExpenseCategory) => {
    setEditingCategory(category)
    setNewBudgetAmount(budgets[category]?.toString() || '')
    setShowModal(true)
  }

  const handleAddBudget = () => {
    setEditingCategory(null)
    setNewBudgetAmount('')
    setShowModal(true)
  }

  const handleDeleteBudget = async (category: ExpenseCategory) => {
    if (confirm('Supprimer ce budget ?')) {
      await removeBudget(category)
    }
  }

  const categorySpent: Record<string, number> = {}
  expenses.forEach(exp => {
    categorySpent[exp.category] = (categorySpent[exp.category] || 0) + exp.amount
  })

  const categoriesWithBudgets = Object.entries(budgets).filter(([, amount]) => amount > 0)
  const categoriesWithoutBudgets = Object.keys(categoryMeta).filter(
    cat => !budgets[cat as ExpenseCategory] || budgets[cat as ExpenseCategory] === 0
  )

  return (
    <div className="budgets-page">
      <BackButton />
      <div className="budgets-container">
        {/* Header */}
        <header className="budgets-header animate-fade-in">
          <div className="budgets-header-info">
            <div className="budgets-icon">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <div>
              <h1 className="budgets-title">Budgets</h1>
              <p className="budgets-subtitle">Définissez vos limites de dépenses</p>
            </div>
          </div>
          <button onClick={handleAddBudget} className="btn btn-primary btn-sm">
            <span className="material-symbols-outlined">add</span>
            <span className="desktop-only">Nouveau</span>
          </button>
        </header>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <section className="budgets-alerts card animate-fade-in-up">
            <div className="budgets-alerts-header">
              <span className="material-symbols-outlined">warning</span>
              <h2>Alertes ({alerts.length})</h2>
            </div>
            <div className="budgets-alerts-grid">
              {alerts.map((alert, index) => {
                const meta = categoryMeta[alert.category]
                const isOver = alert.status === 'over'
                
                return (
                  <div
                    key={alert.category}
                    className={`budgets-alert-item ${isOver ? 'danger' : 'warning'}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="budgets-alert-header">
                      <span className="budgets-alert-emoji">{meta?.icon}</span>
                      <span className="budgets-alert-name">{meta?.label}</span>
                    </div>
                    <p className={`budgets-alert-amount ${isOver ? 'text-danger' : 'text-warning'}`}>
                      {formatAmount(alert.spent)} / {formatAmount(alert.budget)} FCFA ({alert.percentage}%)
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Budgets Grid */}
        {categoriesWithBudgets.length > 0 ? (
          <section className="budgets-grid">
            {categoriesWithBudgets.map(([category, budget], index) => {
              const meta = categoryMeta[category as ExpenseCategory]
              const spent = categorySpent[category] || 0
              const percentage = Math.min(Math.round((spent / budget) * 100), 100)
              const isOver = spent > budget
              const isWarning = percentage >= 80 && !isOver

              return (
                <div 
                  key={category} 
                  className="budgets-card card animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="budgets-card-header">
                    <div className="budgets-card-category">
                      <div className="budgets-card-icon" style={{ backgroundColor: `${meta?.color}20` }}>
                        {meta?.icon}
                      </div>
                      <div>
                        <h3 className="budgets-card-name">{meta?.label}</h3>
                        <div className="budgets-card-status">
                          <span 
                            className="material-symbols-outlined"
                            style={{ color: isOver ? 'var(--color-danger)' : isWarning ? 'var(--color-warning)' : 'var(--color-success)' }}
                          >
                            {isOver ? 'error' : isWarning ? 'warning' : 'check_circle'}
                          </span>
                          <span style={{ color: isOver ? 'var(--color-danger)' : isWarning ? 'var(--color-warning)' : 'var(--color-success)' }}>
                            {isOver ? 'Dépassé' : isWarning ? 'Attention' : 'OK'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="budgets-card-actions">
                      <button onClick={() => handleEditBudget(category as ExpenseCategory)} className="budgets-action-btn">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button onClick={() => handleDeleteBudget(category as ExpenseCategory)} className="budgets-action-btn danger">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="budgets-progress">
                    <div className="progress">
                      <div
                        className={`progress-bar ${isOver ? 'progress-bar-danger' : isWarning ? 'progress-bar-warning' : ''}`}
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: !isOver && !isWarning ? meta?.color : undefined
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="budgets-card-stats">
                    <span className="text-muted">{formatAmount(spent)} / {formatAmount(budget)} FCFA</span>
                    <span className={`font-extrabold ${isOver ? 'text-danger' : isWarning ? 'text-warning' : ''}`}>
                      {percentage}%
                    </span>
                  </div>

                  {!isOver && (
                    <p className="budgets-card-remaining text-success">
                      Reste : {formatAmount(budget - spent)} FCFA
                    </p>
                  )}
                  {isOver && (
                    <p className="budgets-card-remaining text-danger">
                      Dépassement : +{formatAmount(spent - budget)} FCFA
                    </p>
                  )}
                </div>
              )
            })}
          </section>
        ) : (
          <div className="budgets-empty card animate-fade-in-up">
            <div className="budgets-empty-icon">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <p className="budgets-empty-title">Aucun budget défini</p>
            <p className="budgets-empty-text">Créez votre premier budget pour mieux contrôler vos dépenses</p>
            <button onClick={handleAddBudget} className="btn btn-primary">
              Créer un budget
            </button>
          </div>
        )}

        {/* Tips */}
        <section className="budgets-tips card animate-fade-in-up">
          <div className="budgets-tips-header">
            <span className="material-symbols-outlined">tips_and_updates</span>
            <h3>Conseils budgétaires</h3>
          </div>
          <ul className="budgets-tips-list">
            <li>
              <span className="text-accent">•</span>
              Commencez par définir un budget pour vos plus grosses dépenses
            </li>
            <li>
              <span className="text-accent">•</span>
              Les alertes vous préviendront à 80% pour anticiper les dépassements
            </li>
            <li>
              <span className="text-accent">•</span>
              Révisez vos budgets chaque mois pour les ajuster à vos besoins réels
            </li>
          </ul>
        </section>
      </div>

      {/* Budget Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-title">{editingCategory ? 'Modifier le budget' : 'Nouveau budget'}</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-icon">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-body">
              {!editingCategory && (
                <div className="budgets-modal-categories">
                  <label className="form-label">Choisir une catégorie</label>
                  <div className="budgets-category-grid">
                    {categoriesWithoutBudgets.map((cat) => {
                      const meta = categoryMeta[cat as ExpenseCategory]
                      return (
                        <button
                          key={cat}
                          onClick={() => setEditingCategory(cat as ExpenseCategory)}
                          className="budgets-category-btn"
                        >
                          <span>{meta?.icon}</span>
                          <span>{meta?.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {editingCategory && (
                <>
                  <div className="budgets-modal-selected">
                    <span className="budgets-modal-emoji">{categoryMeta[editingCategory]?.icon}</span>
                    <span className="budgets-modal-name">{categoryMeta[editingCategory]?.label}</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Montant du budget (FCFA)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newBudgetAmount}
                      onChange={(e) => setNewBudgetAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Ex: 50000"
                      className="form-input"
                      autoFocus
                    />
                    {newBudgetAmount && (
                      <p className="budgets-modal-preview">
                        = {formatAmount(parseInt(newBudgetAmount) || 0)} FCFA par mois
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Annuler
              </button>
              <button
                onClick={handleSaveBudget}
                disabled={!editingCategory || !newBudgetAmount}
                className="btn btn-primary"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BudgetsPage
