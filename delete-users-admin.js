/**
 * Script Node.js pour supprimer tous les utilisateurs Supabase via l'API Admin
 * 
 * UTILISATION :
 * 1. Installe les dépendances : npm install @supabase/supabase-js
 * 2. Configure SUPABASE_SERVICE_ROLE_KEY dans ton .env
 * 3. Exécute : node delete-users-admin.js
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erreur : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis')
  console.log('\n📝 Pour obtenir la clé service_role :')
  console.log('   1. Va dans Supabase Dashboard → Settings → API')
  console.log('   2. Copie la clé "service_role" (⚠️ NE JAMAIS l\'exposer publiquement)')
  console.log('   3. Ajoute-la dans ton .env : SUPABASE_SERVICE_ROLE_KEY=ton_cle_ici')
  process.exit(1)
}

// Créer le client Supabase avec la clé service_role (droits admin)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function deleteAllUsers() {
  console.log('🔍 Récupération de la liste des utilisateurs...')
  
  try {
    // Récupérer tous les utilisateurs
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', listError)
      return
    }
    
    if (!users || users.users.length === 0) {
      console.log('✅ Aucun utilisateur trouvé. La base de données est déjà vide.')
      return
    }
    
    console.log(`📊 ${users.users.length} utilisateur(s) trouvé(s)`)
    console.log('\n📋 Liste des utilisateurs :')
    users.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`)
    })
    
    console.log('\n🗑️  Suppression de tous les utilisateurs...')
    
    // Supprimer chaque utilisateur
    let deletedCount = 0
    let errorCount = 0
    
    for (const user of users.users) {
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
          console.error(`   ❌ Erreur pour ${user.email}:`, deleteError.message)
          errorCount++
        } else {
          console.log(`   ✅ ${user.email} supprimé`)
          deletedCount++
        }
      } catch (error) {
        console.error(`   ❌ Erreur pour ${user.email}:`, error.message)
        errorCount++
      }
    }
    
    console.log('\n📊 Résumé :')
    console.log(`   ✅ ${deletedCount} utilisateur(s) supprimé(s)`)
    if (errorCount > 0) {
      console.log(`   ❌ ${errorCount} erreur(s)`)
    }
    
    // Vérifier que tout est supprimé
    const { data: remainingUsers } = await supabaseAdmin.auth.admin.listUsers()
    if (remainingUsers && remainingUsers.users.length === 0) {
      console.log('\n✅ Tous les utilisateurs ont été supprimés avec succès !')
      console.log('🎉 Tu peux maintenant créer un nouveau compte.')
    } else {
      console.log(`\n⚠️  ${remainingUsers?.users.length || 0} utilisateur(s) restant(s)`)
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

// Exécuter la suppression
deleteAllUsers()

