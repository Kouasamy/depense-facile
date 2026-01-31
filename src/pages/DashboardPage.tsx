import { useState, useEffect } from 'react'
import { useExpenseStore } from '../stores/expenseStore'
import { useBudgetStore } from '../stores/budgetStore'
import { useAuthStore } from '../stores/authStore'
import { categoryMeta, type ExpenseCategory } from '../db/schema'
import { formatAmount } from '../core/nlp/parser'
import { AddIncomeModal } from '../components/Dashboard/AddIncomeModal'
import './DashboardPage.css'

export function DashboardPage() {
  const { expenses, totalExpenses, totalIncomes, refreshData } = useExpenseStore()
  const { alerts, calculateAlerts } = useBudgetStore()
  const { user } = useAuthStore()
  const [showIncomeModal, setShowIncomeModal] = useState(false)

  useEffect(() => {
    refreshData()
  }, [refreshData])

  useEffect(() => {
    calculateAlerts(expenses)
  }, [expenses, calculateAlerts])

  // Calculations
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const currentDay = now.getDate()
  const daysRemaining = daysInMonth - currentDay

  const balance = totalIncomes - totalExpenses
  const savingsRate = totalIncomes > 0 ? Math.round((balance / totalIncomes) * 100) : 0
  const spentPercentage = totalIncomes > 0 ? Math.min((totalExpenses / totalIncomes) * 100, 100) : 0

  // Category breakdown
  const categoryTotals: Record<string, number> = {}
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
  })

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  // User first name
  const firstName = user?.name?.split(' ')[0] || 'Utilisateur'

  // Health status
  const getHealthStatus = () => {
    if (savingsRate >= 30) return { label: 'Excellent', color: '#10B981', icon: 'sentiment_very_satisfied' }
    if (savingsRate >= 15) return { label: 'Bon', color: '#f48c25', icon: 'sentiment_satisfied' }
    if (savingsRate >= 0) return { label: 'Attention', color: '#F59E0B', icon: 'sentiment_neutral' }
    return { label: 'Critique', color: '#EF4444', icon: 'sentiment_dissatisfied' }
  }

  const healthStatus = getHealthStatus()

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header animate-fade-in">
          <div>
            <h1 className="dashboard-title">Gestion des Budgets</h1>
            <p className="dashboard-subtitle">Contrôlez vos finances mensuelles en FCFA</p>
          </div>
          <button
            onClick={() => setShowIncomeModal(true)}
            className="btn btn-primary"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Ajouter Revenu</span>
          </button>
        </header>

        {/* Summary Stats */}
        <div className="dashboard-stats-row animate-fade-in-up">
          <div className="stat-card">
            <p className="stat-card-label">Budget Total Mensuel</p>
            <p className="stat-card-value">{formatAmount(totalIncomes)} FCFA</p>
            <div className="stat-card-badge text-success">
              <span className="material-symbols-outlined">trending_up</span>
              <span>Stable</span>
            </div>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Total Dépensé</p>
            <p className="stat-card-value">{formatAmount(totalExpenses)} FCFA</p>
            <div className="stat-card-badge text-accent">
              <span className="material-symbols-outlined">payments</span>
              <span>{Math.round(spentPercentage)}% utilisé</span>
            </div>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Reste à Vivre</p>
            <p className="stat-card-value">{formatAmount(Math.max(balance, 0))} FCFA</p>
            <div className="stat-card-badge text-danger">
              <span className="material-symbols-outlined">calendar_today</span>
              <span>{daysRemaining} jours restants</span>
            </div>
          </div>
        </div>

        {/* Health Status Card */}
        <div className="dashboard-health-card card animate-fade-in-up delay-1">
          <div className="dashboard-health-content">
            <div className="dashboard-health-info">
              <h3 className="text-subtitle">Santé Financière</h3>
              <p className="dashboard-health-message">
                {savingsRate >= 20
                  ? `Félicitations ${firstName} ! Vous économisez ${savingsRate}% ce mois-ci.`
                  : savingsRate >= 0
                    ? `Continuez vos efforts, ${firstName}. Vous êtes à ${savingsRate}% d'économies.`
                    : `Attention ${firstName}, vos dépenses dépassent vos revenus.`
                }
              </p>
            </div>
            <div className="dashboard-health-badge" style={{ backgroundColor: `${healthStatus.color}15` }}>
              <span
                className="material-symbols-outlined"
                style={{ color: healthStatus.color, fontSize: '32px' }}
              >
                {healthStatus.icon}
              </span>
              <p className="dashboard-health-status" style={{ color: healthStatus.color }}>
                {healthStatus.label}
              </p>
            </div>
          </div>
          <div className="dashboard-progress-section">
            <div className="dashboard-progress-header">
              <span>Budget utilisé</span>
              <span>{Math.round(spentPercentage)}%</span>
            </div>
            <div className="progress">
              <div
                className={`progress-bar ${spentPercentage > 80 ? 'progress-bar-danger' : spentPercentage > 50 ? 'progress-bar-warning' : ''}`}
                style={{ width: `${spentPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Budget Categories Grid */}
        <section className="dashboard-section animate-fade-in-up delay-2">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Catégories de dépenses</h2>
            <span className="text-small text-muted">
              {now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="dashboard-budget-grid">
            {topCategories.map(([category, amount]) => {
              const meta = categoryMeta[category as ExpenseCategory]
              const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
              const isWarning = percentage > 80

              return (
                <div key={category} className="budget-card card">
                  <div className="budget-card-header">
                    <div className="budget-card-category">
                      <div
                        className="budget-card-icon"
                        style={{ backgroundColor: `${meta?.color}20`, color: meta?.color }}
                      >
                        {meta?.icon}
                      </div>
                      <div>
                        <h3 className="budget-card-name">{meta?.label}</h3>
                        <p className="budget-card-detail">Dépenses du mois</p>
                      </div>
                    </div>
                    <button className="budget-card-menu">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                  <div className="budget-card-stats">
                    <span className="budget-card-amount">
                      {formatAmount(amount)} FCFA
                    </span>
                    <span
                      className="budget-card-percentage"
                      style={{ color: isWarning ? 'var(--color-danger)' : meta?.color }}
                    >
                      {percentage}%
                    </span>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: isWarning ? 'var(--color-danger)' : meta?.color
                      }}
                    ></div>
                  </div>
                  <div className="budget-card-footer">
                    <span>Reste: {formatAmount(Math.max(0, totalIncomes * 0.2 - amount))} FCFA</span>
                    <span className={isWarning ? 'text-danger' : ''}>
                      {isWarning ? 'Attention!' : 'Bon état'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {topCategories.length === 0 && (
            <div className="dashboard-empty card">
              <div className="empty-state-icon">
                <span className="material-symbols-outlined">pie_chart</span>
              </div>
              <p className="font-bold">Aucune dépense enregistrée</p>
              <p className="text-small text-muted">Commencez par ajouter vos premières dépenses</p>
            </div>
          )}
        </section>

        {/* Budget Alerts */}
        {alerts.length > 0 && (
          <section className="dashboard-section animate-fade-in-up delay-3">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">
                <span className="material-symbols-outlined text-warning" style={{ marginRight: '8px' }}>warning</span>
                Alertes Budget
              </h2>
              <span className="badge badge-warning">{alerts.length}</span>
            </div>

            <div className="dashboard-alerts-list">
              {alerts.slice(0, 3).map((alert) => {
                const meta = categoryMeta[alert.category]
                const isOver = alert.status === 'over'

                return (
                  <div
                    key={alert.category}
                    className={`alert-card card ${isOver ? 'alert-card-danger' : 'alert-card-warning'}`}
                  >
                    <div className="alert-card-header">
                      <div className="alert-card-category">
                        <span className="alert-card-emoji">{meta?.icon}</span>
                        <span className="font-bold">{meta?.label}</span>
                      </div>
                      <span className={`font-extrabold ${isOver ? 'text-danger' : 'text-warning'}`}>
                        {alert.percentage}%
                      </span>
                    </div>
                    <div className="progress">
                      <div
                        className={`progress-bar ${isOver ? 'progress-bar-danger' : 'progress-bar-warning'}`}
                        style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-small text-muted">
                      {formatAmount(alert.spent)} / {formatAmount(alert.budget)} FCFA
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* Income Modal */}
      {showIncomeModal && (
        <AddIncomeModal onClose={() => setShowIncomeModal(false)} />
      )}
    </div>
  )
}

export default DashboardPage
