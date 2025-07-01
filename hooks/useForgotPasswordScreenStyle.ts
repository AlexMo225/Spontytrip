import { StyleSheet } from "react-native";
import { Colors, Spacing, TextStyles } from "../constants";

export const useForgotPasswordScreenStyle = () => {
    return StyleSheet.create({
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
            justifyContent: "center",
            paddingHorizontal: Spacing.md,
        },
        content: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: Spacing.xl,
        },
        logoContainer: {
            marginBottom: Spacing.xl,
        },
        form: {
            width: "100%",
            maxWidth: 400,
            alignItems: "center",
        },
        title: {
            ...TextStyles.h2,
            color: Colors.textPrimary,
            fontWeight: "600",
            textAlign: "center",
            marginBottom: Spacing.md,
        },
        subtitle: {
            ...TextStyles.body1,
            color: Colors.textSecondary,
            textAlign: "center",
            lineHeight: 22,
            marginBottom: Spacing.xl,
            maxWidth: "80%",
        },
        inputGroup: {
            width: "100%",
            marginBottom: Spacing.xl,
        },
        label: {
            ...TextStyles.body1,
            color: Colors.textPrimary,
            fontWeight: "500",
            marginBottom: Spacing.xs,
        },
        inputContainer: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors.white,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            paddingHorizontal: Spacing.md,
            height: 56,
        },
        inputIcon: {
            marginRight: Spacing.sm,
        },
        input: {
            flex: 1,
            ...TextStyles.body1,
            color: Colors.textPrimary,
            height: "100%",
        },
        inputContainerError: {
            borderColor: Colors.error,
        },
        inputError: {
            color: Colors.error,
        },
        resetButton: {
            width: "100%",
            height: 56,
            backgroundColor: "#7ED957",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: Spacing.md,
        },
        resetButtonDisabled: {
            opacity: 0.6,
        },
        resetButtonText: {
            ...TextStyles.button,
            color: Colors.white,
            fontWeight: "600",
            fontSize: 16,
        },
        backButton: {
            paddingVertical: Spacing.md,
        },
        backButtonText: {
            ...TextStyles.body2,
            color: Colors.textSecondary,
            textDecorationLine: "underline",
        },
        successContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: Spacing.md,
        },
        successContent: {
            alignItems: "center",
            maxWidth: 400,
            width: "100%",
            paddingHorizontal: Spacing.lg,
        },
        successIconContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors.secondaryLight,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: Spacing.xl,
        },
        successTitle: {
            ...TextStyles.h2,
            color: Colors.textPrimary,
            fontWeight: "600",
            textAlign: "center",
            marginBottom: Spacing.md,
        },
        successDescription: {
            ...TextStyles.body1,
            color: Colors.textPrimary,
            textAlign: "center",
            marginBottom: Spacing.md,
        },
        emailHighlight: {
            fontWeight: "600",
            color: Colors.secondary,
        },
        successSubtext: {
            ...TextStyles.body2,
            color: Colors.textSecondary,
            textAlign: "center",
            lineHeight: 20,
            marginBottom: Spacing.xl,
        },
        primaryButton: {
            width: "100%",
            height: 56,
            backgroundColor: "#7ED957",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: Spacing.md,
        },
        primaryButtonText: {
            ...TextStyles.button,
            color: Colors.white,
            fontWeight: "600",
            fontSize: 16,
        },
        secondaryButton: {
            alignItems: "center",
            paddingVertical: Spacing.md,
        },
        secondaryButtonText: {
            ...TextStyles.body2,
            color: Colors.textSecondary,
            textDecorationLine: "underline",
        },
        errorText: {
            ...TextStyles.caption,
            color: Colors.error,
            marginTop: Spacing.xs,
        },
    });
};
