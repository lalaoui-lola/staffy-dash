# Instructions de Configuration Supabase

Ce guide vous explique étape par étape comment configurer Supabase pour votre application CRM Staffy.

## 📋 Étape 1 : Créer un Projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project" ou "New Project"
3. Connectez-vous ou créez un compte
4. Créez une nouvelle organisation si nécessaire
5. Créez un nouveau projet :
   - **Name:** CRM Staffy
   - **Database Password:** Choisissez un mot de passe fort (notez-le !)
   - **Region:** Choisissez la région la plus proche
6. Attendez que le projet soit créé (2-3 minutes)

## 🔑 Étape 2 : Récupérer les Clés API

1. Dans votre projet, allez dans **Settings** (icône d'engrenage)
2. Cliquez sur **API** dans le menu latéral
3. Copiez les informations suivantes :
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon public** key (clé publique)

4. Créez un fichier `.env.local` à la racine de votre projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

## 🗄️ Étape 3 : Exécuter le Schéma SQL

1. Dans votre projet Supabase, allez dans **SQL Editor** (icône de base de données)
2. Cliquez sur **New query**
3. Ouvrez le fichier `supabase/schema.sql` de votre projet
4. Copiez **TOUT** le contenu du fichier
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)
7. Vérifiez qu'il n'y a pas d'erreurs (vous devriez voir "Success. No rows returned")

### Vérification

Pour vérifier que tout est bien créé :

1. Allez dans **Table Editor**
2. Vous devriez voir 3 tables :
   - `profiles`
   - `leads`
   - `activities`

## 👥 Étape 4 : Créer des Utilisateurs de Test

### Option A : Via l'Interface Supabase (Recommandé)

1. Allez dans **Authentication** > **Users**
2. Cliquez sur **Add user** > **Create new user**
3. Créez 3 utilisateurs :

   **Administrateur :**
   - Email: `admin@example.com`
   - Password: `password123`
   - Auto Confirm User: ✅ (coché)

   **Agent :**
   - Email: `agent@example.com`
   - Password: `password123`
   - Auto Confirm User: ✅ (coché)

   **Conseiller :**
   - Email: `conseiller@example.com`
   - Password: `password123`
   - Auto Confirm User: ✅ (coché)

4. Pour chaque utilisateur créé :
   - Cliquez sur l'utilisateur dans la liste
   - Copiez son **UUID** (identifiant unique)
   - Allez dans **SQL Editor**
   - Exécutez cette requête pour définir son rôle :

```sql
-- Pour l'administrateur
UPDATE public.profiles 
SET role = 'administrateur', full_name = 'Admin User'
WHERE id = 'UUID_DE_L_ADMIN_ICI';

-- Pour l'agent
UPDATE public.profiles 
SET role = 'agent', full_name = 'Agent User'
WHERE id = 'UUID_DE_L_AGENT_ICI';

-- Pour le conseiller
UPDATE public.profiles 
SET role = 'conseiller', full_name = 'Conseiller User'
WHERE id = 'UUID_DU_CONSEILLER_ICI';
```

### Option B : Via SQL (Alternative)

Si vous préférez, vous pouvez créer les utilisateurs directement via SQL :

```sql
-- Note: Cette méthode nécessite de définir les mots de passe hashés
-- Il est plus simple d'utiliser l'interface Authentication
```

## 📊 Étape 5 : Ajouter des Données de Test (Optionnel)

Pour tester l'application avec quelques leads, exécutez dans le SQL Editor :

```sql
-- Remplacez UUID_AGENT par l'UUID réel de votre agent
INSERT INTO public.leads (nom, prenom, email, telephone, entreprise, statut, agent_id) VALUES
('Dupont', 'Jean', 'jean.dupont@example.com', '0612345678', 'TechCorp', 'nouveau', 'UUID_AGENT'),
('Martin', 'Sophie', 'sophie.martin@example.com', '0623456789', 'InnoSoft', 'contacte', 'UUID_AGENT'),
('Bernard', 'Pierre', 'pierre.bernard@example.com', '0634567890', 'DataPro', 'qualifie', 'UUID_AGENT');
```

## 🔒 Étape 6 : Vérifier la Sécurité (RLS)

1. Allez dans **Authentication** > **Policies**
2. Vérifiez que chaque table a des policies actives :
   - `profiles` : 6 policies
   - `leads` : 9 policies
   - `activities` : 3 policies

Si les policies ne sont pas là, réexécutez le fichier `schema.sql`.

## ✅ Étape 7 : Tester la Configuration

1. Assurez-vous que votre fichier `.env.local` est bien configuré
2. Lancez l'application :
   ```bash
   npm install
   npm run dev
   ```
3. Ouvrez [http://localhost:3000](http://localhost:3000)
4. Testez la connexion avec :
   - Email: `admin@example.com`
   - Password: `password123`

## 🐛 Dépannage

### Erreur "Invalid API key"
- Vérifiez que votre `.env.local` contient les bonnes clés
- Redémarrez le serveur de développement après avoir modifié `.env.local`

### Erreur "relation does not exist"
- Les tables n'ont pas été créées correctement
- Réexécutez le fichier `schema.sql` complet

### Impossible de se connecter
- Vérifiez que l'utilisateur existe dans **Authentication** > **Users**
- Vérifiez que l'utilisateur est confirmé (colonne "Confirmed")
- Vérifiez que le profil existe dans la table `profiles`

### Les leads ne s'affichent pas
- Vérifiez les policies RLS
- Vérifiez que les leads ont bien un `agent_id` ou `conseiller_id` correspondant à votre utilisateur

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console du navigateur (F12)
2. Vérifiez les logs Supabase dans **Logs** > **API Logs**
3. Consultez la documentation Supabase : [https://supabase.com/docs](https://supabase.com/docs)

## 🎉 Félicitations !

Votre application CRM Staffy est maintenant configurée et prête à l'emploi !

### Prochaines Étapes

1. Personnalisez les rôles et permissions selon vos besoins
2. Ajoutez plus de fonctionnalités (formulaires, filtres, etc.)
3. Configurez un domaine personnalisé
4. Déployez sur Vercel ou Netlify

---

**Bon développement ! 🚀**
