import { StyleSheet } from "react-native";

export const useAddActivityScreenStyle = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#F9FAFB",
        },
        keyboardAvoidingView: {
            flex: 1,
        },
        scrollView: {
            flex: 1,
        },
        scrollViewContent: {
            flexGrow: 1,
            padding: 20,
        },
        footer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
            backgroundColor: "white",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
        },
        footerButton: {
            flexDirection: "row",
            alignItems: "center",
            padding: 8,
        },
        footerButtonDisabled: {
            opacity: 0.5,
        },
        footerButtonText: {
            fontSize: 16,
            color: "#4DA1A9",
            marginHorizontal: 8,
        },
        footerButtonTextDisabled: {
            color: "#9CA3AF",
        },
        footerCenter: {
            alignItems: "center",
        },
        stepIndicator: {
            fontSize: 14,
            color: "#6B7280",
        },
        // Modal styles
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
        },
        modalContent: {
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            width: "80%",
        },
        pickerContainer: {
            backgroundColor: "white",
            borderRadius: 10,
        },
        pickerToolbar: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
        },
        pickerButton: {
            fontSize: 16,
            color: "#4DA1A9",
            fontWeight: "600",
        },
        pickerTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: "#1F2937",
        },
        pickerHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 8,
        },
        cancelButton: {
            fontSize: 16,
            fontWeight: "600",
            color: "#4DA1A9",
        },
        confirmButton: {
            fontSize: 16,
            fontWeight: "600",
            color: "#4DA1A9",
        },
        iosPicker: {
            width: "100%",
            height: 200,
        },
    });
};
