import React from "react";
import { StatusBar } from "expo-status-bar";

// Navigation
import AuthNavigator from "./navigation/AuthNavigator";

// Auth Context
import { AuthProvider } from "./contexts/AuthContext";

// Constants
import { Colors } from "./constants/Colors";

export default function App() {
    console.log("🚀 Démarrage de SpontyTrip avec polices système");

    return (
        <AuthProvider>
            <StatusBar
                style="auto"
                backgroundColor={Colors.backgroundColors.primary}
            />
            <AuthNavigator />
        </AuthProvider>
    );
}
