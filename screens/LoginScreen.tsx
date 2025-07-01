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
import { Colors } from "../constants";
import { useLoginStyles  } from "../styles/screens";
import { useModal, useQuickModals } from "../hooks/useModal";
import { AuthService } from "../services/authService";
import { RootStackParamList } from "../types";

type LoginScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Login"
>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const modal = useModal();
    const quickModals = useQuickModals();
    const styles = useLoginStyles();

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

    const handleLogin = async () => {
        if (!email || !password) {
            quickModals.formError("tous les champs");
            return;
        }

        setIsLoading(true);

        try {
            const result = await AuthService.signIn(email, password);

            if (result.success) {
                modal.showSuccess(
                    "Connexion réussie",
                    "Bienvenue dans SpontyTrip !"
                );
                // La navigation sera gérée automatiquement par AuthNavigator
            } else {
                modal.showError(
                    "Connexion impossible",
                    result.error || "Vérifiez votre email et mot de passe."
                );
            }
        } catch (error) {
            modal.showError("Erreur", "Une erreur inattendue est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigation.navigate("ForgotPassword");
    };

    const handleGoToRegister = () => {
        navigation.navigate("Register");
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
                            <SpontyTripLogoAnimated size="large" />
                        </View>

                        <View style={styles.form}>
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
                                    onChangeText={setPassword}
                                    editable={!isLoading}
                                    showStrengthIndicator={false}
                                    placeholder="••••••••"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.forgotPasswordContainer}
                                onPress={handleForgotPassword}
                                disabled={isLoading}
                            >
                                <Text style={styles.forgotPasswordText}>
                                    Mot de passe oublié ?
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.loginButton,
                                    isLoading && styles.loginButtonDisabled,
                                ]}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.loginButtonText}>
                                    {isLoading
                                        ? "Connexion..."
                                        : "Se connecter"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>

                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        onPress={handleGoToRegister}
                        disabled={isLoading}
                    >
                        <Text style={styles.signUpText}>
                            Pas de compte ?{" "}
                            <Text style={styles.signUpLink}>S'inscrire</Text>
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;
