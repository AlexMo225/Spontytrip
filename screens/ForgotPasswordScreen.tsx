import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useLayoutEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SpontyTripLogoAnimated from "../components/SpontyTripLogoAnimated";
import { Colors } from "../constants/Colors";
import { useForgotPasswordStyles  } from "../styles/screens";
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
    const styles = useForgotPasswordStyles();
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
                                        style={styles.input}
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            setEmailError("");
                                        }}
                                        placeholder="Votre adresse email"
                                        placeholderTextColor={
                                            Colors.textSecondary
                                        }
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete="email"
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
                                    styles.primaryButton,
                                    isLoading && { opacity: 0.7 },
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
                                    <Text style={styles.primaryButtonText}>
                                        Réinitialiser le mot de passe
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleGoBackToLogin}
                                disabled={isLoading}
                            >
                                <Text style={styles.secondaryButtonText}>
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

export default ForgotPasswordScreen;
