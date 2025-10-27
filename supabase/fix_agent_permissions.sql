-- Corriger les permissions pour que les agents voient les retours conseiller sur leurs leads

-- 1. Vérifier les policies existantes pour les agents
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'leads'
AND policyname LIKE '%agent%';

-- 2. Supprimer les anciennes policies agent si elles existent
DROP POLICY IF EXISTS "agent_select" ON public.leads;
DROP POLICY IF EXISTS "Agents can view their leads" ON public.leads;
DROP POLICY IF EXISTS "Agents can view own leads" ON public.leads;

-- 3. Créer une nouvelle policy SELECT pour que les agents voient TOUS les champs de leurs leads
CREATE POLICY "Agents can view their leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  agent_id = auth.uid()
  OR created_by = auth.uid()
);

-- 4. Vérifier la policy UPDATE pour les agents
DROP POLICY IF EXISTS "agent_update" ON public.leads;
DROP POLICY IF EXISTS "Agents can update their leads" ON public.leads;

CREATE POLICY "Agents can update their leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  agent_id = auth.uid()
  OR created_by = auth.uid()
)
WITH CHECK (
  agent_id = auth.uid()
  OR created_by = auth.uid()
);

-- 5. Vérifier la policy INSERT pour les agents
DROP POLICY IF EXISTS "agent_insert" ON public.leads;
DROP POLICY IF EXISTS "Agents can insert leads" ON public.leads;

CREATE POLICY "Agents can insert leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  agent_id = auth.uid()
  OR created_by = auth.uid()
);

-- 6. Vérifier que RLS est activé
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 7. Vérifier les nouvelles policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'leads'
AND policyname LIKE '%gent%'
ORDER BY policyname;

-- 8. Tester : Vérifier qu'un agent peut voir tous les champs
-- (Remplacez 'ID_AGENT' par un vrai ID d'agent pour tester)
/*
SELECT 
    id,
    nom_societe,
    nom_client,
    qualite,
    statut_conseiller,
    commentaire_conseiller,
    date_suivi_conseiller,
    agent_id
FROM public.leads
WHERE agent_id = 'ID_AGENT'
LIMIT 5;
*/
