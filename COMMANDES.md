# 📝 Commandes à Exécuter

## 🚀 Installation et Lancement

### 1. Installer les dépendances
```bash
npm install
```

### 2. Créer le fichier de configuration
Créez un fichier `.env.local` à la racine avec :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 3. Lancer l'application en mode développement
```bash
npm run dev
```

### 4. Ouvrir dans le navigateur
```
http://localhost:3000
```

## 🗄️ SQL à Exécuter dans Supabase

### Étape 1 : Créer les tables et la sécurité
Copiez **TOUT** le contenu du fichier `supabase/schema.sql` et exécutez-le dans le SQL Editor de Supabase.

### Étape 2 : Créer un utilisateur administrateur
Après avoir créé un utilisateur dans Authentication > Users, exécutez :

```sql
-- Remplacez UUID_ICI par l'UUID de votre utilisateur
UPDATE public.profiles 
SET role = 'administrateur', full_name = 'Administrateur'
WHERE id = 'UUID_ICI';
```

### Étape 3 : Créer un utilisateur agent (optionnel)
```sql
-- Remplacez UUID_ICI par l'UUID de votre utilisateur agent
UPDATE public.profiles 
SET role = 'agent', full_name = 'Agent Commercial'
WHERE id = 'UUID_ICI';
```

### Étape 4 : Créer un utilisateur conseiller (optionnel)
```sql
-- Remplacez UUID_ICI par l'UUID de votre utilisateur conseiller
UPDATE public.profiles 
SET role = 'conseiller', full_name = 'Conseiller'
WHERE id = 'UUID_ICI';
```

### Étape 5 : Ajouter des leads de test (optionnel)
```sql
-- Remplacez UUID_AGENT par l'UUID de votre agent
INSERT INTO public.leads (nom, prenom, email, telephone, entreprise, statut, source, budget, agent_id) VALUES
('Dupont', 'Jean', 'jean.dupont@example.com', '0612345678', 'TechCorp', 'nouveau', 'Site web', 50000, 'UUID_AGENT'),
('Martin', 'Sophie', 'sophie.martin@example.com', '0623456789', 'InnoSoft', 'contacte', 'Référence', 75000, 'UUID_AGENT'),
('Bernard', 'Pierre', 'pierre.bernard@example.com', '0634567890', 'DataPro', 'qualifie', 'LinkedIn', 100000, 'UUID_AGENT'),
('Dubois', 'Marie', 'marie.dubois@example.com', '0645678901', 'CloudTech', 'negocie', 'Salon', 120000, 'UUID_AGENT'),
('Petit', 'Luc', 'luc.petit@example.com', '0656789012', 'WebAgency', 'gagne', 'Appel', 80000, 'UUID_AGENT');
```

## 🔍 Vérifications

### Vérifier que les tables sont créées
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Vous devriez voir : `profiles`, `leads`, `activities`

### Vérifier les utilisateurs
```sql
SELECT id, email, full_name, role 
FROM public.profiles;
```

### Vérifier les leads
```sql
SELECT id, nom, prenom, entreprise, statut 
FROM public.leads;
```

### Vérifier les policies RLS
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🛠️ Commandes de Développement

### Lancer en mode développement
```bash
npm run dev
```

### Compiler pour la production
```bash
npm run build
```

### Lancer en mode production
```bash
npm run start
```

### Vérifier les erreurs TypeScript
```bash
npm run lint
```

## 📦 Commandes NPM Utiles

### Installer une nouvelle dépendance
```bash
npm install nom-du-package
```

### Mettre à jour les dépendances
```bash
npm update
```

### Nettoyer et réinstaller
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🌐 URLs Importantes

- **Application locale :** http://localhost:3000
- **Page de connexion :** http://localhost:3000/login
- **Dashboard Admin :** http://localhost:3000/admin
- **Dashboard Agent :** http://localhost:3000/agent
- **Dashboard Conseiller :** http://localhost:3000/conseiller

## 🔑 Identifiants de Test

Après avoir créé les utilisateurs dans Supabase :

- **Admin :** admin@example.com / password123
- **Agent :** agent@example.com / password123
- **Conseiller :** conseiller@example.com / password123

## 📚 Fichiers de Documentation

- `README.md` - Documentation complète du projet
- `INSTRUCTIONS_SUPABASE.md` - Guide détaillé Supabase
- `DEMARRAGE_RAPIDE.md` - Guide de démarrage rapide
- `RESUME_PROJET.md` - Résumé de ce qui a été créé
- `COMMANDES.md` - Ce fichier

---

**💡 Astuce :** Gardez ce fichier ouvert pendant la configuration !
