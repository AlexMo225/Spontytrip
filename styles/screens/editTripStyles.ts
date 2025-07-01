import { StyleSheet } from "react-native";
import { Colors, Layout, TextStyles } from "../../constants";

export const useEditTripScreenStyle = () => {
    return StyleSheet.create({
        container: {
            ...Layout.container,
            ...Layout.centerContent,
            backgroundColor: Colors.background,
        },
        title: {
            ...TextStyles.h2,
            color: Colors.textPrimary,
            marginBottom: 8,
        },
        subtitle: {
            ...TextStyles.body1,
            color: Colors.textSecondary,
        },
    });
};
