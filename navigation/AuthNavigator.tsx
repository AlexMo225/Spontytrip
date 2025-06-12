import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "../constants/Colors";
import { Layout } from "../constants/Spacing";
import { useAuth } from "../contexts/AuthContext";
import AuthStackNavigator from "./AuthStackNavigator";
import MainAppNavigator from "./MainAppNavigator";

const AuthNavigator: React.FC = () => {
    const { user, loading } = useAuth();

    // Affichage du loader pendant la vérification de l'état d'auth
    if (loading) {
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

    // Si l'utilisateur est connecté, afficher l'app principale
    if (user) {
        console.log(
            "👤 Utilisateur connecté, navigation vers MainApp:",
            user.email
        );
        return <MainAppNavigator />;
    }

    // Sinon, afficher les écrans d'authentification
    console.log("🔐 Utilisateur non connecté, affichage des écrans d'auth");
    return <AuthStackNavigator />;
};

export default AuthNavigator;
