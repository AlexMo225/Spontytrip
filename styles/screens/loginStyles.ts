import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { Colors, Spacing } from "../../constants";

const TextStyles = {
    body1: {
        fontFamily: "System",
        fontSize: 16,
        fontWeight: "400",
    } as TextStyle,
    body2: {
        fontFamily: "System",
        fontSize: 14,
        fontWeight: "400",
    } as TextStyle,
    button: {
        fontFamily: "System",
        fontSize: 16,
        fontWeight: "600",
    } as TextStyle,
};

interface LoginScreenStyles {
    container: ViewStyle;
    keyboardAvoid: ViewStyle;
    scrollView: ViewStyle;
    scrollContent: ViewStyle;
    content: ViewStyle;
    logoContainer: ViewStyle;
    form: ViewStyle;
    inputGroup: ViewStyle;
    label: TextStyle;
    input: TextStyle;
    forgotPasswordContainer: ViewStyle;
    forgotPasswordText: TextStyle;
    loginButton: ViewStyle;
    loginButtonDisabled: ViewStyle;
    loginButtonText: TextStyle;
    footer: ViewStyle;
    signUpText: TextStyle;
    signUpLink: TextStyle;
}

export const useLoginScreenStyle = () => {
    return StyleSheet.create<LoginScreenStyles>({
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
            marginBottom: Spacing.xl * 2,
        },
        form: {
            width: "100%",
            maxWidth: 400,
        },
        inputGroup: {
            marginBottom: Spacing.lg,
        },
        label: {
            ...TextStyles.body1,
            color: Colors.textPrimary,
            fontWeight: "500",
            marginBottom: Spacing.xs,
        },
        input: {
            ...TextStyles.body1,
            height: 56,
            backgroundColor: Colors.white,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            paddingHorizontal: Spacing.md,
            color: Colors.textPrimary,
        },
        forgotPasswordContainer: {
            alignItems: "flex-end",
            marginBottom: Spacing.lg,
        },
        forgotPasswordText: {
            ...TextStyles.body2,
            color: Colors.textSecondary,
            textDecorationLine: "underline",
        },
        loginButton: {
            height: 56,
            backgroundColor: "#7ED957",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: Spacing.md,
        },
        loginButtonDisabled: {
            opacity: 0.6,
        },
        loginButtonText: {
            ...TextStyles.button,
            color: Colors.white,
            fontWeight: "600",
            fontSize: 16,
        },
        footer: {
            paddingVertical: Spacing.lg,
            alignItems: "center",
        },
        signUpText: {
            ...TextStyles.body1,
            color: Colors.textSecondary,
        },
        signUpLink: {
            color: Colors.primary,
            fontWeight: "600",
        },
    });
};
