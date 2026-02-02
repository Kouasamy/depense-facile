import { useState, useEffect, useMemo } from 'react'
import { useExpenseStore } from '../stores/expenseStore'
import { formatAmount } from '../core/nlp/parser'
import { categoryMeta } from '../db/schema'
import {
  generateFinancialAdvice,
  generateBudgetRecommendations,
  calculateFinancialHealth,
  generateSmartTips,
  calculateDailyLimit,
  getLifestyleTips,
  type FinancialAdvice,
  type FinancialHealth
} from '../core/ai/advisor'
import { BackButton } from '../components/common'
import './AdvisorPage.css'

export function AdvisorPage() {
  const { totalIncomes, totalExpenses, categoryTotals, refreshData } = useExpenseStore()
  const [activeTab, setActiveTab] = useState<'advice' | 'budget' | 'tips'>('advice')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const financialHealth = useMemo(() => 
    calculateFinancialHealth(totalIncomes, totalExpenses, categoryTotals),
    [totalIncomes, totalExpenses, categoryTotals]
  )

  const savingsRate = totalIncomes > 0 
    ? ((totalIncomes - totalExpenses) / totalIncomes) * 100 
    : 0

  const advice = useMemo(() => 
    generateFinancialAdvice(totalIncomes, totalExpenses, categoryTotals, savingsRate),
    [totalIncomes, totalExpenses, categoryTotals, savingsRate]
  )

  const budgetRecommendations = useMemo(() => 
    generateBudgetRecommendations(totalIncomes, categoryTotals),
    [totalIncomes, categoryTotals]
  )

  const smartTips = useMemo(() => 
    generateSmartTips(categoryTotals, totalIncomes),
    [categoryTotals, totalIncomes]
  )

  const lifestyleTips = useMemo(() => 
    getLifestyleTips(totalIncomes),
    [totalIncomes]
  )

  const dailyLimit = useMemo(() => {
    const fixedExpenses = (categoryTotals.logement || 0) + (categoryTotals.communication || 0)
    return calculateDailyLimit(totalIncomes, fixedExpenses, 20)
  }, [totalIncomes, categoryTotals])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshData()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const getAdviceIcon = (type: FinancialAdvice['type']) => {
    switch (type) {
      case 'warning': return 'warning'
      case 'success': return 'check_circle'
      case 'tip': return 'lightbulb'
      default: return 'info'
    }
  }

  const getAdviceColor = (type: FinancialAdvice['type']) => {
    switch (type) {
      case 'warning': return 'var(--color-danger)'
      case 'success': return 'var(--color-success)'
      case 'tip': return 'var(--color-warning)'
      default: return 'var(--color-info)'
    }
  }

  const getHealthColor = (status: FinancialHealth['status']) => {
    switch (status) {
      case 'excellent': return 'var(--color-primary)'
      case 'good': return '#22c55e'
      case 'average': return 'var(--color-warning)'
      case 'warning': return '#f97316'
      case 'critical': return 'var(--color-danger)'
    }
  }

  const getHealthLabel = (status: FinancialHealth['status']) => {
    switch (status) {
      case 'excellent': return 'Excellent'
      case 'good': return 'Bon'
      case 'average': return 'Moyen'
      case 'warning': return 'Attention'
      case 'critical': return 'Critique'
    }
  }

  return (
    <div className="advisor-page">
      <BackButton />
      <div className="advisor-container">
        {/* Header */}
        <header className="advisor-header animate-fade-in">
          <div className="advisor-header-info">
            <div className="advisor-icon">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <h1 className="advisor-title">Conseiller IA</h1>
              <p className="advisor-subtitle">Conseils financiers personnalisés</p>
            </div>
          </div>
          <button onClick={handleRefresh} className="btn btn-secondary btn-icon" disabled={isRefreshing}>
            <span className={`material-symbols-outlined ${isRefreshing ? 'spinning' : ''}`}>refresh</span>
          </button>
        </header>

        {/* Health Score Card */}
        <section className="advisor-health-card card animate-fade-in-up">
          <div className="advisor-health-content">
            {/* Score Circle */}
            <div className="advisor-score">
              <div className="advisor-score-circle">
                <svg className="advisor-score-svg" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="var(--color-bg-elevated)" strokeWidth="12" />
                  <circle
                    cx="64" cy="64" r="56" fill="none"
                    stroke={getHealthColor(financialHealth.status)}
                    strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${(financialHealth.score / 100) * 352} 352`}
                    className="advisor-score-progress"
                  />
                </svg>
                <div className="advisor-score-value">
                  <span className="advisor-score-number" style={{ color: getHealthColor(financialHealth.status) }}>
                    {financialHealth.score}
                  </span>
                  <span className="advisor-score-label">/ 100</span>
                </div>
              </div>
              <span className="advisor-health-badge" style={{ backgroundColor: `${getHealthColor(financialHealth.status)}20`, color: getHealthColor(financialHealth.status) }}>
                {getHealthLabel(financialHealth.status)}
              </span>
            </div>

            {/* Summary */}
            <div className="advisor-health-summary">
              <h3 className="advisor-health-title">Santé financière</h3>
              <p className="advisor-health-text">{financialHealth.summary}</p>
              
              {financialHealth.improvements.length > 0 && (
                <div className="advisor-improvements">
                  <p className="advisor-improvements-label">Points à améliorer :</p>
                  {financialHealth.improvements.map((improvement, index) => (
                    <div key={index} className="advisor-improvement-item">
                      <span className="material-symbols-outlined">arrow_forward</span>
                      <span>{improvement}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="advisor-quick-stats">
              <div className="advisor-stat-box">
                <span className="material-symbols-outlined text-success">trending_up</span>
                <p className="advisor-stat-label">Revenus</p>
                <p className="advisor-stat-value">{formatAmount(totalIncomes)}</p>
              </div>
              <div className="advisor-stat-box">
                <span className="material-symbols-outlined text-danger">trending_down</span>
                <p className="advisor-stat-label">Dépenses</p>
                <p className="advisor-stat-value">{formatAmount(totalExpenses)}</p>
              </div>
              <div className="advisor-stat-box">
                <span className="material-symbols-outlined text-accent">savings</span>
                <p className="advisor-stat-label">Épargne</p>
                <p className="advisor-stat-value">{savingsRate.toFixed(0)}%</p>
              </div>
              <div className="advisor-stat-box">
                <span className="material-symbols-outlined text-warning">target</span>
                <p className="advisor-stat-label">Limite/jour</p>
                <p className="advisor-stat-value">{formatAmount(dailyLimit.dailyLimit)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Daily Limit Card */}
        <section className="advisor-limit-card card animate-fade-in-up delay-1">
          <div className="advisor-limit-icon">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div className="advisor-limit-content">
            <h3 className="advisor-limit-title">Limite quotidienne recommandée</h3>
            <p className="advisor-limit-amount">
              {formatAmount(dailyLimit.dailyLimit)} <span>FCFA / jour</span>
            </p>
            <p className="advisor-limit-explanation">{dailyLimit.explanation}</p>
          </div>
        </section>

        {/* Tabs */}
        <div className="advisor-tabs animate-fade-in-up delay-2">
          {[
            { id: 'advice', label: 'Conseils', icon: 'auto_awesome' },
            { id: 'budget', label: 'Budgets', icon: 'account_balance_wallet' },
            { id: 'tips', label: 'Astuces', icon: 'lightbulb' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`advisor-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'advice' && (
          <div className="advisor-advice-list animate-fade-in-up">
            {advice.length === 0 ? (
              <div className="advisor-empty card">
                <div className="advisor-empty-icon">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <p className="advisor-empty-title">Tout va bien !</p>
                <p className="advisor-empty-text">Continuez à bien gérer vos finances.</p>
              </div>
            ) : (
              advice.map((item, index) => (
                <div 
                  key={item.id} 
                  className="advisor-advice-item card"
                  style={{ borderLeftColor: getAdviceColor(item.type), animationDelay: `${index * 50}ms` }}
                >
                  <div className="advisor-advice-icon" style={{ backgroundColor: `${getAdviceColor(item.type)}20` }}>
                    <span className="material-symbols-outlined" style={{ color: getAdviceColor(item.type) }}>
                      {getAdviceIcon(item.type)}
                    </span>
                  </div>
                  <div className="advisor-advice-content">
                    <h3 className="advisor-advice-title">{item.title}</h3>
                    <p className="advisor-advice-message">{item.message}</p>
                    {item.action && (
                      <div className="advisor-advice-action">
                        <span className="material-symbols-outlined">chevron_right</span>
                        <span>{item.action}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="advisor-budget-section animate-fade-in-up">
            <p className="advisor-budget-intro">
              Basé sur vos revenus de {formatAmount(totalIncomes)} FCFA/mois
            </p>
            <div className="advisor-budget-grid">
              {budgetRecommendations.map((rec, index) => {
                const meta = categoryMeta[rec.category]
                const currentSpending = categoryTotals[rec.category] || 0
                const percentUsed = rec.suggestedAmount > 0 ? (currentSpending / rec.suggestedAmount) * 100 : 0
                const isOverBudget = percentUsed > 100
                
                return (
                  <div key={rec.category} className="advisor-budget-card card" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="advisor-budget-header">
                      <span className="advisor-budget-emoji">{meta.icon}</span>
                      <div className="advisor-budget-info">
                        <h3 className="advisor-budget-name">{meta.label}</h3>
                        <span className={`badge ${rec.priority === 'essential' ? 'badge-danger' : rec.priority === 'important' ? 'badge-warning' : 'badge-primary'}`}>
                          {rec.priority === 'essential' ? 'Essentiel' : rec.priority === 'important' ? 'Important' : 'Optionnel'}
                        </span>
                      </div>
                    </div>
                    <div className="advisor-budget-stats">
                      <div className="advisor-budget-stat">
                        <span className="text-muted">Budget suggéré</span>
                        <span className="font-bold">{formatAmount(rec.suggestedAmount)} ({rec.percentage}%)</span>
                      </div>
                      <div className="advisor-budget-stat">
                        <span className="text-muted">Dépensé</span>
                        <span className={`font-bold ${isOverBudget ? 'text-danger' : ''}`}>{formatAmount(currentSpending)}</span>
                      </div>
                    </div>
                    <div className="progress">
                      <div 
                        className={`progress-bar ${isOverBudget ? 'progress-bar-danger' : ''}`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      ></div>
                    </div>
                    <p className="advisor-budget-reasoning">{rec.reasoning}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="advisor-tips-section animate-fade-in-up">
            <div className="advisor-tips-grid">
              {smartTips.map((tip, index) => (
                <div key={index} className="advisor-tip-card card" style={{ animationDelay: `${index * 50}ms` }}>
                  <p>{tip}</p>
                </div>
              ))}
            </div>

            <div className="advisor-lifestyle-tips">
              {lifestyleTips.map((tip, index) => (
                <div key={index} className="advisor-lifestyle-tip card">
                  <span className="material-symbols-outlined text-accent">favorite</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>

            {/* 50/30/20 Rule */}
            <div className="advisor-rule-card card">
              <h3 className="advisor-rule-title">
                <span className="material-symbols-outlined">psychology</span>
                La règle 50/30/20
              </h3>
              <div className="advisor-rule-items">
                <div className="advisor-rule-item">
                  <span className="advisor-rule-percent primary">50%</span>
                  <div>
                    <p className="advisor-rule-label">Besoins essentiels</p>
                    <p className="advisor-rule-desc">Logement, nourriture, transport</p>
                  </div>
                </div>
                <div className="advisor-rule-item">
                  <span className="advisor-rule-percent warning">30%</span>
                  <div>
                    <p className="advisor-rule-label">Envies</p>
                    <p className="advisor-rule-desc">Divertissement, sorties</p>
                  </div>
                </div>
                <div className="advisor-rule-item">
                  <span className="advisor-rule-percent success">20%</span>
                  <div>
                    <p className="advisor-rule-label">Épargne</p>
                    <p className="advisor-rule-desc">Fonds d'urgence, investissements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvisorPage
