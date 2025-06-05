# SpontyTrip

Une application React Native développée avec Expo Router.

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Démarrer l'application
npm start

# Ou directement avec Expo
npx expo start
```

## 📱 Plateformes supportées

-   iOS
-   Android
-   Web

## 📁 Structure du projet

```
spontytrip/
├── app/                    # Routes et écrans (Expo Router)
│   ├── (tabs)/            # Navigation par onglets
│   │   ├── index.tsx      # Écran d'accueil
│   │   ├── explore.tsx    # Écran d'exploration
│   │   └── _layout.tsx    # Layout des onglets
│   ├── _layout.tsx        # Layout racine
│   └── +not-found.tsx     # Page 404
├── assets/                # Images et ressources
│   └── images/           # Icônes de l'app
├── components/           # Composants réutilisables
├── config/              # Configuration de l'app
└── hooks/               # Hooks personnalisés
```

## 🛠️ Technologies utilisées

-   **React Native** - Framework mobile
-   **Expo** - Plateforme de développement
-   **Expo Router** - Navigation basée sur les fichiers
-   **TypeScript** - Typage statique
-   **ESLint** - Linting du code

## 📝 Scripts disponibles

-   `npm start` - Démarre le serveur de développement
-   `npm run android` - Lance sur Android
-   `npm run ios` - Lance sur iOS
-   `npm run web` - Lance sur le web
-   `npm run lint` - Vérifie le code avec ESLint

## 🎯 Prochaines étapes

Ce projet a été nettoyé et optimisé pour un développement professionnel. Vous pouvez maintenant :

1. Ajouter vos composants dans `/components`
2. Créer vos hooks personnalisés dans `/hooks`
3. Configurer votre app dans `/config`
4. Ajouter de nouvelles routes dans `/app`

Bon développement ! 🚀
