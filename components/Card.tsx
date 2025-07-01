import React from "react";
import { View, ViewStyle } from "react-native";

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    padding?: number;
    shadow?: boolean;
    borderRadius?: keyof typeof Spacing.borderRadius;
}

const Card: React.FC<CardProps> = ({
    children,
    style,
    padding,
    shadow = true,
    borderRadius = "lg",
}) => {
    const { cardStyle } = useCardStyle({
        padding,
        shadow,
        borderRadius,
    });

    return <View style={[cardStyle, style]}>{children}</View>;
};

export default Card;
