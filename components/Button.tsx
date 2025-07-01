import React from "react";
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

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
    const {
        buttonStyle,
        textStyle: hookTextStyle,
        loadingColor,
    } = useButtonStyle({
        variant,
        size,
        disabled,
        loading,
        fullWidth,
    });

    return (
        <TouchableOpacity
            style={[buttonStyle, style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator size="small" color={loadingColor} />
            ) : (
                <Text style={[hookTextStyle, textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

export default Button;
