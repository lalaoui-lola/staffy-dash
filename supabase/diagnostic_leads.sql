-- Script de diagnostic pour vérifier les leads

-- 1. Vérifier tous les leads
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
ORDER BY created_at DESC
LIMIT 20;

-- 2. Compter les leads par statut de qualité
SELECT 
    qualite,
    COUNT(*) as nombre
FROM public.leads
GROUP BY qualite;

-- 3. Compter les leads par statut conseiller
SELECT 
    statut_conseiller,
    COUNT(*) as nombre
FROM public.leads
GROUP BY statut_conseiller;

-- 4. Vérifier les leads validés
SELECT 
    id,
    nom_societe,
    nom_client,
    qualite,
    statut_conseiller,
    date_rdv
FROM public.leads
WHERE qualite = 'valide'
ORDER BY created_at DESC;

-- 5. Vérifier si la colonne statut_conseiller existe
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'leads' 
AND column_name LIKE '%conseiller%';

-- 6. Vérifier les agents
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    COUNT(l.id) as nombre_leads
FROM public.profiles p
LEFT JOIN public.leads l ON l.agent_id = p.id
WHERE p.role = 'agent'
GROUP BY p.id, p.email, p.full_name, p.role;
