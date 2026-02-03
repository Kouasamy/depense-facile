/**
 * Serveur backend pour l'envoi d'emails via SMTP Hostinger
 * Utilise nodemailer pour gérer l'envoi SMTP
 */

import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { mkdir } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Charger les variables d'environnement
dotenv.config()

// Créer le dossier logs s'il n'existe pas
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const logsDir = join(__dirname, 'logs')

mkdir(logsDir, { recursive: true }).catch(err => {
  if (err.code !== 'EEXIST') {
    console.warn('⚠️ Impossible de créer le dossier logs:', err.message)
  }
})

const app = express()
const PORT = process.env.EMAIL_SERVER_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Convertir l'email en format Punycode si nécessaire (pour Hostinger avec caractères spéciaux)
function toPunycode(email) {
  if (!email || !email.includes('@')) return email
  const [localPart, domain] = email.split('@')
  // Si le domaine contient 'è', utiliser le format Punycode
  if (domain.includes('è')) {
    return `${localPart}@xn--gretondjai-z6a.com`
  }
  return email
}

// Configuration du transporteur SMTP Hostinger
const createTransporter = () => {
  // Essayer d'abord le port 587 (TLS) comme recommandé par Hostinger
  const port = parseInt(process.env.SMTP_PORT || '587')
  const secure = port === 465 // SSL pour 465, TLS (false) pour 587
  
  // Récupérer l'utilisateur SMTP (utiliser le format Punycode si nécessaire)
  let smtpUser = process.env.SMTP_USER || process.env.EMAIL_FROM
  // Si l'email contient 'è', convertir en Punycode pour l'authentification SMTP
  if (smtpUser && smtpUser.includes('è')) {
    smtpUser = toPunycode(smtpUser)
    console.log(`📧 Email converti en Punycode pour SMTP: ${smtpUser}`)
  }
  // Si l'email est déjà en format Punycode, l'utiliser tel quel
  // Le format Punycode est déjà correct pour SMTP Hostinger
  
  const config = {
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: port,
    secure: secure, // true pour le port 465 (SSL), false pour 587 (TLS)
    auth: {
      user: smtpUser, // Format Punycode pour l'authentification
      pass: process.env.SMTP_PASSWORD // Mot de passe de la boîte mail
    },
    tls: {
      rejectUnauthorized: false // Pour éviter les problèmes de certificat
    },
    debug: true, // Activer les logs de débogage
    logger: true // Logger les opérations
  }
  
  // Pour le port 587, s'assurer que STARTTLS est activé
  if (port === 587) {
    config.requireTLS = true
  }
  
  console.log('📧 Configuration SMTP:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'Non configuré',
    password: process.env.SMTP_PASSWORD ? '✅ Configuré' : '❌ Non configuré'
  })
  
  return nodemailer.createTransport(config)
}

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'email-server' })
})

// Route pour envoyer un email
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text, from, replyTo } = req.body

    // Validation
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        error: 'Les champs to, subject et html sont requis'
      })
    }

    // Vérifier que SMTP est configuré
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('❌ SMTP non configuré. Vérifiez SMTP_USER et SMTP_PASSWORD dans .env')
      return res.status(500).json({
        success: false,
        error: 'Service email non configuré'
      })
    }

    // Créer le transporteur
    const transporter = createTransporter()

    // Préparer l'email avec en-têtes anti-spam
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER
    const fromName = process.env.EMAIL_FROM_NAME || 'GèreTonDjai-CI'
    
    const mailOptions = {
      from: from || `${fromName} <${fromEmail}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ''), // Convertir HTML en texte si pas fourni
      ...(replyTo && { replyTo: replyTo }),
      // En-têtes pour éviter les spams
      headers: {
        'X-Mailer': 'GèreTonDjai Email Service',
        'X-Priority': '3',
        'List-Unsubscribe': `<mailto:${fromEmail}?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'Precedence': 'bulk',
        // Authentification
        'Message-ID': `<${Date.now()}-${Math.random().toString(36).substring(7)}@geretondjai.com>`,
        'Date': new Date().toUTCString()
      },
      // Priorité normale
      priority: 'normal'
    }

    console.log('📧 Envoi email via SMTP Hostinger...')
    console.log('   De:', mailOptions.from)
    console.log('   Vers:', mailOptions.to)
    console.log('   Sujet:', mailOptions.subject)

    // Tester la connexion SMTP avant d'envoyer
    console.log('🔍 Vérification de la connexion SMTP...')
    await transporter.verify()
    console.log('✅ Connexion SMTP vérifiée avec succès!')

    // Envoyer l'email
    console.log('📤 Envoi de l\'email...')
    const info = await transporter.sendMail(mailOptions)

    console.log('✅ Email envoyé avec succès!')
    console.log('   Message ID:', info.messageId)
    console.log('   Réponse:', info.response)

    res.json({
      success: true,
      messageId: info.messageId
    })
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error)
    console.error('   Code:', error.code)
    console.error('   Command:', error.command)
    console.error('   Response:', error.response)
    console.error('   Stack:', error.stack)
    
    // Messages d'erreur plus détaillés
    let errorMessage = error.message || 'Erreur lors de l\'envoi de l\'email'
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Erreur d\'authentification SMTP. Vérifiez SMTP_USER et SMTP_PASSWORD.'
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Impossible de se connecter au serveur SMTP. Vérifiez SMTP_HOST et SMTP_PORT.'
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Timeout de connexion SMTP. Le serveur ne répond pas.'
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Démarrer le serveur avec gestion du port occupé
// En production, écouter sur 0.0.0.0 pour accepter les connexions externes
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur email démarré sur ${HOST}:${PORT}`)
  console.log(`📧 SMTP Host: ${process.env.SMTP_HOST || 'smtp.hostinger.com'}`)
  console.log(`📧 SMTP User: ${process.env.SMTP_USER || process.env.EMAIL_FROM || 'Non configuré'}`)
  console.log(`📧 SMTP Password: ${process.env.SMTP_PASSWORD ? '✅ Configuré' : '❌ Non configuré'}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`✅ Serveur prêt à recevoir des requêtes en production`)
  }
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Le port ${PORT} est déjà utilisé`)
    console.error(`💡 Solution: Tue le processus qui utilise le port ${PORT}`)
    console.error(`   Windows: netstat -ano | findstr :${PORT}`)
    console.error(`   Puis: taskkill /PID <PID> /F`)
    process.exit(1)
  } else {
    throw error
  }
})

