import { Platform, StatusBar, StyleSheet } from "react-native";
import { Colors } from "../../constants";

export const useHomeScreenStyle = () => {
    const styles = StyleSheet.create({
        modernContainer: {
            flex: 1,
            backgroundColor: Colors.lightGray,
            borderTopWidth: 0,
            paddingTop:
                Platform.OS === "ios" ? 48 : StatusBar.currentHeight || 24,
        },
        modernScrollView: {
            flex: 1,
        },
    });

    return styles;
};
