import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useLayoutEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
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
import SpontyTripLogoAnimated from "../components/SpontyTripLogoAnimated";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { useModal } from "../hooks/useModal";
import { AuthService } from "../services/authService";
import { RootStackParamList } from "../types";

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "ForgotPassword"
>;

interface Props {
    navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
    const modal = useModal();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });

        // Animation d'entrée
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [navigation, fadeAnim]);

    // Validation de l'email
    const validateEmail = (email: string): boolean => {
        setEmailError("");
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setEmailError("L'adresse email est requise");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setEmailError("L'adresse email n'est pas valide");
            return false;
        }

        return true;
    };

    const handleResetPassword = async () => {
        if (!validateEmail(email)) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await AuthService.resetPassword(email.trim());

            if (result.success) {
                setIsEmailSent(true);
            } else {
                setEmailError(
                    result.error ||
                        "Une erreur est survenue lors de l'envoi de l'email"
                );
            }
        } catch (error) {
            setEmailError(
                "Une erreur inattendue est survenue. Veuillez réessayer."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBackToLogin = () => {
        navigation.navigate("Login");
    };

    const handleResendEmail = () => {
        setIsEmailSent(false);
        handleResetPassword();
    };

    if (isEmailSent) {
        return (
            <SafeAreaView style={styles.container}>
                <Animated.View
                    style={[styles.successContainer, { opacity: fadeAnim }]}
                >
                    <View style={styles.successContent}>
                        <View style={styles.successIconContainer}>
                            <Ionicons
                                name="mail-outline"
                                size={48}
                                color={Colors.secondary}
                            />
                        </View>
                        <Text style={styles.successTitle}>Email envoyé !</Text>
                        <Text style={styles.successDescription}>
                            Nous avons envoyé un lien de réinitialisation à{" "}
                            <Text style={styles.emailHighlight}>{email}</Text>
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
                                Renvoyer l'email
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
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
                    <Animated.View
                        style={[styles.content, { opacity: fadeAnim }]}
                    >
                        <View style={styles.logoContainer}>
                            <SpontyTripLogoAnimated size="large" />
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.title}>
                                Mot de passe oublié ?
                            </Text>
                            <Text style={styles.subtitle}>
                                Entrez votre adresse email pour recevoir un lien
                                de réinitialisation
                            </Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Adresse email</Text>
                                <View
                                    style={[
                                        styles.inputContainer,
                                        emailError &&
                                            styles.inputContainerError,
                                    ]}
                                >
                                    <Ionicons
                                        name="mail-outline"
                                        size={20}
                                        color={
                                            emailError
                                                ? Colors.error
                                                : Colors.textSecondary
                                        }
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[
                                            styles.input,
                                            emailError && styles.inputError,
                                        ]}
                                        placeholder="Entrez votre email"
                                        placeholderTextColor={
                                            Colors.textSecondary
                                        }
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            setEmailError("");
                                        }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={!isLoading}
                                    />
                                </View>
                                {emailError ? (
                                    <Text style={styles.errorText}>
                                        {emailError}
                                    </Text>
                                ) : null}
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.resetButton,
                                    isLoading && styles.resetButtonDisabled,
                                ]}
                                onPress={handleResetPassword}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator
                                        color={Colors.white}
                                        size="small"
                                    />
                                ) : (
                                    <Text style={styles.resetButtonText}>
                                        Réinitialiser le mot de passe
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={handleGoBackToLogin}
                                disabled={isLoading}
                            >
                                <Text style={styles.backButtonText}>
                                    Retour à la connexion
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
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
        justifyContent: "center",
        paddingHorizontal: Spacing.md,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: Spacing.xl,
    },
    logoContainer: {
        marginBottom: Spacing.xl,
    },
    form: {
        width: "100%",
        maxWidth: 400,
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
        marginBottom: Spacing.xl,
        maxWidth: "80%",
    },
    inputGroup: {
        width: "100%",
        marginBottom: Spacing.xl,
    },
    label: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
        fontWeight: "500",
        marginBottom: Spacing.xs,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        height: 56,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        ...TextStyles.body1,
        color: Colors.textPrimary,
        height: "100%",
    },
    inputContainerError: {
        borderColor: Colors.error,
    },
    inputError: {
        color: Colors.error,
    },
    resetButton: {
        width: "100%",
        height: 56,
        backgroundColor: "#7ED957",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    resetButtonDisabled: {
        opacity: 0.6,
    },
    resetButtonText: {
        ...TextStyles.button,
        color: Colors.white,
        fontWeight: "600",
        fontSize: 16,
    },
    backButton: {
        paddingVertical: Spacing.md,
    },
    backButtonText: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        textDecorationLine: "underline",
    },
    successContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: Spacing.md,
    },
    successContent: {
        alignItems: "center",
        maxWidth: 400,
        width: "100%",
        paddingHorizontal: Spacing.lg,
    },
    successIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.secondaryLight,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.xl,
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
    },
    emailHighlight: {
        fontWeight: "600",
        color: Colors.secondary,
    },
    successSubtext: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: Spacing.xl,
    },
    primaryButton: {
        width: "100%",
        height: 56,
        backgroundColor: "#7ED957",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    primaryButtonText: {
        ...TextStyles.button,
        color: Colors.white,
        fontWeight: "600",
        fontSize: 16,
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
    errorText: {
        ...TextStyles.caption,
        color: Colors.error,
        marginTop: Spacing.xs,
    },
});

export default ForgotPasswordScreen;
