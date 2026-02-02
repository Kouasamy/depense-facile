/**
 * Script pour tester l'inscription directement via l'API Supabase
 * Pour diagnostiquer le problème
 */

import { createClient } from '@supabase/supabase-js'
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

const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ ERREUR : Credentials manquants')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function testerInscription() {
  console.log('')
  console.log('========================================')
  console.log('  TEST INSCRIPTION DIRECTE')
  console.log('========================================')
  console.log('')

  // Générer un email unique pour le test
  const testEmail = `test-${Date.now()}@test.com`
  const testPassword = 'Test123456!'
  const testName = 'Test User'

  console.log(`📧 Email de test : ${testEmail}`)
  console.log(`🔑 Mot de passe : ${testPassword}`)
  console.log(`👤 Nom : ${testName}`)
  console.log('')

  try {
    console.log('🔄 Tentative d\'inscription...')
    console.log('')

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: undefined,
        data: {
          name: testName
        }
      }
    })

    if (error) {
      console.error('❌ ERREUR D\'INSCRIPTION :')
      console.error('')
      console.error('   Code:', error.status || 'N/A')
      console.error('   Message:', error.message)
      console.error('')
      console.error('   Détails complets:', JSON.stringify(error, null, 2))
      console.error('')
      
      // Analyser l'erreur
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        console.error('🔍 DIAGNOSTIC : Email déjà utilisé')
        console.error('   → Vérifie dans Supabase Dashboard → Authentication → Users')
      } else if (error.message.includes('email')) {
        console.error('🔍 DIAGNOSTIC : Problème avec l\'email')
      } else if (error.message.includes('password')) {
        console.error('🔍 DIAGNOSTIC : Problème avec le mot de passe')
      } else {
        console.error('🔍 DIAGNOSTIC : Erreur inconnue')
      }
      
      process.exit(1)
    }

    if (data && data.user) {
      console.log('✅ INSCRIPTION RÉUSSIE !')
      console.log('')
      console.log('   User ID:', data.user.id)
      console.log('   Email:', data.user.email)
      console.log('   Email vérifié:', data.user.email_confirmed_at ? 'Oui' : 'Non')
      console.log('')
      
      // Supprimer l'utilisateur de test
      console.log('🗑️  Suppression de l\'utilisateur de test...')
      const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id)
      
      if (deleteError) {
        console.error('⚠️  Erreur lors de la suppression:', deleteError.message)
      } else {
        console.log('✅ Utilisateur de test supprimé')
      }
      
      console.log('')
      console.log('✅ L\'inscription fonctionne correctement !')
      console.log('')
      console.log('💡 Le problème vient peut-être de :')
      console.log('   1. Le cache local du navigateur')
      console.log('   2. La configuration de l\'application')
      console.log('   3. Un problème avec l\'interface utilisateur')
      console.log('')
    } else {
      console.error('❌ ERREUR : Aucun utilisateur créé')
      console.error('   Data:', JSON.stringify(data, null, 2))
      console.error('')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ ERREUR FATALE:', error.message)
    console.error('')
    console.error('Stack:', error.stack)
    console.error('')
    process.exit(1)
  }
}

testerInscription()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })

