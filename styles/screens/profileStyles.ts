import { Dimensions, Platform, StyleSheet } from "react-native";
import { Colors, Fonts } from "../../constants/index";

const { width: screenWidth } = Dimensions.get("window");

export const useProfileStyles = () => {
    const colors = Colors;
    const fonts = Fonts;

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#F9FAFB",
        },
        header: {
            paddingHorizontal: 24,
            paddingBottom: 40,
            position: "relative",
            overflow: "hidden",
        },
        headerTitle: {
            fontSize: 32,
            fontWeight: "800",
            color: "#FFFFFF",
            textAlign: "center",
            fontFamily: fonts.heading.family,
            textShadowColor: "rgba(0, 0, 0, 0.1)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
        },
        headerDecoration: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
        },
        floatingElement: {
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            top: 20,
            right: 30,
        },
        floatingElement2: {
            width: 120,
            height: 120,
            borderRadius: 60,
            top: -20,
            left: 20,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
        },
        content: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: 20,
            paddingBottom: 40,
        },
        profileSection: {
            borderRadius: 16,
            marginBottom: 24,
            overflow: "hidden",
            ...Platform.select({
                ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 4,
                },
            }),
        },
        gradientBackground: {
            width: "100%",
            alignItems: "center",
            paddingVertical: 24,
            paddingHorizontal: 20,
        },
        contentContainer: {
            width: "100%",
            alignItems: "center",
        },
        avatarContainer: {
            marginBottom: 16,
            padding: 4,
            borderRadius: 42,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
        },
        avatarGlow: {
            padding: 8,
            borderRadius: 60,
            backgroundColor: "rgba(126, 217, 87, 0.1)",
            ...Platform.select({
                ios: {
                    shadowColor: "#7ED957",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                },
                android: {
                    elevation: 8,
                },
            }),
        },
        userName: {
            fontSize: 24,
            fontWeight: "700",
            color: colors.text.primary,
            marginBottom: 4,
            fontFamily: fonts.heading.family,
            textShadowColor: "rgba(0, 0, 0, 0.1)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
        },
        userEmail: {
            fontSize: 16,
            color: colors.text.secondary,
            marginBottom: 12,
            fontFamily: fonts.body.family,
        },
        joinDateBadge: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#BBF7D0",
            marginBottom: 20,
        },
        joinDate: {
            fontSize: 12,
            color: "#15803D",
            marginLeft: 6,
            fontFamily: fonts.body.family,
            fontWeight: "500",
        },
        editButton: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderWidth: 1,
            borderColor: "#BBF7D0",
        },
        editButtonText: {
            marginLeft: 8,
            fontSize: 14,
            fontWeight: "600",
            color: "#15803D",
            fontFamily: fonts.body.family,
        },
        settingsSection: {
            backgroundColor: colors.white,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 24,
            ...Platform.select({
                ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 4,
                },
            }),
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: colors.text.primary,
            marginVertical: 16,
            paddingHorizontal: 20,
            fontFamily: fonts.heading.family,
        },
        settingItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        settingLeft: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
        settingIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
        },
        settingInfo: {
            flex: 1,
        },
        settingTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: colors.text.primary,
            marginBottom: 2,
            fontFamily: fonts.body.family,
        },
        settingDescription: {
            fontSize: 14,
            color: colors.text.secondary,
            fontFamily: fonts.body.family,
        },
        settingRight: {
            flexDirection: "row",
            alignItems: "center",
        },
        badge: {
            backgroundColor: "#7ED957",
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 2,
            marginRight: 8,
        },
        badgeText: {
            color: colors.white,
            fontSize: 12,
            fontWeight: "600",
            fontFamily: fonts.body.family,
        },
        logoutButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FEE2E2",
            paddingVertical: 16,
            borderRadius: 16,
            marginTop: 8,
        },
        logoutText: {
            marginLeft: 8,
            fontSize: 16,
            fontWeight: "600",
            color: "#EF4444",
            fontFamily: fonts.body.family,
        },
        bottomSpacing: {
            height: 100,
        },
    });
};
