import { StyleSheet } from "react-native";

export const useSpontyTripLogoAnimatedStyle = () => {
    return StyleSheet.create({
        container: {
            alignItems: "center",
            justifyContent: "center",
        },
        logoContainer: {
            flexDirection: "row",
            alignItems: "center",
        },
        textContainer: {
            alignItems: "flex-start",
        },
        logoText: {
            fontWeight: "700",
            fontFamily: "System",
        },
    });
};
