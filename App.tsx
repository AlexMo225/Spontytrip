import { StatusBar } from "expo-status-bar";
import React from "react";

// Navigation
import AuthNavigator from "./navigation/AuthNavigator";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { ModalProvider } from "./hooks/useModal";

// Constants
import { Colors } from "./constants/Colors";

export default function App() {
    console.log("🚀 Démarrage de SpontyTrip avec polices système");

    return (
        <ModalProvider>
            <AuthProvider>
                <StatusBar
                    style="auto"
                    backgroundColor={Colors.backgroundColors.primary}
                />
                <AuthNavigator />
            </AuthProvider>
        </ModalProvider>
    );
}
