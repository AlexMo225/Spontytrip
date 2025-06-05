import React from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "../constants/Colors";
import { Spacing } from "../constants/Spacing";

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
    padding = Spacing.cardPadding,
    shadow = true,
    borderRadius = "lg",
}) => {
    const cardStyle: ViewStyle = {
        backgroundColor: Colors.white,
        borderRadius: Spacing.borderRadius[borderRadius],
        padding: padding,
        ...(shadow && Spacing.shadow.medium),
    };

    return <View style={[cardStyle, style]}>{children}</View>;
};

export default Card;
