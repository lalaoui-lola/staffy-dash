# CRM Staffy - Application de Gestion des Leads

Application web complète de gestion des leads avec authentification par rôle utilisant Next.js et Supabase.

## 🚀 Fonctionnalités

### Trois Rôles Utilisateurs

1. **Administrateur**
   - Vue complète sur tous les leads
   - Gestion des utilisateurs
   - Création et suppression de leads
   - Statistiques globales

2. **Agent**
   - Gestion de ses propres leads
   - Création de nouveaux leads
   - Mise à jour du statut des leads
   - Statistiques personnelles

3. **Conseiller**
   - Accès aux leads qualifiés assignés
   - Suivi des négociations
   - Mise à jour du statut des leads
   - Taux de conversion

### Fonctionnalités Principales

- ✅ Authentification sécurisée avec Supabase
- ✅ Row Level Security (RLS) pour la sécurité des données
- ✅ Dashboards personnalisés par rôle
- ✅ Gestion complète des leads (CRUD)
- ✅ Statistiques en temps réel
- ✅ Interface moderne et responsive
- ✅ Système de statuts pour les leads (Nouveau, Contacté, Qualifié, Négocié, Gagné, Perdu)

## 📋 Prérequis

- Node.js 18+ installé
- Un compte Supabase (gratuit)
- Git (optionnel)

## 🛠️ Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration Supabase

#### A. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre `Project URL` et `anon public key`

#### B. Exécuter le schéma SQL

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Copiez le contenu du fichier `supabase/schema.sql`
3. Exécutez le script SQL complet
4. Vérifiez que toutes les tables sont créées

#### C. Créer des utilisateurs de test (optionnel)

Dans le SQL Editor de Supabase, exécutez :

```sql
-- Créer les utilisateurs dans auth.users (via l'interface Supabase Authentication)
-- Puis insérez les profils correspondants :

INSERT INTO public.profiles (id, email, full_name, role) VALUES
('UUID_ADMIN', 'admin@example.com', 'Admin User', 'administrateur'),
('UUID_AGENT', 'agent@example.com', 'Agent User', 'agent'),
('UUID_CONSEILLER', 'conseiller@example.com', 'Conseiller User', 'conseiller');
```

**Note:** Remplacez les UUID par les vrais UUID générés lors de la création des utilisateurs dans l'onglet Authentication de Supabase.

### 3. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

Remplacez les valeurs par celles de votre projet Supabase.

### 4. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
CRM staffy/
├── app/
│   ├── admin/          # Dashboard administrateur
│   ├── agent/          # Dashboard agent
│   ├── conseiller/     # Dashboard conseiller
│   ├── login/          # Page de connexion
│   ├── globals.css     # Styles globaux
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Page d'accueil (redirection)
├── components/
│   ├── Navbar.tsx      # Barre de navigation
│   ├── StatsCard.tsx   # Carte de statistiques
│   └── LeadTable.tsx   # Tableau des leads
├── lib/
│   ├── supabase.ts     # Client Supabase
│   ├── auth.ts         # Fonctions d'authentification
│   └── database.types.ts # Types TypeScript
├── supabase/
│   └── schema.sql      # Schéma de base de données
└── package.json
```

## 🔐 Sécurité

L'application utilise Row Level Security (RLS) de Supabase pour garantir que :

- Les agents ne voient que leurs propres leads
- Les conseillers ne voient que les leads qui leur sont assignés
- Les administrateurs ont accès à toutes les données
- Toutes les opérations sont sécurisées au niveau de la base de données

## 📊 Modèle de Données

### Tables Principales

1. **profiles** - Profils utilisateurs avec rôles
2. **leads** - Informations sur les leads
3. **activities** - Historique des interactions avec les leads

### Statuts des Leads

- `nouveau` - Lead nouvellement créé
- `contacte` - Premier contact établi
- `qualifie` - Lead qualifié et prêt pour un conseiller
- `negocie` - En cours de négociation
- `gagne` - Lead converti en client
- `perdu` - Lead perdu

## 🎨 Technologies Utilisées

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **Supabase** - Backend as a Service (BaaS)
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Icônes

## 📝 Utilisation

### Connexion

1. Accédez à `/login`
2. Entrez vos identifiants
3. Vous serez redirigé vers votre dashboard selon votre rôle

### Gestion des Leads (Administrateur/Agent)

1. Cliquez sur "Nouveau Lead"
2. Remplissez les informations
3. Le lead apparaît dans votre tableau
4. Mettez à jour le statut au fur et à mesure

### Assignation (Administrateur)

1. Dans le dashboard admin
2. Assignez des agents et conseillers aux leads
3. Les utilisateurs verront automatiquement leurs leads assignés

## 🚧 Développement Futur

- [ ] Formulaire d'ajout/édition de leads
- [ ] Système de notifications
- [ ] Historique des activités
- [ ] Export de données (CSV, PDF)
- [ ] Graphiques et analytics avancés
- [ ] Filtres et recherche avancée
- [ ] Gestion des documents
- [ ] Intégration email

## 📄 Licence

Ce projet est sous licence MIT.

## 🤝 Support

Pour toute question ou problème, veuillez créer une issue sur le repository.

---

**Développé avec ❤️ pour optimiser la gestion des leads**
