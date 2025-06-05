import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { RootStackParamList } from "../types";

type RegisterScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Register"
>;

interface Props {
    navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
            return;
        }

        if (password.length < 6) {
            Alert.alert(
                "Erreur",
                "Le mot de passe doit contenir au moins 6 caractères"
            );
            return;
        }

        setIsLoading(true);

        // Simulation d'une inscription (à remplacer par votre API)
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert("Succès", "Compte créé avec succès !", [
                {
                    text: "OK",
                    onPress: () => navigation.replace("MainTab"),
                },
            ]);
        }, 1500);
    };

    const handleGoToLogin = () => {
        navigation.navigate("Login");
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoid}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Créer votre compte</Text>
                    </View>

                    {/* Formulaire */}
                    <View style={styles.form}>
                        {/* Champ Email */}
                        <View style={styles.inputGroup}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={Colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                        </View>

                        {/* Champ Mot de passe */}
                        <View style={styles.inputGroup}>
                            <TextInput
                                style={styles.input}
                                placeholder="Mot de passe"
                                placeholderTextColor={Colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                        </View>

                        {/* Champ Confirmer le mot de passe */}
                        <View style={styles.inputGroup}>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirmer le mot de passe"
                                placeholderTextColor={Colors.textSecondary}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                        </View>

                        {/* Bouton d'inscription */}
                        <TouchableOpacity
                            style={[
                                styles.registerButton,
                                isLoading && styles.registerButtonDisabled,
                            ]}
                            onPress={handleRegister}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.registerButtonText}>
                                {isLoading ? "Création..." : "S&apos;inscrire"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleGoToLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginText}>
                            Déjà un compte ?{" "}
                            <Text style={styles.loginLink}>Se connecter</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.md,
    },
    header: {
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xl,
        alignItems: "flex-start",
    },
    title: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        fontWeight: "600",
        marginLeft: Spacing.xs,
    },
    form: {
        flex: 1,
        paddingTop: Spacing.md,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    input: {
        ...TextStyles.body1,
        height: 56,
        backgroundColor: "#F0F2F5",
        borderWidth: 0,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        color: Colors.textPrimary,
    },
    registerButton: {
        height: 48,
        backgroundColor: Colors.secondary,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.91,
        marginTop: Spacing.md,
    },
    registerButtonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        ...TextStyles.button,
        color: Colors.textPrimary,
        fontWeight: "600",
    },
    footer: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        alignItems: "center",
    },
    loginText: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        textAlign: "center",
    },
    loginLink: {
        color: Colors.textPrimary,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});

export default RegisterScreen;
