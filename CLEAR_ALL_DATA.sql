-- ============================================
-- Script pour supprimer TOUTES les données utilisateurs
-- ATTENTION : Cette action est IRRÉVERSIBLE !
-- ============================================

-- ⚠️ AVERTISSEMENT : Ce script va supprimer TOUTES les données de tous les utilisateurs
-- Assure-toi d'avoir fait une sauvegarde si nécessaire avant d'exécuter ce script

-- ============================================
-- ÉTAPE 1 : Supprimer toutes les données des tables
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
-- ÉTAPE 2 : Vérifier que les tables sont vides
-- ============================================

-- Vérifier le nombre de lignes restantes (devrait être 0 pour toutes)
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
-- ÉTAPE 3 : Supprimer les utilisateurs de Supabase Auth
-- ============================================
-- NOTE : Cette partie doit être faite manuellement dans le dashboard Supabase
-- car elle nécessite des privilèges admin
--
-- Pour supprimer les utilisateurs :
-- 1. Va dans Supabase Dashboard → Authentication → Users
-- 2. Sélectionne tous les utilisateurs
-- 3. Clique sur "Delete" ou utilise l'API Admin
--
-- OU utilise cette commande dans le SQL Editor (nécessite service_role key) :
-- DELETE FROM auth.users;

-- ============================================
-- RÉINITIALISER LES SÉQUENCES (optionnel)
-- ============================================
-- Si tu veux aussi réinitialiser les IDs auto-incrémentés :

-- ALTER SEQUENCE expenses_id_seq RESTART WITH 1;
-- ALTER SEQUENCE incomes_id_seq RESTART WITH 1;
-- ALTER SEQUENCE budgets_id_seq RESTART WITH 1;
-- ALTER SEQUENCE user_profiles_id_seq RESTART WITH 1;
-- ALTER SEQUENCE user_onboarding_id_seq RESTART WITH 1;

-- ============================================
-- MESSAGE DE CONFIRMATION
-- ============================================
-- ✅ Toutes les données ont été supprimées !
-- Tu peux maintenant tester l'application avec une base de données vide.

