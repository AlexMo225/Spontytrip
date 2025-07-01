import { TextStyle, ViewStyle } from "react-native";
import { Colors } from "../../constants";
import { TextStyles } from "../../constants";

interface UseButtonStyleProps {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "small" | "medium" | "large";
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
}

export const useButtonStyle = ({
    variant = "primary",
    size = "medium",
    disabled = false,
    loading = false,
    fullWidth = false,
}: UseButtonStyleProps) => {
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

    const getLoadingColor = () => {
        return variant === "outline" || variant === "ghost"
            ? Colors.primary
            : "#FFFFFF";
    };

    return {
        buttonStyle: getButtonStyle(),
        textStyle: getTextStyle(),
        loadingColor: getLoadingColor(),
    };
};
