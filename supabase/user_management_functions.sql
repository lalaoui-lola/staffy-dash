-- Fonction pour supprimer un utilisateur (admin seulement)
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur appelant est admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'administrateur'
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent supprimer des utilisateurs';
  END IF;

  -- Supprimer le profil (cascade supprimera les leads associés si configuré)
  DELETE FROM profiles WHERE id = user_id;
  
  -- Supprimer l'utilisateur de auth.users
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Fonction pour changer le mot de passe d'un utilisateur (admin seulement)
CREATE OR REPLACE FUNCTION change_user_password(user_id UUID, new_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur appelant est admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'administrateur'
  ) THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent changer les mots de passe';
  END IF;

  -- Changer le mot de passe
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION change_user_password(UUID, TEXT) TO authenticated;
