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
import StackNavigator from "./navigation/StackNavigator";

// Constants
import { Colors } from "./constants/Colors";
import { Layout } from "./constants/Spacing";

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
                    { backgroundColor: Colors.background.primary },
                ]}
            >
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <>
            <StatusBar
                style="auto"
                backgroundColor={Colors.background.primary}
            />
            <StackNavigator />
        </>
    );
}
