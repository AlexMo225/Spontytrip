import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { useModal, useQuickModals } from "../hooks/useModal";

const TestModalScreen: React.FC = () => {
    const modal = useModal();
    const quickModals = useQuickModals();

    const showSuccessExample = () => {
        modal.showSuccess(
            "Opération réussie",
            "Votre voyage a été créé avec succès !"
        );
    };

    const showErrorExample = () => {
        modal.showError(
            "Erreur de connexion",
            "Impossible de se connecter au serveur. Vérifiez votre connexion internet."
        );
    };

    const showWarningExample = () => {
        modal.showWarning(
            "Attention",
            "Cette action ne peut pas être annulée."
        );
    };

    const showInfoExample = () => {
        modal.showInfo(
            "Information",
            "Une nouvelle mise à jour est disponible."
        );
    };

    const showConfirmExample = () => {
        modal.showConfirm(
            "Confirmer l'action",
            "Êtes-vous sûr de vouloir continuer ?",
            () => {
                quickModals.success("Action confirmée !");
            },
            () => {
                quickModals.info("Action annulée");
            },
            "Oui, continuer",
            "Non, annuler"
        );
    };

    const showDeleteExample = () => {
        modal.showDelete(
            "Supprimer le voyage",
            "Cette action supprimera définitivement le voyage et toutes ses données.",
            () => {
                quickModals.success("Voyage supprimé");
            }
        );
    };

    const showQuickModalExamples = () => {
        // Succession de modals pour démonstration
        setTimeout(() => quickModals.success("Première étape terminée"), 500);
        setTimeout(() => quickModals.info("Traitement en cours..."), 2000);
        setTimeout(
            () => quickModals.success("Toutes les étapes terminées !"),
            4000
        );
    };

    const showFormErrorExample = () => {
        quickModals.formError("l'adresse email");
    };

    const showLoginSuccessExample = () => {
        quickModals.loginSuccess();
    };

    const showSaveSuccessExample = () => {
        quickModals.saveSuccess();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>🎯 Démonstration SpontyModal</Text>
                <Text style={styles.subtitle}>
                    Testez tous les types de modals disponibles
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📢 Modals de Base</Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={showSuccessExample}
                    >
                        <Text style={styles.buttonText}>✅ Succès</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.errorButton]}
                        onPress={showErrorExample}
                    >
                        <Text style={styles.buttonText}>❌ Erreur</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.warningButton]}
                        onPress={showWarningExample}
                    >
                        <Text style={styles.buttonText}>⚠️ Avertissement</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.infoButton]}
                        onPress={showInfoExample}
                    >
                        <Text style={styles.buttonText}>ℹ️ Information</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        🤔 Modals Interactifs
                    </Text>

                    <TouchableOpacity
                        style={[styles.button, styles.confirmButton]}
                        onPress={showConfirmExample}
                    >
                        <Text style={styles.buttonText}>❓ Confirmation</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.deleteButton]}
                        onPress={showDeleteExample}
                    >
                        <Text style={styles.buttonText}>🗑️ Suppression</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚡ QuickModals</Text>

                    <TouchableOpacity
                        style={[styles.button, styles.quickButton]}
                        onPress={showQuickModalExamples}
                    >
                        <Text style={styles.buttonText}>🚀 Séquence Auto</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.formButton]}
                        onPress={showFormErrorExample}
                    >
                        <Text style={styles.buttonText}>
                            📝 Erreur Formulaire
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.loginButton]}
                        onPress={showLoginSuccessExample}
                    >
                        <Text style={styles.buttonText}>🔐 Login Succès</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.saveButton]}
                        onPress={showSaveSuccessExample}
                    >
                        <Text style={styles.buttonText}>💾 Sauvegarde</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Tous les modals utilisent la charte graphique SpontyTrip
                    </Text>
                    <Text style={styles.footerSubtext}>
                        #7ED957 • #4DA1A9 • Design moderne et cohérent
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: Colors.text.primary,
        textAlign: "center",
        marginBottom: 8,
        fontFamily: Fonts.heading.family,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: "center",
        marginBottom: 32,
        fontFamily: Fonts.body.family,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text.primary,
        marginBottom: 16,
        fontFamily: Fonts.heading.family,
    },
    button: {
        backgroundColor: "#7ED957",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    errorButton: {
        backgroundColor: "#EF4444",
    },
    warningButton: {
        backgroundColor: "#F59E0B",
    },
    infoButton: {
        backgroundColor: "#4DA1A9",
    },
    confirmButton: {
        backgroundColor: "#8B5CF6",
    },
    deleteButton: {
        backgroundColor: "#DC2626",
    },
    quickButton: {
        backgroundColor: "#10B981",
    },
    formButton: {
        backgroundColor: "#F97316",
    },
    loginButton: {
        backgroundColor: "#3B82F6",
    },
    saveButton: {
        backgroundColor: "#06B6D4",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        fontFamily: Fonts.body.family,
    },
    footer: {
        marginTop: 32,
        padding: 20,
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        alignItems: "center",
    },
    footerText: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: "center",
        fontFamily: Fonts.body.family,
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
        color: Colors.text.muted,
        textAlign: "center",
        fontFamily: Fonts.body.family,
    },
});

export default TestModalScreen;
