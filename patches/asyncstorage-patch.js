// Patch pour AsyncStorage - À importer AVANT Firebase
import AsyncStorage from "@react-native-async-storage/async-storage";

// Patch direct du module react-native
const ReactNative = require("react-native");

// Injection forcée d'AsyncStorage dans react-native
Object.defineProperty(ReactNative, "AsyncStorage", {
    get: () => AsyncStorage,
    enumerable: true,
    configurable: true,
});

// Polyfill global
global.AsyncStorage = AsyncStorage;

// Polyfill pour les environnements web
if (typeof window !== "undefined") {
    window.AsyncStorage = AsyncStorage;
}

console.log("✅ AsyncStorage patch appliqué avec succès");

export default AsyncStorage;
