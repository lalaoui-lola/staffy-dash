# 📊 Page Conseiller Modernisée

## 🎯 Vue d'Ensemble

Le conseiller a maintenant accès à **TOUS les leads validés** (de tous les agents) avec 3 onglets :
1. **Tous les Leads** - Liste complète
2. **Calendrier** - Vue mensuelle style Google Calendar
3. **RDV Aujourd'hui** - Leads du jour uniquement

---

## 📋 Fonctionnalités

### 1. **Tous les Leads Validés** ✅

**Accès :**
- TOUS les leads de TOUS les agents
- Uniquement les leads avec `qualite = 'valide'`
- Badge agent sur chaque lead
- Tri par date de RDV

**Affichage :**
- Cartes modernes avec glassmorphism
- Badge agent (qui a créé le lead)
- Badge "Validé" en vert
- Toutes les informations du lead

---

### 2. **Calendrier** 📅

**Vue Google Calendar :**
- Grille mensuelle (7 jours × semaines)
- Navigation mois par mois
- Bouton "Aujourd'hui"
- Leads affichés dans chaque jour

**Fonctionnalités :**
- Jour actuel en gradient indigo/purple
- Jours avec RDV en blanc avec bordure
- Jours sans RDV en gris
- Max 2 leads affichés + compteur "+X"
- Clic sur un lead pour voir les détails

**Navigation :**
- Flèche gauche : mois précédent
- Flèche droite : mois suivant
- Bouton "Aujourd'hui" : retour au mois actuel

---

### 3. **RDV Aujourd'hui** ⏰

**Affichage Timeline :**
- Liste des RDV du jour uniquement
- Triés par heure
- Design timeline avec heure à gauche
- Informations complètes de chaque lead

**Éléments :**
- Header vert avec nombre de RDV
- Heure en gros dans un carré gradient
- Société, client, agent
- Téléphone, email, département
- Commentaire si présent

**Si aucun RDV :**
- Message "Aucun rendez-vous aujourd'hui"
- Icône calendrier
- Message encourageant

---

## 🎨 Interface

### Sidebar

```
┌─────────────────────┐
│ ✅ Tous les Leads   │ ← Onglet 1
│ 📅 Calendrier       │ ← Onglet 2
│ ⏰ RDV Aujourd'hui  │ ← Onglet 3
└─────────────────────┘
```

### Stats (3 cartes)

1. **Total Leads Validés** (vert)
2. **RDV Aujourd'hui** (indigo)
3. **Tous les RDV** (purple)

---

## 🗓️ Calendrier - Détails

### Structure

```
┌─────────────────────────────────────┐
│  Janvier 2024        [<] [Aujourd'hui] [>]  │
├─────────────────────────────────────┤
│ Dim  Lun  Mar  Mer  Jeu  Ven  Sam  │
├─────────────────────────────────────┤
│      1    2    3    4    5    6     │
│  7   8    9   10   11   12   13     │
│ 14  15   16   17   18   19   20     │
│ 21  22   23   24   25   26   27     │
│ 28  29   30   31                    │
└─────────────────────────────────────┘
```

### Couleurs

**Aujourd'hui :**
```css
bg-gradient-to-br from-indigo-500 to-purple-500
text-white
shadow-lg
```

**Jour avec RDV :**
```css
bg-white
border-2 border-indigo-200
hover:border-indigo-400
cursor-pointer
```

**Jour sans RDV :**
```css
bg-gray-50
hover:bg-gray-100
```

### Affichage des Leads

**Dans chaque jour :**
- 2 premiers leads affichés
- Nom de la société
- Icône Building
- Si plus de 2 : badge "+X"

---

## ⏰ RDV Aujourd'hui - Détails

### Carte de RDV

```
┌──────────────────────────────────────┐
│ ⏰ 09:00  │  🏢 Société ABC          │
│   Heure   │  👤 Jean Dupont          │
│           │  👤 Agent: Marie Martin  │
│           │  ✅ Validé               │
│           │                          │
│           │  📞 01 23 45 67 89       │
│           │  📧 contact@abc.com      │
│           │  📍 75 - Paris           │
│           │                          │
│           │  💬 Commentaire...       │
└──────────────────────────────────────┘
```

### Header Vert

```tsx
<div className="bg-gradient-to-r from-green-500 to-emerald-500">
  <h2>Rendez-vous du jour</h2>
  <p>{leads.length} rendez-vous prévu(s)</p>
</div>
```

---

## 🔧 Composants Créés

### 1. `ConseillerSidebar.tsx`

**Props :**
```typescript
interface ConseillerSidebarProps {
  activeTab: 'leads' | 'calendar' | 'today'
  onTabChange: (tab) => void
}
```

**Fonctionnalités :**
- 3 onglets de navigation
- Rétractable
- Glassmorphism
- Animations

---

### 2. `CalendarView.tsx`

**Props :**
```typescript
interface CalendarViewProps {
  leads: LeadWithAgent[]
  onLeadClick?: (lead: Lead) => void
}
```

**Fonctionnalités :**
- Grille calendrier
- Navigation mois
- Affichage leads par jour
- Légende

**État :**
```typescript
const [currentDate, setCurrentDate] = useState(new Date())
```

**Fonctions :**
- `getLeadsForDay(day)` : Récupère les leads d'un jour
- `previousMonth()` : Mois précédent
- `nextMonth()` : Mois suivant
- `goToToday()` : Retour aujourd'hui
- `isToday(day)` : Vérifie si c'est aujourd'hui

---

### 3. `TodayLeads.tsx`

**Props :**
```typescript
interface TodayLeadsProps {
  leads: LeadWithAgent[]
}
```

**Fonctionnalités :**
- Timeline des RDV
- Tri par heure
- Affichage complet
- Message si vide

---

## 📊 Requête SQL

### Charger les Leads Validés

```typescript
const { data: leadsData } = await supabase
  .from('leads')
  .select(`
    *,
    agent:agent_id(id, email, full_name, role)
  `)
  .eq('qualite', 'valide')  // UNIQUEMENT validés
  .order('date_rdv', { ascending: true })
```

**Résultat :**
- Tous les leads validés
- Infos de l'agent incluses
- Triés par date de RDV

---

## 🔄 Flux de Données

### Chargement

```
1. checkAuth() → Vérifie conseiller
   ↓
2. loadLeads() → Charge TOUS les leads validés
   ↓
3. Calcul stats (total, today)
   ↓
4. Affichage selon onglet actif
```

### Filtrage Aujourd'hui

```typescript
const today = new Date().toISOString().split('T')[0]
const todayLeads = leads.filter(lead => lead.date_rdv === today)
```

### Filtrage par Jour (Calendrier)

```typescript
function getLeadsForDay(day: number): LeadWithAgent[] {
  const dateStr = `${year}-${month}-${day}`
  return leads.filter(lead => lead.date_rdv === dateStr)
}
```

---

## 🎨 Design

### Sidebar
- Glassmorphism
- 3 onglets colorés
- Icônes : CalendarCheck, Calendar, Clock
- Rétractable

### Calendrier
- Grille 7×6
- Aujourd'hui en gradient
- RDV en blanc/bordure
- Hover effects

### Timeline RDV
- Heure à gauche (gradient)
- Contenu à droite
- Cartes glassmorphism
- Animations progressives

---

## 📱 Responsive

### Desktop
- Sidebar 256px
- Calendrier grille complète
- Timeline 2 colonnes

### Tablet
- Sidebar rétractable
- Calendrier adapté
- Timeline 1 colonne

### Mobile
- Sidebar overlay
- Calendrier scroll
- Timeline empilée

---

## ✨ Animations

### Entrée
```css
animate-fadeInDown  (header)
animate-slideUp     (stats)
animate-fadeIn      (contenu)
```

### Calendrier
- Hover sur jours
- Scale sur boutons
- Transition smooth

### Timeline
- Delay progressif (100ms × index)
- Hover shadow
- Scale buttons

---

## 🎯 Cas d'Usage

### Scénario 1 : Planification Journée

**Matin :**
1. Conseiller ouvre "RDV Aujourd'hui"
2. Voit 5 RDV triés par heure
3. Prépare ses appels
4. Note les informations importantes

### Scénario 2 : Vue Mensuelle

**Planification :**
1. Conseiller ouvre "Calendrier"
2. Voit tout le mois
3. Identifie les jours chargés
4. Planifie sa semaine

### Scénario 3 : Recherche Lead

**Consultation :**
1. Conseiller ouvre "Tous les Leads"
2. Voit tous les leads validés
3. Trouve un lead spécifique
4. Consulte les détails

---

## 🔒 Sécurité

### Accès Limité

**Le conseiller voit :**
- ✅ Tous les leads validés
- ✅ Leads de tous les agents
- ❌ Pas les leads non validés
- ❌ Pas de bouton de validation

**Requête filtrée :**
```sql
WHERE qualite = 'valide'
```

---

## ✅ Résumé

**Le conseiller a maintenant :**

1. ✅ **Accès à tous les leads validés**
2. ✅ **Vue calendrier mensuelle**
3. ✅ **Page RDV du jour**
4. ✅ **Sidebar moderne avec 3 onglets**
5. ✅ **Stats en temps réel**
6. ✅ **Design glassmorphism**
7. ✅ **Animations fluides**

---

## 🚀 Testez Maintenant !

**Ouvrez** http://localhost:3000/conseiller

**Naviguez entre les onglets :**

1. **Tous les Leads**
   - Voyez tous les leads validés
   - Badge agent sur chaque lead

2. **Calendrier**
   - Vue mensuelle
   - Cliquez sur les flèches
   - Cliquez sur "Aujourd'hui"

3. **RDV Aujourd'hui**
   - Timeline des RDV du jour
   - Triés par heure
   - Informations complètes

**Interface moderne et fonctionnelle pour le conseiller !** 🎉

*Page Conseiller - 23 octobre 2024*
