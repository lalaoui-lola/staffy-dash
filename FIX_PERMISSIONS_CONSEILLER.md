# 🔧 Correction - Leads Non Visibles pour le Conseiller

## ❌ Problème

Les leads validés existent dans la base de données mais n'apparaissent pas dans le profil conseiller.

**Cause probable :** Problème de permissions RLS (Row Level Security)

---

## ✅ Solution Rapide

### Étape 1 : Exécuter le script de correction des permissions

**Dans Supabase SQL Editor :**

1. **Ouvrez** le fichier `supabase/fix_conseiller_permissions.sql`
2. **Copiez** tout le contenu
3. **Collez** dans Supabase SQL Editor
4. **Cliquez** "Run"
5. **Attendez** le message de succès

**Ce script va :**
- ✅ Supprimer les anciennes policies restrictives
- ✅ Créer une nouvelle policy pour que les conseillers voient TOUS les leads validés
- ✅ Permettre aux conseillers de mettre à jour le suivi
- ✅ Vérifier que RLS est activé

---

### Étape 2 : Vérifier les permissions

**Exécutez ce script de test :**

```sql
-- Voir les policies actuelles
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'leads'
AND policyname LIKE '%onseiller%';
```

**Résultat attendu :**
```
Conseillers can view all validated leads    | SELECT | qualite = 'valide'...
Conseillers can update lead tracking        | UPDATE | qualite = 'valide'...
```

---

### Étape 3 : Tester

1. **Rechargez** la page conseiller (Ctrl+F5)
2. **Ouvrez** la console (F12)
3. **Regardez** les logs :
   ```
   🔍 Conseiller - Chargement des leads
   📊 Nombre de leads reçus: X
   ```

**Si X > 0 :** ✅ Problème résolu !

**Si X = 0 :** Continuez au diagnostic avancé

---

## 🔍 Diagnostic Avancé

### Test 1 : Vérifier les leads validés dans la base

```sql
-- Compter les leads validés
SELECT COUNT(*) as nombre_leads_valides
FROM public.leads
WHERE qualite = 'valide';
```

**Si 0 :** Aucun lead n'est validé → Validez des leads en tant qu'admin

**Si > 0 :** Les leads existent, c'est un problème de permissions

---

### Test 2 : Vérifier le profil conseiller

```sql
-- Vérifier que l'utilisateur est bien conseiller
SELECT 
    id,
    email,
    full_name,
    role
FROM public.profiles
WHERE role = 'conseiller';
```

**Vérifiez :**
- ✅ Le conseiller existe
- ✅ Son rôle est exactement `'conseiller'` (pas `'Conseiller'` avec majuscule)

---

### Test 3 : Vérifier RLS

```sql
-- Vérifier que RLS est activé
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'leads';
```

**Résultat attendu :**
```
leads | true
```

**Si false :**
```sql
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
```

---

### Test 4 : Lister toutes les policies

```sql
-- Voir TOUTES les policies sur leads
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY policyname;
```

**Policies attendues :**
- `admin_all` : Admin peut tout faire
- `agent_select` : Agent peut voir ses leads
- `agent_insert` : Agent peut créer des leads
- `agent_update` : Agent peut modifier ses leads
- `Conseillers can view all validated leads` : **NOUVELLE**
- `Conseillers can update lead tracking` : **NOUVELLE**

---

## 🛠️ Solutions Alternatives

### Solution 1 : Recréer les policies manuellement

**Supprimer toutes les policies conseiller :**

```sql
DROP POLICY IF EXISTS "Conseillers can view their assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Conseillers can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "conseiller_select" ON public.leads;
DROP POLICY IF EXISTS "Conseillers can view all validated leads" ON public.leads;
DROP POLICY IF EXISTS "Conseillers can update lead tracking" ON public.leads;
```

**Créer la policy SELECT :**

```sql
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
```

**Créer la policy UPDATE :**

```sql
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
```

---

### Solution 2 : Désactiver temporairement RLS (DANGER)

**⚠️ À utiliser UNIQUEMENT pour tester :**

```sql
-- Désactiver RLS temporairement
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
```

**Testez si les leads apparaissent maintenant**

**Si OUI :** Le problème vient bien des policies RLS

**Réactivez RLS immédiatement :**

```sql
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
```

**Puis recréez les bonnes policies**

---

### Solution 3 : Vérifier le client Supabase

**Dans le code, vérifiez que le client utilise la bonne clé :**

```typescript
// .env.local
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

**La clé doit être la clé `anon` (publique), pas la clé `service_role`**

---

## 🔄 Procédure Complète

### 1. Exécuter le fix

```sql
-- Dans Supabase SQL Editor
-- Copier/coller le contenu de fix_conseiller_permissions.sql
```

### 2. Vérifier les policies

```sql
SELECT policyname FROM pg_policies WHERE tablename = 'leads';
```

### 3. Tester avec la console

1. Ouvrir http://localhost:3000/conseiller
2. Ouvrir la console (F12)
3. Regarder les logs :
   - `📊 Nombre de leads reçus: X`
   - `❌ Erreur: ...`

### 4. Si erreur de permissions

**Message type :**
```
"new row violates row-level security policy"
```

**Solution :**
- Vérifier que la policy existe
- Vérifier que le rôle est bien 'conseiller'
- Vérifier que RLS est activé

---

## 📊 Logs de Debug

**Dans la console du navigateur, vous devriez voir :**

```
🔍 Conseiller - Chargement des leads
📊 Nombre de leads reçus: 5
❌ Erreur: null
✅ Premier lead: {id: "...", nom_societe: "...", ...}
```

**Si vous voyez :**
```
📊 Nombre de leads reçus: 0
❌ Erreur: {code: "...", message: "..."}
```

**C'est un problème de permissions RLS !**

---

## ✅ Checklist de Vérification

Avant de continuer, vérifiez :

- [ ] Le script `fix_conseiller_permissions.sql` a été exécuté
- [ ] Les policies "Conseillers can view all validated leads" existent
- [ ] RLS est activé sur la table `leads`
- [ ] Le profil utilisateur a le rôle `'conseiller'` (minuscule)
- [ ] Il existe des leads avec `qualite = 'valide'`
- [ ] La page a été rechargée (Ctrl+F5)
- [ ] Les logs de la console ont été vérifiés
- [ ] Aucune erreur dans la console

---

## 🆘 Si Rien Ne Fonctionne

**Exécutez ce script de diagnostic complet :**

```sql
-- 1. Vérifier les leads validés
SELECT COUNT(*) FROM public.leads WHERE qualite = 'valide';

-- 2. Vérifier les conseillers
SELECT COUNT(*) FROM public.profiles WHERE role = 'conseiller';

-- 3. Vérifier RLS
SELECT rowsecurity FROM pg_tables WHERE tablename = 'leads';

-- 4. Vérifier les policies
SELECT COUNT(*) FROM pg_policies 
WHERE tablename = 'leads' 
AND policyname LIKE '%onseiller%';

-- 5. Voir les détails des policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'leads';
```

**Envoyez les résultats pour diagnostic**

---

## 📞 Support

Si le problème persiste :

1. **Copiez** les résultats du script de diagnostic
2. **Faites** une capture d'écran de la console (F12)
3. **Notez** le message d'erreur exact
4. **Vérifiez** que vous êtes bien connecté en tant que conseiller

*Guide de correction - 24 octobre 2024*
