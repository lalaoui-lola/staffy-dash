# 🔧 Dépannage - Leads Non Visibles

## ❌ Problème

Un lead créé par l'agent "lola" et validé par l'admin n'apparaît pas pour le conseiller.

---

## 🔍 Diagnostic

### Étape 1 : Vérifier que le script SQL a été exécuté

**Dans Supabase SQL Editor :**

```sql
-- Vérifier si les colonnes existent
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'leads' 
AND column_name LIKE '%conseiller%';
```

**Résultat attendu :**
```
statut_conseiller       | USER-DEFINED | 'en_attente'
commentaire_conseiller  | text         | NULL
date_suivi_conseiller   | timestamp    | NULL
conseiller_suivi_id     | uuid         | NULL
```

**Si les colonnes n'existent pas :**
1. Ouvrez Supabase SQL Editor
2. Copiez le contenu de `supabase/add_conseiller_suivi.sql`
3. Exécutez-le

---

### Étape 2 : Vérifier le statut du lead

**Dans Supabase SQL Editor :**

```sql
-- Voir tous les leads récents
SELECT 
    id,
    nom_societe,
    nom_client,
    qualite,
    statut_conseiller,
    agent_id,
    date_rdv,
    created_at
FROM public.leads
ORDER BY created_at DESC
LIMIT 10;
```

**Vérifiez :**
- ✅ `qualite` = `'valide'` (pas `'non_valide'`)
- ✅ `statut_conseiller` existe et = `'en_attente'`
- ✅ `date_rdv` est remplie

---

### Étape 3 : Vérifier l'agent "lola"

**Dans Supabase SQL Editor :**

```sql
-- Trouver l'agent lola
SELECT 
    id,
    email,
    full_name,
    role
FROM public.profiles
WHERE email LIKE '%lola%' 
   OR full_name LIKE '%lola%';
```

**Puis vérifier ses leads :**

```sql
-- Remplacez 'ID_DE_LOLA' par l'ID trouvé ci-dessus
SELECT 
    id,
    nom_societe,
    nom_client,
    qualite,
    agent_id,
    created_at
FROM public.leads
WHERE agent_id = 'ID_DE_LOLA'
ORDER BY created_at DESC;
```

---

### Étape 4 : Compter les leads validés

**Dans Supabase SQL Editor :**

```sql
-- Compter les leads par statut
SELECT 
    qualite,
    COUNT(*) as nombre
FROM public.leads
GROUP BY qualite;
```

**Résultat attendu :**
```
valide      | X
non_valide  | Y
```

---

## ✅ Solutions

### Solution 1 : Exécuter le script SQL

**Si les colonnes n'existent pas :**

1. **Ouvrez** Supabase SQL Editor
2. **Copiez** le contenu de `supabase/add_conseiller_suivi.sql`
3. **Exécutez** le script
4. **Vérifiez** que ça s'exécute sans erreur
5. **Rechargez** la page conseiller

---

### Solution 2 : Valider le lead

**Si le lead n'est pas validé :**

1. **Connectez-vous** en tant qu'admin
2. **Allez** sur "Leads non validés"
3. **Trouvez** le lead de lola
4. **Cliquez** sur "Valider" (bouton vert)
5. **Confirmez**
6. **Reconnectez-vous** en tant que conseiller
7. **Le lead devrait apparaître**

---

### Solution 3 : Mettre à jour manuellement

**Si le lead existe mais n'a pas de statut_conseiller :**

```sql
-- Mettre à jour tous les leads sans statut_conseiller
UPDATE public.leads 
SET statut_conseiller = 'en_attente' 
WHERE statut_conseiller IS NULL;
```

---

### Solution 4 : Vérifier les permissions RLS

**Vérifier que les conseillers ont accès :**

```sql
-- Voir les policies sur la table leads
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'leads';
```

**Si nécessaire, ajouter une policy :**

```sql
-- Policy pour que les conseillers voient tous les leads validés
CREATE POLICY "Conseillers can view validated leads"
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

---

## 🔄 Procédure Complète de Vérification

### 1. Vérifier la structure

```sql
-- Exécuter dans Supabase SQL Editor
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'leads' 
ORDER BY ordinal_position;
```

**Colonnes attendues :**
- id
- nom_societe
- nom_client
- telephone
- mail
- formule_juridique
- departement
- numero_siret
- date_rdv
- heure_rdv
- qualite
- commentaire
- agent_id
- conseiller_id
- created_by
- date_creation
- created_at
- updated_at
- **statut_conseiller** ← DOIT EXISTER
- **commentaire_conseiller** ← DOIT EXISTER
- **date_suivi_conseiller** ← DOIT EXISTER
- **conseiller_suivi_id** ← DOIT EXISTER

---

### 2. Vérifier les données

```sql
-- Voir le lead spécifique de lola
SELECT 
    l.*,
    p.email as agent_email,
    p.full_name as agent_name
FROM public.leads l
LEFT JOIN public.profiles p ON l.agent_id = p.id
WHERE p.email LIKE '%lola%' 
   OR p.full_name LIKE '%lola%'
ORDER BY l.created_at DESC;
```

---

### 3. Corriger si nécessaire

```sql
-- Si statut_conseiller est NULL
UPDATE public.leads 
SET statut_conseiller = 'en_attente' 
WHERE statut_conseiller IS NULL;

-- Si qualite est non_valide mais devrait être valide
-- (À faire uniquement si vous êtes sûr)
UPDATE public.leads 
SET qualite = 'valide' 
WHERE id = 'ID_DU_LEAD';
```

---

## 🚀 Test Final

### Après avoir appliqué les corrections :

1. **Ouvrez** http://localhost:3000/conseiller
2. **Connectez-vous** en tant que conseiller
3. **Allez** sur "Tous les Leads"
4. **Vérifiez** que le lead apparaît

**Si le lead apparaît :**
- ✅ Problème résolu !

**Si le lead n'apparaît toujours pas :**
- Ouvrez la console du navigateur (F12)
- Regardez l'onglet "Network"
- Cherchez la requête vers Supabase
- Vérifiez la réponse

---

## 📊 Requête de Debug dans le Code

**Ajoutez temporairement dans `loadLeads` :**

```typescript
async function loadLeads(userId: string) {
  setLoading(true)

  const { data: leadsData, error } = await supabase
    .from('leads')
    .select(`
      *,
      agent:agent_id(id, email, full_name, role)
    `)
    .eq('qualite', 'valide')
    .order('date_rdv', { ascending: true })

  console.log('Leads data:', leadsData)
  console.log('Error:', error)
  console.log('Nombre de leads:', leadsData?.length)

  if (leadsData) {
    setLeads(leadsData as LeadWithAgent[])
    // ...
  }
}
```

**Ouvrez la console (F12) et regardez :**
- Nombre de leads retournés
- Contenu des leads
- Erreurs éventuelles

---

## ✅ Checklist

Avant de contacter le support, vérifiez :

- [ ] Le script `add_conseiller_suivi.sql` a été exécuté
- [ ] Les colonnes `statut_conseiller`, etc. existent
- [ ] Le lead a `qualite = 'valide'`
- [ ] Le lead a `statut_conseiller = 'en_attente'`
- [ ] L'agent "lola" existe dans la base
- [ ] Le lead est bien lié à l'agent lola (`agent_id`)
- [ ] Les permissions RLS permettent aux conseillers de voir les leads
- [ ] La page a été rechargée (Ctrl+F5)
- [ ] Le conseiller est bien connecté

---

## 🆘 Si Rien Ne Fonctionne

**Exécutez ce script de réinitialisation :**

```sql
-- ATTENTION : Ceci va réinitialiser tous les suivis conseiller
-- Utilisez uniquement en dernier recours

-- 1. Supprimer les colonnes si elles existent
ALTER TABLE public.leads 
DROP COLUMN IF EXISTS statut_conseiller,
DROP COLUMN IF EXISTS commentaire_conseiller,
DROP COLUMN IF EXISTS date_suivi_conseiller,
DROP COLUMN IF EXISTS conseiller_suivi_id;

-- 2. Supprimer l'enum
DROP TYPE IF EXISTS statut_conseiller;

-- 3. Re-exécuter le script complet
-- (Copiez le contenu de add_conseiller_suivi.sql)
```

**Puis :**
1. Rechargez la page
2. Reconnectez-vous
3. Testez à nouveau

---

## 📞 Contact

Si le problème persiste après toutes ces étapes :
1. Faites une capture d'écran de la console (F12)
2. Copiez le résultat des requêtes SQL de diagnostic
3. Notez les messages d'erreur exacts

*Guide de dépannage - 23 octobre 2024*
