# 🔧 Correction - Agent Ne Voit Pas les Retours Conseiller

## ❌ Problème

L'agent ne peut pas voir les commentaires et statuts ajoutés par le conseiller sur ses leads.

**Causes :**
1. Permissions RLS manquantes
2. Composant `LeadTableAgent` n'affichait pas les retours

---

## ✅ Solution en 2 Étapes

### Étape 1 : Corriger les Permissions RLS

**Exécutez dans Supabase SQL Editor :**

```sql
-- Fichier : supabase/fix_agent_permissions.sql

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "agent_select" ON public.leads;
DROP POLICY IF EXISTS "Agents can view their leads" ON public.leads;

-- Créer la nouvelle policy SELECT
CREATE POLICY "Agents can view their leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  agent_id = auth.uid()
  OR created_by = auth.uid()
);

-- Policy UPDATE
DROP POLICY IF EXISTS "agent_update" ON public.leads;

CREATE POLICY "Agents can update their leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  agent_id = auth.uid()
  OR created_by = auth.uid()
)
WITH CHECK (
  agent_id = auth.uid()
  OR created_by = auth.uid()
);

-- Vérifier RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
```

---

### Étape 2 : Vérifier le Composant

**Le composant `LeadTableAgent.tsx` a été mis à jour pour afficher :**

```tsx
{/* Suivi Conseiller */}
{lead.commentaire_conseiller && lead.statut_conseiller !== 'en_attente' && (
  <div className="bg-green-50 border-l-4 border-green-500 p-4">
    <p className="font-bold">💬 Suivi Conseiller</p>
    <span className="badge">✓ OK</span>
    <p>{lead.commentaire_conseiller}</p>
    <p className="text-xs">Suivi le {date}</p>
  </div>
)}
```

---

## 🔍 Diagnostic

### Test 1 : Vérifier les Permissions

```sql
-- Voir les policies agent
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'leads'
AND policyname LIKE '%gent%';
```

**Résultat attendu :**
```
Agents can view their leads    | SELECT | agent_id = auth.uid()...
Agents can update their leads  | UPDATE | agent_id = auth.uid()...
Agents can insert leads        | INSERT | ...
```

---

### Test 2 : Vérifier les Données

```sql
-- Voir un lead avec retour conseiller
SELECT 
    id,
    nom_societe,
    agent_id,
    statut_conseiller,
    commentaire_conseiller,
    date_suivi_conseiller
FROM public.leads
WHERE commentaire_conseiller IS NOT NULL
LIMIT 5;
```

**Si aucun résultat :**
→ Aucun conseiller n'a encore ajouté de suivi

---

### Test 3 : Console du Navigateur

**Ouvrez F12 sur la page agent :**

```javascript
// Regardez les logs
🔍 Conseiller - Chargement des leads
📊 Nombre de leads reçus: X
```

**Vérifiez qu'il n'y a pas d'erreur de permissions**

---

## 📋 Checklist de Vérification

Avant de dire que ça ne fonctionne pas :

- [ ] **Script SQL exécuté** : `fix_agent_permissions.sql`
- [ ] **Policies créées** : "Agents can view their leads"
- [ ] **RLS activé** : `rowsecurity = true`
- [ ] **Composant mis à jour** : `LeadTableAgent.tsx`
- [ ] **Un conseiller a ajouté un suivi** : Au moins 1 lead avec commentaire
- [ ] **Page rechargée** : Ctrl+F5
- [ ] **Console vérifiée** : Aucune erreur
- [ ] **Connecté en tant qu'agent** : Pas admin ou conseiller

---

## 🎯 Ce Que l'Agent Doit Voir

### Sur Chaque Lead avec Retour Conseiller

```
┌─────────────────────────────────────┐
│ 🏢 Société ABC                      │
│ 👤 Jean Dupont                      │
├─────────────────────────────────────┤
│ 💬 Commentaire Agent:               │
│ Client intéressé par l'offre...     │
├─────────────────────────────────────┤
│ 💬 Suivi Conseiller       [✓ OK]   │ ← NOUVEAU
│ RDV réussi, client satisfait        │
│ Suivi le 24/10/2024                 │
└─────────────────────────────────────┘
```

**Couleurs selon statut :**
- **OK** : Vert (bg-green-50, border-green-500)
- **Non OK** : Rouge (bg-red-50, border-red-500)
- **À Rappeler** : Jaune (bg-yellow-50, border-yellow-500)

---

## 🔄 Flux Complet

### 1. Conseiller Ajoute un Suivi

```
Conseiller → Clic "Suivi" → Sélectionne "OK"
→ Écrit commentaire → Enregistre
→ Lead mis à jour dans la base
```

### 2. Agent Voit le Retour

```
Agent → Ouvre "Mes Leads"
→ Voit la section "Suivi Conseiller" (verte)
→ Lit le commentaire et le statut
→ Comprend le résultat du RDV
```

---

## 🛠️ Solutions Alternatives

### Solution 1 : Vérifier Manuellement

**Dans Supabase SQL Editor :**

```sql
-- Trouver l'ID de l'agent
SELECT id, email FROM public.profiles WHERE role = 'agent';

-- Voir ses leads avec les retours
SELECT 
    l.id,
    l.nom_societe,
    l.statut_conseiller,
    l.commentaire_conseiller,
    l.agent_id
FROM public.leads l
WHERE l.agent_id = 'ID_DE_LAGENT'
ORDER BY l.created_at DESC;
```

**Si les champs sont NULL :**
→ Aucun conseiller n'a ajouté de suivi

**Si les champs ont des valeurs :**
→ Problème de permissions RLS

---

### Solution 2 : Recréer les Policies

**Supprimer TOUTES les policies agent :**

```sql
DROP POLICY IF EXISTS "agent_select" ON public.leads;
DROP POLICY IF EXISTS "agent_update" ON public.leads;
DROP POLICY IF EXISTS "agent_insert" ON public.leads;
DROP POLICY IF EXISTS "agent_delete" ON public.leads;
DROP POLICY IF EXISTS "Agents can view their leads" ON public.leads;
DROP POLICY IF EXISTS "Agents can update their leads" ON public.leads;
DROP POLICY IF EXISTS "Agents can insert leads" ON public.leads;
```

**Recréer proprement :**

```sql
-- SELECT : Voir ses leads
CREATE POLICY "Agents can view their leads"
ON public.leads FOR SELECT TO authenticated
USING (agent_id = auth.uid() OR created_by = auth.uid());

-- INSERT : Créer des leads
CREATE POLICY "Agents can insert leads"
ON public.leads FOR INSERT TO authenticated
WITH CHECK (agent_id = auth.uid() OR created_by = auth.uid());

-- UPDATE : Modifier ses leads
CREATE POLICY "Agents can update their leads"
ON public.leads FOR UPDATE TO authenticated
USING (agent_id = auth.uid() OR created_by = auth.uid())
WITH CHECK (agent_id = auth.uid() OR created_by = auth.uid());

-- DELETE : Supprimer ses leads
CREATE POLICY "Agents can delete their leads"
ON public.leads FOR DELETE TO authenticated
USING (agent_id = auth.uid() OR created_by = auth.uid());
```

---

### Solution 3 : Tester avec un Lead Spécifique

**Créer un lead de test avec retour conseiller :**

```sql
-- 1. Trouver un agent
SELECT id FROM public.profiles WHERE role = 'agent' LIMIT 1;

-- 2. Créer un lead
INSERT INTO public.leads (
    nom_societe,
    nom_client,
    agent_id,
    qualite,
    statut_conseiller,
    commentaire_conseiller,
    date_suivi_conseiller
) VALUES (
    'Test Société',
    'Test Client',
    'ID_AGENT',
    'valide',
    'ok',
    'Test de retour conseiller',
    NOW()
);

-- 3. Vérifier que l'agent le voit
-- (Se connecter en tant qu'agent et vérifier)
```

---

## 🚀 Test Complet

### Étape 1 : Exécuter le Fix

```bash
# Ouvrir Supabase SQL Editor
# Copier/coller fix_agent_permissions.sql
# Exécuter
```

### Étape 2 : Ajouter un Suivi (Conseiller)

1. **Connectez-vous** en tant que conseiller
2. **Ouvrez** un lead validé
3. **Cliquez** "Suivi"
4. **Sélectionnez** "OK"
5. **Écrivez** "Test de retour pour l'agent"
6. **Enregistrez**

### Étape 3 : Vérifier (Agent)

1. **Connectez-vous** en tant qu'agent
2. **Ouvrez** "Mes Leads"
3. **Trouvez** le lead avec le suivi
4. **Vérifiez** la section verte "Suivi Conseiller"

**Si visible :** ✅ Problème résolu !

**Si invisible :** Continuez au diagnostic avancé

---

## 🔍 Diagnostic Avancé

### Vérifier la Requête Supabase

**Dans `app/agent/page.tsx` :**

```typescript
const { data: leadsData, error } = await supabase
  .from('leads')
  .select('*')  // ← Vérifie que * inclut tous les champs
  .eq('agent_id', userId)
  .order('created_at', { ascending: false })

console.log('Leads:', leadsData)
console.log('Premier lead:', leadsData[0])
```

**Vérifiez dans la console :**
```javascript
{
  id: "...",
  nom_societe: "...",
  statut_conseiller: "ok",  // ← DOIT EXISTER
  commentaire_conseiller: "...",  // ← DOIT EXISTER
  date_suivi_conseiller: "..."  // ← DOIT EXISTER
}
```

**Si les champs manquent :**
→ Problème de permissions RLS

---

## ✅ Résumé de la Solution

**Problème :**
- Les policies RLS ne permettaient pas aux agents de voir les nouveaux champs

**Solution :**
1. Recréer les policies agent avec accès complet à leurs leads
2. Mettre à jour `LeadTableAgent.tsx` pour afficher les retours
3. Vérifier que les données existent dans la base

**Résultat :**
- ✅ Agent voit tous les champs de ses leads
- ✅ Section "Suivi Conseiller" visible
- ✅ Badge coloré selon statut
- ✅ Commentaire complet affiché

---

## 📞 Support

**Si le problème persiste :**

1. Exécutez ce diagnostic :
```sql
-- Vérifier les policies
SELECT policyname FROM pg_policies WHERE tablename = 'leads';

-- Vérifier un lead
SELECT * FROM public.leads WHERE commentaire_conseiller IS NOT NULL LIMIT 1;

-- Vérifier l'agent
SELECT id, email, role FROM public.profiles WHERE role = 'agent';
```

2. Copiez les résultats
3. Faites une capture d'écran de la console (F12)
4. Vérifiez que vous êtes bien connecté en tant qu'agent

*Guide de correction - 24 octobre 2024*
