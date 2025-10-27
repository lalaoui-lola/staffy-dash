-- =====================================================
-- CONFIGURATION COMPLÈTE SUPABASE - CRM STAFFY
-- =====================================================
-- Copiez et exécutez TOUT ce script dans le SQL Editor de Supabase
-- =====================================================

-- 1. Créer les types ENUM
CREATE TYPE user_role AS ENUM ('administrateur', 'agent', 'conseiller');
CREATE TYPE lead_status AS ENUM ('nouveau', 'contacte', 'qualifie', 'negocie', 'gagne', 'perdu');

-- 2. Table des profils utilisateurs
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'agent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des leads
CREATE TABLE public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT,
    telephone TEXT,
    entreprise TEXT,
    poste TEXT,
    statut lead_status DEFAULT 'nouveau',
    source TEXT,
    budget DECIMAL(10, 2),
    notes TEXT,
    agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    conseiller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des activités
CREATE TABLE public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    date_activite TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Fonction pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'agent')
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- En cas d'erreur, on continue quand même
        RETURN NEW;
END;
$$;

-- 6. Trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 7. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Triggers pour updated_at
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_leads
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES POUR PROFILES
-- =====================================================

-- Tout le monde peut voir son propre profil
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Les admins peuvent voir tous les profils
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

-- Les admins peuvent créer des profils (pour créer des utilisateurs)
CREATE POLICY "Admins can insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

-- Les admins peuvent modifier tous les profils
CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Les admins peuvent supprimer des profils
CREATE POLICY "Admins can delete profiles"
    ON public.profiles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

-- =====================================================
-- POLICIES POUR LEADS
-- =====================================================

-- Les admins voient tous les leads
CREATE POLICY "Admins can view all leads"
    ON public.leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

-- Les agents voient leurs propres leads
CREATE POLICY "Agents can view their leads"
    ON public.leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'agent'
        ) AND agent_id = auth.uid()
    );

-- Les conseillers voient leurs leads assignés
CREATE POLICY "Conseillers can view their leads"
    ON public.leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'conseiller'
        ) AND conseiller_id = auth.uid()
    );

-- Les admins peuvent créer des leads
CREATE POLICY "Admins can insert leads"
    ON public.leads FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

-- Les agents peuvent créer des leads
CREATE POLICY "Agents can insert leads"
    ON public.leads FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'agent'
        )
    );

-- Les admins peuvent modifier tous les leads
CREATE POLICY "Admins can update all leads"
    ON public.leads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

-- Les agents peuvent modifier leurs leads
CREATE POLICY "Agents can update their leads"
    ON public.leads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'agent'
        ) AND agent_id = auth.uid()
    );

-- Les conseillers peuvent modifier leurs leads assignés
CREATE POLICY "Conseillers can update their leads"
    ON public.leads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'conseiller'
        ) AND conseiller_id = auth.uid()
    );

-- Les admins peuvent supprimer des leads
CREATE POLICY "Admins can delete leads"
    ON public.leads FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

-- =====================================================
-- POLICIES POUR ACTIVITIES
-- =====================================================

-- Les utilisateurs voient les activités de leurs leads
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

-- Les utilisateurs peuvent créer des activités pour leurs leads
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

-- Les admins peuvent supprimer des activités
CREATE POLICY "Admins can delete activities"
    ON public.activities FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'administrateur'
        )
    );

-- =====================================================
-- FONCTIONS UTILES
-- =====================================================

-- Fonction pour obtenir le rôle de l'utilisateur actuel
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques des leads
CREATE OR REPLACE FUNCTION public.get_lead_stats(user_id UUID DEFAULT NULL)
RETURNS TABLE (
    total_leads BIGINT,
    nouveaux BIGINT,
    contactes BIGINT,
    qualifies BIGINT,
    negocies BIGINT,
    gagnes BIGINT,
    perdus BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE statut = 'nouveau') as nouveaux,
        COUNT(*) FILTER (WHERE statut = 'contacte') as contactes,
        COUNT(*) FILTER (WHERE statut = 'qualifie') as qualifies,
        COUNT(*) FILTER (WHERE statut = 'negocie') as negocies,
        COUNT(*) FILTER (WHERE statut = 'gagne') as gagnes,
        COUNT(*) FILTER (WHERE statut = 'perdu') as perdus
    FROM public.leads
    WHERE 
        CASE 
            WHEN user_id IS NULL THEN TRUE
            ELSE agent_id = user_id OR conseiller_id = user_id
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- =====================================================
-- TERMINÉ !
-- =====================================================
-- Maintenant, créez votre premier utilisateur administrateur :
-- 1. Allez dans Authentication > Users
-- 2. Créez un utilisateur avec email et password
-- 3. Copiez son UUID
-- 4. Exécutez la commande suivante (remplacez UUID_ICI) :
--
-- UPDATE public.profiles 
-- SET role = 'administrateur', full_name = 'Administrateur'
-- WHERE id = 'UUID_ICI';
--
-- =====================================================
