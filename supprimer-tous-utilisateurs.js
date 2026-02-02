/**
 * Script pour supprimer TOUS les utilisateurs de Supabase Auth
 * 
 * ⚠️ ATTENTION : Cette action est IRRÉVERSIBLE !
 * 
 * Ce script nécessite la clé SERVICE_ROLE de Supabase (pas la clé anon)
 * 
 * Instructions :
 * 1. Va dans Supabase Dashboard → Settings → API
 * 2. Copie la clé "service_role" (secret)
 * 3. Crée un fichier .env.local avec :
 *    SUPABASE_URL=https://ton-projet.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=ta_cle_service_role
 * 4. Exécute : node supprimer-tous-utilisateurs.js
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '.env.local') })

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERREUR : Variables d\'environnement manquantes !')
  console.error('')
  console.error('📋 Crée un fichier .env.local avec :')
  console.error('   SUPABASE_URL=https://ton-projet.supabase.co')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=ta_cle_service_role')
  console.error('')
  console.error('🔑 Pour obtenir la clé service_role :')
  console.error('   1. Va dans Supabase Dashboard → Settings → API')
  console.error('   2. Copie la clé "service_role" (secret, rouge)')
  console.error('')
  process.exit(1)
}

// Créer le client Supabase avec la clé service_role (admin)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function supprimerTousLesUtilisateurs() {
  console.log('')
  console.log('========================================')
  console.log('  SUPPRESSION DE TOUS LES UTILISATEURS')
  console.log('========================================')
  console.log('')
  console.log('⚠️  ATTENTION : Cette action est IRRÉVERSIBLE !')
  console.log('')

  try {
    // Étape 1 : Lister tous les utilisateurs
    console.log('📋 Étape 1 : Récupération de la liste des utilisateurs...')
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', listError.message)
      process.exit(1)
    }

    if (!users || users.users.length === 0) {
      console.log('✅ Aucun utilisateur trouvé dans la base de données.')
      console.log('')
      return
    }

    console.log(`📊 ${users.users.length} utilisateur(s) trouvé(s) :`)
    users.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`)
    })
    console.log('')

    // Demander confirmation
    console.log('⚠️  Êtes-vous sûr de vouloir supprimer TOUS ces utilisateurs ?')
    console.log('   Cette action est IRRÉVERSIBLE !')
    console.log('')
    console.log('   Pour confirmer, appuyez sur Ctrl+C pour annuler,')
    console.log('   ou attendez 5 secondes pour continuer...')
    console.log('')

    // Attendre 5 secondes
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Étape 2 : Supprimer tous les utilisateurs
    console.log('🗑️  Étape 2 : Suppression des utilisateurs...')
    console.log('')

    let successCount = 0
    let errorCount = 0

    for (const user of users.users) {
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
          console.error(`   ❌ Erreur pour ${user.email}:`, deleteError.message)
          errorCount++
        } else {
          console.log(`   ✅ ${user.email} supprimé`)
          successCount++
        }
      } catch (error) {
        console.error(`   ❌ Erreur pour ${user.email}:`, error.message)
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

    // Étape 3 : Vérifier que tout est supprimé
    console.log('🔍 Étape 3 : Vérification...')
    const { data: remainingUsers } = await supabaseAdmin.auth.admin.listUsers()
    
    if (remainingUsers && remainingUsers.users.length > 0) {
      console.log(`   ⚠️  ${remainingUsers.users.length} utilisateur(s) restant(s)`)
    } else {
      console.log('   ✅ Aucun utilisateur restant. Base de données vide !')
    }
    console.log('')

    console.log('✅ Suppression terminée !')
    console.log('')

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message)
    console.error('')
    process.exit(1)
  }
}

// Exécuter le script
supprimerTousLesUtilisateurs()
  .then(() => {
    console.log('🎉 Script terminé avec succès !')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })

