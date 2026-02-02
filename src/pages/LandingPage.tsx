import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { SEO } from '../components/SEO'
import './LandingPage.css'

export function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' })
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  }

  const features = [
    {
      icon: '🎤',
      title: 'Saisie Vocale Intelligente',
      description: 'Enregistre tes dépenses en parlant naturellement. Le micro ultra-sensible capture même les voix douces. Comprend le Nouchi et le français ivoirien.',
      color: '#f48c25'
    },
    {
      icon: '🇨🇮',
      title: '100% Ivoirien',
      description: 'Reconnaissance du Nouchi, compréhension des expressions locales (Gbaka, Garba, Woro-woro). Conçu pour les Ivoiriens, par les Ivoiriens.',
      color: '#ff6b35'
    },
    {
      icon: '📊',
      title: 'Tableau de Bord Complet',
      description: 'Visualise tes dépenses par catégorie, suivi tes revenus, définis des budgets et analyse tes habitudes financières en temps réel.',
      color: '#4ecdc4'
    },
    {
      icon: '💳',
      title: 'Mobile Money Intégré',
      description: 'Support complet pour Orange Money, MTN Money, Moov Money et Wave. Gère tous tes moyens de paiement en un seul endroit.',
      color: '#45b7d1'
    },
    {
      icon: '🔒',
      title: 'Sécurisé & Privé',
      description: 'Tes données sont protégées dans une base de données sécurisée Supabase. Synchronisation automatique avec sauvegarde cloud.',
      color: '#96ceb4'
    },
    {
      icon: '📱',
      title: 'PWA Installable',
      description: 'Installe l\'app sur ton téléphone et utilise-la hors ligne. Fonctionne même sans internet, synchronise quand la connexion revient.',
      color: '#ffeaa7'
    },
    {
      icon: '🤖',
      title: 'Conseiller IA Woro',
      description: 'Ton coach financier personnel. Obtiens des conseils personnalisés, des plans d\'épargne adaptés et des astuces pour mieux gérer ton argent.',
      color: '#a29bfe'
    },
    {
      icon: '📈',
      title: 'Analyses Avancées',
      description: 'Graphiques détaillés, tendances mensuelles, comparaisons et rapports PDF. Comprends mieux tes habitudes de dépenses.',
      color: '#fd79a8'
    }
  ]

  const stats = [
    { number: '100%', label: 'Gratuit', icon: '💰' },
    { number: '24/7', label: 'Disponible', icon: '⏰' },
    { number: '100%', label: 'Hors ligne', icon: '📱' },
    { number: '∞', label: 'Illimité', icon: '♾️' }
  ]

  return (
    <>
      <SEO
        title="GèreTonDjai - Gère ton argent comme un boss, en Nouchi !"
        description="Application de gestion de dépenses intelligente pour les Ivoiriens. Saisie vocale ultra-sensible, reconnaissance du Nouchi, conseiller IA Woro, analyses avancées. 100% gratuit, disponible hors ligne et synchronisation cloud sécurisée."
        keywords="gestion dépenses Côte d'Ivoire, application argent ivoirienne, Nouchi, mobile money Orange Money MTN Money Wave, épargne budget, finances personnelles, PWA hors ligne, conseiller financier IA, Woro"
        type="website"
      />
      <div className="landing-page">
        {/* Animated Background */}
      <div className="landing-bg">
        <div className="landing-bg-blob landing-bg-blob-1"></div>
        <div className="landing-bg-blob landing-bg-blob-2"></div>
        <div className="landing-bg-blob landing-bg-blob-3"></div>
      </div>

      {/* Cursor Follower */}
      <motion.div
        className="landing-cursor"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y
        }}
        transition={{
          type: 'spring',
          stiffness: 50,
          damping: 15
        }}
      />

      {/* Navigation */}
      <motion.nav
        className="landing-nav"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="landing-nav-container">
          <div className="landing-logo">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span className="landing-logo-text">GèreTonDjai</span>
          </div>
          <div className="landing-nav-links">
            <Link to="/auth" className="landing-nav-link">Connexion</Link>
            <Link to="/auth" className="landing-btn landing-btn-primary">
              Commencer
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="landing-hero"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <motion.div
          className="landing-hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="landing-hero-badge"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <span>✨ Nouveau</span>
            <span>Conseiller IA Woro disponible</span>
          </motion.div>

          <motion.h1
            className="landing-hero-title"
            variants={itemVariants}
          >
            Gère ton{' '}
            <span className="landing-title-highlight">
              <motion.span
                animate={{
                  backgroundPosition: ['0%', '100%', '0%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  background: 'linear-gradient(90deg, #f48c25, #ff6b35, #f48c25)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                argent
              </motion.span>
            </span>
            <br />
            comme un <span className="landing-title-accent">boss</span>
          </motion.h1>

          <motion.p
            className="landing-hero-subtitle"
            variants={itemVariants}
          >
            L'application de gestion de dépenses intelligente pour les Ivoiriens.
            <br />
            Parle, enregistre, analyse. C'est tout simple.
          </motion.p>

          <motion.div
            className="landing-hero-cta"
            variants={itemVariants}
          >
            <Link
              to="/auth"
              className="landing-btn landing-btn-hero"
            >
              <span>Commencer gratuitement</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <motion.button
              className="landing-btn landing-btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <span>En savoir plus</span>
              <span className="material-symbols-outlined">expand_more</span>
            </motion.button>
          </motion.div>

          {/* Stats Preview */}
          <motion.div
            className="landing-hero-stats"
            variants={itemVariants}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="landing-stat-preview"
                whileHover={{ y: -5, scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <span className="landing-stat-icon">{stat.icon}</span>
                <div>
                  <div className="landing-stat-number">{stat.number}</div>
                  <div className="landing-stat-label">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          className="landing-hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="landing-phone-mockup">
            <div className="landing-phone-screen">
              <div className="landing-mockup-content">
                <div className="landing-mockup-header">
                  <div className="landing-mockup-avatar"></div>
                  <div>
                    <div className="landing-mockup-line short"></div>
                    <div className="landing-mockup-line"></div>
                  </div>
                </div>
                <div className="landing-mockup-stats">
                  <div className="landing-mockup-stat">
                    <div className="landing-mockup-line short"></div>
                    <div className="landing-mockup-amount"></div>
                  </div>
                  <div className="landing-mockup-stat">
                    <div className="landing-mockup-line short"></div>
                    <div className="landing-mockup-amount"></div>
                  </div>
                </div>
                <div className="landing-mockup-voice">
                  <div className="landing-mockup-mic"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="landing-features" ref={featuresRef}>
        <div className="landing-container">
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="landing-section-title">
              Tout ce dont tu as besoin pour{' '}
              <span className="landing-title-highlight">gérer ton argent</span>
            </h2>
            <p className="landing-section-subtitle">
              Une application complète, intuitive et 100% ivoirienne
            </p>
          </motion.div>

          <motion.div
            className="landing-features-grid"
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="landing-feature-card"
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                style={{
                  '--feature-color': feature.color
                } as React.CSSProperties}
              >
                <div className="landing-feature-icon">{feature.icon}</div>
                <h3 className="landing-feature-title">{feature.title}</h3>
                <p className="landing-feature-description">{feature.description}</p>
                <div className="landing-feature-glow"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how-it-works">
        <div className="landing-container">
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="landing-section-title">
              Comment ça <span className="landing-title-highlight">fonctionne</span> ?
            </h2>
            <p className="landing-section-subtitle">
              En 3 étapes simples, tu maîtrises tes finances
            </p>
          </motion.div>

          <div className="landing-steps">
            {[
              {
                step: '01',
                title: 'Parle ta dépense',
                description: 'Appuie sur le micro et dis simplement "Gbaka 500" ou "Garba 1500". Le micro ultra-sensible capture même les voix douces.',
                icon: '🎤'
              },
              {
                step: '02',
                title: 'Confirme et enregistre',
                description: 'Vérifie les détails détectés automatiquement (catégorie, montant, moyen de paiement) et confirme d\'un clic.',
                icon: '✅'
              },
              {
                step: '03',
                title: 'Analyse et optimise',
                description: 'Consulte tes statistiques, définis des budgets, reçois des conseils de Woro ton conseiller IA et atteins tes objectifs.',
                icon: '📊'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="landing-step-card"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="landing-step-number">{step.step}</div>
                <div className="landing-step-icon">{step.icon}</div>
                <h3 className="landing-step-title">{step.title}</h3>
                <p className="landing-step-description">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats-section" ref={statsRef}>
        <div className="landing-container">
          <motion.div
            className="landing-stats-grid"
            variants={containerVariants}
            initial="hidden"
            animate={statsInView ? 'visible' : 'hidden'}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="landing-stat-card"
                variants={itemVariants}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="landing-stat-icon-large">{stat.icon}</div>
                <motion.div
                  className="landing-stat-number-large"
                  initial={{ scale: 0 }}
                  animate={statsInView ? { scale: 1 } : {}}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: index * 0.1
                  }}
                >
                  {stat.number}
                </motion.div>
                <div className="landing-stat-label-large">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-section">
        <div className="landing-container">
          <motion.div
            className="landing-cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="landing-cta-title">
              Prêt à mieux gérer ton <span className="landing-title-highlight">argent</span> ?
            </h2>
            <p className="landing-cta-subtitle">
              Rejoins des milliers d'Ivoiriens qui font confiance à GèreTonDjai
            </p>
            <Link
              to="/auth"
              className="landing-btn landing-btn-cta"
            >
              <span>Commencer maintenant</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-content">
            <div className="landing-footer-brand">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              <span>GèreTonDjai</span>
            </div>
            <p className="landing-footer-text">
              Gère ton argent comme un boss, en Nouchi ! 💰
            </p>
            <div className="landing-footer-links">
              <Link to="/terms">Conditions</Link>
              <Link to="/privacy">Confidentialité</Link>
            </div>
            <p className="landing-footer-credit">by Sam_k</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}

