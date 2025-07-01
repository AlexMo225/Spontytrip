import { Platform, StyleSheet } from "react-native";
import { Colors } from "../../constants";
import { TextStyles } from "../../constants";
import { Spacing } from "../../constants";

export const useJoinTripScreenStyle = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.white,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: Spacing.large,
            paddingVertical: Spacing.medium,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
            backgroundColor: Colors.white,
        },
        headerTitle: {
            fontSize: 20,
            fontFamily: TextStyles.heading.family,
            fontWeight: "600",
            color: Colors.textPrimary,
        },
        headerSpacer: {
            width: 40,
        },
        content: {
            flex: 1,
            paddingHorizontal: Spacing.large,
            paddingTop: Spacing.xlarge,
        },
        instructionSection: {
            alignItems: "center",
            marginBottom: Spacing.xlarge,
        },
        iconContainer: {
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: Colors.primary + "10",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: Spacing.large,
        },
        instructionTitle: {
            fontSize: 24,
            fontFamily: TextStyles.heading.family,
            fontWeight: "600",
            color: Colors.textPrimary,
            marginBottom: Spacing.medium,
            textAlign: "center",
        },
        instructionText: {
            fontSize: 16,
            color: Colors.textSecondary,
            textAlign: "center",
            lineHeight: 24,
            paddingHorizontal: Spacing.large,
        },
        inputSection: {
            marginBottom: Spacing.xlarge,
        },
        inputLabel: {
            fontSize: 14,
            color: Colors.textSecondary,
            marginBottom: Spacing.small,
        },
        codeInput: {
            backgroundColor: Colors.backgroundLight,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            paddingHorizontal: Spacing.medium,
            paddingVertical: Spacing.medium,
            fontSize: 20,
            color: Colors.textPrimary,
            textAlign: "center",
            letterSpacing: 2,
            fontWeight: "600",
        },
        inputHint: {
            fontSize: 12,
            color: Colors.textSecondary,
            marginTop: Spacing.xsmall,
            textAlign: "center",
        },
        errorContainer: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors.error + "10",
            borderRadius: 12,
            padding: Spacing.medium,
            marginBottom: Spacing.large,
        },
        errorText: {
            flex: 1,
            fontSize: 14,
            color: Colors.error,
            marginLeft: Spacing.small,
        },
        joinButton: {
            backgroundColor: Colors.primary,
            borderRadius: 12,
            paddingVertical: Spacing.medium,
            alignItems: "center",
            marginBottom: Spacing.large,
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
        joinButtonDisabled: {
            opacity: 0.7,
        },
        loadingContainer: {
            flexDirection: "row",
            alignItems: "center",
        },
        joinButtonText: {
            color: Colors.white,
            fontSize: 16,
            fontWeight: "600",
            marginLeft: Spacing.small,
        },
        alternativeSection: {
            alignItems: "center",
        },
        alternativeText: {
            fontSize: 14,
            color: Colors.textSecondary,
            marginBottom: Spacing.medium,
        },
        createTripButton: {
            paddingVertical: Spacing.small,
        },
        createTripButtonText: {
            fontSize: 16,
            color: Colors.primary,
            fontWeight: "600",
        },
    });
};
