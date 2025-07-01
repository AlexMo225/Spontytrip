import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, View } from "react-native";
import { useAvatarStyles } from "../styles/components";

interface AvatarProps {
    size?: number;
    imageUrl?: string;
    showBorder?: boolean;
    style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({
    size = 40,
    imageUrl,
    showBorder = false,
    style,
}) => {
    const styles = useAvatarStyles({
        size,
        showBorder,
    });

    return (
        <View style={[styles.container, style]}>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} />
            ) : (
                <View style={styles.placeholder}>
                    <Ionicons
                        name="person"
                        size={styles.iconSize}
                        color={styles.iconColor}
                    />
                </View>
            )}
        </View>
    );
};

export default Avatar;
