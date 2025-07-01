import { StyleSheet } from "react-native";
import { Colors, Fonts, Spacing } from "../../constants";

export const useEditProfileStyles = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.white,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            backgroundColor: Colors.white,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        headerTitle: {
            fontSize: 20,
            fontFamily: Fonts.heading.family,
            fontWeight: "600",
            color: Colors.text.primary,
        },
        headerButton: {
            padding: Spacing.sm,
        },
        headerButtonText: {
            fontSize: 16,
            color: Colors.primary,
            fontWeight: "500",
        },
        content: {
            flex: 1,
            backgroundColor: Colors.backgroundColors.primary,
        },
        section: {
            backgroundColor: Colors.white,
            marginBottom: Spacing.md,
            padding: Spacing.lg,
        },
        profileSection: {
            alignItems: "center",
            paddingVertical: Spacing.xl,
        },
        avatarContainer: {
            position: "relative",
            marginBottom: Spacing.md,
        },
        editPhotoButton: {
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: Colors.primary,
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: Colors.white,
        },
        formGroup: {
            marginBottom: Spacing.md,
        },
        label: {
            fontSize: 14,
            color: Colors.text.secondary,
            marginBottom: Spacing.xs,
            fontFamily: Fonts.body.family,
        },
        input: {
            backgroundColor: Colors.backgroundColors.primary,
            borderRadius: 8,
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            fontSize: 16,
            color: Colors.text.primary,
            fontFamily: Fonts.body.family,
        },
        errorText: {
            color: Colors.error,
            fontSize: 12,
            marginTop: Spacing.xs,
            fontFamily: Fonts.body.family,
        },
        button: {
            borderRadius: 8,
            paddingVertical: Spacing.md,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            marginTop: Spacing.md,
        },
        primaryButton: {
            backgroundColor: Colors.primary,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: "600",
            marginLeft: Spacing.xs,
            fontFamily: Fonts.body.family,
        },
        primaryButtonText: {
            color: Colors.white,
        },
        dangerSection: {
            marginTop: Spacing.xl,
        },
        dangerTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: Colors.text.primary,
            marginBottom: Spacing.sm,
            fontFamily: Fonts.heading.family,
        },
        dangerText: {
            fontSize: 14,
            color: Colors.text.secondary,
            marginBottom: Spacing.md,
            fontFamily: Fonts.body.family,
        },
        deleteButton: {
            backgroundColor: Colors.backgroundColors.primary,
            borderWidth: 1,
            borderColor: Colors.error,
        },
        deleteButtonText: {
            color: Colors.error,
        },
        memberSinceContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: Spacing.sm,
        },
        memberSinceText: {
            fontSize: 14,
            color: Colors.text.secondary,
            fontFamily: Fonts.body.family,
        },
        memberSinceDate: {
            color: Colors.text.primary,
            fontWeight: "500",
            marginLeft: Spacing.xs,
        },
    });
};
