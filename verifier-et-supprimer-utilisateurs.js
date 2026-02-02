/**
 * Script pour vérifier et supprimer TOUS les utilisateurs Supabase
 * Utilise les credentials de Cursor/Supabase
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

// Récupérer les credentials Supabase
const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

console.log('')
console.log('========================================')
console.log('  VÉRIFICATION ET SUPPRESSION UTILISATEURS')
console.log('========================================')
console.log('')

// Vérifier la configuration
if (!SUPABASE_URL) {
  console.error('❌ ERREUR : SUPABASE_URL non trouvé !')
  console.error('')
  console.error('📋 Vérifie que .env contient :')
  console.error('   VITE_SUPABASE_URL=https://ton-projet.supabase.co')
  console.error('')
  process.exit(1)
}

console.log('✅ Supabase URL trouvé:', SUPABASE_URL)
console.log('')

// Essayer d'abord avec service_role, sinon avec anon
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY

if (!SUPABASE_KEY) {
  console.error('❌ ERREUR : Aucune clé Supabase trouvée !')
  console.error('')
  console.error('📋 Pour supprimer les utilisateurs, tu as besoin de la clé SERVICE_ROLE :')
  console.error('   1. Va dans Supabase Dashboard → Settings → API')
  console.error('   2. Copie la clé "service_role" (secret, rouge)')
  console.error('   3. Ajoute dans .env.local : SUPABASE_SERVICE_ROLE_KEY=ta_cle')
  console.error('')
  console.error('⚠️  Sans service_role, je peux seulement LISTER les utilisateurs, pas les supprimer.')
  console.error('')
  
  // Essayer quand même avec anon pour lister
  if (SUPABASE_ANON_KEY) {
    console.log('📋 Tentative avec la clé anon (lecture seule)...')
    console.log('')
  } else {
    process.exit(1)
  }
} else {
  if (SUPABASE_SERVICE_ROLE_KEY) {
    console.log('✅ Clé SERVICE_ROLE trouvée (droits admin complets)')
  } else {
    console.log('⚠️  Clé anon trouvée (droits limités - peut-être impossible de supprimer)')
  }
  console.log('')
}

// Créer le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function verifierEtSupprimer() {
  try {
    // Étape 1 : Lister les utilisateurs
    console.log('📋 Étape 1 : Récupération de la liste des utilisateurs...')
    console.log('')

    let users = []
    
    if (SUPABASE_SERVICE_ROLE_KEY) {
      // Utiliser l'API Admin
      const { data: adminData, error: adminError } = await supabase.auth.admin.listUsers()
      
      if (adminError) {
        console.error('❌ Erreur lors de la récupération:', adminError.message)
        process.exit(1)
      }
      
      users = adminData?.users || []
    } else {
      // Essayer avec l'API normale (peut ne pas fonctionner)
      console.log('⚠️  Tentative avec l\'API normale (peut ne pas fonctionner sans service_role)...')
      console.log('')
      
      // On ne peut pas lister les utilisateurs avec l'API anon
      console.error('❌ Impossible de lister les utilisateurs avec la clé anon.')
      console.error('   Tu dois utiliser la clé SERVICE_ROLE pour supprimer les utilisateurs.')
      console.error('')
      console.error('📋 Solution :')
      console.error('   1. Va dans Supabase Dashboard → Settings → API')
      console.error('   2. Copie la clé "service_role"')
      console.error('   3. Crée .env.local avec : SUPABASE_SERVICE_ROLE_KEY=ta_cle')
      console.error('   4. Relance ce script')
      console.error('')
      process.exit(1)
    }

    if (users.length === 0) {
      console.log('✅ Aucun utilisateur trouvé dans la base de données.')
      console.log('   La base est déjà vide !')
      console.log('')
      return
    }

    console.log(`📊 ${users.length} utilisateur(s) trouvé(s) :`)
    console.log('')
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email || user.id} (ID: ${user.id})`)
      if (user.created_at) {
        const date = new Date(user.created_at)
        console.log(`      Créé le : ${date.toLocaleDateString('fr-FR')}`)
      }
    })
    console.log('')

    // Étape 2 : Demander confirmation pour supprimer
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Impossible de supprimer sans la clé SERVICE_ROLE !')
      console.error('')
      process.exit(1)
    }

    console.log('⚠️  ATTENTION : Tu es sur le point de supprimer TOUS ces utilisateurs !')
    console.log('   Cette action est IRRÉVERSIBLE !')
    console.log('')
    console.log('   Pour continuer, appuyez sur Ctrl+C pour annuler,')
    console.log('   ou attendez 5 secondes pour confirmer...')
    console.log('')

    // Attendre 5 secondes
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Étape 3 : Supprimer tous les utilisateurs
    console.log('🗑️  Étape 2 : Suppression des utilisateurs...')
    console.log('')

    let successCount = 0
    let errorCount = 0

    for (const user of users) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
          console.error(`   ❌ Erreur pour ${user.email || user.id}:`, deleteError.message)
          errorCount++
        } else {
          console.log(`   ✅ ${user.email || user.id} supprimé`)
          successCount++
        }
      } catch (error) {
        console.error(`   ❌ Erreur pour ${user.email || user.id}:`, error.message)
        errorCount++
      }
    }

    console.log('')
    console.log('========================================')
    console.log('  RÉSULTAT')
    console.log('========================================')
    console.log(`   ✅ Supprimés avec succès : ${successCount}`)
    if (errorCount > 0) {
      console.log(`   ❌ Erreurs : ${errorCount}`)
    }
    console.log('')

    // Étape 4 : Vérifier que tout est supprimé
    console.log('🔍 Étape 3 : Vérification finale...')
    const { data: remainingData } = await supabase.auth.admin.listUsers()
    const remainingUsers = remainingData?.users || []
    
    if (remainingUsers.length > 0) {
      console.log(`   ⚠️  ${remainingUsers.length} utilisateur(s) restant(s)`)
      console.log('')
      remainingUsers.forEach(user => {
        console.log(`      - ${user.email || user.id}`)
      })
    } else {
      console.log('   ✅ Aucun utilisateur restant. Base de données vide !')
    }
    console.log('')

    console.log('✅ Opération terminée !')
    console.log('')
    console.log('🎉 Tu peux maintenant créer un nouveau compte sans problème.')
    console.log('')

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message)
    console.error('')
    console.error('Stack:', error.stack)
    console.error('')
    process.exit(1)
  }
}

// Exécuter le script
verifierEtSupprimer()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })

