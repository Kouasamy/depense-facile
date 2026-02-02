import { useState, useEffect, useMemo } from 'react'
import { useExpenseStore } from '../stores/expenseStore'
import { categoryMeta, type ExpenseCategory } from '../db/schema'
import { formatAmount } from '../core/nlp/parser'
import { BackButton, AnimatedIcon } from '../components/common'
import './AnalyticsPage.css'

type Period = '3m' | '6m' | '12m'

export function AnalyticsPage() {
  const { expenses, incomes, refreshData } = useExpenseStore()
  const [period, setPeriod] = useState<Period>('6m')

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const periodMonths = period === '3m' ? 3 : period === '6m' ? 6 : 12
  const now = new Date()

  const monthlyData = useMemo(() => {
    const data: { month: string; expenses: number; incomes: number; shortLabel: string }[] = []

    for (let i = periodMonths - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const monthExpenses = expenses
        .filter(e => {
          const d = new Date(e.date)
          return d >= monthDate && d <= monthEnd
        })
        .reduce((sum, e) => sum + e.amount, 0)

      const monthIncomes = incomes
        .filter(inc => {
          const d = new Date(inc.date)
          return d >= monthDate && d <= monthEnd
        })
        .reduce((sum, inc) => sum + inc.amount, 0)

      data.push({
        month: monthDate.toLocaleDateString('fr-FR', { month: 'long' }),
        shortLabel: monthDate.toLocaleDateString('fr-FR', { month: 'short' }).substring(0, 3),
        expenses: monthExpenses,
        incomes: monthIncomes
      })
    }

    return data
  }, [expenses, incomes, periodMonths])

  const totalPeriodExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0)
  const totalPeriodIncomes = monthlyData.reduce((sum, m) => sum + m.incomes, 0)
  const avgMonthlyExpenses = Math.round(totalPeriodExpenses / periodMonths)
  const totalSavings = totalPeriodIncomes - totalPeriodExpenses

  const categoryDistribution = useMemo(() => {
    const distribution: Record<string, number> = {}
    expenses.forEach(exp => {
      distribution[exp.category] = (distribution[exp.category] || 0) + exp.amount
    })

    const total = Object.values(distribution).reduce((sum, v) => sum + v, 0)
    
    return Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category: category as ExpenseCategory,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        meta: categoryMeta[category as ExpenseCategory]
      }))
  }, [expenses])

  const maxValue = Math.max(...monthlyData.map(m => Math.max(m.expenses, m.incomes)), 1)

  return (
    <div className="analytics-page">
      <BackButton />
      <div className="analytics-container">
        {/* Header */}
        <header className="analytics-header animate-fade-in">
          <div className="analytics-header-info">
            <div className="analytics-icon">
              <span className="material-symbols-outlined">insights</span>
            </div>
            <div>
              <h1 className="analytics-title">Analyses</h1>
              <p className="analytics-subtitle">Évolution de vos finances</p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="analytics-period-selector">
            {(['3m', '6m', '12m'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`analytics-period-btn ${period === p ? 'active' : ''}`}
              >
                {p === '3m' ? '3M' : p === '6m' ? '6M' : '12M'}
              </button>
            ))}
          </div>
        </header>

        {/* Stats Cards */}
        <section className="analytics-stats-grid animate-fade-in-up">
          <div className="analytics-stat-card">
            <div className="analytics-stat-icon danger">
              <span className="material-symbols-outlined">trending_down</span>
            </div>
            <div className="analytics-stat-content">
              <p className="analytics-stat-label">Dépenses</p>
              <p className="analytics-stat-value text-danger">{formatAmount(totalPeriodExpenses)}</p>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon success">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div className="analytics-stat-content">
              <p className="analytics-stat-label">Revenus</p>
              <p className="analytics-stat-value text-success">{formatAmount(totalPeriodIncomes)}</p>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon warning">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <div className="analytics-stat-content">
              <p className="analytics-stat-label">Moy./mois</p>
              <p className="analytics-stat-value">{formatAmount(avgMonthlyExpenses)}</p>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon primary">
              <span className="material-symbols-outlined">savings</span>
            </div>
            <div className="analytics-stat-content">
              <p className="analytics-stat-label">Épargne</p>
              <p className={`analytics-stat-value ${totalSavings >= 0 ? 'text-success' : 'text-danger'}`}>
                {totalSavings >= 0 ? '+' : ''}{formatAmount(totalSavings)}
              </p>
            </div>
          </div>
        </section>

        <div className="analytics-charts-grid">
          {/* Monthly Evolution Chart */}
          <section className="analytics-chart-card card animate-fade-in-up delay-1">
            <div className="analytics-chart-header">
              <h3 className="analytics-chart-title">
                <span className="material-symbols-outlined">bar_chart</span>
                Évolution mensuelle
              </h3>
              <div className="analytics-chart-legend">
                <div className="analytics-legend-item">
                  <div className="analytics-legend-dot danger"></div>
                  <span>Dépenses</span>
                </div>
                <div className="analytics-legend-item">
                  <div className="analytics-legend-dot success"></div>
                  <span>Revenus</span>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="analytics-bar-chart">
              {monthlyData.map((month, index) => (
                <div key={month.month} className="analytics-bar-group" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="analytics-bars">
                    <div
                      className="analytics-bar danger"
                      style={{ height: `${(month.expenses / maxValue) * 100}%` }}
                      title={`${month.month}: ${formatAmount(month.expenses)} FCFA`}
                    ></div>
                    <div
                      className="analytics-bar success"
                      style={{ height: `${(month.incomes / maxValue) * 100}%` }}
                      title={`${month.month}: ${formatAmount(month.incomes)} FCFA`}
                    ></div>
                  </div>
                  <span className="analytics-bar-label">{month.shortLabel}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Category Distribution */}
          <section className="analytics-chart-card card animate-fade-in-up delay-2">
            <h3 className="analytics-chart-title">
              <span className="material-symbols-outlined text-warning">donut_large</span>
              Répartition par catégorie
            </h3>

            {categoryDistribution.length > 0 ? (
              <div className="analytics-categories">
                {categoryDistribution.slice(0, 6).map(({ category, amount, percentage, meta }, index) => (
                  <div key={category} className="analytics-category-item" style={{ animationDelay: `${(index + 2) * 50}ms` }}>
                    <div className="analytics-category-header">
                      <div className="analytics-category-info">
                        <AnimatedIcon emoji={meta?.icon} size={24} animation="scale" />
                        <span className="analytics-category-name">{meta?.label}</span>
                      </div>
                      <div className="analytics-category-stats">
                        <span className="analytics-category-amount">{formatAmount(amount)}</span>
                        <span className="badge badge-neutral">{percentage}%</span>
                      </div>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: meta?.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="analytics-empty">
                <span className="material-symbols-outlined">donut_large</span>
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </section>

          {/* Savings Analysis */}
          <section className="analytics-savings-card card animate-fade-in-up delay-3">
            <h3 className="analytics-chart-title">
              <span className="material-symbols-outlined text-accent">trending_up</span>
              Analyse de l'épargne
            </h3>

            <div className="analytics-savings-grid">
              {monthlyData.slice(-3).reverse().map((month, index) => {
                const savings = month.incomes - month.expenses
                const savingsRate = month.incomes > 0 ? Math.round((savings / month.incomes) * 100) : 0
                const isPositive = savings >= 0

                return (
                  <div 
                    key={month.month} 
                    className={`analytics-savings-item ${isPositive ? 'positive' : 'negative'}`}
                    style={{ animationDelay: `${(index + 3) * 50}ms` }}
                  >
                    <p className="analytics-savings-month">{month.month}</p>
                    <p className={`analytics-savings-amount ${isPositive ? 'text-success' : 'text-danger'}`}>
                      {isPositive ? '+' : ''}{formatAmount(savings)}
                    </p>
                    <p className="analytics-savings-rate">
                      Taux d'épargne : <span className="font-bold">{savingsRate}%</span>
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
