/**
 * Script pour vérifier que toutes les tables sont vides
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
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERREUR : Credentials manquants')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function verifierTables() {
  console.log('')
  console.log('========================================')
  console.log('  VÉRIFICATION DES TABLES')
  console.log('========================================')
  console.log('')

  const tables = ['expenses', 'incomes', 'budgets', 'user_profiles', 'user_onboarding']
  let toutesVides = true

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`⚠️  ${table}: Erreur - ${error.message}`)
        toutesVides = false
      } else {
        const isEmpty = count === 0
        const status = isEmpty ? '✅' : '❌'
        console.log(`${status} ${table}: ${count || 0} ligne(s)`)
        if (!isEmpty) {
          toutesVides = false
        }
      }
    } catch (error) {
      console.log(`⚠️  ${table}: Erreur - ${error.message}`)
      toutesVides = false
    }
  }

  console.log('')
  console.log('========================================')
  if (toutesVides) {
    console.log('  ✅ TOUTES LES TABLES SONT VIDES !')
  } else {
    console.log('  ⚠️  Certaines tables contiennent encore des données')
  }
  console.log('========================================')
  console.log('')
}

verifierTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })

