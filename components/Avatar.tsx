import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";
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
    const avatarStyle = [
        styles.avatar,
        {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: showBorder ? 2 : 0,
        },
        style,
    ];

    if (imageUrl) {
        return (
            <Image
                source={{ uri: imageUrl }}
                style={avatarStyle}
                resizeMode="cover"
            />
        );
    }

    // Placeholder si pas d'image
    return (
        <View style={[avatarStyle, styles.placeholder]}>
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
