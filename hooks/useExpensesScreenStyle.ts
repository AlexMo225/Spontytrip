import { StyleSheet } from "react-native";
import { Colors } from "../constants";

export const useExpensesScreenStyle = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.backgroundColors.primary,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 120, // Espace pour le bouton d'ajout
        },
        // États d'erreur
        errorContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: Colors.backgroundColors.primary,
        },
        errorTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: Colors.error,
            marginBottom: 12,
            textAlign: "center",
        },
        errorText: {
            fontSize: 16,
            color: Colors.text.secondary,
            textAlign: "center",
            marginBottom: 20,
            lineHeight: 24,
        },
        errorRetry: {
            fontSize: 16,
            color: Colors.primary,
            fontWeight: "600",
            textDecorationLine: "underline",
        },
        // Conteneur du bouton d'ajout
        addExpenseContainer: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: Colors.backgroundColors.primary,
            paddingTop: 10,
            paddingBottom: 10,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            shadowColor: Colors.cardShadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 8,
        },
    });
};
