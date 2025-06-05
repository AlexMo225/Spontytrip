# 🌟 SpontyTrip

Une application mobile React Native pour organiser des week-ends entre amis, simplement et efficacement.

## 🎯 Concept

SpontyTrip permet à un groupe d'amis d'organiser un week-end ensemble en centralisant toutes les étapes :

-   ✈️ Création d'un séjour et choix de destination
-   📅 Sélection des dates
-   ✅ Répartition des objets (checklist collaborative)
-   📱 QR code pour inviter les amis
-   📸 Galerie de souvenirs
-   💬 Chat entre membres

## 👥 Types d'utilisateurs

-   **Créateur** : Peut modifier, supprimer, inviter et gérer le voyage
-   **Membres** : Peuvent participer mais pas tout modifier

## 🎨 Design

Design **mobile-first, pastel, moderne et simple** inspiré de Splitwise, Airbnb et Notion :

-   **Polices** : Poppins (titres) / Inter (texte)
-   **Couleurs** : Palette pastel avec bleu principal (#6B73FF), vert secondaire (#9FE2BF)
-   **UI** : Composants réutilisables, navigation fluide

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Démarrer l'application
npm start

# Ou directement avec Expo
npx expo start
```

## 📁 Structure du projet

```
spontytrip/
├── screens/                    # Écrans de l'application
│   ├── LoginScreen.tsx        # Connexion
│   ├── RegisterScreen.tsx     # Inscription
│   ├── HomeScreen.tsx         # Accueil
│   ├── MyTripsScreen.tsx      # Mes voyages
│   ├── CreateTripScreen.tsx   # Créer un voyage
│   ├── TripDetailsScreen.tsx  # Détails du voyage
│   ├── ChecklistScreen.tsx    # Liste de tâches
│   ├── ChatScreen.tsx         # Discussion
│   ├── GalleryScreen.tsx      # Galerie
│   └── ...                   # Autres écrans
├── components/                # Composants réutilisables
│   ├── Button.tsx            # Bouton personnalisé
│   ├── Card.tsx              # Carte avec shadow
│   └── index.ts              # Exports
├── navigation/               # Configuration navigation
│   └── StackNavigator.tsx    # Navigation principale
├── constants/               # Constantes de design
│   ├── Colors.ts            # Palette de couleurs
│   ├── Fonts.ts             # Polices et styles
│   ├── Spacing.ts           # Espacements et layout
│   └── MockData.ts          # Données de test
├── types/                   # Types TypeScript
│   └── index.ts             # Interfaces principales
├── config/                  # Configuration app
├── hooks/                   # Hooks personnalisés
├── services/               # Services API
├── utils/                  # Utilitaires
└── App.tsx                 # Point d'entrée
```

## 🛠️ Technologies utilisées

-   **React Native** - Framework mobile cross-platform
-   **Expo** - Plateforme de développement
-   **React Navigation** - Navigation native
-   **TypeScript** - Typage statique
-   **Poppins & Inter** - Polices Google Fonts
-   **ESLint** - Linting du code

## 📱 Écrans disponibles

### 🔐 Authentification

-   `LoginScreen` - Connexion utilisateur
-   `RegisterScreen` - Création de compte
-   `ForgotPasswordScreen` - Récupération mot de passe

### 🏠 Navigation principale (Tabs)

-   `HomeScreen` - Accueil et aperçu
-   `MyTripsScreen` - Liste des voyages
-   `DiscoverScreen` - Découvrir destinations
-   `ProfileScreen` - Profil utilisateur

### ✈️ Gestion des voyages

-   `CreateTripScreen` - Créer un nouveau voyage
-   `TripDetailsScreen` - Détails et gestion
-   `EditTripScreen` - Modifier un voyage
-   `CitySuggestionsScreen` - Suggestions de destinations
-   `DateSelectionScreen` - Sélection des dates

### 🎯 Fonctionnalités voyage

-   `ChecklistScreen` - Liste de tâches collaborative
-   `ChatScreen` - Discussion du groupe
-   `GalleryScreen` - Photos et souvenirs
-   `InviteMembersScreen` - Inviter des amis

### ⚙️ Profil et paramètres

-   `EditProfileScreen` - Modifier le profil
-   `SettingsScreen` - Paramètres de l'app

## 🎨 Système de design

### Couleurs principales

```typescript
primary: "#6B73FF"; // Bleu moderne
secondary: "#9FE2BF"; // Vert pastel
accent: "#FF6B9D"; // Rose accent
background: "#FAFBFC"; // Fond clair
```

### Composants disponibles

-   `<Button />` - Bouton avec variants (primary, secondary, outline, ghost)
-   `<Card />` - Carte avec ombre et bordures arrondies

## 📝 Scripts disponibles

-   `npm start` - Démarre le serveur de développement
-   `npm run android` - Lance sur Android
-   `npm run ios` - Lance sur iOS
-   `npm run web` - Lance sur le web
-   `npm run lint` - Vérifie le code avec ESLint

## 🔄 Prochaines étapes

**Structure prête !** Tous les écrans sont créés et typés, en attente des maquettes Figma pour l'implémentation.

### Pour développer un écran :

1. 📋 Envoie ta maquette Figma
2. 🎨 Je convertis en JSX/TSX
3. ✅ Intégration avec navigation et types
4. 🚀 Test et validation

### Fonctionnalités à implémenter :

-   🔐 Authentification utilisateur
-   🗄️ Gestion d'état (Context/Redux)
-   🌐 Intégration API backend
-   📱 Notifications push
-   🔄 Synchronisation temps réel
-   📊 Analytics et métriques

## 🤝 Contribution

Le projet est structuré pour un développement modulaire et collaboratif. Chaque écran peut être développé indépendamment en suivant les types et constantes définis.

---

**SpontyTrip** - Organisez vos week-ends entre amis, simplement ! 🎉
