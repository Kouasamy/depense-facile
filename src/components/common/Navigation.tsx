import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import './Navigation.css'

interface NavItem {
  path: string
  icon: string
  label: string
}

const navItems: NavItem[] = [
  { path: '/', icon: 'home', label: 'Accueil' },
  { path: '/dashboard', icon: 'monitoring', label: 'Dashboard' },
  { path: '/history', icon: 'receipt_long', label: 'Historique' },
  { path: '/budgets', icon: 'account_balance', label: 'Budgets' },
  { path: '/analytics', icon: 'query_stats', label: 'Statistiques' },
  { path: '/advisor', icon: 'psychology', label: 'Conseiller' },
  { path: '/chatbot', icon: 'smart_toy', label: 'Assistant' },
]

export function Navigation() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  if (!isAuthenticated) return null

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="nav-sidebar">
        <div className="nav-sidebar-logo">
          <img
            src="/logo-gtd.png"
            alt="Logo GèreTonDjai"
            className="nav-logo-image"
          />
        </div>

        <nav className="nav-sidebar-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-sidebar-item ${isActive ? 'active' : ''}`
              }
              title={item.label}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
            </NavLink>
          ))}
        </nav>

        <div className="nav-sidebar-footer">
          <button
            onClick={toggleTheme}
            className="nav-sidebar-item"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-sidebar-item ${isActive ? 'active' : ''}`
            }
            title="Paramètres"
          >
            <span className="material-symbols-outlined">settings</span>
          </NavLink>
          {user && (
            <div className="nav-sidebar-avatar" title={user.name}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="nav-mobile-header">
        <div className="nav-mobile-logo">
          <div className="nav-mobile-logo-icon">
            <img
              src="/logo-gtd.png"
              alt="Logo GèreTonDjai"
              className="nav-logo-image"
            />
          </div>
          <span className="nav-mobile-logo-text">GèreTonDjai</span>
        </div>
        <div className="nav-mobile-actions">
          <button onClick={toggleTheme} className="nav-mobile-btn">
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button onClick={handleLogout} className="nav-mobile-btn">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="nav-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-bottom-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="nav-bottom-label">{item.label}</span>
          </NavLink>
        ))}
        
        {/* Paramètres */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-bottom-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="nav-bottom-label">Paramètres</span>
        </NavLink>
      </nav>
    </>
  )
}

export default Navigation
