# Checklist publication App Store & Play Store (GlowScore)

Ce document liste ce qui est **déjà en place** et ce qu’il reste à faire pour publier GlowScore sur l’**App Store** (Apple) et le **Play Store** (Google).

---

## Déjà en place dans le projet

| Élément | Statut |
|--------|--------|
| **iOS** `bundleIdentifier` | ✅ `com.glowscore.app` dans `app.json` |
| **Android** `package` | ✅ `com.glowscore.app` dans `app.json` |
| **Permissions iOS** (infoPlist) | ✅ Caméra + photothèque (libellés en français) |
| **Icône & splash** | ✅ `assets/images/` (icon, splash, adaptive Android) |
| **EAS** | ✅ `eas.json` + `projectId` dans `app.json` |
| **Paiement (IAP)** | ✅ RevenueCat branché (voir `PAIEMENT.md`) |
| **Firebase** | ✅ Auth + Firestore + `google-services.json` |

---

## Obligatoire avant soumission

### 1. Politique de confidentialité (Privacy Policy)

- **Apple** et **Google** exigent une **URL publique** vers ta politique de confidentialité.
- Elle doit décrire : quelles données sont collectées (email, photo, analyse, etc.), pourquoi, combien de temps, partage avec des tiers (Firebase, Face++, Gemini, RevenueCat).
- À héberger sur un site web (ex. page dédiée sur ton site ou outil type Termly, Iubenda).
- Tu devras renseigner cette URL :
  - **App Store Connect** : fiche de l’app → « Politique de confidentialité » (URL).
  - **Play Console** : Fiche Play Store → « Politique de confidentialité de l’app ».

**À faire :** rédiger la politique, la publier en ligne, noter l’URL.

---

### 2. App Store (Apple)

| Étape | Détail |
|-------|--------|
| **Compte Apple Developer** | Compte payant (99 €/an) sur [developer.apple.com](https://developer.apple.com). |
| **Identifiant d’app** | Créer un identifiant (bundle ID) `com.glowscore.app` dans Certificates, Identifiers & Profiles. |
| **App dans App Store Connect** | Créer une fiche app avec ce bundle ID. |
| **Fiche App Store** | Captures d’écran (iPhone 6.7", 6.5", 5.5" au minimum), description, mots-clés, catégorie (ex. « Style de vie » ou « Santé »). |
| **Étiquetage vie privée** | Renseigner les « Privacy Nutrition Labels » : données collectées (identifiant, email, photo/analyse si envoyée à des serveurs), utilisation, suivi (si tu utilises du tracking). |
| **Classification d’âge** | Questionnaire dans App Store Connect → réponses honnêtes (ex. 12+ si pas de contenu choquant). |
| **Achats in-app** | Abonnement + pack configurés (voir `PAIEMENT.md`). Contrat commercial et fiscal signé. |
| **Build** | Build natif (pas Expo Go). Ex. `eas build --platform ios --profile production` puis soumission via `eas submit` ou manuelle (Xcode). |

---

### 3. Play Store (Google)

| Étape | Détail |
|-------|--------|
| **Compte Google Play Console** | Compte développeur (25 $ une fois) sur [play.google.com/console](https://play.google.com/console). |
| **Créer l’application** | Nouvelle app, package name : `com.glowscore.app`. |
| **Fiche Play Store** | Captures d’écran, description courte/longue, icône 512×512, bannière promo optionnelle. |
| **Politique de confidentialité** | URL (voir §1). |
| **Formulaire « Sécurité des données »** | Déclarer quelles données sont collectées, si partagées, si optionnelles (email, photo, analyse faciale, etc.). |
| **Questionnaire de contenu** | Répondre (publicité, achats in-app, accès à la caméra/photos, etc.). |
| **Classement du contenu** | Questionnaire pour obtenir une tranche d’âge (ex. 3+, PEGI, etc.). |
| **Achats in-app** | Abonnement + produit unique configurés dans Play Console et RevenueCat (voir `PAIEMENT.md`). |
| **Build** | AAB (Android App Bundle) : `eas build --platform android --profile production`, puis upload dans Play Console ou `eas submit`. |

---

## Recommandations

- **Tests** : Tester sur vrais appareils (iOS + Android) avec comptes sandbox (Apple) et licences de test (Google) avant soumission.
- **Version** : Incrémenter `version` dans `app.json` (et `ios.buildNumber` / `android.versionCode` si tu les gères) à chaque soumission.
- **RGPD** : Si des utilisateurs sont en Europe, la politique de confidentialité et le consentement (ex. avant premier scan) doivent être conformes au RGPD.
- **Contenu** : Pas de promesses médicales (« guérison », « diagnostic »). Présenter l’app comme bien-être / style / conseils, pas comme dispositif médical.

---

## Résumé des manques à préparer

1. **Politique de confidentialité** : rédiger + héberger + noter l’URL.
2. **App Store Connect** : compte, fiche app, captures, étiquetage vie privée, classification, IAP.
3. **Play Console** : compte, fiche app, captures, Sécurité des données, questionnaire contenu, IAP.
4. **Builds de production** : `eas build` iOS et Android, puis soumission (EAS Submit ou manuelle).

Une fois ces points faits, l’app est prête à être soumise pour révision (Apple) et examen (Google).
