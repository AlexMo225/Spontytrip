import { StyleSheet } from "react-native";
import { Colors } from "../../constants";
import { Fonts } from "../../constants";
import { Spacing } from "../../constants";

const TextStyles = Fonts.styles;

export const usePasswordInputStyle = () => {
    const styles = StyleSheet.create({
        container: {
            width: "100%",
        },
        inputContainer: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors.white,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            height: 56,
        },
        inputContainerError: {
            borderColor: Colors.error,
        },
        input: {
            flex: 1,
            ...TextStyles.body1,
            height: "100%",
            paddingHorizontal: Spacing.md,
            color: Colors.textPrimary,
        },
        eyeButton: {
            padding: Spacing.sm,
            marginRight: Spacing.xs,
        },
        strengthContainer: {
            marginTop: Spacing.xs,
        },
        strengthBars: {
            flexDirection: "row",
            marginBottom: Spacing.xs,
        },
        strengthBar: {
            flex: 1,
            height: 4,
            borderRadius: 2,
            marginHorizontal: 2,
        },
        strengthText: {
            ...TextStyles.caption,
            marginBottom: Spacing.xs,
        },
        feedbackText: {
            ...TextStyles.caption,
            color: Colors.textSecondary,
        },
        errorText: {
            ...TextStyles.caption,
            color: Colors.error,
            marginTop: Spacing.xs,
        },
    });

    return styles;
};
