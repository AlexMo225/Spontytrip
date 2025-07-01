import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { TextStyles } from "../../constants/Fonts";

interface HomeHeaderProps {
    user: any;
    currentQuote: number;
    inspirationalQuotes: string[];
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
    user,
    currentQuote,
    inspirationalQuotes,
    fadeAnim,
    slideAnim,
}) => {
    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return "Bonjour";
        if (hour < 18) return "Bon après-midi";
        return "Bonsoir";
    };

    return (
        <Animated.View
            style={[
                styles.modernHeader,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <LinearGradient
                colors={["#7ED957", "#4DA1A9"]}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    <View style={styles.greetingSection}>
                        <Text style={styles.greetingText}>
                            {getGreeting()}, {user?.firstName || "Voyageur"} !
                            👋
                        </Text>
                        <Text style={styles.inspirationalText}>
                            {inspirationalQuotes[currentQuote]}
                        </Text>
                    </View>
                    <View style={styles.profileSection}>
                        <View style={styles.modernAvatar}>
                            <Text style={styles.modernAvatarText}>
                                {(
                                    user?.firstName?.charAt(0) || "V"
                                ).toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.quoteBubble}>
                    <Ionicons name="sparkles" size={16} color="#FFD93D" />
                    <Text style={styles.quoteBubbleText}>
                        Prêt pour ta prochaine aventure ?
                    </Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    // 🏠 HEADER MODERNE
    modernHeader: {
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 24,
        borderRadius: 20,
        overflow: "hidden",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    headerGradient: {
        paddingHorizontal: 24,
        paddingVertical: 32,
        position: "relative",
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
    },
    greetingSection: {
        flex: 1,
        marginRight: 16,
    },
    greetingText: {
        fontSize: 24,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 6,
    },
    inspirationalText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.9)",
        lineHeight: 22,
    },
    profileSection: {
        alignItems: "center",
    },
    modernAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    modernAvatarText: {
        fontSize: 20,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    quoteBubble: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: "flex-start",
    },
    quoteBubbleText: {
        fontSize: 14,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#FFFFFF",
        marginLeft: 8,
    },
});
