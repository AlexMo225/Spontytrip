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
import { Spacing } from "../constants/Spacing";

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
            borderRadius: Spacing.borderRadius.lg,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
        };

        // Size styles
        switch (size) {
            case "small":
                baseStyle.height = Spacing.buttonSmallHeight;
                baseStyle.paddingHorizontal = Spacing.lg;
                break;
            case "large":
                baseStyle.height = Spacing.buttonHeight + 8;
                baseStyle.paddingHorizontal = Spacing.xxl;
                break;
            default:
                baseStyle.height = Spacing.buttonHeight;
                baseStyle.paddingHorizontal = Spacing.xl;
        }

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
            ...(size === "small" ? TextStyles.buttonSmall : TextStyles.button),
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
                baseTextStyle.color = disabled
                    ? Colors.textMuted
                    : Colors.textWhite;
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
                            : Colors.white
                    }
                />
            ) : (
                <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

export default Button;
