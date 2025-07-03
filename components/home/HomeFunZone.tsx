import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { TextStyles } from "../../constants/Fonts";

interface HomeFunZoneProps {
    currentQuote: number;
    inspirationalQuotes: string[];
    scaleAnim: Animated.Value;
}

export const HomeFunZone: React.FC<HomeFunZoneProps> = ({
    currentQuote,
    inspirationalQuotes,
    scaleAnim,
}) => {
    return (
        <Animated.View
            style={[
                styles.modernFunZone,
                {
                    transform: [{ scale: scaleAnim || 1 }],
                },
            ]}
        >
            <LinearGradient
                colors={["rgba(126, 217, 87, 0.1)", "rgba(77, 161, 169, 0.1)"]}
                style={styles.funZoneGradient}
            >
                <View style={styles.funZoneHeader}>
                    <Ionicons name="sparkles" size={24} color="#FFD93D" />
                    <Text style={styles.funZoneTitle}>Citation du moment</Text>
                    <Ionicons name="sparkles" size={24} color="#FFD93D" />
                </View>

                <View style={styles.quoteContainer}>
                    <Text style={styles.quoteText}>
                        "{inspirationalQuotes[currentQuote] || ""}"
                    </Text>
                </View>

                <View style={styles.quoteIndicators}>
                    {(inspirationalQuotes || []).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.quoteIndicator,
                                {
                                    backgroundColor:
                                        index === currentQuote
                                            ? "#4DA1A9"
                                            : "#E2E8F0",
                                },
                            ]}
                        />
                    ))}
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    // ✨ ZONE FUN
    modernFunZone: {
        marginHorizontal: 20,
        marginBottom: 32,
        borderRadius: 20,
        overflow: "hidden",
    },
    funZoneGradient: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        borderWidth: 1,
        borderColor: "rgba(126, 217, 87, 0.2)",
    },
    funZoneHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    funZoneTitle: {
        fontSize: 18,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#4DA1A9",
        marginHorizontal: 12,
    },
    quoteContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 16,
        marginBottom: 16,
    },
    quoteText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#2D3748",
        textAlign: "center",
        lineHeight: 24,
        fontStyle: "italic",
    },
    quoteIndicators: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    quoteIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
