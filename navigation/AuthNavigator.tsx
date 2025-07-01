import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Colors } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import AuthStackNavigator from "./AuthStackNavigator";
import MainAppNavigator from "./MainAppNavigator";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.backgroundColors.primary,
    },
});

const AuthNavigator: React.FC = () => {
    const { user, loading } = useAuth();

    // Affichage du loader pendant la vérification de l'état d'auth
    if (loading) {
        return (
            <View style={styles.container}>
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
