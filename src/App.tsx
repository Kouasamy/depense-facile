import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navigation } from './components/common/Navigation'
import { useExpenseStore } from './stores/expenseStore'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import { useNotificationStore } from './stores/notificationStore'
import './index.css'

// Lazy load pages for better performance (especially on mobile)
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })))
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })))
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(m => ({ default: m.HistoryPage })))
const BudgetsPage = lazy(() => import('./pages/BudgetsPage').then(m => ({ default: m.BudgetsPage })))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })))
const AdvisorPage = lazy(() => import('./pages/AdvisorPage').then(m => ({ default: m.AdvisorPage })))
const ChatBotPage = lazy(() => import('./pages/ChatBotPage').then(m => ({ default: m.ChatBotPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })))
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })))

// Loading component optimisé pour mobile
const PageLoader = () => (
  <div className="loading-screen">
    <div className="loading-content animate-fade-in">
      <span className="material-symbols-outlined spinning" style={{ fontSize: '32px', color: 'var(--color-primary)' }}>
        progress_activity
      </span>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Chargement...</p>
    </div>
  </div>
)

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/terms" element={<TermsPage onBack={() => window.history.back()} />} />
          <Route path="/privacy" element={<PrivacyPage onBack={() => window.history.back()} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
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
    return (
      <Suspense fallback={<PageLoader />}>
        <OnboardingPage />
      </Suspense>
    )
  }

  // Main app with navigation
  return (
    <>
      <Navigation />
      <main className="app-main">
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
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
