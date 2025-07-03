import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { TextStyles } from "../../constants/Fonts";

interface HomeEmptyStateProps {
    fadeAnim: Animated.Value;
    scaleAnim: Animated.Value;
}

export const HomeEmptyState: React.FC<HomeEmptyStateProps> = ({
    fadeAnim,
    scaleAnim,
}) => {
    return (
        <Animated.View
            style={[
                styles.modernEmptyState,
                {
                    opacity: fadeAnim || 1,
                    transform: [{ scale: scaleAnim || 1 }],
                },
            ]}
        >
            <LinearGradient
                colors={["#7ED957", "#4DA1A9"]}
                style={styles.emptyIconGradient}
            >
                <Ionicons name="airplane" size={40} color="#FFFFFF" />
            </LinearGradient>

            <Text style={styles.modernEmptyTitle}>
                Aucun voyage pour le moment
            </Text>
            <Text style={styles.modernEmptySubtitle}>
                Crée ton premier voyage ou rejoins celui d'un ami ! 🌟
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    // 🎭 ÉTAT VIDE MODERNE
    modernEmptyState: {
        alignItems: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyIconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    modernEmptyTitle: {
        fontSize: 24,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#2D3748",
        marginBottom: 12,
        textAlign: "center",
    },
    modernEmptySubtitle: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "#64748B",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
});
