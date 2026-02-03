/**
 * Script de test pour vérifier la configuration SMTP Hostinger
 */

import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

async function testSMTP() {
  console.log('🧪 Test de la configuration SMTP Hostinger...\n')

  // Vérifier les variables d'environnement
  const smtpHost = process.env.SMTP_HOST || 'smtp.hostinger.com'
  const smtpPort = parseInt(process.env.SMTP_PORT || '465')
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_FROM
  const smtpPassword = process.env.SMTP_PASSWORD
  const emailFrom = process.env.EMAIL_FROM || smtpUser

  console.log('📋 Configuration:')
  console.log(`   Host: ${smtpHost}`)
  console.log(`   Port configuré: ${smtpPort} (on va tester plusieurs ports)`)
  console.log(`   User: ${smtpUser}`)
  console.log(`   Password: ${smtpPassword ? '✅ Configuré (' + smtpPassword.length + ' caractères)' : '❌ Non configuré'}`)
  console.log(`   From: ${emailFrom}`)
  
  // Vérifier le format de l'email
  if (smtpUser && smtpUser.includes('è')) {
    console.log(`\n⚠️  ATTENTION: L'email contient un caractère accentué "è"`)
    console.log(`   Si ça ne fonctionne pas, essaie avec: contact@geretondjai.com (sans accent)\n`)
  }

  if (!smtpUser || !smtpPassword) {
    console.error('❌ ERREUR: SMTP_USER et SMTP_PASSWORD doivent être configurés dans .env')
    process.exit(1)
  }

  // Convertir l'email en format Punycode si nécessaire (pour les domaines avec caractères spéciaux)
  function toPunycode(email) {
    if (!email || !email.includes('@')) return email
    const [localPart, domain] = email.split('@')
    // Convertir le domaine en Punycode si nécessaire
    try {
      const punycodeDomain = domain.includes('xn--') ? domain : 
        (domain.includes('è') ? 'xn--gretondjai-z6a.com' : domain)
      return `${localPart}@${punycodeDomain}`
    } catch {
      return email
    }
  }

  // Tester avec plusieurs formats d'email
  const emailVariants = []
  
  if (smtpUser && smtpUser.includes('è')) {
    // Format original avec accent
    emailVariants.push({
      user: smtpUser,
      name: 'avec accent (original)'
    })
    // Format Punycode (ce que Hostinger demande)
    const punycodeEmail = toPunycode(smtpUser)
    emailVariants.push({
      user: punycodeEmail,
      name: 'format Punycode (xn--gretondjai-z6a.com)'
    })
    // Format sans accent
    emailVariants.push({
      user: smtpUser.replace(/è/g, 'e'),
      name: 'sans accent'
    })
  } else {
    emailVariants.push({
      user: smtpUser,
      name: 'email configuré'
    })
  }

  // Essayer plusieurs configurations SMTP
  const configs = [
    { port: 465, secure: true, name: 'Port 465 (SSL)' },
    { port: 587, secure: false, name: 'Port 587 (TLS)' },
    { port: 465, secure: true, name: 'Port 465 (SSL) - sans TLS reject', tlsReject: false }
  ]

  let transporter = null
  let workingConfig = null
  let workingEmail = null

  // Tester chaque variante d'email avec chaque configuration
  for (const emailVariant of emailVariants) {
    console.log(`\n📧 Test avec email ${emailVariant.name}: ${emailVariant.user}`)
    
    for (const config of configs) {
      try {
        console.log(`   🔌 Test avec ${config.name}...`)
        
        const transportConfig = {
          host: smtpHost,
          port: config.port,
          secure: config.secure,
          auth: {
            user: emailVariant.user,
            pass: smtpPassword
          }
        }

        if (config.tlsReject === false) {
          transportConfig.tls = { rejectUnauthorized: false }
        }

        transporter = nodemailer.createTransport(transportConfig)
        
        await transporter.verify()
        console.log(`   ✅ Connexion SMTP réussie avec ${config.name}!`)
        workingConfig = config
        workingEmail = emailVariant.user
        break
      } catch (error) {
        console.log(`   ❌ Échec avec ${config.name}: ${error.message}`)
      }
    }
    
    if (workingConfig && workingEmail) {
      break
    }
  }

  if (!transporter || !workingConfig) {
    console.error('\n❌ Aucune configuration SMTP n\'a fonctionné.')
    console.error('\n💡 Vérifications URGENTES à faire dans Hostinger:')
    console.error('\n1. 📧 Vérifie que la boîte mail existe:')
    console.error('   → Va dans Hostinger → Email → Gérer les boîtes mail')
    console.error('   → Vérifie que contact@gèretondjai.com existe')
    console.error('\n2. 🔐 Vérifie le mot de passe:')
    console.error('   → Le mot de passe dans .env doit être EXACTEMENT celui de la boîte mail')
    console.error('   → Pas d\'espaces avant/après')
    console.error('   → Essaie de te connecter à la boîte mail via webmail pour vérifier')
    console.error('\n3. ⚙️  Active l\'accès SMTP:')
    console.error('   → Dans Hostinger → Email → Paramètres de la boîte mail')
    console.error('   → Active "Autoriser l\'accès SMTP" ou "SMTP activé"')
    console.error('\n4. 📋 Récupère les paramètres SMTP exacts:')
    console.error('   → Dans Hostinger, cherche "Paramètres SMTP" ou "Configuration email"')
    console.error('   → Note le serveur SMTP, le port, et l\'utilisateur EXACTS')
    console.error('\n5. 🔄 Essaie de créer une boîte mail SANS accent:')
    console.error('   → Crée contact@geretondjai.com (sans è)')
    console.error('   → Utilise cet email dans .env')
    console.error('\n6. 📞 Contacte le support Hostinger si rien ne fonctionne')
    console.error('   → Demande les paramètres SMTP exacts pour ta boîte mail')
    process.exit(1)
  }

  console.log(`\n✅ Configuration fonctionnelle trouvée!`)
  console.log(`   Email: ${workingEmail}`)
  console.log(`   Configuration: ${workingConfig.name}\n`)
  
  if (workingEmail !== smtpUser) {
    if (workingEmail.includes('xn--')) {
      console.log(`⚠️  IMPORTANT: Le format Punycode fonctionne!`)
      console.log(`   Le serveur email convertit automatiquement pour l'authentification SMTP.`)
      console.log(`   Tu peux garder dans ton .env:`)
      console.log(`   SMTP_USER=${smtpUser}`)
      console.log(`   EMAIL_FROM=${smtpUser}`)
      console.log(`   VITE_EMAIL_FROM=${smtpUser}`)
      console.log(`   (Le serveur utilisera automatiquement: ${workingEmail} pour SMTP)\n`)
    } else {
      console.log(`⚠️  IMPORTANT: L'email sans accent fonctionne!`)
      console.log(`   Mets à jour ton .env avec:`)
      console.log(`   SMTP_USER=${workingEmail}`)
      console.log(`   EMAIL_FROM=${workingEmail}`)
      console.log(`   VITE_EMAIL_FROM=${workingEmail}\n`)
    }
  }

  // Demander l'email de test
  const readline = await import('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const testEmail = await new Promise((resolve) => {
    rl.question('📧 Entrez votre email pour recevoir un test: ', (answer) => {
      rl.close()
      resolve(answer)
    })
  })

  if (!testEmail || !testEmail.includes('@')) {
    console.error('❌ Email invalide')
    process.exit(1)
  }

  // Envoyer un email de test
  try {
    console.log(`\n📤 Envoi d'un email de test à ${testEmail}...`)
    
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'GèreTonDjai'} <${emailFrom}>`,
      to: testEmail,
      subject: 'Test SMTP Hostinger - GèreTonDjai',
      html: `
        <h1>✅ Test SMTP réussi!</h1>
        <p>Si tu reçois cet email, la configuration SMTP Hostinger fonctionne correctement.</p>
        <p>Email envoyé depuis: <strong>${emailFrom}</strong></p>
        <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
      `,
      text: `Test SMTP réussi! Si tu reçois cet email, la configuration SMTP Hostinger fonctionne correctement.`
    })

    console.log('✅ Email de test envoyé avec succès!')
    console.log(`   Message ID: ${info.messageId}`)
    console.log(`\n📬 Vérifie ta boîte mail (et les spams) pour confirmer la réception.`)
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error.message)
    process.exit(1)
  }
}

testSMTP().catch(console.error)

