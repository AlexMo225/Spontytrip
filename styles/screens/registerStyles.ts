import { StyleSheet } from "react-native";
import { Colors, Spacing, TextStyles } from "../../constants";

export const useRegisterScreenStyle = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
        },
        keyboardAvoid: {
            flex: 1,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            flexGrow: 1,
        },
        content: {
            flex: 1,
            padding: Spacing.lg,
        },
        logoContainer: {
            alignItems: "center",
            marginVertical: Spacing.xl,
        },
        form: {
            flex: 1,
            gap: Spacing.lg,
        },
        inputGroup: {
            gap: Spacing.sm,
        },
        label: {
            ...TextStyles.body1,
            color: Colors.textPrimary,
            fontWeight: "600",
            marginBottom: Spacing.xs,
        },
        input: {
            height: 56,
            backgroundColor: Colors.white,
            borderRadius: 12,
            paddingHorizontal: Spacing.md,
            borderWidth: 1,
            borderColor: Colors.border,
            color: Colors.textPrimary,
            ...TextStyles.body1,
        },
        registerButton: {
            height: 56,
            backgroundColor: Colors.primary,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            marginTop: Spacing.md,
        },
        registerButtonDisabled: {
            opacity: 0.7,
        },
        registerButtonText: {
            color: Colors.white,
            fontSize: 16,
            fontWeight: "600",
        },
        footer: {
            padding: Spacing.lg,
            alignItems: "center",
        },
        loginText: {
            ...TextStyles.body2,
            color: Colors.textSecondary,
        },
        loginLink: {
            color: Colors.primary,
            fontWeight: "600",
        },
    });
};
