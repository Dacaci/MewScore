# Publication MewScore - Suivi

## Nom de l'app
**MewScore** (choisi pour le SEO - "mewing" = 300K+ recherches/mois)

## Langue
Français par défaut (anglais prévu pour v2)

---

## Etapes completees

- [x] Build EAS production (.aab) généré
- [x] Compte Google Play Console créé
- [x] App créée sur Google Play Console
- [x] Fichier .aab uploadé (tests internes)
- [x] Compte marchand en cours de création
- [x] **Renommage GlowScore → MewScore** (app.json, code, textes)
- [x] **Politique de confidentialité créée** (`docs/privacy-policy.html`)
- [x] **Conditions d'utilisation créées** (`docs/terms-of-service.html`)

---

## En attente

- [ ] **Vérification compte marchand Google** (quelques jours)
  - Virement de 0,25€ de Google à confirmer
  - Vérification d'identité

---

## A faire après vérification

### 1. Héberger les documents légaux
- [ ] Héberger `privacy-policy.html` sur un site web (GitHub Pages, Netlify, etc.)
- [ ] Héberger `terms-of-service.html`
- [ ] Noter les URLs pour les formulaires des stores

### 2. Google Play Console
- [ ] Créer l'abonnement mensuel
  - ID produit : `mewscore_monthly`
  - Prix : 4,99€/mois
- [ ] Créer le pack one-time
  - ID produit : `pack_15_scans`
  - Prix : 9,99€
- [ ] Remplir la fiche Play Store (description, screenshots, icône)
- [ ] Remplir le formulaire "Sécurité des données"
- [ ] Remplir le questionnaire de contenu
- [ ] Ajouter l'URL de la politique de confidentialité
- [ ] Ajouter testeurs (ton email en License Testing)
- [ ] Publier en test interne

### 3. RevenueCat
- [ ] Créer un compte sur revenuecat.com (si pas déjà fait)
- [ ] Ajouter l'app Android
- [ ] Connecter Google Play (Service Account JSON)
- [ ] Ajouter les produits dans RevenueCat
- [ ] Configurer les Entitlements
- [ ] Configurer les Offerings (packages "monthly" et "pack_15")
- [ ] Remplacer la clé test par la clé production dans .env

### 4. Nouveau build
- [ ] Refaire un build EAS avec le nouveau nom/package
  ```bash
  eas build --platform android --profile production
  ```
- [ ] Uploader le nouveau .aab sur Google Play

### 5. Tester les paiements
- [ ] S'ajouter en License Testing (Google Play Console)
- [ ] Tester l'achat abonnement
- [ ] Tester l'achat pack
- [ ] Vérifier que Firestore se met à jour

---

## Configuration actuelle

### app.json (mis à jour)
```json
{
  "name": "MewScore",
  "slug": "MewScore",
  "scheme": "mewscore",
  "ios.bundleIdentifier": "com.mewscore.app",
  "android.package": "com.mewscore.app"
}
```

### .env (clés)
```
EXPO_PUBLIC_REVENUECAT_API_KEY=test_nNnMBVFdsTTMmhQSgFXDjKFqlJi
```

### IDs produits attendus dans le code
- Abonnement : `monthly`, `$rc_monthly`, `default`
- Pack : `pack_15`, `pack`, `onetime`

---

## Documents légaux

| Document | Fichier | URL (à définir) |
|----------|---------|-----------------|
| Politique de confidentialité | `docs/privacy-policy.html` | https://... |
| Conditions d'utilisation | `docs/terms-of-service.html` | https://... |

---

## Notes
- RevenueCat ne fonctionne PAS dans Expo Go (module natif)
- Besoin d'un dev build ou build EAS pour tester les vrais paiements
- En mode dev/Expo Go, le code applique directement les changements Firestore (mock)
- **IMPORTANT** : Le package a changé (`com.mewscore.app`), il faudra un nouveau build

---

## Contact
Reviens sur Claude Code quand le compte marchand est vérifié pour continuer la configuration.
