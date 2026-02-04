/**
 * Script à coller dans la console du navigateur pour nettoyer toutes les données locales
 * 
 * Copiez-collez ce code dans la console (F12) et appuyez sur Entrée
 */

(async function nettoyerBaseLocale() {
  console.log('🗑️ Début du nettoyage...')
  
  const results = []
  
  // 1. Nettoyer IndexedDB
  try {
    const dbName = 'DepenseFacileDB'
    const deleteReq = indexedDB.deleteDatabase(dbName)
    
    await new Promise((resolve, reject) => {
      deleteReq.onsuccess = () => {
        console.log('✅ IndexedDB supprimé')
        results.push('IndexedDB supprimé')
        resolve()
      }
      deleteReq.onerror = () => {
        console.log('⚠️ IndexedDB : Erreur (peut-être déjà supprimé)')
        results.push('IndexedDB : Erreur')
        resolve()
      }
      deleteReq.onblocked = () => {
        console.log('⚠️ IndexedDB : Base de données bloquée (fermez les autres onglets)')
        results.push('IndexedDB : Bloqué')
        resolve()
      }
    })
  } catch (error) {
    console.error('❌ Erreur IndexedDB:', error)
    results.push('IndexedDB : ' + error.message)
  }
  
  // 2. Nettoyer localStorage
  try {
    const localStorageKeys = Object.keys(localStorage)
    localStorageKeys.forEach(key => localStorage.removeItem(key))
    console.log(`✅ localStorage nettoyé (${localStorageKeys.length} clés)`)
    results.push(`localStorage nettoyé (${localStorageKeys.length} clés)`)
  } catch (error) {
    console.error('❌ Erreur localStorage:', error)
    results.push('localStorage : ' + error.message)
  }
  
  // 3. Nettoyer sessionStorage
  try {
    const sessionStorageKeys = Object.keys(sessionStorage)
    sessionStorageKeys.forEach(key => sessionStorage.removeItem(key))
    console.log(`✅ sessionStorage nettoyé (${sessionStorageKeys.length} clés)`)
    results.push(`sessionStorage nettoyé (${sessionStorageKeys.length} clés)`)
  } catch (error) {
    console.error('❌ Erreur sessionStorage:', error)
    results.push('sessionStorage : ' + error.message)
  }
  
  // 4. Nettoyer le cache
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      console.log(`✅ Cache nettoyé (${cacheNames.length} caches)`)
      results.push(`Cache nettoyé (${cacheNames.length} caches)`)
    }
  } catch (error) {
    console.error('❌ Erreur cache:', error)
    results.push('Cache : ' + error.message)
  }
  
  console.log('✅ Nettoyage terminé !')
  console.log('📋 Résultats:', results)
  console.log('🔄 Rechargez la page pour que les changements prennent effet.')
  
  return results
})()

