# ✅ Checklist de Configuration CRM Staffy

Utilisez cette checklist pour vous assurer que tout est correctement configuré.

## 📋 Avant de Commencer

- [ ] Node.js 18+ est installé (`node --version`)
- [ ] NPM est installé (`npm --version`)
- [ ] Vous avez un compte Supabase (gratuit sur [supabase.com](https://supabase.com))

## 🔧 Configuration du Projet

### Étape 1 : Installation
- [ ] Dépendances installées (`npm install`)
- [ ] Aucune erreur lors de l'installation
- [ ] Dossier `node_modules` créé

### Étape 2 : Configuration Supabase
- [ ] Projet Supabase créé
- [ ] Project URL copiée
- [ ] Clé `anon public` copiée
- [ ] Fichier `.env.local` créé à la racine
- [ ] Variables d'environnement ajoutées dans `.env.local`

### Étape 3 : Base de Données
- [ ] Fichier `supabase/schema.sql` ouvert
- [ ] Contenu copié dans SQL Editor de Supabase
- [ ] Script SQL exécuté avec succès
- [ ] Message "Success" affiché
- [ ] Tables créées (vérifiées dans Table Editor)
  - [ ] Table `profiles`
  - [ ] Table `leads`
  - [ ] Table `activities`

### Étape 4 : Utilisateurs
- [ ] Au moins un utilisateur créé dans Authentication
- [ ] Utilisateur confirmé (Auto Confirm coché)
- [ ] UUID de l'utilisateur copié
- [ ] Rôle assigné via SQL UPDATE
- [ ] Profil vérifié dans la table `profiles`

## 🚀 Lancement de l'Application

### Démarrage
- [ ] Serveur lancé (`npm run dev`)
- [ ] Aucune erreur dans la console
- [ ] Application accessible sur http://localhost:3000
- [ ] Redirection automatique vers `/login`

### Test de Connexion
- [ ] Page de connexion s'affiche correctement
- [ ] Formulaire de connexion visible
- [ ] Email et mot de passe saisis
- [ ] Connexion réussie
- [ ] Redirection vers le bon dashboard selon le rôle

## 🎯 Tests par Rôle

### Administrateur
- [ ] Accès au dashboard admin (`/admin`)
- [ ] Statistiques affichées
- [ ] Liste de tous les leads visible
- [ ] Liste des utilisateurs visible
- [ ] Boutons "Nouveau Lead" et "Nouvel Utilisateur" présents

### Agent
- [ ] Accès au dashboard agent (`/agent`)
- [ ] Statistiques personnelles affichées
- [ ] Uniquement ses propres leads visibles
- [ ] Bouton "Nouveau Lead" présent
- [ ] Conseils affichés en bas

### Conseiller
- [ ] Accès au dashboard conseiller (`/conseiller`)
- [ ] Statistiques affichées
- [ ] Uniquement les leads assignés visibles
- [ ] Taux de conversion calculé
- [ ] Conseils de vente affichés

## 🔒 Tests de Sécurité

### Isolation des Données
- [ ] Un agent ne voit pas les leads d'un autre agent
- [ ] Un conseiller ne voit que ses leads assignés
- [ ] Impossible d'accéder à un dashboard non autorisé
- [ ] Déconnexion fonctionne correctement

### Row Level Security
- [ ] Policies RLS activées (vérifiées dans Supabase)
- [ ] Au moins 18 policies créées
- [ ] Policies pour `profiles` (6)
- [ ] Policies pour `leads` (9)
- [ ] Policies pour `activities` (3)

## 🎨 Tests d'Interface

### Responsive Design
- [ ] Interface correcte sur desktop
- [ ] Interface correcte sur tablette
- [ ] Interface correcte sur mobile
- [ ] Navigation fluide

### Composants
- [ ] Navbar s'affiche correctement
- [ ] Cartes de statistiques visibles
- [ ] Tableau des leads formaté
- [ ] Icônes affichées
- [ ] Couleurs et styles appliqués

## 📊 Tests Fonctionnels

### Gestion des Leads
- [ ] Leads affichés dans le tableau
- [ ] Informations complètes visibles
- [ ] Statuts colorés correctement
- [ ] Boutons d'action fonctionnels (si applicable)

### Navigation
- [ ] Redirection après connexion
- [ ] Bouton de déconnexion fonctionne
- [ ] Retour à la page de login après déconnexion
- [ ] Protection des routes (pas d'accès sans connexion)

## 🐛 Dépannage

Si quelque chose ne fonctionne pas :

### Erreurs Courantes

#### "Invalid API key"
- [ ] Vérifier `.env.local` existe
- [ ] Vérifier les clés sont correctes
- [ ] Redémarrer le serveur (`Ctrl+C` puis `npm run dev`)

#### "relation does not exist"
- [ ] Réexécuter `schema.sql` dans Supabase
- [ ] Vérifier les tables dans Table Editor
- [ ] Vérifier la connexion à Supabase

#### Impossible de se connecter
- [ ] Vérifier l'utilisateur existe dans Authentication
- [ ] Vérifier l'utilisateur est confirmé
- [ ] Vérifier le profil existe dans `profiles`
- [ ] Vérifier le rôle est assigné

#### Page blanche ou erreur 404
- [ ] Vérifier le serveur est lancé
- [ ] Vérifier l'URL est correcte
- [ ] Vérifier la console pour les erreurs
- [ ] Réinstaller les dépendances (`npm install`)

## 📝 Logs à Vérifier

### Console du Navigateur (F12)
- [ ] Aucune erreur rouge
- [ ] Pas d'erreur de connexion à Supabase
- [ ] Pas d'erreur 404 sur les ressources

### Console du Terminal
- [ ] Serveur démarre sans erreur
- [ ] Compilation réussie
- [ ] Aucun warning critique

### Supabase Dashboard
- [ ] Logs > API Logs : pas d'erreur 401 ou 403
- [ ] Authentication : utilisateurs créés
- [ ] Table Editor : données présentes

## ✨ Fonctionnalités Optionnelles

### Données de Test
- [ ] Leads de test ajoutés
- [ ] Plusieurs utilisateurs créés
- [ ] Assignations agent/conseiller testées

### Personnalisation
- [ ] Couleurs personnalisées (optionnel)
- [ ] Logo ajouté (optionnel)
- [ ] Textes modifiés (optionnel)

## 🎉 Validation Finale

- [ ] ✅ Application lance sans erreur
- [ ] ✅ Connexion fonctionne
- [ ] ✅ Les 3 dashboards sont accessibles
- [ ] ✅ Les données s'affichent correctement
- [ ] ✅ La sécurité RLS fonctionne
- [ ] ✅ L'interface est responsive
- [ ] ✅ La déconnexion fonctionne

## 🚀 Prêt pour la Production ?

Si toutes les cases sont cochées, votre application est prête !

### Prochaines Étapes
1. Ajouter plus de fonctionnalités
2. Personnaliser le design
3. Ajouter des formulaires d'édition
4. Implémenter les activités
5. Déployer sur Vercel/Netlify

---

**🎊 Félicitations ! Votre CRM est opérationnel !**

Pour toute question, consultez :
- `README.md` - Documentation complète
- `INSTRUCTIONS_SUPABASE.md` - Guide Supabase
- `DEMARRAGE_RAPIDE.md` - Démarrage rapide
- `COMMANDES.md` - Commandes utiles
