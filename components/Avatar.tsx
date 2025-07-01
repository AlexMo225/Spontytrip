import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ImageStyle, View, ViewStyle } from "react-native";
import { useAvatarStyle } from "../hooks/useAvatarStyle";

interface AvatarProps {
    imageUrl?: string | null;
    size?: number;
    style?: ViewStyle;
    showBorder?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
    imageUrl,
    size = 40,
    style,
    showBorder = false,
}) => {
    const { avatarImageStyle, placeholderStyle, iconSize, iconColor } =
        useAvatarStyle({
            size,
            showBorder,
        });

    if (imageUrl) {
        const imageStyle: ImageStyle = {
            ...avatarImageStyle,
            ...(style as ImageStyle),
        };

        return (
            <Image
                source={{ uri: imageUrl }}
                style={imageStyle}
                resizeMode="cover"
            />
        );
    }

    // Placeholder si pas d'image
    const viewStyle: ViewStyle = {
        ...placeholderStyle,
        ...style,
    };

    return (
        <View style={viewStyle}>
            <Ionicons name="person" size={iconSize} color={iconColor} />
        </View>
    );
};

export default Avatar;
