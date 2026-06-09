# FORGA — Grace Period & Billing Retry (RevenueCat + App Store Connect)

Document à exécuter dans les dashboards **avant** le launch. Pas de code à modifier — c'est de la config.

---

## ⚠️ Pourquoi c'est critique

Quand un user a un abonnement actif et que sa CB échoue au renouvellement (carte expirée, plafond atteint, banque suspecte une fraude), il a 2 destinations possibles :

| Scénario | Sans grace period | Avec grace period |
|---|---|---|
| CB échoue au renouvellement | **Downgrade immédiat → free.** L'user perd tout, churne, et tu rates 16 jours pendant lesquels Apple aurait pu réessayer. | **L'user garde l'accès premium 16 jours.** Apple réessaie 6 fois. Statistiquement, 30-40% des CB échouées se résolvent en silence. |

Sans grace period, tu perds artificiellement **30-40% de tes renouvellements** à cause de problèmes techniques de paiement. Et l'user est furieux : "j'ai payé, j'ai rien fait, et tout est verrouillé".

---

## 1) App Store Connect — activer Billing Retry & Grace Period

### Pour iOS subscriptions

1. Va sur **App Store Connect** → ton app → **Subscriptions**
2. Clique sur le subscription group **FORGA Pro** (ou son nom)
3. Onglet **Subscription Group Settings**
4. Cherche **"Billing Grace Period"**
5. Active-le → **16 jours** (max autorisé)

### Pourquoi 16 jours
- Apple essaie la CB de l'user pendant 60 jours (6 retries espacés)
- Tu n'as pas besoin d'aller jusqu'à 60j de grace — 16j couvre 90% des CB qui se résolvent
- Au-delà de 16j, l'user est probablement parti pour de bon

### Test
- Pour tester sans attendre une vraie expiration : utilise un **sandbox account** dans **Settings → Developer → Sandbox Apple Account**
- Force une expiration et vérifie que `entitlements.active['premium']` reste true pendant la grace period

---

## 2) RevenueCat dashboard — refléter la grace period

1. Va sur **app.revenuecat.com** → ton projet FORGA
2. **Projects → Settings → Subscription Status**
3. Vérifie que **"Grace Period as Active"** est activé (par défaut, RevenueCat traite la grace period comme un abonnement actif → c'est ce qu'on veut, l'user garde son accès)

### Côté code (déjà OK)
- `useEntitlements()` ou équivalent qui lit `customerInfo.entitlements.active['premium']` retourne `true` pendant la grace period automatiquement
- Pas besoin de logique custom

---

## 3) RevenueCat dashboard — Billing Issues Email

C'est l'email automatique envoyé à l'user dont la CB échoue. Il améliore drastiquement le taux de récupération.

1. **RevenueCat dashboard → Email Settings**
2. Active **"Billing Issue Email"**
3. Template recommandé :

> **Sujet** : Ta CB a un souci — garde ton accès FORGA Pro
>
> Salut Paul,
>
> Apple a essayé de renouveler ton abonnement FORGA Pro et la CB enregistrée a été refusée.
>
> Pas de panique : tu gardes ton accès complet pendant 16 jours pendant qu'Apple réessaie.
>
> Pour aller plus vite, mets à jour ta CB ici : [Lien vers réglages Apple ID]
>
> Tu as un souci ? Réponds à ce mail, on t'aide. 💪
>
> L'équipe FORGA

### Pourquoi ça marche
- Sans email : 100% des CB échouées restent en l'état (l'user ne sait même pas)
- Avec email : 50-60% des CB sont mises à jour dans les 7 jours

---

## 4) Configurer le webhook (optionnel mais recommandé)

Pour être notifié côté serveur quand un user entre/sort de grace period :

1. **RevenueCat → Integrations → Webhooks**
2. URL : `https://quwzjsbwylgkdxbdgcsc.supabase.co/functions/v1/revenuecat-webhook` (à créer si pas existant)
3. Events à écouter :
   - `BILLING_ISSUE` — l'user entre en grace period
   - `EXPIRATION` — fin de grace period sans résolution
   - `RENEWAL` — CB rechargée OK
   - `CANCELLATION` — l'user a annulé volontairement

Avec ce webhook, tu peux :
- Logger l'event en analytics (`subscription_billing_issue`, `subscription_recovered`)
- Envoyer un push notif "Pense à mettre à jour ta CB" (gated par quiet hours + cap journalier déjà en place)
- Mettre à jour ton dashboard ops

---

## 5) Checklist finale avant submit

- [ ] Grace period activée dans App Store Connect (16 jours)
- [ ] Grace period reflétée comme "active" dans RevenueCat
- [ ] Billing Issue Email activé dans RevenueCat (template custom rempli)
- [ ] Webhook configuré (optionnel — peut être fait post-launch)
- [ ] Test fait avec sandbox account : `entitlements.active['premium']` reste `true` pendant 16 jours après expiration sans renouvellement

---

## 6) Métrique à surveiller post-launch

Dans RevenueCat dashboard :
- **Recovery rate** : % d'abonnements qui repassent à actif après une CB échouée
- Objectif : > 30% (industrie : 25-40%)
- Si < 20% → revoir l'email template ou ajouter un push notif in-app

Et dans tes analytics PostHog :
- Event `subscription_billing_issue` count
- Event `subscription_recovered` count
- Ratio recovered / billing_issue
