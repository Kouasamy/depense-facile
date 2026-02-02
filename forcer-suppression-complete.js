/**
 * Script pour FORCER la suppression complète de TOUS les utilisateurs
 * Utilise plusieurs méthodes pour s'assurer que tout est supprimé
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

async function forcerSuppressionComplete() {
  console.log('')
  console.log('========================================')
  console.log('  SUPPRESSION FORCÉE COMPLÈTE')
  console.log('========================================')
  console.log('')

  try {
    // Étape 1 : Lister TOUS les utilisateurs (avec pagination)
    console.log('📋 Étape 1 : Récupération de TOUS les utilisateurs...')
    console.log('')

    let allUsers = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page: page,
        perPage: 1000
      })

      if (error) {
        console.error('❌ Erreur:', error.message)
        break
      }

      if (data && data.users && data.users.length > 0) {
        allUsers = allUsers.concat(data.users)
        console.log(`   📄 Page ${page}: ${data.users.length} utilisateur(s) trouvé(s)`)
        hasMore = data.users.length === 1000
        page++
      } else {
        hasMore = false
      }
    }

    console.log('')
    console.log(`📊 Total: ${allUsers.length} utilisateur(s) trouvé(s)`)

    if (allUsers.length === 0) {
      console.log('✅ Aucun utilisateur trouvé. La base est déjà vide !')
      console.log('')
      
      // Vérifier quand même avec une requête directe
      console.log('🔍 Vérification supplémentaire...')
      const { data: verifyData } = await supabase.auth.admin.listUsers()
      if (verifyData && verifyData.users && verifyData.users.length > 0) {
        console.log(`⚠️  ${verifyData.users.length} utilisateur(s) trouvé(s) lors de la vérification`)
        allUsers = verifyData.users
      } else {
        console.log('✅ Confirmation : Aucun utilisateur')
        console.log('')
        return
      }
    }

    // Afficher la liste
    if (allUsers.length > 0) {
      console.log('')
      console.log('📋 Liste des utilisateurs à supprimer :')
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email || 'Pas d\'email'} (ID: ${user.id})`)
      })
      console.log('')
    }

    // Étape 2 : Supprimer TOUS les utilisateurs
    console.log('🗑️  Étape 2 : Suppression de TOUS les utilisateurs...')
    console.log('')

    let successCount = 0
    let errorCount = 0
    const errors = []

    for (const user of allUsers) {
      try {
        // Méthode 1 : Suppression via API Admin
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
          // Si l'erreur est "User not found", c'est OK (déjà supprimé)
          if (deleteError.message && deleteError.message.includes('not found')) {
            console.log(`   ✅ ${user.email || user.id} (déjà supprimé)`)
            successCount++
          } else {
            console.error(`   ❌ Erreur pour ${user.email || user.id}:`, deleteError.message)
            errors.push({ user: user.email || user.id, error: deleteError.message })
            errorCount++
          }
        } else {
          console.log(`   ✅ ${user.email || user.id} supprimé`)
          successCount++
        }

        // Petite pause pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`   ❌ Erreur pour ${user.email || user.id}:`, error.message)
        errors.push({ user: user.email || user.id, error: error.message })
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
      console.log('')
      console.log('   Détails des erreurs :')
      errors.forEach((err, index) => {
        console.log(`      ${index + 1}. ${err.user}: ${err.error}`)
      })
    }
    console.log('')

    // Étape 3 : Vérification finale (plusieurs fois)
    console.log('🔍 Étape 3 : Vérification finale (3 tentatives)...')
    console.log('')

    let remainingUsers = []
    for (let attempt = 1; attempt <= 3; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: finalData } = await supabase.auth.admin.listUsers()
      const users = finalData?.users || []
      
      if (users.length > 0) {
        console.log(`   Tentative ${attempt}: ${users.length} utilisateur(s) restant(s)`)
        remainingUsers = users
      } else {
        console.log(`   Tentative ${attempt}: ✅ Aucun utilisateur restant`)
        break
      }
    }

    console.log('')
    if (remainingUsers.length > 0) {
      console.log('⚠️  ATTENTION : Des utilisateurs restent encore !')
      console.log('')
      console.log('   Utilisateurs restants :')
      remainingUsers.forEach(user => {
        console.log(`      - ${user.email || user.id} (ID: ${user.id})`)
      })
      console.log('')
      console.log('   💡 Solution : Supprime-les manuellement dans Supabase Dashboard')
      console.log('      → Authentication → Users → Supprime chaque utilisateur')
      console.log('')
    } else {
      console.log('✅ CONFIRMATION : Aucun utilisateur restant !')
      console.log('')
    }

    // Étape 4 : Vérifier aussi les tables de données
    console.log('🔍 Étape 4 : Vérification des tables de données...')
    console.log('')

    const tables = ['expenses', 'incomes', 'budgets', 'user_profiles', 'user_onboarding']
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.log(`   ⚠️  ${table}: Erreur - ${error.message}`)
        } else {
          const isEmpty = count === 0
          const status = isEmpty ? '✅' : '❌'
          console.log(`${status} ${table}: ${count || 0} ligne(s)`)
        }
      } catch (error) {
        console.log(`   ⚠️  ${table}: Erreur - ${error.message}`)
      }
    }

    console.log('')
    console.log('========================================')
    console.log('  ✅ SUPPRESSION TERMINÉE')
    console.log('========================================')
    console.log('')
    console.log('📋 Prochaines étapes :')
    console.log('   1. Nettoie le cache du navigateur (IndexedDB)')
    console.log('   2. Ouvre l\'application dans un onglet privé')
    console.log('   3. Teste l\'inscription')
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
forcerSuppressionComplete()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })

