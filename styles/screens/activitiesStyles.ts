import { StyleSheet } from "react-native";
import { Colors } from "../../constants";

export const useActivitiesScreenStyle = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.backgroundColors.primary,
        },
        header: {
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: Colors.white,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        title: {
            fontSize: 24,
            fontWeight: "700",
            color: Colors.text.primary,
            textAlign: "center",
        },
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            color: Colors.text.secondary,
        },
        errorContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
        },
        errorText: {
            fontSize: 20,
            fontWeight: "600",
            color: Colors.error,
            marginBottom: 8,
            textAlign: "center",
        },
        errorDescription: {
            fontSize: 16,
            color: Colors.text.secondary,
            textAlign: "center",
        },
        notificationContainer: {
            backgroundColor: "#4DA1A9",
            marginHorizontal: 16,
            marginTop: 8,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            shadowColor: "#4DA1A9",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
        },
        notificationText: {
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: "600",
            textAlign: "center",
        },
        content: {
            flex: 1,
        },
        listView: {
            paddingBottom: 20,
        },
        emptyState: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
            paddingVertical: 80,
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: "600",
            color: Colors.text.primary,
            marginTop: 16,
            marginBottom: 8,
            textAlign: "center",
        },
        emptyDescription: {
            fontSize: 16,
            color: Colors.text.secondary,
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 32,
        },
        emptyButton: {
            backgroundColor: Colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
        },
        emptyButtonText: {
            color: Colors.white,
            fontSize: 16,
            fontWeight: "600",
        },
        floatingAddButton: {
            position: "absolute",
            bottom: 30,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: Colors.primary,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },
        modalContainer: {
            flex: 1,
            backgroundColor: Colors.backgroundColors.primary,
        },
        modalHeader: {
            padding: 16,
            backgroundColor: Colors.white,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        modalCloseButton: {
            position: "absolute",
            top: 16,
            right: 16,
        },
        modalHeaderTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: Colors.text.primary,
            textAlign: "center",
        },
        modalHeaderSpacer: {
            flex: 1,
        },
        modalContent: {
            flex: 1,
        },
        modalTitleSection: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: Colors.text.primary,
            marginRight: 16,
        },
        modalStatusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: Colors.backgroundColors.secondary,
        },
        modalStatusText: {
            fontSize: 14,
            fontWeight: "600",
            color: Colors.text.primary,
        },
        modalSection: {
            marginBottom: 16,
        },
        modalSectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
        },
        modalSectionTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: Colors.text.primary,
            marginRight: 8,
        },
        modalText: {
            fontSize: 14,
            color: Colors.text.secondary,
        },
        modalLinkText: {
            fontSize: 14,
            color: "#4DA1A9",
            textDecorationLine: "underline",
        },
        modalTimeContainer: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
        },
    });
};
