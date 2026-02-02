-- ============================================
-- SCRIPT COMPLET POUR VIDER TOUTE LA BASE DE DONNÉES
-- ATTENTION : Cette action est IRRÉVERSIBLE !
-- ============================================

-- ⚠️ AVERTISSEMENT : Ce script va supprimer TOUT :
-- - Tous les utilisateurs Supabase Auth
-- - Toutes les données de toutes les tables
-- - Tous les profils utilisateurs
-- 
-- Assure-toi d'avoir fait une sauvegarde si nécessaire !

-- ============================================
-- ÉTAPE 1 : Supprimer TOUTES les données des tables
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
-- ÉTAPE 2 : Supprimer TOUS les utilisateurs Supabase Auth
-- ============================================
-- ⚠️ IMPORTANT : Cette commande nécessite les privilèges ADMIN
-- Si tu as une erreur de permissions, utilise le Dashboard Supabase

-- Supprimer TOUS les utilisateurs Auth (nécessite service_role)
DELETE FROM auth.users;

-- ============================================
-- ÉTAPE 3 : Vérifier que TOUT est supprimé
-- ============================================

-- Vérifier le nombre d'utilisateurs (devrait être 0)
SELECT 
    'auth.users' as table_name, 
    COUNT(*) as row_count 
FROM auth.users;

-- Vérifier toutes les tables (devrait être 0 pour toutes)
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
-- ÉTAPE 4 : Réinitialiser les séquences (optionnel)
-- ============================================
-- Si tu veux aussi réinitialiser les IDs auto-incrémentés

-- Note: Les tables utilisent UUID, donc pas besoin de réinitialiser les séquences

-- ============================================
-- MESSAGE DE CONFIRMATION
-- ============================================
-- ✅ Tous les utilisateurs et toutes les données ont été supprimés !
-- Tu peux maintenant créer un nouveau compte sans problème.

