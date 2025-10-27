-- Script de test pour vérifier l'accès des conseillers aux leads

-- 1. Lister tous les conseillers
SELECT 
    id,
    email,
    full_name,
    role
FROM public.profiles
WHERE role = 'conseiller';

-- 2. Lister tous les leads validés (vue admin)
SELECT 
    id,
    nom_societe,
    nom_client,
    qualite,
    statut_conseiller,
    agent_id,
    date_rdv,
    created_at
FROM public.leads
WHERE qualite = 'valide'
ORDER BY created_at DESC;

-- 3. Compter les leads par statut de qualité
SELECT 
    qualite,
    COUNT(*) as nombre
FROM public.leads
GROUP BY qualite;

-- 4. Vérifier les policies RLS sur la table leads
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY policyname;

-- 5. Vérifier si RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'leads';

-- 6. Test : Simuler une requête conseiller
-- (Remplacez 'ID_DU_CONSEILLER' par un vrai ID de conseiller)
/*
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'ID_DU_CONSEILLER';

SELECT 
    id,
    nom_societe,
    nom_client,
    qualite
FROM public.leads
WHERE qualite = 'valide';
*/

-- 7. Vérifier les colonnes de la table leads
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;
