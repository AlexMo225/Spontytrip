// PATCH ASYNCSTORAGE - DOIT ÊTRE LE PREMIER IMPORT
import "../patches/asyncstorage-patch";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";

// Configuration Firebase avec variables d'environnement
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validation des variables d'environnement
const requiredEnvVars = [
    "EXPO_PUBLIC_FIREBASE_API_KEY",
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "EXPO_PUBLIC_FIREBASE_APP_ID",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
    throw new Error(
        `Variables d'environnement Firebase manquantes: ${missingVars.join(
            ", "
        )}\nVeuillez créer un fichier .env avec ces variables.`
    );
}

// Patch AsyncStorage pour React Native
if (typeof global !== "undefined") {
    global.AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
    console.log("✅ AsyncStorage patch appliqué avec succès");
}

// Initialiser Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log(
        "🔥 Firebase v8 Auth et Storage initialisés avec patch AsyncStorage"
    );
} else {
    firebase.app();
}

// Exporter les services
export const auth = firebase.auth();
export const storage = firebase.storage();
export default firebase;
