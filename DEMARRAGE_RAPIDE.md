# 🚀 Démarrage Rapide - CRM Staffy

Guide ultra-rapide pour lancer votre application en 10 minutes !

## ⚡ Étapes Rapides

### 1️⃣ Installer les dépendances (2 min)

```bash
npm install
```

### 2️⃣ Configurer Supabase (5 min)

1. **Créer un projet sur [supabase.com](https://supabase.com)**
   - Inscrivez-vous gratuitement
   - Créez un nouveau projet
   - Attendez 2-3 minutes

2. **Copier les clés API**
   - Allez dans Settings > API
   - Copiez `Project URL` et `anon public key`

3. **Créer le fichier `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url_ici
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_ici
   ```

### 3️⃣ Créer la base de données (2 min)

1. Dans Supabase, allez dans **SQL Editor**
2. Copiez TOUT le contenu de `supabase/schema.sql`
3. Collez et cliquez sur **Run**
4. ✅ Vérifiez "Success"

### 4️⃣ Créer un utilisateur admin (1 min)

1. Dans Supabase, allez dans **Authentication** > **Users**
2. Cliquez sur **Add user**
3. Créez un utilisateur :
   - Email: `admin@example.com`
   - Password: `password123`
   - ✅ Cochez "Auto Confirm User"

4. Copiez l'UUID de l'utilisateur créé
5. Dans **SQL Editor**, exécutez :
   ```sql
   UPDATE public.profiles 
   SET role = 'administrateur', full_name = 'Admin'
   WHERE id = 'COLLEZ_UUID_ICI';
   ```

### 5️⃣ Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 🎯 Connexion

- **Email:** admin@example.com
- **Password:** password123

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `README.md` - Documentation complète
- `INSTRUCTIONS_SUPABASE.md` - Guide détaillé Supabase

## 🆘 Problèmes Courants

### ❌ "Invalid API key"
→ Vérifiez votre fichier `.env.local` et redémarrez le serveur

### ❌ "relation does not exist"
→ Réexécutez le fichier `schema.sql` dans Supabase

### ❌ Impossible de se connecter
→ Vérifiez que l'utilisateur est bien créé et confirmé dans Authentication

## ✨ C'est tout !

Vous êtes prêt à utiliser votre CRM ! 🎉

### Prochaines étapes :

1. Créez des utilisateurs Agent et Conseiller
2. Ajoutez des leads
3. Testez les différents rôles
4. Personnalisez selon vos besoins

---

**Besoin d'aide ?** Consultez `INSTRUCTIONS_SUPABASE.md` pour un guide détaillé.
