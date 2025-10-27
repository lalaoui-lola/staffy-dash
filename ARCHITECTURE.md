# 🏗️ Architecture de l'Application CRM Staffy

## 📐 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                     UTILISATEUR                              │
│                    (Navigateur Web)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION NEXT.JS                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages (App Router)                                  │   │
│  │  • /login          → Authentification                │   │
│  │  • /admin          → Dashboard Administrateur        │   │
│  │  • /agent          → Dashboard Agent                 │   │
│  │  • /conseiller     → Dashboard Conseiller            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Composants Réutilisables                            │   │
│  │  • Navbar          → Navigation + Déconnexion        │   │
│  │  • StatsCard       → Cartes de statistiques          │   │
│  │  • LeadTable       → Tableau des leads               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Bibliothèques (lib/)                                │   │
│  │  • supabase.ts     → Client Supabase                 │   │
│  │  • auth.ts         → Fonctions d'authentification    │   │
│  │  • database.types  → Types TypeScript                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication                                      │   │
│  │  • Gestion des sessions                              │   │
│  │  • JWT Tokens                                        │   │
│  │  • Sécurité                                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                 │   │
│  │  • profiles        → Utilisateurs + Rôles            │   │
│  │  • leads           → Données des leads               │   │
│  │  • activities      → Historique des interactions     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Row Level Security (RLS)                            │   │
│  │  • 18 Policies de sécurité                           │   │
│  │  • Isolation des données par rôle                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flux d'Authentification

```
1. Utilisateur → Page /login
                    ↓
2. Saisie email/password
                    ↓
3. Appel signIn() → Supabase Auth
                    ↓
4. Supabase vérifie les credentials
                    ↓
5. Retour session + user
                    ↓
6. Récupération du profil (table profiles)
                    ↓
7. Vérification du rôle
                    ↓
8. Redirection selon le rôle:
   • administrateur → /admin
   • agent         → /agent
   • conseiller    → /conseiller
```

## 🔐 Système de Permissions (RLS)

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMINISTRATEUR                            │
│  ✅ Voir tous les leads                                      │
│  ✅ Créer des leads                                          │
│  ✅ Modifier tous les leads                                  │
│  ✅ Supprimer des leads                                      │
│  ✅ Voir tous les utilisateurs                               │
│  ✅ Gérer les utilisateurs                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        AGENT                                 │
│  ✅ Voir ses propres leads (agent_id = user.id)              │
│  ✅ Créer des leads                                          │
│  ✅ Modifier ses propres leads                               │
│  ❌ Supprimer des leads                                      │
│  ❌ Voir les leads des autres agents                         │
│  ❌ Gérer les utilisateurs                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      CONSEILLER                              │
│  ✅ Voir les leads assignés (conseiller_id = user.id)        │
│  ❌ Créer des leads                                          │
│  ✅ Modifier les leads assignés                              │
│  ❌ Supprimer des leads                                      │
│  ❌ Voir les leads non assignés                              │
│  ❌ Gérer les utilisateurs                                   │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Modèle de Données

```
┌─────────────────────────────────────────────────────────────┐
│  auth.users (Supabase Auth)                                  │
│  ├── id (UUID)                                               │
│  ├── email                                                   │
│  └── encrypted_password                                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 1:1
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  profiles                                                    │
│  ├── id (UUID) → FK auth.users.id                           │
│  ├── email                                                   │
│  ├── full_name                                               │
│  ├── role (administrateur | agent | conseiller)             │
│  ├── created_at                                              │
│  └── updated_at                                              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 1:N (agent)
                  │ 1:N (conseiller)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  leads                                                       │
│  ├── id (UUID)                                               │
│  ├── nom                                                     │
│  ├── prenom                                                  │
│  ├── email                                                   │
│  ├── telephone                                               │
│  ├── entreprise                                              │
│  ├── poste                                                   │
│  ├── statut (nouveau | contacte | qualifie | ...)           │
│  ├── source                                                  │
│  ├── budget                                                  │
│  ├── notes                                                   │
│  ├── agent_id → FK profiles.id                              │
│  ├── conseiller_id → FK profiles.id                         │
│  ├── created_by → FK profiles.id                            │
│  ├── created_at                                              │
│  └── updated_at                                              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 1:N
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  activities                                                  │
│  ├── id (UUID)                                               │
│  ├── lead_id → FK leads.id                                  │
│  ├── user_id → FK profiles.id                               │
│  ├── type (appel | email | reunion | note)                  │
│  ├── description                                             │
│  ├── date_activite                                           │
│  └── created_at                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Cycle de Vie d'un Lead

```
┌──────────┐
│ NOUVEAU  │ ← Lead créé par un agent
└────┬─────┘
     │
     ▼
┌──────────┐
│ CONTACTE │ ← Premier contact établi
└────┬─────┘
     │
     ▼
┌──────────┐
│ QUALIFIE │ ← Lead qualifié, assigné à un conseiller
└────┬─────┘
     │
     ▼
┌──────────┐
│ NEGOCIE  │ ← En cours de négociation
└────┬─────┘
     │
     ├─────────┐
     ▼         ▼
┌─────────┐  ┌───────┐
│  GAGNE  │  │ PERDU │
└─────────┘  └───────┘
```

## 🛡️ Sécurité Multi-Niveaux

```
┌─────────────────────────────────────────────────────────────┐
│  Niveau 1 : Frontend (Next.js)                               │
│  • Vérification de session                                   │
│  • Redirection si non authentifié                            │
│  • Affichage conditionnel selon le rôle                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Niveau 2 : API Supabase                                     │
│  • Validation du JWT Token                                   │
│  • Vérification de l'identité                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Niveau 3 : Row Level Security (PostgreSQL)                  │
│  • Policies au niveau de la base de données                  │
│  • Isolation automatique des données                         │
│  • Impossible de contourner même avec l'API                  │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Stack Technologique

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend                                                    │
│  ├── Next.js 14        → Framework React avec App Router    │
│  ├── TypeScript        → Typage statique                     │
│  ├── Tailwind CSS      → Styles utility-first               │
│  └── Lucide React      → Icônes modernes                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Backend (Supabase)                                          │
│  ├── PostgreSQL        → Base de données relationnelle      │
│  ├── Auth              → Authentification JWT                │
│  ├── Row Level Security→ Sécurité au niveau des lignes      │
│  └── Realtime          → Mises à jour en temps réel         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Outils de Développement                                     │
│  ├── Node.js           → Runtime JavaScript                  │
│  ├── NPM               → Gestionnaire de paquets             │
│  └── Git               → Contrôle de version                 │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Structure des Pages

```
app/
├── page.tsx                    → Redirection automatique
│   └── Vérifie la session et redirige selon le rôle
│
├── login/
│   └── page.tsx               → Page de connexion
│       ├── Formulaire email/password
│       ├── Appel signIn()
│       └── Redirection après succès
│
├── admin/
│   └── page.tsx               → Dashboard Administrateur
│       ├── Vue sur tous les leads
│       ├── Gestion des utilisateurs
│       ├── Statistiques globales
│       └── Actions : Créer/Modifier/Supprimer
│
├── agent/
│   └── page.tsx               → Dashboard Agent
│       ├── Vue sur ses leads uniquement
│       ├── Statistiques personnelles
│       └── Actions : Créer/Modifier ses leads
│
└── conseiller/
    └── page.tsx               → Dashboard Conseiller
        ├── Vue sur leads assignés
        ├── Taux de conversion
        └── Actions : Modifier ses leads assignés
```

## 🔄 Flux de Données

```
Composant React
      ↓
   useEffect()
      ↓
supabase.from('leads').select()
      ↓
Supabase vérifie RLS
      ↓
PostgreSQL exécute la requête
      ↓
Retour des données filtrées
      ↓
setState() dans React
      ↓
Re-render du composant
      ↓
Affichage à l'utilisateur
```

## 🚀 Déploiement

```
Développement Local
      ↓
npm run build
      ↓
Test de production (npm run start)
      ↓
Déploiement sur Vercel/Netlify
      ↓
Configuration des variables d'environnement
      ↓
Application en production
```

---

**📖 Cette architecture garantit :**
- ✅ Sécurité maximale avec RLS
- ✅ Séparation claire des responsabilités
- ✅ Scalabilité de l'application
- ✅ Maintenabilité du code
- ✅ Performance optimale
