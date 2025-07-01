// Constants
import { Colors } from "./constants";

// Navigation
import AuthNavigator from "./navigation/AuthNavigator";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { ModalProvider } from "./hooks/useModal";

// Expo
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function App() {
    console.log("🚀 Démarrage de SpontyTrip avec polices système");

    return (
        <ModalProvider>
            <AuthProvider>
                <StatusBar style="auto" backgroundColor={Colors.background} />
                <AuthNavigator />
            </AuthProvider>
        </ModalProvider>
    );
}
