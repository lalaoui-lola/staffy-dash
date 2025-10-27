-- =====================================================
-- MISE À JOUR DU SCHÉMA LEADS - NOUVEAUX CHAMPS
-- =====================================================
-- Exécutez ce script dans Supabase SQL Editor
-- =====================================================

-- 1. Supprimer l'ancienne table leads si elle existe
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;

-- 2. Supprimer l'ancien enum lead_status
DROP TYPE IF EXISTS lead_status CASCADE;
DROP TYPE IF EXISTS qualite_status CASCADE;

-- 3. Créer le nouvel enum pour la qualité
CREATE TYPE qualite_status AS ENUM ('valide', 'non_valide');

-- 4. Recréer la table leads avec les nouveaux champs
CREATE TABLE public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Informations société
    nom_societe TEXT NOT NULL,
    nom_client TEXT NOT NULL,
    telephone TEXT,
    mail TEXT,
    formule_juridique TEXT,
    departement TEXT,
    numero_siret TEXT,
    
    -- Informations RDV
    date_rdv DATE,
    heure_rdv TIME,
    
    -- Qualité et commentaire
    qualite qualite_status DEFAULT 'non_valide',
    commentaire TEXT,
    
    -- Assignation
    agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    conseiller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Dates
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Recréer la table activities
CREATE TABLE public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    date_activite TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Trigger pour updated_at
CREATE TRIGGER set_updated_at_leads
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Activer RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 8. Supprimer les anciennes policies
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Agents can view their leads" ON public.leads;
DROP POLICY IF EXISTS "Conseillers can view their leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Agents can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update all leads" ON public.leads;
DROP POLICY IF EXISTS "Agents can update their leads" ON public.leads;
DROP POLICY IF EXISTS "Conseillers can update their leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;

-- 9. Recréer les policies pour leads
CREATE POLICY "Admins can view all leads"
    ON public.leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

CREATE POLICY "Agents can view their leads"
    ON public.leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'agent'
        ) AND agent_id = auth.uid()
    );

CREATE POLICY "Conseillers can view their leads"
    ON public.leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'conseiller'
        ) AND conseiller_id = auth.uid()
    );

CREATE POLICY "Admins can insert leads"
    ON public.leads FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

CREATE POLICY "Agents can insert leads"
    ON public.leads FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'agent'
        )
    );

CREATE POLICY "Admins can update all leads"
    ON public.leads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

CREATE POLICY "Agents can update their leads"
    ON public.leads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'agent'
        ) AND agent_id = auth.uid()
    );

CREATE POLICY "Conseillers can update their leads"
    ON public.leads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'conseiller'
        ) AND conseiller_id = auth.uid()
    );

CREATE POLICY "Admins can delete leads"
    ON public.leads FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

CREATE POLICY "Agents can delete their leads"
    ON public.leads FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'agent'
        ) AND agent_id = auth.uid()
    );

-- 10. Policies pour activities
DROP POLICY IF EXISTS "Users can view activities of their leads" ON public.activities;
DROP POLICY IF EXISTS "Users can insert activities for their leads" ON public.activities;
DROP POLICY IF EXISTS "Admins can delete activities" ON public.activities;

CREATE POLICY "Users can view activities of their leads"
    ON public.activities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.leads l
            WHERE l.id = lead_id
            AND (
                l.agent_id = auth.uid()
                OR l.conseiller_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role = 'administrateur'
                )
            )
        )
    );

CREATE POLICY "Users can insert activities for their leads"
    ON public.activities FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.leads l
            WHERE l.id = lead_id
            AND (
                l.agent_id = auth.uid()
                OR l.conseiller_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role = 'administrateur'
                )
            )
        )
    );

CREATE POLICY "Admins can delete activities"
    ON public.activities FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

-- 11. Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO anon, authenticated, service_role;

-- =====================================================
-- TERMINÉ !
-- =====================================================
