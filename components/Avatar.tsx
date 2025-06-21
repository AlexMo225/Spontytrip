import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from "react-native";
import { Colors } from "../constants/Colors";

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
    const baseStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: showBorder ? 2 : 0,
    };

    if (imageUrl) {
        const imageStyle: ImageStyle = {
            ...styles.avatar,
            ...baseStyle,
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
        ...styles.placeholder,
        ...baseStyle,
        ...style,
    };

    return (
        <View style={viewStyle}>
            <Ionicons
                name="person"
                size={size * 0.4}
                color={Colors.textSecondary}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: Colors.lightGray,
        borderColor: Colors.primary,
    },
    placeholder: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.lightGray,
    },
});

export default Avatar;
