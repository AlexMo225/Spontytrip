import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    useFonts,
} from "@expo-google-fonts/poppins";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, View } from "react-native";

// Navigation
import AuthNavigator from "./navigation/AuthNavigator";

// Auth Context
import { AuthProvider } from "./contexts/AuthContext";

// Constants
import { Colors } from "./constants/Colors";
import { Layout } from "./constants/Spacing";

// Navigation et Contexte

export default function App() {
    // Chargement des polices
    const [fontsLoaded] = useFonts({
        Poppins_500Medium,
        Poppins_600SemiBold,
        Poppins_700Bold,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    // Affichage du loader pendant le chargement des polices
    if (!fontsLoaded) {
        return (
            <View
                style={[
                    Layout.container,
                    Layout.centerContent,
                    { backgroundColor: Colors.backgroundColors.primary },
                ]}
            >
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

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
