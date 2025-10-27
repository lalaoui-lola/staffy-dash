-- =====================================================
-- FONCTIONS POUR L'ADMINISTRATION DES UTILISATEURS
-- =====================================================
-- Exécutez ce script pour permettre aux admins de créer des utilisateurs
-- =====================================================

-- 1. Fonction pour permettre aux admins de créer des utilisateurs
CREATE OR REPLACE FUNCTION public.admin_create_user(
    user_email TEXT,
    user_password TEXT,
    user_full_name TEXT,
    user_role user_role
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    new_user_id UUID;
    result JSON;
BEGIN
    -- Vérifier que l'utilisateur actuel est un administrateur
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'administrateur'
    ) THEN
        RAISE EXCEPTION 'Seuls les administrateurs peuvent créer des utilisateurs';
    END IF;

    -- Note: Cette fonction ne peut pas créer directement l'utilisateur dans auth.users
    -- car cela nécessite des permissions spéciales.
    -- L'utilisateur doit être créé via l'API Supabase côté client.
    
    -- Cette fonction peut être utilisée pour valider et préparer les données
    result := json_build_object(
        'email', user_email,
        'full_name', user_full_name,
        'role', user_role,
        'status', 'ready_to_create'
    );
    
    RETURN result;
END;
$$;

-- 2. Fonction pour mettre à jour le rôle d'un utilisateur (réservée aux admins)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
    target_user_id UUID,
    new_role user_role
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Vérifier que l'utilisateur actuel est un administrateur
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'administrateur'
    ) THEN
        RAISE EXCEPTION 'Seuls les administrateurs peuvent modifier les rôles';
    END IF;

    -- Mettre à jour le rôle
    UPDATE public.profiles
    SET role = new_role, updated_at = NOW()
    WHERE id = target_user_id;

    RETURN TRUE;
END;
$$;

-- 3. Fonction pour supprimer un utilisateur (réservée aux admins)
CREATE OR REPLACE FUNCTION public.admin_delete_user(
    target_user_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Vérifier que l'utilisateur actuel est un administrateur
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'administrateur'
    ) THEN
        RAISE EXCEPTION 'Seuls les administrateurs peuvent supprimer des utilisateurs';
    END IF;

    -- Empêcher la suppression du dernier admin
    IF (SELECT role FROM public.profiles WHERE id = target_user_id) = 'administrateur' THEN
        IF (SELECT COUNT(*) FROM public.profiles WHERE role = 'administrateur') <= 1 THEN
            RAISE EXCEPTION 'Impossible de supprimer le dernier administrateur';
        END IF;
    END IF;

    -- Supprimer le profil (cela supprimera aussi l'utilisateur auth grâce à ON DELETE CASCADE)
    DELETE FROM public.profiles WHERE id = target_user_id;

    RETURN TRUE;
END;
$$;

-- 4. Fonction pour obtenir la liste de tous les utilisateurs (réservée aux admins)
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    role user_role,
    created_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Vérifier que l'utilisateur actuel est un administrateur
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'administrateur'
    ) THEN
        RAISE EXCEPTION 'Seuls les administrateurs peuvent voir tous les utilisateurs';
    END IF;

    RETURN QUERY
    SELECT p.id, p.email, p.full_name, p.role, p.created_at
    FROM public.profiles p
    ORDER BY p.created_at DESC;
END;
$$;

-- 5. Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.admin_create_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_all_users TO authenticated;

-- =====================================================
-- TERMINÉ !
-- =====================================================
-- Les administrateurs peuvent maintenant :
-- - Créer des utilisateurs via l'interface
-- - Modifier les rôles
-- - Supprimer des utilisateurs
-- - Voir tous les utilisateurs
-- =====================================================
