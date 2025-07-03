# 🌍 SpontyTrip

## 📱 À propos

SpontyTrip est une application mobile collaborative de gestion de voyages développée avec React Native et Expo. Elle permet aux voyageurs de planifier, organiser et partager leurs aventures en toute simplicité.

## ✨ Fonctionnalités principales

### 🎯 Gestion des voyages

-   Création modification et suppression de voyages
-   Invitation de participants
-   Interface intuitive et moderne

### 📋 Checklist collaborative

-   Templates prédéfinis pour différents types de voyages
-   Attribution des tâches aux participants
-   Suivi en temps réel de l'avancement
-   Vue personnelle "Mes tâches"

### 💰 Gestion des dépenses

-   Suivi des dépenses du groupe
-   Conversion des devises intégrée
-   Calcul automatique des remboursements
-   Visualisation claire des dettes

### 📝 Notes partagées

-   Création et partage de notes
-   Organisation par catégories
-   Recherche rapide
-   Mode hors-ligne

### 🎨 Activités

-   Planification d'activités
-   Timeline interactive
-   Filtres par type et date
-   Détails et informations pratiques

## 🛠 Technologies utilisées

-   **Frontend:**

    -   React Native
    -   Expo SDK 53
    -   TypeScript
    -   React Navigation
    -   React Native Elements

-   **Backend:**

    -   Firebase v8
        -   Authentication
        -   Cloud Firestore
        -   Cloud Storage
        -   Cloud Functions

-   **Tests:**
    -   Jest
    -   React Native Testing Library
    -   Tests unitaires et d'intégration
    -   Couverture de code > 85%

## 📦 Installation

\`\`\`bash

# Cloner le repository

git clone [URL_DU_REPO]

# Installer les dépendances

npm install --legacy-peer-deps

# Lancer l'application en mode développement

npm start
\`\`\`

## 🚀 Scripts disponibles

-   \`npm start\`: Lance le serveur de développement Expo
-   \`npm test\`: Lance la suite de tests
-   \`npm run test:coverage\`: Génère un rapport de couverture de tests
-   \`npm run test:watch\`: Lance les tests en mode watch
-   \`npm run android\`: Lance l'application sur Android
-   \`npm run ios\`: Lance l'application sur iOS

## 🧪 Tests

L'application dispose d'une suite de tests complète :

-   Tests unitaires pour les utilitaires et constantes
-   Tests d'intégration pour l'architecture
-   Couverture de code globale : 89.47%

## 📱 Configuration requise

-   Node.js >= 14.0.0
-   Expo CLI
-   iOS 13+ ou Android 6.0+
-   Compte Firebase

## 🔒 Variables d'environnement

Créez un fichier \`.env\` à la racine du projet :

\`\`\`
FIREBASE_API_KEY=votre_api_key
FIREBASE_AUTH_DOMAIN=votre_auth_domain
FIREBASE_PROJECT_ID=votre_project_id
FIREBASE_STORAGE_BUCKET=votre_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
FIREBASE_APP_ID=votre_app_id
\`\`\`

## 📚 Structure du projet

\`\`\`
spontytrip/
├── api/ # Services API externes
├── components/ # Composants React Native
├── config/ # Configuration Firebase
├── constants/ # Constantes de l'application
├── contexts/ # Contextes React
├── hooks/ # Hooks personnalisés
├── navigation/ # Configuration de la navigation
├── screens/ # Écrans de l'application
├── services/ # Services (auth, firebase, etc.)
├── styles/ # Styles et thèmes
├── tests/ # Tests unitaires et d'intégration
├── types/ # Types TypeScript
└── utils/ # Utilitaires
\`\`\`

## 📱 Bonnes pratiques de développement

### 🔄 Gestion d'état

-   Utilisation des React Hooks personnalisés pour la logique métier
-   Context API pour le state global
-   État local avec useState pour les composants simples
-   Gestion optimisée des re-renders avec useMemo et useCallback

### 🏗 Architecture des composants

-   Pattern de composition pour les composants réutilisables
-   Séparation claire entre les composants de présentation et la logique
-   Props TypeScript bien typées pour une meilleure maintenabilité
-   Utilisation des refs pour les interactions DOM directes

### 🔥 Optimisations Firebase

-   Indexes Firestore optimisés pour les requêtes complexes
-   Règles de sécurité strictes pour protéger les données
-   Utilisation du mode hors-ligne pour une meilleure expérience utilisateur
-   Pagination et lazy loading pour les grandes collections

### 📱 Spécificités React Native

-   Utilisation des FlatList pour les longues listes
-   Gestion optimisée des images avec mise en cache
-   Support du mode sombre natif
-   Gestion des différentes tailles d'écran avec responsive design

### 🚀 Performance

-   Lazy loading des écrans non critiques
-   Compression des images avant upload
-   Minimisation des re-renders inutiles
-   Utilisation de web workers pour les calculs lourds

### 🔒 Sécurité

-   Authentification multi-facteurs disponible
-   Validation des données côté client et serveur
-   Protection contre les injections NoSQL
-   Encryption des données sensibles

## 💡 Guides de développement

### 🎨 Style et formatage

\`\`\`typescript
// Exemple de composant bien structuré
interface ButtonProps {
title: string;
onPress: () => void;
variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
title,
onPress,
variant = 'primary'
}) => {
// Implementation...
};
\`\`\`

### 🪝 Exemple de Hook personnalisé

\`\`\`typescript
// Hook de gestion des voyages
const useTrip = (tripId: string) => {
const [trip, setTrip] = useState<Trip | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
// Implementation...
}, [tripId]);

return { trip, loading };
};
\`\`\`

### 🔥 Exemple de règle Firestore

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /trips/{tripId} {
allow read: if request.auth != null &&
(resource.data.participants[request.auth.uid] != null);
allow write: if request.auth != null &&
(resource.data.owner == request.auth.uid);
}
}
}
\`\`\`

## 📚 Ressources d'apprentissage

### 📖 Documentation officielle

-   [React Native](https://reactnative.dev/)
-   [Expo](https://docs.expo.dev/)
-   [Firebase](https://firebase.google.com/docs)
-   [TypeScript](https://www.typescriptlang.org/docs/)

### 🎓 Tutoriels recommandés

-   [React Native Navigation](https://reactnavigation.org/docs/getting-started)
-   [Firebase Authentication](https://firebase.google.com/docs/auth)
-   [Firestore Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)
-   [TypeScript avec React Native](https://reactnative.dev/docs/typescript)

### 🔧 Outils de développement recommandés

-   VS Code avec les extensions :
    -   ESLint
    -   Prettier
    -   React Native Tools
    -   Firebase Explorer
-   React Native Debugger
-   Firebase Console
-   Expo Go

## 🌟 Fonctionnalités à venir

-   🌐 Support multilingue
-   🗺 Intégration de cartes interactives
-   📊 Statistiques avancées des voyages
-   🤖 Assistant IA pour la planification
-   📸 Galerie photos partagée
-   🔔 Notifications push personnalisées

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Forker le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

-   [SAHIE]
-   [Alex]

## 📞 Support

Pour toute question ou problème :

-   Ouvrir une issue sur GitHub
-   Contacter l'équipe de support à [Alexmorel1999@gmail.com]