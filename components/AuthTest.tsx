import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useModal, useQuickModals } from "../hooks/useModal";
import { AuthService, AuthUser } from "../services/authService";

const AuthTest: React.FC = () => {
    const modal = useModal();
    const quickModals = useQuickModals();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);

    // Écouter les changements d'état d'authentification
    useEffect(() => {
        const unsubscribe = AuthService.onAuthStateChanged((user) => {
            setUser(user);
            console.log("État d'authentification changé:", user);
        });

        return unsubscribe;
    }, []);

    const handleSignUp = async () => {
        if (!email || !password) {
            quickModals.formError("remplir tous les champs");
            return;
        }

        setLoading(true);
        const result = await AuthService.signUp(email, password, displayName);
        setLoading(false);

        if (result.success) {
            modal.showSuccess("Succès", "Compte créé avec succès !");
            setEmail("");
            setPassword("");
            setDisplayName("");
        } else {
            modal.showError(
                "Inscription impossible",
                result.error || "Impossible de créer votre compte."
            );
        }
    };

    const handleSignIn = async () => {
        if (!email || !password) {
            quickModals.formError("remplir email et mot de passe");
            return;
        }

        setLoading(true);
        const result = await AuthService.signIn(email, password);
        setLoading(false);

        if (result.success) {
            modal.showSuccess("Succès", "Connexion réussie !");
            setEmail("");
            setPassword("");
        } else {
            modal.showError(
                "Connexion impossible",
                result.error || "Vérifiez votre email et mot de passe."
            );
        }
    };

    const handleSignOut = async () => {
        setLoading(true);
        const result = await AuthService.signOut();
        setLoading(false);

        if (result.success) {
            modal.showSuccess("Succès", "Déconnexion réussie !");
        } else {
            modal.showError(
                "Déconnexion impossible",
                result.error || "Impossible de vous déconnecter."
            );
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            quickModals.formError("entrer votre adresse email");
            return;
        }

        setLoading(true);
        const result = await AuthService.resetPassword(email);
        setLoading(false);

        if (result.success) {
            modal.showSuccess("Succès", "Email de réinitialisation envoyé !");
        } else {
            modal.showError(
                "Envoi impossible",
                result.error ||
                    "Impossible d'envoyer l'email de réinitialisation."
            );
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>🔥 Test Firebase Auth</Text>

            {user ? (
                <View style={styles.userInfo}>
                    <Text style={styles.userTitle}>
                        👤 Utilisateur connecté
                    </Text>
                    <Text style={styles.userText}>UID: {user.uid}</Text>
                    <Text style={styles.userText}>Email: {user.email}</Text>
                    <Text style={styles.userText}>
                        Nom: {user.displayName || "Non défini"}
                    </Text>

                    <TouchableOpacity
                        style={[styles.button, styles.signOutButton]}
                        onPress={handleSignOut}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>Se déconnecter</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.authForm}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nom d'affichage (optionnel)"
                        value={displayName}
                        onChangeText={setDisplayName}
                        autoCapitalize="words"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Mot de passe"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color="#007AFF"
                            style={styles.loader}
                        />
                    ) : (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.signUpButton]}
                                onPress={handleSignUp}
                            >
                                <Text style={styles.buttonText}>
                                    S'inscrire
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.signInButton]}
                                onPress={handleSignIn}
                            >
                                <Text style={styles.buttonText}>
                                    Se connecter
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.resetButton]}
                                onPress={handleResetPassword}
                            >
                                <Text style={styles.buttonText}>
                                    Mot de passe oublié
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 30,
        marginTop: 50,
    },
    userInfo: {
        backgroundColor: "#e8f5e8",
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    userTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    userText: {
        fontSize: 14,
        marginBottom: 5,
        color: "#333",
    },
    authForm: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    buttonContainer: {
        gap: 10,
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    signUpButton: {
        backgroundColor: "#34C759",
    },
    signInButton: {
        backgroundColor: "#007AFF",
    },
    signOutButton: {
        backgroundColor: "#FF3B30",
        marginTop: 15,
    },
    resetButton: {
        backgroundColor: "#FF9500",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    loader: {
        marginVertical: 20,
    },
});

export default AuthTest;
