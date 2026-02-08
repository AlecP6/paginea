# 📚 Paginea - Réseau Social Littéraire

<div align="center">
  <img src="web/public/logo.png" alt="Paginea Logo" width="200"/>
  
  **Partagez vos lectures, découvrez de nouveaux livres et échangez avec une communauté passionnée de lecteurs.**

  [![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
  [![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)

  [🌐 Site Web](https://www.paginea.fr) • [📖 Documentation](docs/README.md) • [🚀 Déploiement](docs/DEPLOIEMENT_VERCEL_COMPLET.md)
</div>

---

## ✨ Fonctionnalités

### 📖 Gestion de Lectures
- ✅ Ajout de livres via recherche Open Library
- ✅ Statuts de lecture (Lu, En cours, À lire, Abandonné)
- ✅ Notes et critiques personnelles
- ✅ Bibliothèque virtuelle personnalisée

### 👥 Social
- ✅ Système d'amitié
- ✅ Fil d'actualité des amis
- ✅ Messagerie privée temps réel
- ✅ Commentaires et likes
- ✅ Partage de lectures

### 🏪 Librairie
- ✅ Découverte de nouveaux livres
- ✅ Livres populaires de la communauté
- ✅ Liens d'affiliation Amazon
- ✅ Recommandations personnalisées

### 🎨 Interface
- ✅ Design moderne avec animations fluides
- ✅ Mode sombre/clair
- ✅ Responsive mobile/tablette/desktop
- ✅ PWA (installable sur mobile)

### 🔐 Sécurité
- ✅ Authentification JWT
- ✅ Bcrypt pour mots de passe (12 rounds)
- ✅ Rate limiting
- ✅ Validation des inputs
- ✅ Headers de sécurité (CSP, HSTS)

### 💰 Monétisation
- ✅ Google AdSense intégré
- ✅ Amazon Affiliate (liens optimisés)

### 🚀 SEO & Performance
- ✅ Structured Data (Schema.org)
- ✅ Open Graph & Twitter Cards
- ✅ Sitemap.xml & robots.txt
- ✅ Métadonnées optimisées
- ✅ Images optimisées (Next.js Image)

---

## 🛠️ Technologies

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (State management)
- **Axios** (HTTP client)
- **Lucide React** (Icons)

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **PostgreSQL**
- **JWT** (Authentication)
- **Bcrypt** (Password hashing)

### Services Externes
- **Open Library API** (Recherche de livres)
- **Vercel** (Hébergement & déploiement)
- **Neon** (Base de données PostgreSQL)
- **Google AdSense** (Publicité)
- **Amazon Affiliate** (Monétisation)

---

## 📁 Structure du Projet

```
paginea/
├── web/                          # Application Next.js
│   ├── src/
│   │   ├── app/                  # Pages & API routes
│   │   ├── components/           # Composants React
│   │   ├── lib/                  # Utilitaires
│   │   └── store/                # State management (Zustand)
│   ├── prisma/
│   │   ├── schema.prisma         # Schéma de la BDD
│   │   └── migrations/           # Migrations Prisma
│   └── public/                   # Assets statiques
├── docs/                         # 📚 Documentation complète
│   ├── README.md                 # Index de la documentation
│   ├── GUIDE_SECURITE.md         # Guide sécurité
│   ├── GUIDE_MESSAGERIE.md       # Guide messagerie
│   ├── GUIDE_MONETISATION.md     # Guide monétisation
│   ├── GUIDE_SEO.md              # Guide SEO
│   └── ...                       # Autres guides
└── README.md                     # Ce fichier
```

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20.x ou supérieur
- PostgreSQL
- npm ou yarn

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/AlecP6/paginea.git
cd paginea
```

2. **Installer les dépendances**
```bash
cd web
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

Voir [docs/ENV_EXAMPLE.md](docs/ENV_EXAMPLE.md) pour la liste complète.

4. **Initialiser la base de données**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## 📖 Documentation

Toute la documentation est disponible dans le dossier [**docs/**](docs/):

### 📚 Guides Principaux
- [**Déploiement Vercel**](docs/DEPLOIEMENT_VERCEL_COMPLET.md) - Guide complet de déploiement
- [**Sécurité**](docs/GUIDE_SECURITE.md) - Bonnes pratiques de sécurité
- [**Messagerie**](docs/GUIDE_MESSAGERIE.md) - Système de messagerie privée
- [**Monétisation**](docs/GUIDE_MONETISATION.md) - Amazon & AdSense
- [**SEO**](docs/GUIDE_SEO.md) - Optimisation référencement

### 🔧 Configuration
- [Variables d'environnement](docs/ENV_EXAMPLE.md)
- [Configuration domaine](docs/CONFIGURATION_DOMAINE.md)
- [Checklist post-déploiement](docs/CHECKLIST_POST_DEPLOIEMENT.md)

---

## 🎯 Roadmap

### ✅ Réalisé (v1.0)
- Système d'authentification complet
- Gestion de bibliothèque personnelle
- Réseau social (amis, posts, likes, commentaires)
- Messagerie privée
- Recherche de livres (Open Library)
- Monétisation (AdSense + Amazon)
- SEO optimisé
- Design moderne & responsive

### 🚧 En cours
- Tests automatisés
- Notifications push
- Mode hors ligne (PWA)

### 📅 À venir (v2.0)
- Conversations de groupe
- WebSockets (messagerie temps réel)
- Recommendations IA
- Application mobile native
- API publique
- Modération automatique

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👤 Auteur

**Paginea Team**
- Website: [www.paginea.fr](https://www.paginea.fr)
- GitHub: [@AlecP6](https://github.com/AlecP6)

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Vercel](https://vercel.com/) - Hébergement
- [Prisma](https://www.prisma.io/) - ORM
- [Open Library](https://openlibrary.org/) - API de livres
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons

---

<div align="center">
  <p>Fait avec ❤️ pour les passionnés de lecture</p>
  <p>© 2026 Paginea. Tous droits réservés.</p>
</div>
