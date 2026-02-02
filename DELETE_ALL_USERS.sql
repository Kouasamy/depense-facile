-- ============================================
-- Script pour SUPPRIMER TOUS LES UTILISATEURS Supabase Auth
-- ATTENTION : Cette action est IRRÉVERSIBLE !
-- ============================================

-- ⚠️ AVERTISSEMENT : Ce script va supprimer TOUS les utilisateurs de Supabase Auth
-- Assure-toi d'avoir fait une sauvegarde si nécessaire avant d'exécuter ce script

-- ============================================
-- IMPORTANT : Ce script nécessite les privilèges ADMIN
-- ============================================
-- Pour exécuter ce script, tu dois :
-- 1. Utiliser la clé "service_role" (pas la clé "anon")
-- 2. OU exécuter depuis le dashboard Supabase avec les droits admin
-- 3. OU utiliser l'API Admin de Supabase

-- ============================================
-- ÉTAPE 1 : Supprimer toutes les données utilisateurs (d'abord)
-- ============================================

-- Supprimer toutes les dépenses
DELETE FROM expenses;

-- Supprimer tous les revenus
DELETE FROM incomes;

-- Supprimer tous les budgets
DELETE FROM budgets;

-- Supprimer tous les profils utilisateurs
DELETE FROM user_profiles;

-- Supprimer tous les statuts d'onboarding
DELETE FROM user_onboarding;

-- ============================================
-- ÉTAPE 2 : Supprimer TOUS les utilisateurs de Supabase Auth
-- ============================================

-- ⚠️ ATTENTION : Cette commande supprime TOUS les utilisateurs
-- Elle nécessite les privilèges admin (service_role key)

DELETE FROM auth.users;

-- ============================================
-- ÉTAPE 3 : Vérifier que tout est supprimé
-- ============================================

-- Vérifier le nombre d'utilisateurs (devrait être 0)
SELECT COUNT(*) as total_users FROM auth.users;

-- Vérifier les tables de données (devrait être 0 pour toutes)
SELECT 
    'expenses' as table_name, COUNT(*) as row_count FROM expenses
UNION ALL
SELECT 
    'incomes' as table_name, COUNT(*) as row_count FROM incomes
UNION ALL
SELECT 
    'budgets' as table_name, COUNT(*) as row_count FROM budgets
UNION ALL
SELECT 
    'user_profiles' as table_name, COUNT(*) as row_count FROM user_profiles
UNION ALL
SELECT 
    'user_onboarding' as table_name, COUNT(*) as row_count FROM user_onboarding;

-- ============================================
-- ALTERNATIVE : Si DELETE FROM auth.users ne fonctionne pas
-- ============================================

-- Tu peux aussi supprimer les utilisateurs un par un :
-- SELECT id, email FROM auth.users;
-- DELETE FROM auth.users WHERE id = 'user-id-here';

-- ============================================
-- MESSAGE DE CONFIRMATION
-- ============================================
-- ✅ Tous les utilisateurs et toutes les données ont été supprimés !
-- Tu peux maintenant créer un nouveau compte sans problème.

