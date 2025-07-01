import { StyleSheet } from "react-native";
import { TextStyles } from "../../constants";

export const useCreateTripScreenStyle = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#F8F9FA",
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 60,
            paddingBottom: 20,
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: "#F0F0F0",
        },
        headerTitle: {
            flex: 1,
            fontSize: 24,
            fontWeight: "700",
            color: "#1A1A1A",
            textAlign: "center",
            letterSpacing: -0.5,
        },
        headerSpacer: {
            width: 44,
        },
        content: {
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 24,
        },
        bottomContainer: {
            paddingHorizontal: 20,
            paddingVertical: 24,
            paddingBottom: 40,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#F0F0F0",
        },
        createButton: {
            backgroundColor: "#4DA1A9",
            borderRadius: 12,
            alignItems: "center",
            height: 48,
            justifyContent: "center",
            paddingHorizontal: 16,
            shadowColor: "#4DA1A9",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        },
        createButtonDisabled: {
            backgroundColor: "#E5E5E5",
            shadowOpacity: 0,
            elevation: 0,
        },
        createButtonLoading: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        },
        createButtonText: {
            ...TextStyles.button,
            color: "#FFFFFF",
            fontWeight: "600",
        },
    });
};
