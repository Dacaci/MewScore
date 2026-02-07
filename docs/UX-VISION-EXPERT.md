# Vision UX experte — Données, ordre des écrans et pertinence

## 1. Insights & Analytics (Accueil) — Est-ce logique ?

**État actuel**
- Carte « Insights & Analytics » sur l’Accueil (après scans restants).
- Contenu : streak (X jours), phrase de motivation, puis grille : Meilleur score, Moyenne (avec tendance), Nombre de scans, Record (longueur de streak).

**Problèmes**
- Le terme « Insights & Analytics » est en anglais et flou : ce ne sont pas des « insights » au sens « ce que tu dois améliorer », mais des **statistiques d’usage** (engagement, suivi).
- L’ordre met la streak en premier (gros chiffre) alors que pour une app beauté/score, **le meilleur score** est souvent plus motivant en premier.
- « Plus de statistiques avec Premium » ne dit pas quelles stats sont débloquées (on n’en affiche pas de nouvelles aujourd’hui).

**Recommandations**
- Renommer en **« Ta progression »** ou **« Tes stats »** (français, clair).
- Ordre proposé : **Meilleur score** → Moyenne (tendance) → Scans → Streak (ou Streak en premier si tu veux pousser la régularité).
- Si Premium n’apporte pas de stats en plus : retirer la mention « Plus de statistiques avec Premium » ou la remplacer par une vraie valeur (ex. « Historique des scores » / « Évolution dans le temps » quand ce sera dispo).

---

## 2. Ordre des données montrées à l’utilisateur — Optimal ?

### Écran Résultat (après un scan)

**Ordre actuel**
1. Photo  
2. Score (chiffre, tier, description, percentile)  
3. Grille de scores détaillés (Face++)  
4. Résumé IA  
5. Points forts  
6. À améliorer  
7. Conseils pour progresser  
8. Métriques faciales  
9. Lien « Voir l’analyse détaillée »  
10. Actions (Voir mes conseils, Nouveau scan, Retour)

**Problèmes**
- Le **résumé IA** arrive après la grille de scores : l’utilisateur voit d’abord des chiffres bruts, puis le résumé. Un résumé juste après le score donne du sens plus tôt.
- **Métriques faciales** (« indépendantes du score ») sont en bas : cohérent, mais la section pourrait s’appeler « Proportions & détails » pour clarifier.
- Le lien **« Voir l’analyse détaillée »** en bas est facile à manquer ; il ouvre un autre « monde » (looksmax) sans explication.

**Ordre recommandé**
1. Photo  
2. **Score** (chiffre, tier, percentile)  
3. **Résumé IA** (une phrase de contexte)  
4. **Points forts**  
5. **À améliorer**  
6. **Conseils pour progresser** (actions concrètes)  
7. **Grille de scores détaillés** (détail par critère)  
8. **Métriques faciales** (proportions)  
9. **Bloc clair** : « Plan d’action détaillé (par catégorie) » → lien vers Analyse détaillée  
10. Actions  

Résumé : **donner d’abord le sens (score + résumé + conseils), puis le détail (grille, métriques, puis analyse détaillée).**

---

## 3. Écrans après analyse — Intuitifs ?

**Parcours actuel**
- **Résultat** : tout le détail du scan en cours.
- **Conseils** (onglet) : même structure mais pour le **dernier** scan.
- **Analyse détaillée** (écran séparé) : découpe looksmax (catégories, métriques, conseils softmaxx).

**Problèmes**
- **Résultat** et **Conseils** affichent la **même chose** (points forts, à améliorer, conseils, métriques) : une fois pour le scan actuel, une fois pour le dernier. C’est voulu (référence permanente) mais le rôle de l’onglet « Conseils » n’est pas évident.
- L’utilisateur peut croire que « Conseils » = seulement des conseils, alors que c’est **tout le dernier résultat**.
- **Analyse détaillée** n’est pas présentée comme le niveau « au-dessus » (plan structuré par catégorie) mais comme un écran de plus.

**Recommandations**
- Renommer l’onglet **« Conseils »** en **« Dernier scan »** ou garder « Conseils » avec un sous-titre explicite : **« Mes conseils — Basé sur ton dernier scan »** (déjà en partie là).
- Sur la **page Résultat**, après les actions, proposer clairement : « Retrouve ce résumé dans l’onglet Dernier scan / Conseils » pour faire le lien.
- **Analyse détaillée** : y ajouter une courte intro en haut : « Ici, ton score est découpé par catégorie (structure, peau, yeux…) avec des conseils concrets pour chaque point. »

---

## 4. Faut-il repenser tout l’ordre de l’analyse détaillée ?

**Ordre actuel (Analyse détaillée)**
1. Score actuel + Potentiel max  
2. Conseils prioritaires (liste numérotée)  
3. Points forts / À améliorer (halos / failos, côte à côte)  
4. « Analyse par catégorie » → catégories (Structure osseuse, Zone des yeux, Peau, etc.) dans un ordre fixe.

**Points forts**
- Score + potentiel en premier : bien.
- Conseils prioritaires avant le détail par catégorie : logique (actions d’abord).

**À améliorer**
- **Halos / failos** (points forts / à améliorer) se recoupent avec ce que dit déjà l’écran Résultat (points forts / à améliorer Gemini). Double lecture pour une idée proche.
- **Ordre des catégories** : actuellement fixe (structure → yeux → peau → …). Mieux : **trier par priorité** (ex. catégories avec les scores les plus bas en premier) pour que l’utilisateur voie d’abord ce qui pèse le plus.

**Recommandations**
- Garder l’enchaînement : **Score / Potentiel** → **Conseils prioritaires** → **Catégories**.
- **Option A** : supprimer le bloc halos/failos sur l’analyse détaillée pour éviter la redite avec le Résultat (les conseils prioritaires suffisent comme synthèse).
- **Option B** : garder halos/failos mais les étiqueter clairement : « Points forts / faibles (analyse par catégories) » pour les distinguer du « Résumé IA ».
- **Catégories** : afficher en premier les catégories avec le **score moyen le plus bas** (ou avec au moins une métrique « critical »), puis le reste.
- Titre de section : « Analyse par catégorie » → **« Détail par catégorie (du plus à améliorer au plus solide) »** si tu appliques l’ordre par priorité.

---

## 5. L’analyse détaillée est-elle pertinente ?

**Oui.** Elle apporte :
- Une **structure** (catégories, métriques, niveaux) que le Résultat n’a pas.
- Des **conseils softmaxx** par métrique (mewing, peau, etc.) plus actionnables que les listes globales Gemini.
- La notion de **potentiel** (+X avec les conseils), motivante.

Elle est **complémentaire** du Résultat (résumé + conseils IA) et des **Conseils** (dernier scan). Le problème n’est pas la pertinence mais la **lisibilité du rôle** de chaque écran.

---

## 6. Les conseils sont-ils pertinents ou affichent-ils les mêmes choses ?

**Deux types de contenus « conseils » :**

| Source        | Où c’est affiché                         | Contenu                          |
|---------------|-------------------------------------------|----------------------------------|
| **Gemini (IA)** | Résultat + onglet Conseils (dernier scan) | Points forts, à améliorer, « Conseils pour progresser » (liste numérotée). Texte libre. |
| **Looksmax**  | Analyse détaillée uniquement             | Conseils prioritaires + par catégorie/métrique (softmaxx). Très structuré. |

**En pratique**
- **Résultat / Conseils** = même type de contenu (Gemini), pour le scan actuel vs dernier scan. Donc oui, **les mêmes types de blocs** (points forts, à améliorer, conseils) sont affichés à deux endroits, avec des **données différentes** (scan du jour vs dernier scan).
- **Analyse détaillée** = autre logique (catégories, scores, conseils ciblés). Il peut y avoir **recoupement thématique** (ex. « peau », « mâchoire ») entre Gemini et softmaxx, mais pas « les mêmes phrases ».

**Recommandations**
- Garder les deux niveaux : **synthèse lisible** (Résultat / Conseils) et **plan d’action détaillé** (Analyse détaillée).
- Éviter la redite visuelle : sur l’analyse détaillée, soit retirer halos/failos, soit les labelliser pour marquer la différence avec le Résumé IA.
- Sur le Résultat, un seul bloc « Conseils pour progresser » (Gemini) suffit ; ne pas dupliquer la même liste ailleurs sans raison.

---

## 7. Comment je verrais l’app en tant qu’expert (synthèse)

1. **Accueil**
   - Carte **« Ta progression »** (ou « Tes stats »), ordre : Meilleur score → Moyenne (tendance) → Scans → Streak. Texte Premium uniquement si une vraie valeur ajoutée existe.

2. **Résultat**
   - Ordre : Score → **Résumé IA** → Points forts → À améliorer → Conseils pour progresser → Grille détaillée → Métriques faciales → **« Plan d’action détaillé »** (lien explicite vers Analyse détaillée) → Actions.
   - Rappel : « Tu retrouveras ce résumé dans l’onglet Conseils. »

3. **Onglet Conseils**
   - Titre clair : **« Mes conseils »** + sous-titre **« Basé sur ton dernier scan »**. Structure identique au Résultat (pas de duplication de logique, juste « dernier » vs « ce scan »).

4. **Analyse détaillée**
   - Court texte d’intro : « Ton score découpé par catégorie (structure, peau, yeux…) avec des conseils concrets. »
   - Ordre : Score / Potentiel → Conseils prioritaires → **Catégories ordonnées par priorité** (les plus faibles en premier). Halos/failos optionnels et clairement labellisés s’ils restent.

5. **Cohérence sémantique**
   - **Résultat / Conseils** = « Ce que l’IA retient de ton visage » (résumé + conseils).
   - **Analyse détaillée** = « Plan d’action par critère » (looksmax / softmaxx).
   - **Insights / Stats** = « Ta progression dans le temps » (scores, streak).

En appliquant ces principes, l’app garde la même puissance mais avec un **ordre et des libellés** qui rendent chaque écran et chaque bloc plus logiques et plus intuitifs.
