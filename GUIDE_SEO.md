# 🚀 Guide SEO - Paginea

## ✅ Optimisations Implémentées

### 1. **Métadonnées Enrichies** 📋

#### Layout global (`/web/src/app/layout.tsx`)
- ✅ Title template : `%s | Paginea`
- ✅ Description optimisée pour Google (max 160 caractères)
- ✅ Keywords ciblés : "réseau social littéraire", "communauté de lecteurs", etc.
- ✅ Open Graph pour Facebook/LinkedIn
- ✅ Twitter Cards pour partages Twitter
- ✅ Apple Web App tags pour iOS
- ✅ Manifest PWA

### 2. **Structured Data (Schema.org)** 🏷️

Fichier : `/web/src/components/StructuredData.tsx`

**Types supportés :**
- `WebSite` : Page d'accueil avec SearchAction
- `Organization` : Informations entreprise
- `Article` : Posts/critiques
- `Book` : Fiches livres
- `Review` : Critiques de livres
- `Person` : Profils utilisateurs

**Avantages :**
- Apparaît dans les **Rich Results** Google
- Éligible pour les **Featured Snippets**
- Meilleur CTR dans les résultats de recherche

### 3. **Sitemap.xml** 🗺️

Fichier : `/web/src/app/sitemap.ts`

**Priorités définies :**
- Page d'accueil : `1.0` (max)
- Librairie : `0.95`
- Dashboard, Mes Livres : `0.9`
- Lectures Amis : `0.85`
- Messages, Profils : `0.6-0.75`
- Pages légales : `0.4`

**Accessible à :** `https://www.paginea.fr/sitemap.xml`

### 4. **Robots.txt** 🤖

Fichier : `/web/src/app/robots.ts`

**Configuration :**
- ✅ Autorise : Pages publiques, contenu
- ❌ Bloque : `/api/`, `/admin/`, `/messages/`, `/_next/`
- Référence sitemap automatiquement

**Accessible à :** `https://www.paginea.fr/robots.txt`

### 5. **PWA Manifest** 📱

Fichier : `/web/public/manifest.json`

**Fonctionnalités :**
- Installation sur écran d'accueil (mobile)
- Mode standalone (comme une app native)
- Icônes adaptatives
- Couleur de thème : `#065f46` (vert Paginea)

### 6. **Composant SEO Réutilisable** 🔄

Fichier : `/web/src/components/SEO.tsx`

**Utilisation :**
```tsx
<SEO 
  title="Ma page"
  description="Description unique"
  keywords={['mot1', 'mot2']}
  type="article"
  image="/image.jpg"
/>
```

---

## 📊 Actions Recommandées Post-Déploiement

### 1. **Google Search Console** 🔍
1. Aller sur : https://search.google.com/search-console
2. Ajouter la propriété : `https://www.paginea.fr`
3. Vérifier la propriété (balise HTML ou DNS)
4. Soumettre le sitemap : `https://www.paginea.fr/sitemap.xml`
5. Demander l'indexation des pages principales

### 2. **Google Analytics** 📈
1. Créer un compte : https://analytics.google.com
2. Ajouter la propriété Paginea
3. Obtenir le code de suivi (GA4)
4. Ajouter dans `/web/src/app/layout.tsx` :

```tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

### 3. **Bing Webmaster Tools** 🦅
1. Aller sur : https://www.bing.com/webmasters
2. Ajouter le site
3. Soumettre le sitemap
4. Vérifier l'indexation

### 4. **Open Graph Testing** 🧪

**Tester les partages sociaux :**
- Facebook : https://developers.facebook.com/tools/debug/
- Twitter : https://cards-dev.twitter.com/validator
- LinkedIn : https://www.linkedin.com/post-inspector/

**Entrer :** `https://www.paginea.fr`

### 5. **Structured Data Testing** ✅

**Google Rich Results Test :**
https://search.google.com/test/rich-results

**Tester :**
- Page d'accueil
- Une fiche livre
- Un post/critique

---

## 🎯 Mots-Clés Ciblés

### Primaires
- Réseau social littéraire
- Communauté de lecteurs
- Partage de lecture
- Critiques de livres

### Secondaires
- Recommandations de livres
- Bibliothèque virtuelle
- Club de lecture en ligne
- Découverte littéraire
- Avis sur les livres

### Long-tail
- "Où partager mes lectures en ligne"
- "Communauté de passionnés de lecture"
- "Réseau social pour les lecteurs"
- "Créer ma bibliothèque virtuelle"

---

## 📝 Optimisations Futures (Optionnelles)

### 1. **Blog SEO** ✍️
Créer un blog avec articles optimisés :
- "Top 10 des livres à lire en 2026"
- "Comment créer sa bibliothèque virtuelle"
- "Conseils pour écrire une critique de livre"

### 2. **Backlinks** 🔗
Obtenir des liens depuis :
- Blogs littéraires
- Sites de booktubers
- Forums de lecture
- Médias sociaux

### 3. **Rich Snippets** ⭐
Ajouter :
- Notes moyennes (étoiles dans Google)
- Nombre d'avis
- Prix des livres (affiliation Amazon)

### 4. **Performance** ⚡
- Optimiser les images (WebP, lazy loading)
- Minifier CSS/JS
- Cache navigateur
- CDN pour assets statiques

### 5. **Contenu** 📚
- Créer des pages catégories par genre
- Pages auteurs
- Top livres du mois
- Actualités littéraires

---

## 🔍 Vérifications SEO Rapides

### Checklist technique
- [x] Sitemap.xml accessible
- [x] Robots.txt configuré
- [x] Balises title uniques par page
- [x] Meta descriptions uniques
- [x] Balises H1 sur chaque page
- [x] Alt text sur images
- [x] URLs propres (slug)
- [x] HTTPS activé
- [x] Mobile-friendly
- [x] Vitesse de chargement < 3s

### Checklist contenu
- [x] Mots-clés dans title
- [x] Mots-clés dans description
- [x] Contenu unique (pas de duplicate)
- [x] Liens internes
- [x] Call-to-action clairs
- [x] Partage social facile

---

## 📈 Métriques à Suivre

### Google Search Console
- Impressions
- Clics
- Position moyenne
- CTR (Click-Through Rate)

### Google Analytics
- Sessions
- Utilisateurs
- Taux de rebond
- Pages par session
- Durée moyenne des sessions

### Objectifs
- Inscriptions (conversions)
- Livres ajoutés
- Avis publiés
- Partages sociaux

---

## 🎉 Résultat Attendu

Avec ces optimisations, Paginea devrait :
- ✅ Apparaître dans les résultats Google en 2-4 semaines
- ✅ Être indexé sur Bing/Yahoo
- ✅ Avoir de beaux aperçus sur réseaux sociaux
- ✅ Être installable comme PWA sur mobile
- ✅ Être éligible aux Rich Results Google

**Position cible dans 3-6 mois :**
- Top 20 pour "réseau social littéraire"
- Top 10 pour "communauté de lecteurs"
- Top 5 pour "Paginea"

---

## 📞 Support & Ressources

### Documentation
- Next.js SEO : https://nextjs.org/learn/seo/introduction-to-seo
- Schema.org : https://schema.org
- Google Search Central : https://developers.google.com/search

### Outils gratuits
- Google Search Console
- Google Analytics
- Google PageSpeed Insights
- GTmetrix
- Ubersuggest (mots-clés)

---

**Dernière mise à jour :** 8 février 2026  
**Version :** 1.0  
**Auteur :** Paginea Team
