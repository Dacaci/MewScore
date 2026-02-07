# Mise en place du paiement (GlowScore)

## Contexte

- Le **paywall** existe déjà (abonnement 4,99 €/mois + pack 9,99 € une fois).
- Pour l’instant, un clic sur « Acheter » met à jour Firestore (Premium ou +15 scans) **sans vraie prise de paiement**.
- Pour accepter de l’argent en production, il faut brancher un **vrai** système de paiement.

---

## Règles Apple et Google

- **Contenu digital dans l’app** (débloquer Premium, scans, etc.) doit passer par les **achats in-app** du store (App Store / Google Play).
- **Stripe** (carte bancaire) dans l’app pour débloquer des fonctionnalités est **interdit par Apple** pour ce cas. Stripe reste utile pour un site web ou un autre type de vente.
- Donc : **achats in-app (IAP)** pour l’abonnement et le pack, côté mobile.

---

## Option recommandée : RevenueCat

**RevenueCat** gère pour toi :
- Les achats in-app **Apple** et **Google**
- La vérification des reçus
- Un **webhook** vers ton backend quand un achat réussit → tu mets à jour Firestore (`isPremium`, `scansRemaining`)

Avantages : un seul SDK, tableau de bord, essais gratuits, pas besoin de coder la validation des reçus toi-même.

### Étapes (résumé)

1. **Créer un compte** sur [revenuecat.com](https://www.revenuecat.com).
2. **Créer un projet** et ajouter ton app (iOS + Android si les deux).
3. **Côté Apple** (App Store Connect) :
   - Créer un abonnement (ex. `glowscore_premium_monthly`) à 4,99 €/mois.
   - Créer un produit « achat unique » (ex. `glowscore_pack_15`) à 9,99 €.
4. **Côté Google** (Play Console) :
   - Même chose : abonnement + produit unique avec les mêmes IDs (ou ceux que RevenueCat te donne).
5. **Dans RevenueCat** : lier ces produits (Product IDs) à des **Entitlements** (ex. `premium` pour l’abo, `pack_15` pour le pack).
6. **Dans l’app** :
   - Installer le SDK : `npx expo install react-native-purchases`
   - Configurer avec ta clé API RevenueCat (env `EXPO_PUBLIC_REVENUECAT_API_KEY`).
   - Au clic « Acheter » : appeler `Purchases.purchasePackage()` avec le bon package (abo ou pack).
   - Après succès : RevenueCat met à jour l’état côté client ; en parallèle tu peux appeler ton backend ou une **Cloud Function** pour mettre à jour Firestore.
7. **Webhook RevenueCat → Firebase** :
   - Dans RevenueCat, configurer un webhook vers une **Cloud Function** Firebase.
   - La Cloud Function reçoit l’événement (nouvel achat, renouvellement, annulation) et met à jour le document `users/{userId}` (isPremium, scansRemaining, etc.).

Détails et doc : [RevenueCat – Documentation](https://www.revenuecat.com/docs).

---

## Option alternative : react-native-iap (sans RevenueCat)

- Tu utilises **react-native-iap** (ou `expo-in-app-purchases` si compatible avec ton Expo).
- Tu lances l’achat côté app, tu reçois un **reçu** (token).
- Tu envoies ce reçu à **ton backend** (ou une Cloud Function).
- Le backend **vérifie le reçu** auprès d’Apple / Google (API server-side), puis met à jour Firestore.

Plus de travail (validation des reçus, gestion des renouvellements), mais pas de dépendance à RevenueCat.

---

## Ce qui est prêt dans le code

- **RevenueCat** : SDK configuré au démarrage (`revenuecat-init.ts`), clé API dans `.env` (`EXPO_PUBLIC_REVENUECAT_API_KEY`).
- **`services/payment-service.ts`** : `getOfferings()` charge les offres RevenueCat ; `purchaseSubscription(userId, pkg)` et `purchasePack(userId, pkg)` lancent l’achat IAP puis mettent à jour Firestore après succès. Si les offres ne sont pas chargées (ex. Expo Go), fallback sur mise à jour Firestore seule (mock).
- **Paywall** : charge les offres au montage, affiche les **prix réels** (RevenueCat) ou 4,99 € / 9,99 € en secours. Au clic « Acheter », achat réel si un package est disponible.
- **Identifiants des packages** (à créer dans le dashboard RevenueCat) : **monthly** (ou `$rc_monthly`) pour l’abonnement ; **pack_15** (ou `pack`) pour le pack one-time. Voir `SUBSCRIPTION_PACKAGE_IDS` / `PACK_PACKAGE_IDS` dans `payment-service.ts`.

---

## Résumé

| Étape | Action |
|-------|--------|
| 1 | Choisir RevenueCat (recommandé) ou react-native-iap |
| 2 | Créer produits / abonnements dans App Store Connect et Google Play |
| 3 | Configurer RevenueCat (ou ton backend) et lier les produits |
| 4 | Dans l’app : brancher le SDK et remplacer le « mock » dans `payment-service.ts` par l’appel au vrai achat |
| 5 | Mettre à jour Firestore après achat (webhook RevenueCat → Cloud Function, ou depuis l’app après validation) |

Une fois ces étapes faites, le système de paiement sera en place et le paywall actuel restera le même côté utilisateur.

---

## Guide pas à pas : tout configurer pour tester le vrai paiement

### Étape 1 – RevenueCat : projet et app

1. Va sur [app.revenuecat.com](https://app.revenuecat.com) et connecte-toi.
2. **Nouveau projet** : donne un nom (ex. GlowScore).
3. **Ajouter une app** :
   - **iOS** : nom (ex. GlowScore), bundle ID = celui de ton app Expo (dans `app.json` → `expo.ios.bundleIdentifier`, ex. `com.tonnom.glowscore`).
   - **Android** : nom, package name = `expo.android.package` dans `app.json` (ex. `com.tonnom.glowscore`).
4. Récupère les **clés API** : une pour iOS, une pour Android (dashboard → ton projet → API Keys). Mets la clé iOS dans `.env` comme `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` et la clé Android comme `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` (ou une seule clé dans `EXPO_PUBLIC_REVENUECAT_API_KEY` si tu utilises la même pour les deux en test).

---

### Étape 2 – App Store Connect (iOS)

1. Va sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com).
2. **Mon app** → crée une app si besoin (bundle ID doit correspondre à ton `app.json`).
3. **Abonnement (subscription)** :
   - Dans l’app → **Abonnements** (ou via **Accord sur les abonnements** si demandé).
   - Crée un **groupe d’abonnements** (ex. « Premium »).
   - Dans ce groupe, crée un **abonnement** (ex. « Mensuel ») :
     - **Référence du produit** : ex. `glowscore_premium_monthly` (c’est l’ID que RevenueCat utilisera).
     - Prix : 4,99 € (ou autre).
     - Durée : 1 mois.
   - Valide et soumets pour révision si besoin.
4. **Achat unique (pack)** :
   - Dans l’app → **Achats intégrés** (In-App Purchases).
   - **Créer** → type **Consommable** ou **Non consommable** (ex. Non consommable pour « pack 15 scans »).
   - **Référence du produit** : ex. `glowscore_pack_15`.
   - Prix : 9,99 €.
5. **Compte sandbox (test)** :
   - **Utilisateurs et accès** → **Sandbox** → **Testeurs** → crée un compte testeur (email + mot de passe).
   - Sur ton iPhone/simulateur : **Réglages → App Store → Se connecter** avec ce compte (en bas, section « Compte sandbox »). Comme ça les achats en test ne sont pas facturés.

---

### Étape 3 – Google Play Console (Android)

1. Va sur [play.google.com/console](https://play.google.com/console).
2. Crée ou sélectionne un **projet** et une **app** (package name = celui de ton `app.json`).
3. **Abonnement** :
   - **Monétisation** → **Produits** → **Abonnements** → **Créer un abonnement**.
   - ID produit : ex. `glowscore_premium_monthly` (même ID qu’iOS si tu veux, ou différent).
   - Prix : 4,99 €, renouvellement mensuel.
4. **Achat unique** :
   - **Produits** → **Achats intégrés** → **Créer un produit**.
   - Type : produit géré (one-time).
   - ID : ex. `glowscore_pack_15`, prix 9,99 €.
5. **Testeurs** :
   - **Paramètres** → **Licences de test** → ajoute les adresses Gmail qui pourront tester les achats sans être facturées.

---

### Étape 4 – RevenueCat : produits, entitlements et offre

1. **Produits (Products)**  
   Dans ton projet RevenueCat, pour l’app **iOS** :
   - **Products** → **+ New** → entre l’**Identifier** exact d’App Store Connect (ex. `glowscore_premium_monthly` pour l’abo, `glowscore_pack_15` pour le pack).  
   Fais pareil pour l’app **Android** avec les IDs Google Play (peuvent être les mêmes que sur iOS).

2. **Entitlements**  
   - **Entitlements** → **+ New** :
     - `premium` (pour débloquer l’accès Premium).
     - `pack_15` (optionnel, si tu veux un entitlement dédié au pack).  
   Tu peux n’avoir qu’un entitlement `premium` et gérer le pack côté Firestore uniquement.

3. **Offering et packages**  
   - **Offerings** → **+ New Offering** (ex. « Default »).
   - Dans cette offre, **+ Add Package** :
     - **Package 1** : identifiant **monthly** (ou `$rc_monthly`). Type « Subscription ». Attache le **produit** abonnement iOS et le produit abonnement Android. Attache l’entitlement `premium`.
     - **Package 2** : identifiant **pack_15** (ou `pack`). Type « One-time » (ou Custom). Attache les produits « pack » iOS et Android. Tu peux attacher `premium` aussi ou laisser sans entitlement si tu gères tout dans l’app/Firestore.
   - Enregistre et mets cette offre en **Current** pour ton projet.

Résumé : RevenueCat doit connaître les mêmes **Product IDs** que dans App Store Connect et Play Console, et ton offre « Default » doit contenir deux packages dont les **identifiers** sont `monthly` et `pack_15` (ou ceux listés dans `payment-service.ts`).

---

### Étape 5 – Build natif et test

1. **Build iOS** (Mac avec Xcode) :
   ```bash
   cd GlowScore
   npx expo run:ios
   ```
   Choisis un simulateur ou branche un iPhone. L’app se lance en mode « dev » avec le module natif RevenueCat.

2. **Build Android** :
   ```bash
   npx expo run:android
   ```
   Émulateur ou appareil connecté en USB.

3. **Tester l’achat** :
   - Connecte-toi dans l’app (compte test).
   - Ouvre le paywall.
   - Tu dois voir les **vrais prix** (ceux définis dans les stores).
   - Choisis « Abonnement » ou « Pack », clique **S’abonner** / **Acheter le pack** :
     - **iOS** : la fenêtre système d’achat s’ouvre ; utilise le compte sandbox si demandé.
     - **Android** : idem avec le compte Gmail en licence de test.
   - Après achat réussi, RevenueCat enregistre l’achat et ton code met à jour Firestore (Premium ou +15 scans).

Si les offres ne s’affichent pas : vérifie les Product IDs dans RevenueCat, que l’offre est « Current », et que l’app (bundle ID / package name) correspond bien à celle configurée dans les stores et RevenueCat.
