# 💬 Système de Suivi Conseiller

## 🎯 Vue d'Ensemble

Le conseiller peut maintenant ajouter un **suivi** sur chaque lead validé avec :
- **3 statuts** : OK, Non OK, À Rappeler
- **Commentaire** visible par tous (admin, agent, conseiller)
- **Historique** des suivis
- **Date** du dernier suivi

---

## 📊 Nouveaux Champs Base de Données

### Colonnes Ajoutées à `leads`

```sql
statut_conseiller         -- ENUM: 'en_attente', 'ok', 'non_ok', 'rappeler'
commentaire_conseiller    -- TEXT: Commentaire du conseiller
date_suivi_conseiller     -- TIMESTAMP: Date du dernier suivi
conseiller_suivi_id       -- UUID: ID du conseiller qui a fait le suivi
```

### Enum `statut_conseiller`

```sql
CREATE TYPE statut_conseiller AS ENUM (
  'en_attente',  -- Par défaut, pas encore de suivi
  'ok',          -- Lead OK
  'non_ok',      -- Lead Non OK
  'rappeler'     -- À rappeler
);
```

---

## 🎨 Interface Conseiller

### Bouton "Suivi" 💬

**Sur chaque carte de lead :**
```
[💬 Suivi] [✏️ Modifier] [🗑️ Supprimer]
   ↑ Purple
```

**Propriétés :**
- Couleur : `bg-purple-600`
- Icône : MessageSquare
- Hover : scale-105
- Visible uniquement pour le conseiller

---

## 📝 Modal de Suivi

### Structure

```
┌─────────────────────────────────┐
│ 💬 Suivi Conseiller             │
│    Société ABC                  │
│    [X]                          │
├─────────────────────────────────┤
│ Client: Jean Dupont             │
│ Téléphone: 01 23 45 67 89       │
├─────────────────────────────────┤
│ Statut du suivi *               │
│ [✓ OK] [✗ Non OK] [📞 Rappeler]│
├─────────────────────────────────┤
│ Commentaire (visible par tous) *│
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │                             │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [Annuler] [Enregistrer]         │
└─────────────────────────────────┘
```

### Champs

1. **Statut** (requis)
   - 3 boutons : OK, Non OK, À Rappeler
   - Sélection unique
   - Couleurs : vert, rouge, jaune

2. **Commentaire** (requis)
   - Textarea
   - Minimum 1 caractère
   - Visible par tous
   - Placeholder explicite

3. **Suivi précédent** (si existe)
   - Affichage en lecture seule
   - Badge statut
   - Date du suivi
   - Commentaire précédent

---

## 🎨 Affichage du Suivi

### Dans les Cartes de Lead

**Si suivi existe :**
```
┌─────────────────────────────────┐
│ 💬 Suivi Conseiller    [✓ OK]  │
│ Le client est intéressé...      │
│ Suivi le 23/10/2024             │
└─────────────────────────────────┘
```

**Couleurs selon statut :**

**OK :**
```css
bg-green-50
border-green-500
text-green-800
```

**Non OK :**
```css
bg-red-50
border-red-500
text-red-800
```

**À Rappeler :**
```css
bg-yellow-50
border-yellow-500
text-yellow-800
```

---

## 🔄 Flux de Données

### Ajout/Modification de Suivi

```
1. Conseiller clique "Suivi"
   ↓
2. Modal s'ouvre avec infos lead
   ↓
3. Conseiller sélectionne statut
   ↓
4. Conseiller écrit commentaire
   ↓
5. Validation du formulaire
   ↓
6. UPDATE leads SET
     statut_conseiller = 'ok',
     commentaire_conseiller = '...',
     date_suivi_conseiller = NOW(),
     conseiller_suivi_id = conseiller_id
   ↓
7. Rechargement des leads
   ↓
8. Suivi visible par tous
```

### Visibilité

**Le suivi est visible par :**
- ✅ **Administrateur** (toutes les pages)
- ✅ **Agent** (qui a créé le lead)
- ✅ **Conseiller** (tous les conseillers)

---

## 💾 Requête SQL

### Mise à Jour du Suivi

```typescript
const { error } = await supabase
  .from('leads')
  .update({
    statut_conseiller: 'ok',
    commentaire_conseiller: 'Le client est intéressé...',
    date_suivi_conseiller: new Date().toISOString(),
    conseiller_suivi_id: conseillerId
  })
  .eq('id', leadId)
```

---

## 🎯 Composants Créés

### 1. `ConseillerSuiviModal.tsx`

**Props :**
```typescript
interface ConseillerSuiviModalProps {
  lead: Lead
  conseillerId: string
  conseillerName: string
  onClose: () => void
  onSuiviUpdated: () => void
}
```

**État :**
```typescript
const [statut, setStatut] = useState<StatutConseiller>('en_attente')
const [commentaire, setCommentaire] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [success, setSuccess] = useState(false)
```

**Validation :**
- Statut requis (sélection)
- Commentaire requis (non vide)
- Confirmation avant fermeture si modifié

---

### 2. Modifications `AllLeadsTable.tsx`

**Props ajoutées :**
```typescript
onSuiviConseiller?: (lead: Lead) => void
showSuiviButton?: boolean
```

**Affichage :**
- Bouton "Suivi" si `showSuiviButton = true`
- Section "Suivi Conseiller" si commentaire existe
- Badge statut coloré
- Date du suivi

---

## 📱 Responsive

### Desktop
- Modal centrée (max-width: 2xl)
- 3 boutons statut en ligne
- Textarea large

### Mobile
- Modal plein écran
- Boutons statut empilés
- Textarea adaptée

---

## 🎨 Design

### Modal

**Header :**
```css
bg-gradient-to-r from-indigo-600 to-purple-600
text-white
rounded-t-3xl
```

**Boutons Statut :**

**Non sélectionné :**
```css
bg-white
border-gray-200
text-gray-700
```

**Sélectionné OK :**
```css
bg-green-100
border-green-500
text-green-900
```

**Sélectionné Non OK :**
```css
bg-red-100
border-red-500
text-red-900
```

**Sélectionné Rappeler :**
```css
bg-yellow-100
border-yellow-500
text-yellow-900
```

---

## ✨ Animations

### Modal
```css
animate-fadeIn
backdrop-blur-sm
```

### Boutons
```css
hover:scale-105
transition-all duration-300
```

### Success Message
```css
animate-fadeIn
bg-green-50
```

---

## 🔒 Sécurité

### Permissions

**Le conseiller peut :**
- ✅ Ajouter un suivi sur n'importe quel lead validé
- ✅ Modifier son propre suivi
- ✅ Voir les suivis des autres conseillers
- ❌ Supprimer un suivi
- ❌ Modifier le statut de validation du lead

### Traçabilité

**Chaque suivi enregistre :**
- ID du conseiller (`conseiller_suivi_id`)
- Date exacte (`date_suivi_conseiller`)
- Statut et commentaire

---

## 📊 Cas d'Usage

### Scénario 1 : Lead OK

**Conseiller :**
1. Ouvre "Tous les Leads"
2. Clique "Suivi" sur un lead
3. Sélectionne "OK"
4. Écrit : "Client intéressé, rendez-vous fixé"
5. Enregistre

**Résultat :**
- Badge vert "✓ OK"
- Commentaire visible par tous
- Agent peut voir le retour

---

### Scénario 2 : Lead à Rappeler

**Conseiller :**
1. Consulte un lead
2. Clique "Suivi"
3. Sélectionne "À Rappeler"
4. Écrit : "Pas de réponse, rappeler demain"
5. Enregistre

**Résultat :**
- Badge jaune "📞 À Rappeler"
- Visible dans le calendrier
- Peut filtrer par statut

---

### Scénario 3 : Lead Non OK

**Conseiller :**
1. Traite un lead
2. Clique "Suivi"
3. Sélectionne "Non OK"
4. Écrit : "Client pas intéressé, budget insuffisant"
5. Enregistre

**Résultat :**
- Badge rouge "✗ Non OK"
- Admin peut voir la raison
- Lead peut être réassigné

---

## 📋 Instructions

### 1. Exécuter le SQL

**Dans Supabase SQL Editor :**
```sql
-- Copier et exécuter :
supabase/add_conseiller_suivi.sql
```

**Ce script :**
- Crée l'enum `statut_conseiller`
- Ajoute 4 colonnes à `leads`
- Crée un index pour performance
- Ajoute des commentaires

---

### 2. Utilisation Conseiller

**Ajouter un suivi :**
1. Connectez-vous en tant que conseiller
2. Allez sur "Tous les Leads"
3. Cliquez sur "Suivi" (bouton purple)
4. Sélectionnez un statut
5. Écrivez un commentaire
6. Enregistrez

**Modifier un suivi :**
1. Cliquez à nouveau sur "Suivi"
2. Le suivi précédent s'affiche
3. Modifiez le statut/commentaire
4. Enregistrez

---

### 3. Visibilité

**Admin :**
- Voit tous les suivis
- Sur toutes les pages de leads

**Agent :**
- Voit les suivis de ses leads
- Sur sa page "Mes Rendez-vous"

**Conseiller :**
- Voit tous les suivis
- Peut ajouter/modifier

---

## ✅ Résumé

**Le système de suivi permet :**

1. ✅ **3 statuts** : OK, Non OK, À Rappeler
2. ✅ **Commentaire** visible par tous
3. ✅ **Historique** des suivis
4. ✅ **Traçabilité** (qui, quand)
5. ✅ **Interface moderne** avec modal
6. ✅ **Couleurs** selon statut
7. ✅ **Validation** des champs
8. ✅ **Feedback** visuel

---

## 🚀 Testez Maintenant !

**Ouvrez** http://localhost:3000/conseiller

**Étapes :**

1. **Connectez-vous** en tant que conseiller
2. **Allez** sur "Tous les Leads"
3. **Cliquez** sur "Suivi" (bouton purple)
4. **Sélectionnez** un statut (OK/Non OK/Rappeler)
5. **Écrivez** un commentaire
6. **Enregistrez**
7. **Le suivi apparaît** sur la carte !

**Vérifiez la visibilité :**
- Connectez-vous en tant qu'admin → Suivi visible
- Connectez-vous en tant qu'agent → Suivi visible

**Système de suivi complet et fonctionnel !** 🎉

*Suivi Conseiller - 23 octobre 2024*
