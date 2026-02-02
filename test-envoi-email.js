/**
 * Script pour tester l'envoi d'email via Resend
 */

import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Fonction pour charger les variables d'environnement
function loadEnv() {
  const envFiles = ['.env.local', '.env', '.env.production']
  let envVars = {}

  for (const file of envFiles) {
    const envPath = join(__dirname, file)
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf-8')
      content.split('\n').forEach(line => {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=')
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
          }
        }
      })
    }
  }

  return envVars
}

const env = loadEnv()

const RESEND_API_KEY = env.VITE_RESEND_API_KEY || process.env.VITE_RESEND_API_KEY
const EMAIL_FROM = env.VITE_EMAIL_FROM || 'onboarding@resend.dev'
const EMAIL_FROM_NAME = env.VITE_EMAIL_FROM_NAME || 'GèreTonDjai'
const RESEND_API_URL = env.VITE_RESEND_API_URL || 'https://api.resend.com'

console.log('')
console.log('========================================')
console.log('  TEST ENVOI EMAIL RESEND')
console.log('========================================')
console.log('')

if (!RESEND_API_KEY) {
  console.error('❌ ERREUR : VITE_RESEND_API_KEY non trouvé !')
  console.error('')
  console.error('📋 Ajoute dans .env :')
  console.error('   VITE_RESEND_API_KEY=ta_cle_resend')
  console.error('')
  process.exit(1)
}

console.log('✅ Clé Resend trouvée:', RESEND_API_KEY.substring(0, 10) + '...')
console.log('✅ Email from:', EMAIL_FROM)
console.log('✅ Nom from:', EMAIL_FROM_NAME)
console.log('✅ API URL:', RESEND_API_URL)
console.log('')

// Demander l'email de test
const testEmail = process.argv[2] || 'test@example.com'

console.log(`📧 Email de test : ${testEmail}`)
console.log('')

// Template d'email de bienvenue
const emailHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur GèreTonDjai</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #f48c25 0%, #ff6b35 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">
                🎉 GèreTonDjai
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 700; text-align: center;">
                Bienvenue sur GèreTonDjai ! 🎉
              </h2>
              <p style="font-size: 18px; margin-bottom: 20px;">Salut <strong>Test User</strong> ! 👋</p>
              <p>Nous sommes ravis de t'accueillir sur <strong style="color: #f48c25;">GèreTonDjai</strong>, l'application qui va t'aider à gérer ton argent comme un boss !</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

async function testerEnvoiEmail() {
  try {
    console.log('🔄 Tentative d\'envoi d\'email...')
    console.log('')

    const emailData = {
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: testEmail,
      subject: 'Bienvenue sur GèreTonDjai ! 🎉 Test Email',
      html: emailHTML,
      text: 'Bienvenue sur GèreTonDjai !\n\nSalut Test User !\n\nNous sommes ravis de t\'accueillir sur GèreTonDjai, l\'application qui va t\'aider à gérer ton argent comme un boss !'
    }

    console.log('📤 Envoi à Resend API...')
    console.log('   From:', emailData.from)
    console.log('   To:', emailData.to)
    console.log('   Subject:', emailData.subject)
    console.log('')

    const response = await fetch(`${RESEND_API_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify(emailData)
    })

    const data = await response.json()

    console.log('📥 Réponse de Resend:')
    console.log('   Status:', response.status)
    console.log('   Status Text:', response.statusText)
    console.log('')

    if (!response.ok) {
      console.error('❌ ERREUR D\'ENVOI :')
      console.error('')
      console.error('   Code:', response.status)
      console.error('   Message:', data.message || 'N/A')
      console.error('')
      console.error('   Détails complets:', JSON.stringify(data, null, 2))
      console.error('')

      // Analyser l'erreur
      if (data.message && data.message.includes('Invalid API key')) {
        console.error('🔍 DIAGNOSTIC : Clé API Resend invalide')
        console.error('   → Vérifie que la clé est correcte dans .env')
        console.error('   → Va sur https://resend.com/api-keys pour obtenir une nouvelle clé')
      } else if (data.message && data.message.includes('domain')) {
        console.error('🔍 DIAGNOSTIC : Problème avec le domaine d\'envoi')
        console.error('   → Le domaine doit être vérifié dans Resend')
        console.error('   → Va sur https://resend.com/domains pour vérifier ton domaine')
        console.error('   → OU utilise onboarding@resend.dev (déjà vérifié)')
      } else {
        console.error('🔍 DIAGNOSTIC : Erreur inconnue')
      }

      process.exit(1)
    }

    console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS !')
    console.log('')
    console.log('   Message ID:', data.id)
    console.log('')
    console.log('📋 Vérifie :')
    console.log('   1. Ta boîte mail (et les spams)')
    console.log('   2. Le dashboard Resend : https://resend.com/emails')
    console.log('   3. Les logs Resend pour voir le statut de livraison')
    console.log('')

  } catch (error) {
    console.error('❌ ERREUR FATALE:', error.message)
    console.error('')
    console.error('Stack:', error.stack)
    console.error('')
    process.exit(1)
  }
}

testerEnvoiEmail()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })

