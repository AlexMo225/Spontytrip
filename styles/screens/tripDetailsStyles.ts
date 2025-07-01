import { StyleSheet } from "react-native";

export const useTripDetailsScreenStyle = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#F8FAFC",
        },
        mainContent: {
            flex: 1,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            flexGrow: 1,
        },
        bottomSpacing: {
            height: 40,
        },
        // États de chargement et d'erreur
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: "#F8FAFC",
        },
        loadingText: {
            fontSize: 16,
            fontWeight: "600",
            color: "#333",
            marginTop: 16,
        },
        errorContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: "#F8FAFC",
        },
        errorTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: "#FF6B6B",
            marginBottom: 16,
            marginTop: 16,
        },
        errorText: {
            fontSize: 14,
            color: "#333",
            textAlign: "center",
            marginBottom: 20,
        },
        retryButton: {
            padding: 12,
            backgroundColor: "#7ED957",
            borderRadius: 8,
        },
        retryButtonText: {
            fontSize: 14,
            fontWeight: "600",
            color: "#FFFFFF",
        },
        redirectText: {
            fontSize: 14,
            color: "#666",
            textAlign: "center",
            fontStyle: "italic",
            marginTop: 10,
        },
        feedSection: {
            marginTop: 20,
            marginHorizontal: 20,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
        },
    });
};
