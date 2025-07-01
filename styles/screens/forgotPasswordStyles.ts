import { Platform, StyleSheet } from "react-native";
import { Colors } from "../../constants";
import { TextStyles } from "../../constants";
import { Spacing } from "../../constants";

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
            paddingBottom: Spacing.large,
        },
        content: {
            flex: 1,
            paddingHorizontal: Spacing.large,
        },
        logoContainer: {
            alignItems: "center",
            marginTop: Spacing.xxlarge,
            marginBottom: Spacing.xlarge,
        },
        form: {
            flex: 1,
        },
        title: {
            fontSize: 28,
            fontFamily: TextStyles.heading.family,
            fontWeight: "700",
            color: Colors.textPrimary,
            marginBottom: Spacing.medium,
            textAlign: "center",
        },
        subtitle: {
            fontSize: 16,
            color: Colors.textSecondary,
            marginBottom: Spacing.xlarge,
            textAlign: "center",
            lineHeight: 24,
        },
        inputGroup: {
            marginBottom: Spacing.large,
        },
        label: {
            fontSize: 14,
            color: Colors.textSecondary,
            marginBottom: Spacing.small,
        },
        inputContainer: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors.backgroundLight,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            paddingHorizontal: Spacing.medium,
            height: 56,
        },
        inputContainerError: {
            borderColor: Colors.error,
        },
        inputIcon: {
            marginRight: Spacing.medium,
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: Colors.textPrimary,
        },
        errorText: {
            fontSize: 14,
            color: Colors.error,
            marginTop: Spacing.xsmall,
        },
        primaryButton: {
            backgroundColor: Colors.primary,
            borderRadius: 12,
            paddingVertical: Spacing.medium,
            alignItems: "center",
            marginBottom: Spacing.medium,
            ...Platform.select({
                ios: {
                    shadowColor: Colors.cardShadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 4,
                },
            }),
        },
        primaryButtonText: {
            color: Colors.white,
            fontSize: 16,
            fontWeight: "600",
        },
        secondaryButton: {
            paddingVertical: Spacing.medium,
            alignItems: "center",
        },
        secondaryButtonText: {
            color: Colors.textSecondary,
            fontSize: 16,
            fontWeight: "600",
        },
        successContainer: {
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: Spacing.large,
        },
        successContent: {
            alignItems: "center",
        },
        successIconContainer: {
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: Colors.backgroundLight,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: Spacing.large,
        },
        successTitle: {
            fontSize: 24,
            fontFamily: TextStyles.heading.family,
            fontWeight: "700",
            color: Colors.textPrimary,
            marginBottom: Spacing.medium,
            textAlign: "center",
        },
        successDescription: {
            fontSize: 16,
            color: Colors.textSecondary,
            marginBottom: Spacing.medium,
            textAlign: "center",
            lineHeight: 24,
        },
        successSubtext: {
            fontSize: 14,
            color: Colors.textSecondary,
            marginBottom: Spacing.xlarge,
            textAlign: "center",
            lineHeight: 20,
        },
        emailHighlight: {
            color: Colors.textPrimary,
            fontWeight: "600",
        },
    });
};
