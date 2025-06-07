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

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        setIsLoading(true);

        // Simulation d'une connexion (à remplacer par votre API)
        setTimeout(() => {
            setIsLoading(false);
            // Connexion réussie, aller vers l'app principale
            navigation.replace("MainApp");
        }, 1500);
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
                    </View>

                    {/* Formulaire */}
                    <View style={styles.form}>
                        {/* Champ Email */}
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

                        {/* Champ Mot de passe */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mot de passe</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Entrez votre mot de passe"
                                placeholderTextColor={Colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                        </View>

                        {/* Mot de passe oublié */}
                        <TouchableOpacity
                            style={styles.forgotPasswordContainer}
                            onPress={handleForgotPassword}
                            disabled={isLoading}
                        >
                            <Text style={styles.forgotPasswordText}>
                                Mot de passe oublié ?
                            </Text>
                        </TouchableOpacity>

                        {/* Bouton de connexion */}
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
                                {isLoading ? "Connexion..." : "Se connecter"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleGoToRegister}
                        disabled={isLoading}
                    >
                        <Text style={styles.signUpText}>
                            Pas de compte ?{" "}
                            <Text style={styles.signUpLink}>
                                S&apos;inscrire
                            </Text>
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
        paddingTop: Spacing.md,
        paddingBottom: Spacing.lg,
        alignItems: "center",
    },
    logoContainer: {
        alignItems: "center",
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#7ED957",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    logoInnerCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.white,
    },
    logoText: {
        textAlign: "center",
        lineHeight: 32,
    },
    logoTextSponty: {
        fontSize: 28,
        fontWeight: "700",
        color: "#4DA1A9",
    },
    logoTextTrip: {
        fontSize: 28,
        fontWeight: "700",
        color: "#7ED957",
    },
    form: {
        flex: 1,
        paddingTop: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
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
    forgotPasswordContainer: {
        alignItems: "flex-start",
        marginBottom: Spacing.xl,
    },
    forgotPasswordText: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        textDecorationLine: "underline",
    },
    loginButton: {
        height: 48,
        backgroundColor: "#7ED957",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        ...TextStyles.button,
        color: "#FFFFFF",
        fontWeight: "600",
    },
    footer: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        alignItems: "center",
    },
    signUpText: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        textAlign: "center",
    },
    signUpLink: {
        color: Colors.textPrimary,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});

export default LoginScreen;
