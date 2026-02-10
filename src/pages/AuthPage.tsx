import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import './AuthPage.css'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, register } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Si on arrive avec ?mode=register depuis la landing, ouvrir directement l'onglet inscription
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const mode = params.get('mode')
    if (mode === 'register') {
      setIsLogin(false)
    }
  }, [location.search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      let success = false
      if (isLogin) {
        success = await login(email, password)
        if (!success) {
          setError('Email ou mot de passe incorrect')
        }
      } else {
        if (password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères')
          setIsLoading(false)
          return
        }
        success = await register(email, password, name)
        if (!success) {
          setError('Cet email est déjà utilisé')
        }
      }
      if (success) {
        navigate('/')
      }
    } catch {
      setError('Une erreur est survenue')
    }
    setIsLoading(false)
  }

  return (
    <div className="auth-page">
      {/* Background decorations */}
      <div className="auth-bg-blob auth-bg-blob-1"></div>
      <div className="auth-bg-blob auth-bg-blob-2"></div>
      
      <div className="auth-container">
        {/* Header */}
        <header className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="auth-logo-text">GèreTonDjai</span>
          </div>
        </header>

        {/* Main Card */}
        <main className="auth-card animate-scale-in">
          {/* Illustration */}
          <div className="auth-illustration">
            <svg viewBox="0 0 400 200" className="auth-illustration-svg">
              <defs>
                <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#87CEEB', stopOpacity:0.3}} />
                  <stop offset="100%" style={{stopColor:'#f48c25', stopOpacity:0.2}} />
                </linearGradient>
              </defs>
              <rect width="400" height="200" fill="url(#skyGrad)"/>
              <rect x="20" y="80" width="60" height="120" fill="#D2691E" opacity="0.8" rx="5"/>
              <rect x="90" y="100" width="50" height="100" fill="#CD853F" opacity="0.9" rx="5"/>
              <rect x="150" y="70" width="70" height="130" fill="#DEB887" opacity="0.85" rx="5"/>
              <rect x="230" y="90" width="55" height="110" fill="#F4A460" opacity="0.8" rx="5"/>
              <rect x="295" y="110" width="65" height="90" fill="#D2B48C" opacity="0.9" rx="5"/>
              <rect x="370" y="130" width="8" height="70" fill="#8B4513"/>
              <ellipse cx="374" cy="125" rx="25" ry="15" fill="#228B22" opacity="0.8"/>
            </svg>
            <div className="auth-illustration-overlay"></div>
            <div className="auth-illustration-badge">
              <span className="material-symbols-outlined">storefront</span>
              <span>Abidjan, Côte d'Ivoire</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="auth-form-content">
            <div className="auth-form-header">
              <h1 className="auth-title">
                {isLogin ? 'Bon retour !' : 'Créer un compte'}
              </h1>
              <p className="auth-subtitle">
                {isLogin
                  ? 'Connectez-vous pour gérer vos finances'
                  : 'Rejoignez-nous pour mieux gérer votre argent'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="form-group animate-fade-in-up">
                  <label className="form-label">Nom complet</label>
                  <div className="form-input-wrapper">
                    <span className="material-symbols-outlined form-input-icon">person</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jean Kouassi"
                      className="form-input form-input-with-icon"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="form-group animate-fade-in-up delay-1">
                <label className="form-label">Email</label>
                <div className="form-input-wrapper">
                  <span className="material-symbols-outlined form-input-icon">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="form-input form-input-with-icon"
                    required
                  />
                </div>
              </div>

              <div className="form-group animate-fade-in-up delay-2">
                <label className="form-label">Mot de passe</label>
                <div className="form-input-wrapper">
                  <span className="material-symbols-outlined form-input-icon">lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input form-input-with-icon"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="auth-error animate-scale-in">
                  <span className="material-symbols-outlined">error</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg auth-submit-btn animate-fade-in-up delay-3"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined spinning">progress_activity</span>
                    <span>Chargement...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Se connecter' : "S'inscrire"}</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch">
              <span className="auth-switch-text">
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
              </span>
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="auth-switch-btn"
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="auth-footer">
          <p>© 2024 GèreTonDjai - Fièrement conçu pour la Côte d'Ivoire</p>
          <p className="auth-footer-credit">by Sam_k</p>
        </footer>
      </div>
    </div>
  )
}

export default AuthPage
