import React from "react";
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "small" | "medium" | "large";
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = "primary",
    size = "medium",
    disabled = false,
    loading = false,
    style,
    textStyle,
    fullWidth = false,
}) => {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            height: 48,
            paddingHorizontal: 16,
        };

        // Variant styles
        switch (variant) {
            case "secondary":
                baseStyle.backgroundColor = Colors.secondary;
                break;
            case "outline":
                baseStyle.backgroundColor = "transparent";
                baseStyle.borderWidth = 2;
                baseStyle.borderColor = Colors.primary;
                break;
            case "ghost":
                baseStyle.backgroundColor = "transparent";
                break;
            default:
                baseStyle.backgroundColor = Colors.primary;
        }

        // Disabled state
        if (disabled) {
            baseStyle.backgroundColor = Colors.disabled;
            baseStyle.borderColor = Colors.disabled;
        }

        // Full width
        if (fullWidth) {
            baseStyle.width = "100%";
        }

        return baseStyle;
    };

    const getTextStyle = (): TextStyle => {
        const baseTextStyle: TextStyle = {
            ...TextStyles.button,
            fontWeight: "600",
        };

        switch (variant) {
            case "outline":
                baseTextStyle.color = disabled
                    ? Colors.textMuted
                    : Colors.primary;
                break;
            case "ghost":
                baseTextStyle.color = disabled
                    ? Colors.textMuted
                    : Colors.primary;
                break;
            default:
                baseTextStyle.color = disabled ? Colors.textMuted : "#FFFFFF";
        }

        return baseTextStyle;
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={
                        variant === "outline" || variant === "ghost"
                            ? Colors.primary
                            : "#FFFFFF"
                    }
                />
            ) : (
                <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

export default Button;
