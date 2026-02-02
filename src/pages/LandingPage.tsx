import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { SEO } from '../components/SEO'
import { AnimatedIcon } from '../components/common/AnimatedIcon'
import './LandingPage.css'

export function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  
  // Detect mobile and reduce animations for better performance
  const [reduceMotion, setReduceMotion] = React.useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setReduceMotion(mobile || prefersReducedMotion)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const { scrollYProgress } = useScroll()
  // Disable parallax on mobile for better performance
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', reduceMotion ? '0%' : '50%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, reduceMotion ? 1 : 0])
  
  const featuresInView = useInView(featuresRef, { once: true, margin: reduceMotion ? '0px' : '-100px' })
  const statsInView = useInView(statsRef, { once: true, margin: reduceMotion ? '0px' : '-100px' })

  // Redirect if already authenticated (but only after auth check is complete)
  // Add a small delay to ensure auth check is complete
  useEffect(() => {
    if (isAuthenticated) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        navigate('/dashboard')
      }, 100)
      return () => clearTimeout(timer)
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
    { number: '100%', label: 'Gratuit', icon: 'FCFA', iconType: 'text' },
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
            La plateforme qui t'aide à maîtriser tes dépenses par des conseils personnalisés.
            <br />
            Épargne plus, dépense mieux. C'est ton coach financier ivoirien.
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
                {stat.iconType === 'text' ? (
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>FCFA</span>
                ) : (
                  <AnimatedIcon emoji={stat.icon} size={32} animation="float" delay={index * 0.1} />
                )}
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
              Maîtrise tes dépenses et{' '}
              <span className="landing-title-highlight">épargne plus</span>
            </h2>
            <p className="landing-section-subtitle">
              Des conseils personnalisés pour t'aider à mieux gérer ton argent et atteindre tes objectifs d'épargne
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
                <div className="landing-feature-icon">
                  <AnimatedIcon emoji={feature.icon} size={48} color={feature.color} animation="pulse" delay={index * 0.1} />
                </div>
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
                <div className="landing-step-icon">
                  <AnimatedIcon emoji={step.icon} size={48} animation="bounce" delay={index * 0.2} />
                </div>
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
                <div className="landing-stat-icon-large">
                  {stat.iconType === 'text' ? (
                    <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--color-primary)' }}>FCFA</span>
                  ) : (
                    <AnimatedIcon emoji={stat.icon} size={64} animation="float" delay={index * 0.1} />
                  )}
                </div>
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

      {/* Benefits Section */}
      <section className="landing-benefits">
        <div className="landing-container">
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="landing-section-title">
              Pourquoi choisir <span className="landing-title-highlight">GèreTonDjai</span> ?
            </h2>
            <p className="landing-section-subtitle">
              Une plateforme conçue pour t'aider à maîtriser tes dépenses et épargner grâce à des conseils personnalisés
            </p>
          </motion.div>

          <div className="landing-benefits-grid">
            {[
              {
                icon: '🇨🇮',
                title: '100% Ivoirien',
                description: 'Conçu spécialement pour les Ivoiriens. Comprend le Nouchi, les expressions locales, et les habitudes de consommation ivoiriennes.',
                details: ['Reconnaissance du Nouchi', 'Expressions locales (Gbaka, Garba, Woro-woro)', 'Adapté aux réalités ivoiriennes']
              },
              {
                icon: '🎤',
                title: 'Saisie Vocale Ultra-Sensible',
                description: 'Le micro le plus sensible du marché. Capture même les voix douces et comprend le français ivoirien avec accent.',
                details: ['Micro ultra-sensible', 'Comprend les voix douces', 'Reconnaissance du français ivoirien']
              },
              {
                icon: '💳',
                title: 'Tous les Mobile Money',
                description: 'Support complet pour Orange Money, MTN Money, Moov Money et Wave. Gère tous tes moyens de paiement en un seul endroit.',
                details: ['Orange Money', 'MTN Money', 'Moov Money', 'Wave']
              },
              {
                icon: '🤖',
                title: 'Conseiller IA Woro',
                description: 'Ton coach financier personnel 24/7. Obtiens des conseils personnalisés, des plans d\'épargne et des astuces adaptées à ta situation.',
                details: ['Conseils personnalisés', 'Plans d\'épargne adaptés', 'Astuces quotidiennes']
              },
              {
                icon: 'FCFA',
                iconType: 'text',
                title: 'Conseils pour Épargner',
                description: 'Reçois des conseils personnalisés basés sur tes habitudes de dépenses. Apprends à réduire tes dépenses inutiles et à épargner efficacement.',
                details: ['Conseils personnalisés', 'Plans d\'épargne adaptés', 'Astuces quotidiennes']
              },
              {
                icon: '🔒',
                title: '100% Sécurisé',
                description: 'Tes données sont protégées dans une base de données sécurisée Supabase avec chiffrement et sauvegarde cloud automatique.',
                details: ['Base de données sécurisée', 'Chiffrement des données', 'Sauvegarde cloud']
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="landing-benefit-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="landing-benefit-icon">
                  {benefit.iconType === 'text' ? (
                    <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{benefit.icon}</span>
                  ) : (
                    <AnimatedIcon emoji={benefit.icon} size={48} animation="scale" delay={index * 0.1} />
                  )}
                </div>
                <h3 className="landing-benefit-title">{benefit.title}</h3>
                <p className="landing-benefit-description">{benefit.description}</p>
                <ul className="landing-benefit-details">
                  {benefit.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="landing-faq">
        <div className="landing-container">
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="landing-section-title">
              Questions <span className="landing-title-highlight">fréquentes</span>
            </h2>
            <p className="landing-section-subtitle">
              Tout ce que tu veux savoir sur GèreTonDjai
            </p>
          </motion.div>

          <div className="landing-faq-grid">
            {[
              {
                question: 'GèreTonDjai est-il vraiment gratuit ?',
                answer: 'Oui, la version actuelle (V1) est 100% gratuite ! Aucun abonnement, aucune carte bancaire requise. Toutes les fonctionnalités sont disponibles gratuitement. La version 2 (V2) sera payante mais pas chère, avec des fonctionnalités premium supplémentaires.'
              },
              {
                question: 'Mes données sont-elles sécurisées ?',
                answer: 'Absolument ! Tes données sont stockées dans une base de données sécurisée Supabase avec chiffrement. Seul toi peux accéder à tes informations.'
              },
              {
                question: 'L\'application fonctionne-t-elle sans internet ?',
                answer: 'Oui ! Installe l\'app sur ton téléphone (PWA) et utilise-la hors ligne. Tes données se synchroniseront automatiquement quand tu auras internet.'
              },
              {
                question: 'Le micro comprend-il vraiment le Nouchi ?',
                answer: 'Oui ! Le système de reconnaissance vocale comprend le Nouchi et les expressions ivoiriennes comme "Gbaka", "Garba", "Woro-woro", "Warren", etc.'
              },
              {
                question: 'Comment fonctionne le conseiller IA Woro ?',
                answer: 'Woro analyse tes dépenses et revenus pour te donner des conseils personnalisés, créer des plans d\'épargne et t\'aider à atteindre tes objectifs financiers.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="landing-faq-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="landing-faq-question">{faq.question}</h3>
                <p className="landing-faq-answer">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
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
              Prêt à maîtriser tes dépenses et <span className="landing-title-highlight">épargner plus</span> ?
            </h2>
            <p className="landing-cta-subtitle">
              Rejoins des milliers d'Ivoiriens qui utilisent GèreTonDjai pour mieux gérer leurs finances grâce à des conseils personnalisés
            </p>
            <Link
              to="/auth"
              className="landing-btn landing-btn-cta"
            >
              <span>Commencer maintenant - C'est gratuit !</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
              ✅ Aucune carte bancaire requise • ✅ Inscription en 30 secondes • ✅ 100% gratuit
            </p>
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

