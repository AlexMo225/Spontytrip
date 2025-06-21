// PATCH ASYNCSTORAGE - DOIT ÊTRE LE PREMIER IMPORT
import "../patches/asyncstorage-patch";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

// Configuration Firebase avec variables d'environnement + fallback
const firebaseConfig = {
    apiKey:
        process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
        "AIzaSyAIgT9Su6zArCX_0vGc4gxrLjNcfXtO3Bo",
    authDomain:
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        "spontytrip-dfcfe.firebaseapp.com",
    projectId:
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "spontytrip-dfcfe",
    storageBucket:
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        "spontytrip-dfcfe.firebasestorage.app",
    messagingSenderId:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "324928313318",
    appId:
        process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
        "1:324928313318:web:2dbf4e8d3b326fa4c66827",
};

// Patch AsyncStorage pour React Native
if (typeof global !== "undefined") {
    (global as any).AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
    console.log("✅ AsyncStorage patch appliqué avec succès");
}

// Initialiser Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("🔥 Firebase v8 initialisé avec succès");
} else {
    firebase.app();
}

// Exporter les services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export default firebase;
