import { StyleSheet } from "react-native";
import { Colors, Fonts } from "../../constants";

export const useOnboardingScreenStyle = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.backgroundColors.primary,
        },
        content: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
        },
        logoContainer: {
            alignItems: "center",
            marginBottom: 60,
        },
        logoCircle: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#7ED957",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
            shadowColor: "#7ED957",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
        },
        logoInnerCircle: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: Colors.backgroundColors.primary,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        logoText: {
            textAlign: "center",
            lineHeight: 48,
        },
        logoTextSponty: {
            fontSize: 42,
            fontFamily: Fonts.heading.family,
            fontWeight: "700",
            color: "#4DA1A9",
        },
        logoTextTrip: {
            fontSize: 42,
            fontFamily: Fonts.heading.family,
            fontWeight: "700",
            color: "#7ED957",
        },
        sloganContainer: {
            alignItems: "center",
        },
        slogan: {
            fontSize: 18,
            fontFamily: Fonts.body.family,
            fontWeight: "400",
            color: Colors.text.secondary,
            textAlign: "center",
            lineHeight: 26,
        },
        footer: {
            paddingBottom: 50,
            alignItems: "center",
        },
        loadingDots: {
            flexDirection: "row",
            alignItems: "center",
        },
        dot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#4DA1A9",
            marginHorizontal: 4,
        },
    });
};
