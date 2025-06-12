// PATCH ASYNCSTORAGE - DOIT ÊTRE LE PREMIER IMPORT
import "../patches/asyncstorage-patch";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAIgT9Su6zArCX_0vGc4gxrLjNcfXtO3Bo",
    authDomain: "spontytrip-dfcfe.firebaseapp.com",
    projectId: "spontytrip-dfcfe",
    storageBucket: "spontytrip-dfcfe.firebasestorage.app",
    messagingSenderId: "324928313318",
    appId: "1:324928313318:web:2dbf4e8d3b326fa4c66827",
};

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
