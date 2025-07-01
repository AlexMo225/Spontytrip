import { Colors } from "../../constants/Colors";
import { TextStyles } from "../../constants/Fonts";
import { Spacing } from "../../constants/Spacing";

export const commonStyles = {
    colors: Colors,
    text: TextStyles,
    spacing: Spacing,
    shadow: {
        light: {
            shadowColor: Colors.cardShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        medium: {
            shadowColor: Colors.cardShadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
        heavy: {
            shadowColor: Colors.cardShadow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 6,
        },
    },
    border: {
        thin: {
            borderWidth: 1,
            borderColor: Colors.border,
        },
        medium: {
            borderWidth: 2,
            borderColor: Colors.border,
        },
    },
    radius: {
        small: 4,
        medium: 8,
        large: 12,
        xl: 16,
        round: 9999,
    },
};
