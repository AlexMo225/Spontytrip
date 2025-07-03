import { StackNavigationProp } from "@react-navigation/stack";
import React, { useLayoutEffect, useState } from "react";
import {
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
import PasswordInput from "../components/PasswordInput";
import SpontyTripLogoAnimated from "../components/SpontyTripLogoAnimated";
import { Colors } from "../constants/Colors";
import { useModal } from "../hooks";
import { AuthService } from "../services/authService";
import { useRegisterStyles } from "../styles/screens";
import { RootStackParamList } from "../types";
import { validatePassword } from "../utils/passwordUtils";

type RegisterScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Register"
>;

interface Props {
    navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const modal = useModal();
    const styles = useRegisterStyles();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });

        // Animation d'entrée plus fluide
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [navigation, fadeAnim]);

    const validateForm = (): boolean => {
        let isValid = true;
        setPasswordError("");
        setConfirmPasswordError("");

        // Validation des champs requis
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            modal.showError("Erreur", "Tous les champs sont obligatoires");
            return false;
        }

        // Validation du prénom
        if (firstName.length < 2) {
            modal.showError(
                "Erreur",
                "Le prénom doit contenir au moins 2 caractères"
            );
            return false;
        }

        // Validation du nom
        if (lastName.length < 2) {
            modal.showError(
                "Erreur",
                "Le nom doit contenir au moins 2 caractères"
            );
            return false;
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            modal.showError(
                "Erreur",
                "Veuillez entrer une adresse email valide"
            );
            return false;
        }

        // Validation du mot de passe
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isStrong) {
            setPasswordError(passwordValidation.feedback);
            isValid = false;
        }

        // Validation de la confirmation du mot de passe
        if (password !== confirmPassword) {
            setConfirmPasswordError("Les mots de passe ne correspondent pas");
            isValid = false;
        }

        return isValid;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const displayName = `${firstName} ${lastName}`;
            const result = await AuthService.signUp(
                email,
                password,
                displayName
            );

            if (result.success) {
                console.log(
                    "✅ Inscription réussie, attente de la transition automatique"
                );
                setRegistrationSuccess(true);

                // Afficher la modale de bienvenue
                modal.showSuccess(
                    "🎉 Bienvenue dans SpontyTrip !",
                    `Salut ${firstName} ! Ton compte a été créé avec succès. Tu peux maintenant organiser tes voyages spontanés !`,
                    () => {
                        // La navigation sera automatiquement gérée par AuthNavigator
                        // Pas besoin de navigation manuelle
                    }
                );

                // Animation de sortie fluide
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            } else {
                modal.showError(
                    "Erreur d'inscription",
                    result.error ||
                        "Une erreur est survenue lors de l'inscription"
                );
            }
        } catch (error) {
            console.error("Erreur inscription:", error);
            modal.showError(
                "Erreur",
                "Une erreur est survenue lors de l'inscription"
            );
        } finally {
            setIsLoading(false);
        }
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
                    <Animated.View
                        style={[styles.content, { opacity: fadeAnim }]}
                    >
                        <View style={styles.logoContainer}>
                            <SpontyTripLogoAnimated
                                size="large"
                                autoPlay={!registrationSuccess}
                            />
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Prénom</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Entrez votre prénom"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    autoCapitalize="words"
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nom</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Entrez votre nom"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={lastName}
                                    onChangeText={setLastName}
                                    autoCapitalize="words"
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
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

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mot de passe</Text>
                                <PasswordInput
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setPasswordError("");
                                    }}
                                    editable={!isLoading}
                                    error={passwordError}
                                    placeholder="••••••••"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Confirmer le mot de passe
                                </Text>
                                <PasswordInput
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        setConfirmPasswordError("");
                                    }}
                                    editable={!isLoading}
                                    showStrengthIndicator={false}
                                    error={confirmPasswordError}
                                    placeholder="••••••••"
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.registerButton,
                                    (isLoading || registrationSuccess) &&
                                        styles.registerButtonDisabled,
                                ]}
                                onPress={handleRegister}
                                disabled={isLoading || registrationSuccess}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.registerButtonText}>
                                    {registrationSuccess
                                        ? "Inscription réussie !"
                                        : isLoading
                                        ? "Inscription..."
                                        : "S'inscrire"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>

                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        onPress={handleGoToLogin}
                        disabled={isLoading || registrationSuccess}
                    >
                        <Text style={styles.loginText}>
                            Déjà un compte ?{" "}
                            <Text style={styles.loginLink}>Se connecter</Text>
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;
