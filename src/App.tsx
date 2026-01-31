import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navigation } from './components/common/Navigation'
import { 
  HomePage, 
  DashboardPage, 
  HistoryPage, 
  OnboardingPage, 
  SettingsPage, 
  BudgetsPage, 
  AnalyticsPage, 
  AuthPage, 
  TermsPage, 
  PrivacyPage, 
  AdvisorPage, 
  ChatBotPage 
} from './pages'
import { useExpenseStore } from './stores/expenseStore'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import { useNotificationStore } from './stores/notificationStore'
import './index.css'

function AppContent() {
  const { isAuthenticated, isLoading: isAuthLoading, checkAuth } = useAuthStore()
  const { initializeStore, hasCompletedOnboarding, isLoadingOnboarding } = useExpenseStore()
  const { theme, initTheme } = useThemeStore()
  const { initNotifications } = useNotificationStore()

  // Initialize auth on mount
  useEffect(() => {
    const init = async () => {
      await checkAuth()
      initTheme()
    }
    init()
  }, [checkAuth, initTheme])

  // Initialize store and notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeStore()
      initNotifications()
    }
  }, [isAuthenticated, initializeStore, initNotifications])

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(systemDark ? 'dark' : 'light')
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  // Loading state - Auth check
  if (isAuthLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content animate-fade-in">
          <div className="loading-icon">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <div className="loading-pulse"></div>
          </div>
          <div className="loading-text">
            <h1>GèreTonDjai</h1>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated - Show auth page
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/terms" element={<TermsPage onBack={() => window.history.back()} />} />
        <Route path="/privacy" element={<PrivacyPage onBack={() => window.history.back()} />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    )
  }

  // Loading onboarding state
  if (isLoadingOnboarding) {
    return (
      <div className="loading-screen">
        <div className="loading-content animate-fade-in">
          <span className="material-symbols-outlined spinning" style={{ fontSize: '40px', color: 'var(--color-primary)' }}>
            progress_activity
          </span>
          <p style={{ color: 'var(--color-text-muted)' }}>Préparation de votre espace...</p>
        </div>
      </div>
    )
  }

  // Onboarding flow
  if (!hasCompletedOnboarding) {
    return <OnboardingPage />
  }

  // Main app with navigation
  return (
    <>
      <Navigation />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/advisor" element={<AdvisorPage />} />
          <Route path="/chatbot" element={<ChatBotPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/terms" element={<TermsPage onBack={() => window.history.back()} />} />
          <Route path="/privacy" element={<PrivacyPage onBack={() => window.history.back()} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
