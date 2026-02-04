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
// Chercher le fichier .env dans le dossier server/ d'abord, puis à la racine
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '.env')
dotenv.config({ path: envPath })
// Si le fichier .env n'existe pas dans server/, essayer à la racine
if (!process.env.SMTP_USER) {
  dotenv.config()
}

// Créer le dossier logs s'il n'existe pas
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
  console.log('[/api/send-email] body =', req.body)
  
  const { to, subject, html } = req.body

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

  // Préparer l'email
  const mailOptions = {
    from: 'GereTonDjai <contact@xn--gretondjai-z6a.com>',
    to,
    subject,
    html
  }

  try {
    await transporter.verify()
    console.log('SMTP verify OK')
    const info = await transporter.sendMail(mailOptions)
    console.log('Mail sent OK:', info.messageId)
    res.json({ success: true, messageId: info.messageId })
  } catch (err) {
    console.error('Mail error:', err)
    res.status(500).json({ success: false, error: err.message })
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

