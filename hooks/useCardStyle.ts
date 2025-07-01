import { ViewStyle } from "react-native";
import { Colors } from "../constants/Colors";
import { Spacing } from "../constants/Spacing";

interface UseCardStyleProps {
    padding?: number;
    shadow?: boolean;
    borderRadius?: keyof typeof Spacing.borderRadius;
}

export const useCardStyle = ({
    padding = Spacing.cardPadding,
    shadow = true,
    borderRadius = "lg",
}: UseCardStyleProps) => {
    const cardStyle: ViewStyle = {
        backgroundColor: Colors.white,
        borderRadius: Spacing.borderRadius[borderRadius],
        padding: padding,
        ...(shadow && Spacing.shadow.medium),
    };

    return {
        cardStyle,
    };
};
