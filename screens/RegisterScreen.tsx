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
import { AuthService } from "../services/authService";
import { RootStackParamList } from "../types";

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

    const handleRegister = async () => {
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        if (firstName.length < 2) {
            Alert.alert(
                "Erreur",
                "Le prénom doit contenir au moins 2 caractères"
            );
            return;
        }

        if (lastName.length < 2) {
            Alert.alert("Erreur", "Le nom doit contenir au moins 2 caractères");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Erreur", "Veuillez entrer une adresse email valide");
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

        try {
            const displayName = `${firstName} ${lastName}`;
            const result = await AuthService.signUp(
                email,
                password,
                displayName
            );

            if (result.success) {
                Alert.alert(
                    "Succès",
                    `Bienvenue ${firstName} ! Votre compte a été créé avec succès.`,
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                // La navigation sera gérée automatiquement par AuthNavigator
                                // grâce au changement d'état d'authentification
                            },
                        },
                    ]
                );
            } else {
                Alert.alert(
                    "Erreur d'inscription",
                    result.error ||
                        "Une erreur est survenue lors de la création du compte"
                );
            }
        } catch (error) {
            Alert.alert("Erreur", "Une erreur inattendue est survenue");
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
                    {/* Header avec logo */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <View style={styles.logoInnerCircle} />
                            </View>
                            <Text style={styles.logoText}>
                                <Text style={styles.logoTextSponty}>
                                    Sponty
                                </Text>
                                {"\n"}
                                <Text style={styles.logoTextTrip}>Trip</Text>
                            </Text>
                        </View>
                        <Text style={styles.title}>Créer votre compte</Text>
                        <Text style={styles.subtitle}>
                            Rejoignez la communauté SpontyTrip et planifiez vos
                            aventures !
                        </Text>
                    </View>

                    {/* Formulaire */}
                    <View style={styles.form}>
                        {/* Champs Prénom et Nom */}
                        <View style={styles.nameRow}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Prénom"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                            </View>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nom"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={lastName}
                                    onChangeText={setLastName}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Champ Email */}
                        <View style={styles.inputGroup}>
                            <TextInput
                                style={styles.input}
                                placeholder="Adresse email"
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
                                placeholder="Mot de passe (min. 6 caractères)"
                                placeholderTextColor={Colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                            {password.length > 0 && (
                                <View style={styles.passwordStrength}>
                                    <View
                                        style={[
                                            styles.strengthDot,
                                            password.length >= 6 &&
                                                styles.strengthActive,
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.strengthDot,
                                            password.length >= 8 &&
                                                styles.strengthActive,
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.strengthDot,
                                            password.length >= 10 &&
                                                /[A-Z]/.test(password) &&
                                                /[0-9]/.test(password) &&
                                                styles.strengthActive,
                                        ]}
                                    />
                                    <Text style={styles.strengthText}>
                                        {password.length < 6
                                            ? "Faible"
                                            : password.length < 8
                                            ? "Correct"
                                            : password.length >= 10 &&
                                              /[A-Z]/.test(password) &&
                                              /[0-9]/.test(password)
                                            ? "Fort"
                                            : "Correct"}
                                    </Text>
                                </View>
                            )}
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
                                {isLoading ? "Création..." : "S'inscrire"}
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
        alignItems: "center",
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    logoCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#7ED957",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    logoInnerCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.white,
    },
    logoText: {
        textAlign: "center",
        lineHeight: 24,
    },
    logoTextSponty: {
        fontSize: 20,
        fontWeight: "700",
        color: "#4DA1A9",
    },
    logoTextTrip: {
        fontSize: 20,
        fontWeight: "700",
        color: "#7ED957",
    },
    title: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        fontWeight: "600",
        textAlign: "center",
    },
    subtitle: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        textAlign: "center",
        marginTop: Spacing.xs,
        lineHeight: 20,
    },
    form: {
        flex: 1,
        paddingTop: Spacing.md,
    },
    nameRow: {
        flexDirection: "row",
        gap: Spacing.sm,
    },
    halfWidth: {
        flex: 1,
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
    passwordStrength: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: Spacing.xs,
        paddingHorizontal: 4,
    },
    strengthDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
        marginRight: 6,
    },
    strengthActive: {
        backgroundColor: "#7ED957",
    },
    strengthText: {
        ...TextStyles.caption,
        color: Colors.textSecondary,
        marginLeft: Spacing.xs,
        fontSize: 12,
    },
    registerButton: {
        height: 48,
        backgroundColor: "#7ED957",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: Spacing.md,
    },
    registerButtonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        ...TextStyles.button,
        color: "#FFFFFF",
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
