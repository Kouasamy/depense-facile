/**
 * Serveur backend pour l'envoi d'emails via SMTP Hostinger
 * Utilise nodemailer pour gérer l'envoi SMTP
 */

import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

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
  const port = parseInt(process.env.SMTP_PORT || '465')
  const secure = port === 465 // SSL pour 465, TLS pour 587
  
  // Récupérer l'utilisateur SMTP (utiliser le format Punycode si nécessaire)
  let smtpUser = process.env.SMTP_USER || process.env.EMAIL_FROM
  // Si l'email contient 'è', convertir en Punycode pour l'authentification SMTP
  if (smtpUser && smtpUser.includes('è')) {
    smtpUser = toPunycode(smtpUser)
    console.log(`📧 Email converti en Punycode pour SMTP: ${smtpUser}`)
  }
  
  return nodemailer.createTransport({
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
  })
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

    // Préparer l'email
    const mailOptions = {
      from: from || `${process.env.EMAIL_FROM_NAME || 'GèreTonDjai'} <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ''), // Convertir HTML en texte si pas fourni
      ...(replyTo && { replyTo: replyTo })
    }

    console.log('📧 Envoi email via SMTP Hostinger...')
    console.log('   De:', mailOptions.from)
    console.log('   Vers:', mailOptions.to)
    console.log('   Sujet:', mailOptions.subject)

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions)

    console.log('✅ Email envoyé avec succès!')
    console.log('   Message ID:', info.messageId)

    res.json({
      success: true,
      messageId: info.messageId
    })
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'envoi de l\'email'
    })
  }
})

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur email démarré sur le port ${PORT}`)
  console.log(`📧 SMTP Host: ${process.env.SMTP_HOST || 'smtp.hostinger.com'}`)
  console.log(`📧 SMTP User: ${process.env.SMTP_USER || process.env.EMAIL_FROM || 'Non configuré'}`)
  console.log(`📧 SMTP Password: ${process.env.SMTP_PASSWORD ? '✅ Configuré' : '❌ Non configuré'}`)
})

