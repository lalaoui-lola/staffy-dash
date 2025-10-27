# 👨‍💼 Guide Administrateur - CRM Staffy

## ✅ Fonctionnalité Ajoutée : Création d'Utilisateurs

L'administrateur peut maintenant **créer des utilisateurs** et **leur assigner des rôles** directement depuis le dashboard !

---

## 🎯 Comment Créer un Utilisateur

### Depuis le Dashboard Admin

1. **Connectez-vous** en tant qu'administrateur
2. **Vous serez redirigé** vers `/admin`
3. **Cliquez sur le bouton** "Nouvel Utilisateur"
4. **Remplissez le formulaire** :
   - **Nom complet** : Le nom de l'utilisateur
   - **Email** : L'adresse email (servira d'identifiant)
   - **Mot de passe** : Minimum 6 caractères
   - **Rôle** : Choisissez parmi :
     - **Agent** : Peut créer et gérer ses propres leads
     - **Conseiller** : Peut gérer les leads qui lui sont assignés
     - **Administrateur** : Accès complet au système
5. **Cliquez sur** "Créer l'utilisateur"
6. **L'utilisateur est créé** et apparaît dans la liste !

---

## 🔐 Les 3 Rôles Expliqués

### 👨‍💼 Administrateur
- ✅ Voir **tous les leads**
- ✅ Créer, modifier, supprimer **tous les leads**
- ✅ **Créer des utilisateurs**
- ✅ Voir **tous les utilisateurs**
- ✅ Gérer les **assignations**
- ✅ Accès aux **statistiques globales**

### 👤 Agent
- ✅ Voir **uniquement ses propres leads**
- ✅ **Créer** de nouveaux leads
- ✅ **Modifier** ses propres leads
- ❌ Ne peut pas voir les leads des autres agents
- ❌ Ne peut pas créer d'utilisateurs
- ✅ Accès à ses **statistiques personnelles**

### 🎯 Conseiller
- ✅ Voir **uniquement les leads qui lui sont assignés**
- ✅ **Modifier** les leads assignés
- ❌ Ne peut pas créer de leads
- ❌ Ne peut pas créer d'utilisateurs
- ✅ Voir son **taux de conversion**
- ✅ Accès à ses **statistiques personnelles**

---

## 📊 Workflow Typique

### 1. L'Admin Crée les Utilisateurs

```
Admin → Dashboard → "Nouvel Utilisateur"
  ├─ Crée un Agent
  ├─ Crée un Conseiller
  └─ Crée d'autres Admins si nécessaire
```

### 2. L'Agent Crée des Leads

```
Agent → Dashboard → "Nouveau Lead"
  ├─ Renseigne les informations du prospect
  ├─ Le lead est créé avec statut "Nouveau"
  └─ L'agent peut le faire évoluer
```

### 3. L'Agent Qualifie et Assigne au Conseiller

```
Agent → Modifie le lead
  ├─ Change le statut à "Qualifié"
  ├─ Assigne un conseiller
  └─ Le conseiller voit maintenant ce lead
```

### 4. Le Conseiller Négocie

```
Conseiller → Dashboard → Voit ses leads assignés
  ├─ Change le statut à "Négocié"
  ├─ Ajoute des notes
  └─ Finalise : "Gagné" ou "Perdu"
```

---

## 🔒 Sécurité

### Row Level Security (RLS)

Chaque utilisateur voit **uniquement** ce qu'il doit voir :

- **Agent A** ne voit pas les leads de **Agent B**
- **Conseiller** ne voit que les leads qui lui sont assignés
- **Admin** voit tout

### Isolation des Données

La sécurité est garantie au **niveau de la base de données** :
- Impossible de contourner même en modifiant le code frontend
- Les policies PostgreSQL filtrent automatiquement les données
- Chaque requête est vérifiée par Supabase

---

## 📝 Exemples de Scénarios

### Scénario 1 : Nouvelle Équipe

1. **Admin** crée 3 agents et 2 conseillers
2. Chaque utilisateur reçoit ses identifiants
3. Les agents commencent à créer des leads
4. Les conseillers reçoivent les leads qualifiés

### Scénario 2 : Lead Gagné

1. **Agent** crée un lead "Nouveau"
2. **Agent** contacte → statut "Contacté"
3. **Agent** qualifie → statut "Qualifié" + assigne un conseiller
4. **Conseiller** négocie → statut "Négocié"
5. **Conseiller** finalise → statut "Gagné" 🎉

### Scénario 3 : Gestion d'Équipe

1. **Admin** voit tous les leads de tous les agents
2. **Admin** peut réassigner des leads
3. **Admin** peut créer de nouveaux utilisateurs
4. **Admin** voit les statistiques globales

---

## 🎨 Interface Administrateur

### Dashboard Principal

- **4 Cartes de Statistiques** :
  - Total Leads
  - Nouveaux
  - Gagnés
  - Perdus

- **Boutons d'Action** :
  - "Nouveau Lead" : Créer un lead directement
  - "Nouvel Utilisateur" : Créer un utilisateur

- **Onglets** :
  - Leads : Tableau de tous les leads
  - Utilisateurs : Liste de tous les utilisateurs

### Modal de Création d'Utilisateur

- Formulaire simple et intuitif
- Validation en temps réel
- Messages d'erreur clairs
- Confirmation de succès

---

## 🚀 Prochaines Fonctionnalités (À Venir)

- [ ] Modifier un utilisateur existant
- [ ] Désactiver un utilisateur (sans le supprimer)
- [ ] Réinitialiser le mot de passe
- [ ] Historique des actions
- [ ] Notifications par email
- [ ] Export des données

---

## 💡 Conseils d'Utilisation

### Pour les Admins

1. **Créez d'abord les utilisateurs** avant d'importer des leads
2. **Utilisez des mots de passe forts** (minimum 8 caractères)
3. **Ne créez pas trop d'admins** (1-2 suffisent généralement)
4. **Assignez les leads** aux bons conseillers selon leurs compétences

### Pour les Agents

1. **Créez des leads détaillés** (plus d'infos = meilleure conversion)
2. **Mettez à jour régulièrement** le statut
3. **Ajoutez des notes** après chaque interaction
4. **Qualifiez rapidement** les bons prospects

### Pour les Conseillers

1. **Priorisez les leads qualifiés**
2. **Maintenez un suivi régulier**
3. **Mettez à jour le statut** après chaque action
4. **Visez un bon taux de conversion**

---

## 📞 Support

Si vous rencontrez un problème :

1. Vérifiez que vous êtes bien connecté
2. Vérifiez votre rôle (visible dans la navbar)
3. Consultez la console du navigateur (F12) pour les erreurs
4. Vérifiez les logs Supabase

---

**🎉 Votre système de gestion des utilisateurs est maintenant opérationnel !**

*Guide créé pour CRM Staffy - Octobre 2024*
