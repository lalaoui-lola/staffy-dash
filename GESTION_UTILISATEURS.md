# 👥 Gestion des Utilisateurs - Admin

## ✨ Nouvelle Fonctionnalité

L'administrateur peut maintenant **gérer tous les utilisateurs** depuis l'onglet "Utilisateurs" de la sidebar.

---

## 🎯 Fonctionnalités

### 1. **Voir la Liste des Utilisateurs** 👀

- ✅ Affichage de tous les utilisateurs
- ✅ Nom complet
- ✅ Email
- ✅ Badge de rôle (Admin/Agent/Conseiller)
- ✅ Barre de recherche

### 2. **Modifier un Utilisateur** ✏️

**Champs modifiables :**
- ✅ Nom complet
- ✅ Rôle (Agent/Conseiller/Administrateur)
- ❌ Email (non modifiable)

**Processus :**
1. Clic sur l'icône bleue "Modifier"
2. Modal s'ouvre avec les infos pré-remplies
3. Modification des champs
4. Validation

### 3. **Supprimer un Utilisateur** 🗑️

**Processus :**
1. Clic sur l'icône rouge "Supprimer"
2. Confirmation requise
3. Suppression de :
   - Profil dans `profiles`
   - Compte dans `auth.users`

**Sécurité :**
- ⚠️ Seuls les administrateurs peuvent supprimer
- ⚠️ Confirmation obligatoire

### 4. **Changer le Mot de Passe** 🔑

**Processus :**
1. Clic sur l'icône jaune "Clé"
2. Modal s'ouvre
3. Saisie du nouveau mot de passe (min 6 caractères)
4. Validation

**Sécurité :**
- ⚠️ Seuls les administrateurs peuvent changer
- ⚠️ Mot de passe crypté automatiquement

---

## 🎨 Interface Utilisateur

### Carte Utilisateur

```
┌─────────────────────────────────────────┐
│ 👤  Jean Dupont                         │
│     📧 jean@example.com                 │
│     🛡️ [Agent]                          │
│                                         │
│     [✏️] [🔑] [🗑️]  ← Actions          │
└─────────────────────────────────────────┘
```

### Boutons d'Action

1. **Modifier** (Bleu)
   - Icône : Edit
   - Couleur : bg-blue-100
   - Hover : scale-110

2. **Changer MDP** (Jaune)
   - Icône : Key
   - Couleur : bg-yellow-100
   - Hover : scale-110

3. **Supprimer** (Rouge)
   - Icône : Trash2
   - Couleur : bg-red-100
   - Hover : scale-110

---

## 🔧 Composant Créé

### `UsersManagement.tsx`

**Props :**
```typescript
interface UsersManagementProps {
  users: Profile[]
  onUserUpdated: () => void
}
```

**État :**
```typescript
const [searchTerm, setSearchTerm] = useState('')
const [editingUser, setEditingUser] = useState<Profile | null>(null)
const [changingPassword, setChangingPassword] = useState<Profile | null>(null)
const [newPassword, setNewPassword] = useState('')
```

**Fonctions :**
- `handleDeleteUser()` : Supprime un utilisateur
- `handleUpdateUser()` : Modifie un utilisateur
- `handleChangePassword()` : Change le mot de passe

---

## 🗄️ Fonctions SQL

### 1. `delete_user(user_id UUID)`

**Fichier :** `supabase/user_management_functions.sql`

```sql
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
    RAISE EXCEPTION 'Seuls les administrateurs peuvent supprimer';
  END IF;

  -- Supprimer le profil
  DELETE FROM profiles WHERE id = user_id;
  
  -- Supprimer l'utilisateur de auth.users
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;
```

**Sécurité :**
- `SECURITY DEFINER` : Exécuté avec les droits du créateur
- Vérification du rôle admin
- Suppression en cascade

---

### 2. `change_user_password(user_id UUID, new_password TEXT)`

```sql
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
    RAISE EXCEPTION 'Seuls les administrateurs peuvent changer les MDP';
  END IF;

  -- Changer le mot de passe
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$;
```

**Sécurité :**
- `SECURITY DEFINER` : Accès à `auth.users`
- Vérification du rôle admin
- Cryptage avec bcrypt

---

## 📊 Flux de Données

### Suppression d'Utilisateur

```
1. Clic sur "Supprimer"
   ↓
2. Confirmation
   ↓
3. supabase.rpc('delete_user', { user_id })
   ↓
4. Fonction SQL vérifie admin
   ↓
5. Suppression profiles + auth.users
   ↓
6. onUserUpdated() → Rechargement
   ↓
7. Message de succès
```

### Modification d'Utilisateur

```
1. Clic sur "Modifier"
   ↓
2. Modal s'ouvre avec données
   ↓
3. Modification des champs
   ↓
4. Validation du formulaire
   ↓
5. supabase.from('profiles').update()
   ↓
6. onUserUpdated() → Rechargement
   ↓
7. Message de succès
```

### Changement de Mot de Passe

```
1. Clic sur "Clé"
   ↓
2. Modal s'ouvre
   ↓
3. Saisie nouveau mot de passe
   ↓
4. Validation (min 6 caractères)
   ↓
5. supabase.rpc('change_user_password', { user_id, new_password })
   ↓
6. Fonction SQL crypte et met à jour
   ↓
7. Message de succès
```

---

## 🎨 Modals

### Modal de Modification

**Header :**
- Gradient bleu → indigo
- Icône Edit
- Titre "Modifier l'utilisateur"

**Champs :**
1. Nom complet (input text)
2. Email (disabled)
3. Rôle (select)

**Boutons :**
- Annuler (gris)
- Modifier (gradient bleu)

---

### Modal de Changement de MDP

**Header :**
- Gradient jaune → orange
- Icône Key
- Titre "Changer le mot de passe"

**Champs :**
1. Utilisateur (disabled)
2. Nouveau mot de passe (input password, min 6)

**Boutons :**
- Annuler (gris)
- Changer (gradient jaune)

---

## 🔍 Barre de Recherche

**Fonctionnalités :**
- Recherche en temps réel
- Filtre par nom OU email
- Insensible à la casse
- Icône Search qui change de couleur au focus

**Code :**
```typescript
const filteredUsers = users.filter(user => 
  user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
)
```

---

## 🎯 Badge de Rôle

**Couleurs :**
```typescript
const getRoleBadge = (role: string) => {
  const colors = {
    administrateur: 'bg-red-100 text-red-800 border-red-200',
    agent: 'bg-blue-100 text-blue-800 border-blue-200',
    conseiller: 'bg-green-100 text-green-800 border-green-200'
  }
  return colors[role]
}
```

**Affichage :**
- Icône Shield
- Texte du rôle
- Bordure colorée

---

## ⚠️ Gestion des Erreurs

### Messages d'Erreur

```typescript
setError('Erreur lors de la suppression: ' + err.message)
setError('Erreur lors de la modification: ' + err.message)
setError('Le mot de passe doit contenir au moins 6 caractères')
```

**Affichage :**
- Fond rouge clair
- Bordure rouge
- Animation fadeIn
- Auto-disparition après 3s

### Messages de Succès

```typescript
setSuccess('Utilisateur supprimé avec succès')
setSuccess('Utilisateur modifié avec succès')
setSuccess('Mot de passe modifié avec succès')
```

**Affichage :**
- Fond vert clair
- Bordure verte
- Animation fadeIn
- Auto-disparition après 3s

---

## 🚀 Navigation

### Depuis la Sidebar

1. Clic sur "Utilisateurs" dans la sidebar
2. `activeTab` passe à 'users'
3. Affichage du composant `UsersManagement`
4. Header change : "Gestion des Utilisateurs"

### Code

```typescript
{activeTab === 'users' ? (
  <UsersManagement users={users} onUserUpdated={loadData} />
) : (
  /* Page Leads */
)}
```

---

## 📱 Responsive

### Desktop
- Cartes full width
- 3 boutons d'action visibles
- Modal centrée

### Mobile
- Cartes empilées
- Boutons plus petits
- Modal adaptée

---

## 🔒 Sécurité

### Vérifications Côté Serveur

1. **Fonction `delete_user` :**
   - Vérifie que l'appelant est admin
   - Empêche la suppression par non-admin

2. **Fonction `change_user_password` :**
   - Vérifie que l'appelant est admin
   - Crypte le mot de passe avec bcrypt

### Permissions

```sql
GRANT EXECUTE ON FUNCTION delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION change_user_password(UUID, TEXT) TO authenticated;
```

---

## 📋 Instructions d'Utilisation

### 1. Exécuter le SQL

**Dans Supabase SQL Editor :**
```sql
-- Copier et exécuter le contenu de :
supabase/user_management_functions.sql
```

### 2. Accéder à la Page

1. Connectez-vous en tant qu'admin
2. Allez sur `/admin`
3. Cliquez sur "Utilisateurs" dans la sidebar

### 3. Gérer les Utilisateurs

**Modifier :**
1. Clic sur l'icône bleue
2. Modifiez les champs
3. Validez

**Changer le MDP :**
1. Clic sur l'icône jaune
2. Saisissez le nouveau MDP
3. Validez

**Supprimer :**
1. Clic sur l'icône rouge
2. Confirmez
3. Utilisateur supprimé

---

## ✨ Résumé

**L'admin peut maintenant :**

1. ✅ **Voir** tous les utilisateurs
2. ✅ **Rechercher** par nom ou email
3. ✅ **Modifier** le nom et le rôle
4. ✅ **Supprimer** un utilisateur
5. ✅ **Changer** le mot de passe
6. ✅ **Interface moderne** avec glassmorphism
7. ✅ **Sécurité** : vérifications côté serveur

---

## 🚀 Testez Maintenant !

**Ouvrez** http://localhost:3000/admin

**Étapes :**
1. Cliquez sur "Utilisateurs" dans la sidebar
2. Voyez la liste de tous les utilisateurs
3. Testez la recherche
4. Cliquez sur "Modifier" (icône bleue)
5. Cliquez sur "Clé" (icône jaune)
6. Cliquez sur "Supprimer" (icône rouge)

**Tout fonctionne avec des modals modernes et sécurisés !** 🎉

*Gestion des Utilisateurs - 23 octobre 2024*
