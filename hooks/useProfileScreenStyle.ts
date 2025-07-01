import { Dimensions, Platform, StyleSheet } from "react-native";
import { Fonts } from "../constants/Fonts";

const { width: screenWidth } = Dimensions.get("window");

export const useProfileScreenStyle = () => {
    const styles = StyleSheet.create({
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
            fontFamily: Fonts.heading.family,
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
            paddingBottom: 100,
        },
        profileCard: {
            backgroundColor: "#FFFFFF",
            marginHorizontal: 20,
            marginTop: -20,
            borderRadius: 24,
            padding: 24,
            ...Platform.select({
                ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                },
                android: {
                    elevation: 8,
                },
            }),
        },
        profileInfo: {
            alignItems: "center",
            marginBottom: 20,
        },
        avatarContainer: {
            marginBottom: 16,
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
        userInfo: {
            alignItems: "center",
        },
        userName: {
            fontSize: 24,
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: 4,
            fontFamily: Fonts.heading.family,
        },
        userEmail: {
            fontSize: 16,
            color: "#6B7280",
            marginBottom: 12,
            fontFamily: Fonts.body.family,
        },
        joinDateBadge: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F0FDF4",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#BBF7D0",
        },
        joinDate: {
            fontSize: 12,
            color: "#15803D",
            marginLeft: 6,
            fontFamily: Fonts.body.family,
            fontWeight: "500",
        },
        editButtonContainer: {
            borderRadius: 16,
            overflow: "hidden",
            ...Platform.select({
                ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                android: {
                    elevation: 4,
                },
            }),
        },
        editButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            paddingHorizontal: 24,
        },
        editIcon: {
            marginRight: 8,
        },
        editButtonText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
            fontFamily: Fonts.body.family,
        },
        settingsSection: {
            marginTop: 32,
            paddingHorizontal: 20,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: 16,
            fontFamily: Fonts.heading.family,
        },
        settingsCard: {
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            overflow: "hidden",
            ...Platform.select({
                ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 3,
                },
            }),
        },
        optionItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 16,
            paddingHorizontal: 20,
        },
        optionLeft: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
        optionIcon: {
            width: 24,
            height: 24,
            justifyContent: "center",
            alignItems: "center",
        },
        optionText: {
            fontSize: 16,
            color: "#374151",
            marginLeft: 16,
            fontFamily: Fonts.body.family,
            fontWeight: "500",
        },
        optionSeparator: {
            height: 1,
            backgroundColor: "#F3F4F6",
            marginLeft: 56,
        },
        logoutSection: {
            marginTop: 32,
            paddingHorizontal: 20,
        },
        logoutButtonContainer: {
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: "#FEE2E2",
            borderWidth: 1,
            borderColor: "#FECACA",
        },
        logoutButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            paddingHorizontal: 24,
        },
        logoutButtonText: {
            color: "#DC2626",
            fontSize: 16,
            fontWeight: "600",
            marginLeft: 8,
            fontFamily: Fonts.body.family,
        },
        bottomSpacing: {
            height: 100,
        },
    });

    return styles;
};
