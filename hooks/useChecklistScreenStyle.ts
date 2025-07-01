import { StyleSheet } from "react-native";
import { Colors } from "../constants";

export const useChecklistScreenStyle = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.backgroundColors.primary,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: Colors.white,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        headerContent: {
            flex: 1,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: Colors.text.primary,
        },
        headerSubtitle: {
            fontSize: 14,
            color: Colors.text.secondary,
            marginTop: 2,
        },
        addButton: {
            backgroundColor: Colors.primary,
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
        },
        progressContainer: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: Colors.white,
        },
        progressBar: {
            height: 8,
            backgroundColor: Colors.backgroundColors.secondary,
            borderRadius: 4,
            overflow: "hidden",
        },
        progressFill: {
            height: "100%",
            backgroundColor: Colors.primary,
            borderRadius: 4,
        },
        listContainer: {
            flex: 1,
            paddingBottom: 20,
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
        errorTitle: {
            fontSize: 20,
            fontWeight: "600",
            color: Colors.error,
            marginBottom: 8,
            textAlign: "center",
        },
        errorText: {
            fontSize: 16,
            color: Colors.text.secondary,
            textAlign: "center",
            marginBottom: 20,
            lineHeight: 24,
        },
        retryButton: {
            backgroundColor: Colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
        },
        retryText: {
            color: Colors.white,
            fontSize: 16,
            fontWeight: "600",
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
        },
        modalContent: {
            backgroundColor: Colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: "70%",
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: Colors.text.primary,
            marginBottom: 20,
            textAlign: "center",
        },
        memberOption: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            marginBottom: 8,
            backgroundColor: Colors.backgroundColors.secondary,
        },
        memberInfo: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
        memberAvatar: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
        },
        memberAvatarImage: {
            width: "100%",
            height: "100%",
            borderRadius: 16,
        },
        memberAvatarText: {
            fontSize: 14,
            fontWeight: "600",
            color: Colors.white,
        },
        memberName: {
            fontSize: 16,
            color: Colors.text.primary,
            fontWeight: "500",
        },
        modalActions: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
            gap: 12,
        },
        unassignButton: {
            flex: 1,
            backgroundColor: Colors.backgroundColors.secondary,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
        },
        unassignText: {
            color: Colors.text.secondary,
            fontSize: 16,
            fontWeight: "500",
        },
        cancelButton: {
            flex: 1,
            backgroundColor: Colors.primary,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
        },
        cancelText: {
            color: Colors.white,
            fontSize: 16,
            fontWeight: "600",
        },
    });
};
