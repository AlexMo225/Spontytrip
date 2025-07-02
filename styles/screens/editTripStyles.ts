import { StyleSheet } from "react-native";
import { Colors } from "../../constants";

export const useEditTripStyles = () => {
    return StyleSheet.create({
        // Container principal
        container: {
            flex: 1,
            backgroundColor: Colors.backgroundColors.primary,
        },
        keyboardContainer: {
            flex: 1,
        },

        // États de chargement et d'erreur
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors.backgroundColors.primary,
            paddingHorizontal: 20,
        },
        loadingText: {
            fontSize: 16,
            fontWeight: "500",
            color: Colors.text.secondary,
            marginTop: 16,
            textAlign: "center",
        },
        errorContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors.backgroundColors.primary,
            paddingHorizontal: 20,
        },
        errorTitle: {
            fontSize: 24,
            fontWeight: "700",
            color: Colors.text.primary,
            marginTop: 16,
            marginBottom: 8,
            textAlign: "center",
        },
        errorText: {
            fontSize: 16,
            color: Colors.text.secondary,
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 24,
        },
        retryButton: {
            backgroundColor: Colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
        },
        retryButtonText: {
            fontSize: 16,
            fontWeight: "600",
            color: Colors.white,
        },

        // Header
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: Colors.backgroundColors.primary,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.backgroundColors.secondary,
            justifyContent: "center",
            alignItems: "center",
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: Colors.text.primary,
            flex: 1,
            textAlign: "center",
            marginHorizontal: 16,
        },
        headerSpacer: {
            width: 40,
        },

        // Contenu principal
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            flexGrow: 1,
            paddingBottom: 20,
        },
        formContainer: {
            paddingHorizontal: 20,
            paddingTop: 20,
        },

        // Champs de formulaire
        fieldContainer: {
            marginBottom: 24,
        },
        fieldLabel: {
            fontSize: 16,
            fontWeight: "600",
            color: Colors.text.primary,
            marginBottom: 8,
        },
        textInput: {
            backgroundColor: Colors.backgroundColors.card,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: Colors.text.primary,
        },
        descriptionInput: {
            height: 100,
            textAlignVertical: "top",
        },
        characterCount: {
            fontSize: 12,
            color: Colors.text.muted,
            textAlign: "right",
            marginTop: 4,
        },

        // Boutons d'action
        actionsContainer: {
            padding: 20,
            backgroundColor: Colors.backgroundColors.primary,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
        },
        discardButton: {
            backgroundColor: Colors.backgroundColors.secondary,
            paddingVertical: 12,
            borderRadius: 12,
            marginBottom: 12,
            alignItems: "center",
        },
        discardButtonText: {
            fontSize: 16,
            fontWeight: "600",
            color: Colors.text.secondary,
        },
        saveButton: {
            backgroundColor: Colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        },
        saveButtonDisabled: {
            backgroundColor: Colors.disabled,
            opacity: 0.6,
        },
        saveButtonText: {
            fontSize: 16,
            fontWeight: "600",
            color: Colors.white,
        },

        // Styles hérités pour compatibilité
        title: {
            fontSize: 24,
            fontWeight: "700",
            color: Colors.text.primary,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: Colors.text.secondary,
        },
    });
};
