-- Corriger les permissions pour que les conseillers voient tous les leads validés

-- 1. Vérifier les policies existantes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'leads';

-- 2. Supprimer l'ancienne policy conseiller si elle existe
DROP POLICY IF EXISTS "Conseillers can view their assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Conseillers can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "conseiller_select" ON public.leads;

-- 3. Créer une nouvelle policy pour que les conseillers voient TOUS les leads validés
CREATE POLICY "Conseillers can view all validated leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  qualite = 'valide' 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'conseiller'
  )
);

-- 4. Créer une policy pour que les conseillers puissent mettre à jour le suivi
CREATE POLICY "Conseillers can update lead tracking"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  qualite = 'valide'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'conseiller'
  )
)
WITH CHECK (
  qualite = 'valide'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'conseiller'
  )
);

-- 5. Vérifier que RLS est activé sur la table leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 6. Vérifier les nouvelles policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'leads'
AND policyname LIKE '%onseiller%';
