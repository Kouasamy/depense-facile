/**
 * Script pour nettoyer la base de données locale (IndexedDB)
 * Exécute ce script dans la console du navigateur pour supprimer toutes les données locales
 */

// Fonction pour supprimer toutes les données de IndexedDB
async function clearAllLocalData() {
  console.log('🧹 Début du nettoyage de la base de données locale...');
  
  try {
    // Ouvrir la base de données
    const dbName = 'DepenseFacileDB';
    const request = indexedDB.deleteDatabase(dbName);
    
    request.onsuccess = () => {
      console.log('✅ Base de données locale supprimée avec succès !');
      console.log('🔄 Recharge la page pour réinitialiser la base de données.');
    };
    
    request.onerror = () => {
      console.error('❌ Erreur lors de la suppression de la base de données:', request.error);
    };
    
    request.onblocked = () => {
      console.warn('⚠️ La suppression est bloquée. Ferme tous les onglets ouverts de l\'application.');
    };
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le nettoyage
clearAllLocalData();

// Instructions pour l'utilisateur
console.log('\n📝 Instructions :');
console.log('1. Ce script va supprimer toutes les données locales (IndexedDB)');
console.log('2. Recharge la page après la suppression');
console.log('3. Pour supprimer les données Supabase, utilise le fichier CLEAR_ALL_DATA.sql dans le SQL Editor de Supabase');

