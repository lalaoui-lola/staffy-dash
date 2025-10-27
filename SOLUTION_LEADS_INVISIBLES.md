# 🔧 Solution - Leads Validés Invisibles pour le Conseiller

## ❌ Problème Identifié

**Symptôme :**
- Les leads validés existent dans la base de données ✅
- Mais ils n'apparaissent PAS dans le profil conseiller ❌

**Cause :**
- Problème de **permissions RLS** (Row Level Security)
- Les policies Supabase bloquent l'accès aux leads

---

## ✅ Solution en 3 Étapes

### Étape 1 : Corriger les Permissions RLS

**Ouvrez Supabase SQL Editor et exécutez :**

```sql
-- 1. Supprimer les anciennes policies restrictives
DROP POLICY IF EXISTS "Conseillers can view their assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Conseillers can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "conseiller_select" ON public.leads;

-- 2. Créer la nouvelle policy pour voir TOUS les leads validés
CREATE POLICY "Conseillers can view all validated leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  qualite = 'valide' 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'conseiller'
  )
);

-- 3. Créer la policy pour mettre à jour le suivi
CREATE POLICY "Conseillers can update lead tracking"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  qualite = 'valide'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'conseiller'
  )
)
WITH CHECK (
  qualite = 'valide'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'conseiller'
  )
);

-- 4. Vérifier que RLS est activé
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
```

**OU utilisez le fichier :**
```
supabase/fix_conseiller_permissions.sql
```

---

### Étape 2 : Vérifier les Colonnes Suivi

**Exécutez aussi (si pas déjà fait) :**

```sql
-- Ajouter les colonnes de suivi conseiller
DO $$ BEGIN
    CREATE TYPE statut_conseiller AS ENUM ('en_attente', 'ok', 'non_ok', 'rappeler');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS statut_conseiller statut_conseiller DEFAULT 'en_attente',
ADD COLUMN IF NOT EXISTS commentaire_conseiller TEXT,
ADD COLUMN IF NOT EXISTS date_suivi_conseiller TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS conseiller_suivi_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

UPDATE public.leads 
SET statut_conseiller = 'en_attente' 
WHERE statut_conseiller IS NULL;
```

**OU utilisez le fichier :**
```
supabase/add_conseiller_suivi.sql
```

---

### Étape 3 : Tester

1. **Rechargez** la page conseiller
   ```
   http://localhost:3000/conseiller
   ```

2. **Ouvrez** la console (F12)

3. **Regardez** les logs :
   ```
   🔍 Conseiller - Chargement des leads
   📊 Nombre de leads reçus: X
   ```

**Si X > 0 :** ✅ **PROBLÈME RÉSOLU !**

**Si X = 0 :** Voir le diagnostic ci-dessous

---

## 🔍 Diagnostic Rapide

### Test 1 : Vérifier les leads validés

```sql
SELECT COUNT(*) FROM public.leads WHERE qualite = 'valide';
```

**Si 0 :** Aucun lead validé → Validez des leads en admin

**Si > 0 :** Continuez au test 2

---

### Test 2 : Vérifier les policies

```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'leads' 
AND policyname LIKE '%onseiller%';
```

**Résultat attendu :**
```
Conseillers can view all validated leads
Conseillers can update lead tracking
```

**Si vide :** Les policies n'ont pas été créées → Retour Étape 1

---

### Test 3 : Vérifier RLS

```sql
SELECT rowsecurity 
FROM pg_tables 
WHERE tablename = 'leads';
```

**Résultat attendu :**
```
true
```

**Si false :**
```sql
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
```

---

### Test 4 : Console du navigateur

**Ouvrez F12 et regardez :**

**✅ Succès :**
```
🔍 Conseiller - Chargement des leads
📊 Nombre de leads reçus: 5
❌ Erreur: null
✅ Premier lead: {id: "...", nom_societe: "ABC", ...}
```

**❌ Échec :**
```
📊 Nombre de leads reçus: 0
❌ Erreur: {code: "42501", message: "new row violates..."}
```

**Si erreur 42501 :** Problème de permissions RLS → Retour Étape 1

---

## 📋 Checklist Complète

Avant de dire que ça ne fonctionne pas, vérifiez :

- [ ] **Script SQL exécuté** : `fix_conseiller_permissions.sql`
- [ ] **Colonnes créées** : `statut_conseiller`, etc.
- [ ] **Policies créées** : "Conseillers can view all validated leads"
- [ ] **RLS activé** : `rowsecurity = true`
- [ ] **Leads validés** : Au moins 1 lead avec `qualite = 'valide'`
- [ ] **Profil conseiller** : Rôle = `'conseiller'` (minuscule)
- [ ] **Page rechargée** : Ctrl+F5 (hard refresh)
- [ ] **Console vérifiée** : F12 → Onglet Console
- [ ] **Déconnexion/Reconnexion** : Se reconnecter en conseiller

---

## 🎯 Résumé de la Solution

**Le problème :**
- Les policies RLS bloquaient l'accès des conseillers aux leads

**La solution :**
- Créer une policy qui permet aux conseillers de voir **TOUS** les leads validés
- Pas seulement leurs leads assignés

**Avant :**
```sql
-- Ancienne policy restrictive
WHERE conseiller_id = auth.uid()  ❌
```

**Après :**
```sql
-- Nouvelle policy permissive
WHERE qualite = 'valide' 
AND role = 'conseiller'  ✅
```

---

## 🚀 Commandes Rapides

### Tout en un (Copier/Coller dans Supabase)

```sql
-- 1. Nettoyer les anciennes policies
DROP POLICY IF EXISTS "Conseillers can view their assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Conseillers can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "conseiller_select" ON public.leads;
DROP POLICY IF EXISTS "Conseillers can view all validated leads" ON public.leads;
DROP POLICY IF EXISTS "Conseillers can update lead tracking" ON public.leads;

-- 2. Créer les nouvelles policies
CREATE POLICY "Conseillers can view all validated leads"
ON public.leads FOR SELECT TO authenticated
USING (
  qualite = 'valide' 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'conseiller'
  )
);

CREATE POLICY "Conseillers can update lead tracking"
ON public.leads FOR UPDATE TO authenticated
USING (
  qualite = 'valide'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'conseiller'
  )
)
WITH CHECK (
  qualite = 'valide'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'conseiller'
  )
);

-- 3. Activer RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. Vérifier
SELECT policyname FROM pg_policies WHERE tablename = 'leads';
```

---

## ✅ Après la Correction

**Le conseiller peut maintenant :**
- ✅ Voir **TOUS** les leads validés (de tous les agents)
- ✅ Ajouter un suivi (OK, Non OK, Rappeler)
- ✅ Voir les suivis des autres conseillers
- ✅ Utiliser le calendrier
- ✅ Voir les RDV du jour

**Visible par :**
- ✅ Administrateur (toutes les pages)
- ✅ Agent (ses propres leads)
- ✅ Conseiller (tous les leads validés)

---

## 📞 Support

**Si le problème persiste après avoir suivi toutes les étapes :**

1. Exécutez le diagnostic complet :
   ```
   supabase/test_conseiller_access.sql
   ```

2. Copiez les résultats

3. Faites une capture d'écran de la console (F12)

4. Vérifiez que vous êtes bien connecté en tant que conseiller

---

## 🎉 Résultat Final

**Avant :**
```
Conseiller → 0 leads affichés ❌
Base de données → 10 leads validés ✅
```

**Après :**
```
Conseiller → 10 leads affichés ✅
Base de données → 10 leads validés ✅
```

**Problème résolu !** 🎊

*Solution Leads Invisibles - 24 octobre 2024*
