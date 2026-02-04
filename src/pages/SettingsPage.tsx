import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useExpenseStore } from '../stores/expenseStore'
import { useThemeStore } from '../stores/themeStore'
import { useAuthStore } from '../stores/authStore'
import { downloadExpensesPDF, downloadIncomesPDF, downloadMonthlyReportPDF } from '../utils/export'
import { formatAmount } from '../core/nlp/parser'
import { AddIncomeModal } from '../components/Dashboard/AddIncomeModal'
import { BackButton } from '../components/common'
import './SettingsPage.css'

export function SettingsPage() {
  const navigate = useNavigate()
  const { totalIncomes, refreshData, resetStore } = useExpenseStore()
  const { theme, setTheme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [exportStatus, setExportStatus] = useState<string | null>(null)

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const handleExport = async (type: 'expenses' | 'incomes' | 'report') => {
    setExportStatus('Génération du PDF...')
    try {
      switch (type) {
        case 'expenses':
          await downloadExpensesPDF()
          break
        case 'incomes':
          await downloadIncomesPDF()
          break
        case 'report':
          await downloadMonthlyReportPDF()
          break
      }
      setExportStatus('PDF téléchargé avec succès!')
    } catch (error) {
      setExportStatus('Erreur lors de l\'export')
    }
    setTimeout(() => setExportStatus(null), 3000)
  }

  const handleReset = async () => {
    await resetStore()
    setShowResetConfirm(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <div className="settings-page">
      <BackButton />
      <div className="settings-container">
        {/* Header */}
        <header className="settings-header animate-fade-in">
          <div className="settings-header-info">
            <div className="settings-icon">
              <span className="material-symbols-outlined">settings</span>
            </div>
            <div>
              <h1 className="settings-title">Paramètres</h1>
              <p className="settings-subtitle">Gérez vos préférences</p>
            </div>
          </div>
        </header>

        {/* Profile Section */}
        <section className="settings-section card animate-fade-in-up">
          <div className="settings-section-header">
            <span className="material-symbols-outlined">person</span>
            <h2>Informations personnelles</h2>
          </div>
          <div className="settings-profile">
            <div className="settings-profile-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="settings-profile-info">
              <p className="settings-profile-name">{user?.name || 'Utilisateur'}</p>
              <p className="settings-profile-email">{user?.email}</p>
              <div className="settings-profile-badges">
                <span className="badge badge-primary">Pro Member</span>
                <span className="badge badge-neutral">Abidjan, CI</span>
              </div>
            </div>
          </div>
          <div className="settings-income">
            <div>
              <p className="settings-income-label">Revenus mensuels</p>
              <p className="settings-income-value">{formatAmount(totalIncomes)} FCFA</p>
            </div>
            <button onClick={() => setShowIncomeModal(true)} className="btn btn-outline btn-sm">
              <span className="material-symbols-outlined">edit</span>
              Modifier
            </button>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="settings-section card animate-fade-in-up delay-1">
          <div className="settings-section-header">
            <span className="material-symbols-outlined">palette</span>
            <h2>Apparence</h2>
          </div>
          <div className="settings-options">
            <div className="settings-option">
              <div className="settings-option-info">
                <span className="material-symbols-outlined">dark_mode</span>
                <span>Thème de l'application</span>
              </div>
              <div className="settings-theme-selector">
                <button
                  onClick={() => setTheme('light')}
                  className={`settings-theme-btn ${theme === 'light' ? 'active' : ''}`}
                >
                  <span className="material-symbols-outlined">light_mode</span>
                  <span>Clair</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`settings-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                >
                  <span className="material-symbols-outlined">dark_mode</span>
                  <span>Sombre</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`settings-theme-btn ${theme === 'system' ? 'active' : ''}`}
                >
                  <span className="material-symbols-outlined">contrast</span>
                  <span>Auto</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Export Section */}
        <section className="settings-section card animate-fade-in-up delay-2">
          <div className="settings-section-header">
            <span className="material-symbols-outlined">download</span>
            <h2>Exporter les données</h2>
          </div>
          {exportStatus && (
            <div className="settings-export-status animate-fade-in">
              <span className="material-symbols-outlined">
                {exportStatus.includes('succès') ? 'check_circle' : exportStatus.includes('Erreur') ? 'error' : 'hourglass_empty'}
              </span>
              <span>{exportStatus}</span>
            </div>
          )}
          <div className="settings-export-grid">
            <button onClick={() => handleExport('expenses')} className="settings-export-btn">
              <span className="material-symbols-outlined">receipt_long</span>
              <span>Dépenses PDF</span>
            </button>
            <button onClick={() => handleExport('incomes')} className="settings-export-btn">
              <span className="material-symbols-outlined">payments</span>
              <span>Revenus PDF</span>
            </button>
            <button onClick={() => handleExport('report')} className="settings-export-btn">
              <span className="material-symbols-outlined">assessment</span>
              <span>Rapport Mensuel</span>
            </button>
          </div>
        </section>

        {/* Legal Section */}
        <section className="settings-section card animate-fade-in-up delay-3">
          <div className="settings-section-header">
            <span className="material-symbols-outlined">gavel</span>
            <h2>Légal</h2>
          </div>
          <div className="settings-legal">
            <Link to="/terms" className="settings-legal-link">
              <span className="material-symbols-outlined">description</span>
              <span>Conditions d'utilisation</span>
              <span className="material-symbols-outlined">chevron_right</span>
            </Link>
            <Link to="/privacy" className="settings-legal-link">
              <span className="material-symbols-outlined">security</span>
              <span>Politique de confidentialité</span>
              <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="settings-danger animate-fade-in-up delay-4">
          <div className="settings-danger-content">
            <div>
              <h3>Réinitialiser les données</h3>
              <p>Supprimer toutes vos dépenses et revenus locaux</p>
            </div>
            <button onClick={() => setShowResetConfirm(true)} className="btn btn-outline settings-danger-btn">
              <span className="material-symbols-outlined">delete_forever</span>
              Réinitialiser
            </button>
          </div>
        </section>

        {/* Logout Section */}
        <section className="settings-logout card animate-fade-in-up delay-5">
          <div className="settings-logout-content">
            <div>
              <h3>Déconnexion</h3>
              <p>Fermer votre session sur cet appareil</p>
            </div>
            <button onClick={() => setShowLogoutConfirm(true)} className="btn btn-primary">
              <span className="material-symbols-outlined">logout</span>
              Se déconnecter
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="settings-footer">
          <p>© 2024 GèreTonDjai - Made with ❤️ for Côte d'Ivoire</p>
          <p className="settings-footer-version">Version 1.0.0</p>
          <p className="settings-footer-credit">Crafted by Sam_k</p>
        </footer>
      </div>

      {/* Modals */}
      {showIncomeModal && (
        <AddIncomeModal onClose={() => setShowIncomeModal(false)} />
      )}

      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-title">Confirmer la réinitialisation</h2>
            </div>
            <div className="modal-body">
              <p>Cette action est irréversible. Toutes vos données seront supprimées.</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowResetConfirm(false)} className="btn btn-secondary">
                Annuler
              </button>
              <button onClick={handleReset} className="btn btn-primary" style={{ backgroundColor: 'var(--color-danger)' }}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-title">Confirmer la déconnexion</h2>
            </div>
            <div className="modal-body">
              <p>Voulez-vous vraiment vous déconnecter ?</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowLogoutConfirm(false)} className="btn btn-secondary">
                Annuler
              </button>
              <button onClick={handleLogout} className="btn btn-primary">
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
