# 🔥 Configuration Firebase pour SpontyTrip

## 📋 Instructions de configuration

### 1️⃣ Créer le fichier .env

Créez un fichier `.env` à la racine du projet avec vos clés Firebase :

```bash
# Configuration Firebase - NE PAS COMMITER CE FICHIER
EXPO_PUBLIC_FIREBASE_API_KEY=votre_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre_projet_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_projet.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

### 2️⃣ Obtenir les clés Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Allez dans **Paramètres du projet** > **Général**
4. Dans la section **Vos applications**, cliquez sur **Web**
5. Copiez les valeurs de configuration

### 3️⃣ Activer les services Firebase

#### Authentication

1. Allez dans **Authentication** > **Sign-in method**
2. Activez **Email/Password**

#### Storage

1. Allez dans **Storage** > **Rules**
2. Configurez les règles de sécurité :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images de profil - seul le propriétaire peut lire/écrire
    match /profile-images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4️⃣ Sécurité

⚠️ **IMPORTANT** :

-   Le fichier `.env` est dans `.gitignore` et ne sera jamais commité
-   Ne partagez jamais vos clés Firebase publiquement
-   Utilisez des règles de sécurité Firebase appropriées

### 5️⃣ Démarrage

Une fois le fichier `.env` créé avec vos clés :

```bash
npm install
npx expo start
```

## 🔧 Fonctionnalités configurées

-   ✅ **Authentication** : Inscription/Connexion
-   ✅ **Storage** : Upload de photos de profil
-   ✅ **Synchronisation temps réel** des données utilisateur
