import { ImageStyle, ViewStyle } from "react-native";
import { Colors } from "../../constants";

interface UseAvatarStylesProps {
    size?: number;
    showBorder?: boolean;
}

export const useAvatarStyles = ({
    size = 40,
    showBorder = false,
}: UseAvatarStylesProps) => {
    const baseStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: showBorder ? 2 : 0,
    };

    const avatarImageStyle: ImageStyle = {
        ...baseStyle,
        backgroundColor: Colors.lightGray,
        borderColor: Colors.primary,
    };

    const placeholderStyle: ViewStyle = {
        ...baseStyle,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.lightGray,
    };

    const iconSize = size * 0.4;

    return {
        avatarImageStyle,
        placeholderStyle,
        iconSize,
        iconColor: Colors.textSecondary,
    };
};
