# 📱 Paginea Mobile

Application mobile pour Paginea, construite avec React Native, Expo et TypeScript.

## 🎨 Technologies

- **React Native** - Framework mobile
- **Expo** - Plateforme de développement
- **TypeScript** - Typage statique
- **Expo Router** - Navigation basée sur les fichiers
- **Zustand** - Gestion d'état
- **Axios** - Client HTTP
- **AsyncStorage** - Stockage local

## 📁 Structure

```
mobile/
├── app/                    # Routes et pages (File-based routing)
│   ├── _layout.tsx         # Layout racine
│   ├── index.tsx           # Page d'accueil/bienvenue
│   ├── login.tsx           # Connexion
│   ├── register.tsx        # Inscription
│   └── (tabs)/             # Navigation par onglets
│       ├── _layout.tsx     # Layout des tabs
│       ├── dashboard.tsx   # Feed/Dashboard
│       ├── books.tsx       # Critiques de livres
│       ├── friends.tsx     # Gestion des amis
│       └── profile.tsx     # Profil
├── lib/                    # API client
├── store/                  # Stores Zustand
└── assets/                 # Images, icônes, etc.
```

## 🚀 Démarrage

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npx expo start

# Ou utiliser les raccourcis
npm start
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS (Mac uniquement)
```

## 📱 Tester l'Application

### Sur un Appareil Physique

1. **Installez Expo Go** :
   - iOS : [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android : [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Lancez le serveur** : `npx expo start`

3. **Scannez le QR code** :
   - iOS : Caméra native
   - Android : App Expo Go

### Sur un Émulateur

**Android** :
```bash
# Assurez-vous qu'Android Studio et un AVD sont configurés
npx expo start --android
```

**iOS (Mac uniquement)** :
```bash
# Assurez-vous que Xcode et un simulateur sont configurés
npx expo start --ios
```

## 🔌 Configuration de l'API

Par défaut, l'app se connecte à `http://localhost:3001/api`.

### Pour tester sur un appareil physique

Modifiez `lib/api.ts` :

```typescript
// Remplacez localhost par l'IP de votre ordinateur
const API_URL = 'http://192.168.1.XXX:3001/api';
```

**Trouver votre IP** :
- Mac/Linux : `ifconfig | grep "inet "`
- Windows : `ipconfig`

⚠️ **Important** : Votre téléphone et ordinateur doivent être sur le même réseau WiFi.

## 🎯 Fonctionnalités

### Authentification
- ✅ Inscription avec email, username, mot de passe
- ✅ Connexion
- ✅ Persistance de la session avec AsyncStorage
- ✅ Déconnexion

### Dashboard (Feed)
- ✅ Affichage des posts publics
- ✅ Création de nouveaux posts
- ✅ Likes sur les posts
- ✅ Compteur de commentaires

### Livres
- ✅ Liste des critiques de livres
- ✅ Création de critiques (modal)
- ✅ Notes avec étoiles (1-10)
- ✅ Statuts de lecture
- ✅ Likes sur les critiques

### Amis
- ✅ Recherche d'utilisateurs
- ✅ Envoi de demandes d'ami
- ✅ Acceptation/Refus de demandes
- ✅ Liste des amis

### Profil
- ✅ Affichage des informations
- ✅ Édition du profil
- ✅ Déconnexion avec confirmation

## 🎨 Design System

### Couleurs

```javascript
Primary: '#0ea5e9'    // Sky Blue
Background: '#f8fafc'  // Light Gray
Card: '#ffffff'        // White
Text: '#1e293b'        // Dark Gray
Secondary Text: '#64748b'
```

### Composants

- **Avatar** : Cercles colorés avec initiale
- **Cards** : Fond blanc, coins arrondis
- **Buttons** : Primaire (bleu) ou secondaire (gris)
- **Inputs** : Bordure légère, coins arrondis

## 📱 Navigation

L'app utilise **Expo Router** avec une navigation par onglets :

```
(tabs)
├── Dashboard (Maison)
├── Books (Livre)
├── Friends (Personnes)
└── Profile (Profil)
```

## 🗂️ Gestion d'État

Store d'authentification avec Zustand :

```typescript
import { useAuthStore } from '../store/authStore';

function Component() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  // ...
}
```

## 🔐 Sécurité

- Token JWT stocké dans AsyncStorage
- Token automatiquement ajouté aux requêtes API
- Validation côté serveur

## 📦 Build pour Production

### Android (APK)

```bash
# Build de développement
eas build --profile development --platform android

# Build de production
eas build --profile production --platform android
```

### iOS (IPA)

```bash
# Build de développement
eas build --profile development --platform ios

# Build de production
eas build --profile production --platform ios
```

⚠️ Nécessite un compte Expo et EAS CLI configuré.

## 🚀 Publication

### Android (Google Play)

```bash
eas submit --platform android
```

### iOS (App Store)

```bash
eas submit --platform ios
```

## 🎭 Icônes

L'app utilise **@expo/vector-icons** (Ionicons) :

```typescript
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="heart" size={24} color="red" />
```

[Liste complète des icônes](https://icons.expo.fyi/Index)

## 🔧 Configuration

### app.json

Fichier de configuration Expo :

```json
{
  "expo": {
    "name": "Paginea",
    "slug": "paginea-mobile",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.paginea.app"
    },
    "android": {
      "package": "com.paginea.app"
    }
  }
}
```

## 🐛 Debugging

### Logs

```bash
# Voir les logs
npx expo start

# Puis dans l'app, secouez l'appareil pour ouvrir le menu développeur
```

### React Native Debugger

1. Installez [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Lancez-le sur le port 19000
3. Dans l'app, ouvrez le menu développeur → "Debug"

## 📚 Ressources

- [Documentation Expo](https://docs.expo.dev)
- [Documentation React Native](https://reactnative.dev)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Navigation](https://reactnavigation.org)

## 🎨 Personnalisation

### Changer le Nom de l'App

Modifiez `app.json` :

```json
{
  "expo": {
    "name": "VotreNom",
    "slug": "votrenom-mobile"
  }
}
```

### Changer l'Icône

Remplacez `assets/icon.png` par votre icône (1024x1024px).

### Changer le Splash Screen

Remplacez `assets/splash.png` par votre image de démarrage.

---

Pour plus d'informations, consultez le [README principal](../README.md).

