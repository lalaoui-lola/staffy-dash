-- Ajouter les champs de suivi conseiller à la table leads

-- 1. Créer l'enum pour le statut conseiller
DO $$ BEGIN
    CREATE TYPE statut_conseiller AS ENUM ('en_attente', 'ok', 'non_ok', 'rappeler');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Ajouter les colonnes à la table leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS statut_conseiller statut_conseiller DEFAULT 'en_attente',
ADD COLUMN IF NOT EXISTS commentaire_conseiller TEXT,
ADD COLUMN IF NOT EXISTS date_suivi_conseiller TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS conseiller_suivi_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Mettre à jour les leads existants pour avoir le statut par défaut
UPDATE public.leads 
SET statut_conseiller = 'en_attente' 
WHERE statut_conseiller IS NULL;

-- 3. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_leads_statut_conseiller ON public.leads(statut_conseiller);

-- 4. Ajouter un commentaire pour la documentation
COMMENT ON COLUMN public.leads.statut_conseiller IS 'Statut du suivi par le conseiller: en_attente, ok, non_ok, rappeler';
COMMENT ON COLUMN public.leads.commentaire_conseiller IS 'Commentaire ajouté par le conseiller, visible par tous';
COMMENT ON COLUMN public.leads.date_suivi_conseiller IS 'Date du dernier suivi par le conseiller';
COMMENT ON COLUMN public.leads.conseiller_suivi_id IS 'ID du conseiller qui a fait le dernier suivi';
