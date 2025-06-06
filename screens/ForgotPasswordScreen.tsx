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

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "ForgotPassword"
>;

interface Props {
    navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert("Erreur", "Veuillez entrer votre adresse email");
            return;
        }

        // Validation email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Erreur", "Veuillez entrer une adresse email valide");
            return;
        }

        setIsLoading(true);

        // Simulation d'envoi d'email (à remplacer par votre API)
        setTimeout(() => {
            setIsLoading(false);
            setIsEmailSent(true);
        }, 1500);
    };

    const handleGoBackToLogin = () => {
        navigation.navigate("Login");
    };

    const handleResendEmail = () => {
        setIsEmailSent(false);
    };

    if (isEmailSent) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successContainer}>
                    <View style={styles.successContent}>
                        <Text style={styles.successIcon}>📧</Text>
                        <Text style={styles.successTitle}>Email envoyé !</Text>
                        <Text style={styles.successDescription}>
                            Nous avons envoyé un lien de réinitialisation à{" "}
                            {email}
                        </Text>
                        <Text style={styles.successSubtext}>
                            Vérifiez votre boîte mail et suivez les instructions
                            pour réinitialiser votre mot de passe.
                        </Text>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleGoBackToLogin}
                        >
                            <Text style={styles.primaryButtonText}>
                                Retour à la connexion
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleResendEmail}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Renvoyer l&apos;email
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

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
                        <Text style={styles.title}>Mot de passe oublié ?</Text>
                        <Text style={styles.subtitle}>
                            Entrez votre adresse email pour recevoir un lien de
                            réinitialisation
                        </Text>
                    </View>

                    {/* Formulaire */}
                    <View style={styles.form}>
                        {/* Champ Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Adresse email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Entrez votre email"
                                placeholderTextColor={Colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                        </View>

                        {/* Bouton d'envoi */}
                        <TouchableOpacity
                            style={[
                                styles.resetButton,
                                isLoading && styles.resetButtonDisabled,
                            ]}
                            onPress={handleResetPassword}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.resetButtonText}>
                                {isLoading
                                    ? "Envoi en cours..."
                                    : "Envoyer le lien"}
                            </Text>
                        </TouchableOpacity>

                        {/* Retour à la connexion */}
                        <TouchableOpacity
                            style={styles.backToLoginButton}
                            onPress={handleGoBackToLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.backToLoginText}>
                                Retour à la connexion
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
        paddingTop: Spacing.xl,
    },
    header: {
        paddingBottom: Spacing.xl,
        alignItems: "center",
    },
    title: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: Spacing.md,
    },
    subtitle: {
        ...TextStyles.body1,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 22,
        paddingHorizontal: Spacing.sm,
    },
    form: {
        flex: 1,
        paddingTop: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.xl,
    },
    label: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
        fontWeight: "500",
        marginBottom: Spacing.xs,
    },
    input: {
        ...TextStyles.body1,
        height: 56,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: "#DCE0E5",
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        color: Colors.textPrimary,
    },
    resetButton: {
        height: 48,
        backgroundColor: Colors.secondary,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.91,
        marginBottom: Spacing.lg,
    },
    resetButtonDisabled: {
        opacity: 0.6,
    },
    resetButtonText: {
        ...TextStyles.button,
        color: Colors.textPrimary,
        fontWeight: "600",
    },
    backToLoginButton: {
        alignItems: "center",
        paddingVertical: Spacing.md,
    },
    backToLoginText: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        textDecorationLine: "underline",
    },
    // Styles pour l'écran de succès
    successContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: Spacing.md,
    },
    successContent: {
        alignItems: "center",
        paddingHorizontal: Spacing.lg,
    },
    successIcon: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    successTitle: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: Spacing.md,
    },
    successDescription: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
        textAlign: "center",
        marginBottom: Spacing.md,
        fontWeight: "500",
    },
    successSubtext: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: Spacing.xl,
    },
    primaryButton: {
        height: 48,
        backgroundColor: Colors.secondary,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.91,
        marginBottom: Spacing.md,
        minWidth: 200,
        paddingHorizontal: Spacing.lg,
    },
    primaryButtonText: {
        ...TextStyles.button,
        color: Colors.textPrimary,
        fontWeight: "600",
    },
    secondaryButton: {
        alignItems: "center",
        paddingVertical: Spacing.md,
    },
    secondaryButtonText: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        textDecorationLine: "underline",
    },
});

export default ForgotPasswordScreen;
 