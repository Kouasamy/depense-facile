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
  ChatBotPage,
  LandingPage
} from './pages'
import { useExpenseStore } from './stores/expenseStore'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import { useNotificationStore } from './stores/notificationStore'
import './index.css'

function AppContent() {
  const { isAuthenticated, checkAuth } = useAuthStore()
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

  // Not authenticated - Show landing or auth page
  // Always show landing page first at root path, auth page only when explicitly navigating to /auth
  // This ensures landing page is shown first, not auth page
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/terms" element={<TermsPage onBack={() => window.history.back()} />} />
        <Route path="/privacy" element={<PrivacyPage onBack={() => window.history.back()} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
