import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { User } from "firebase/auth";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { TextStyles } from "../../constants/Fonts";

interface HomeHeaderProps {
    user: User | null;
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

    // Récupérer le prénom de l'email si displayName n'est pas défini
    const getUserFirstName = (): string => {
        if (user?.displayName) {
            return user.displayName.split(" ")[0];
        }
        if (user?.email) {
            return user.email.split("@")[0];
        }
        return "Voyageur";
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
                            {getGreeting()}, {getUserFirstName()} ! 👋
                        </Text>
                        <Text style={styles.inspirationalText}>
                            {inspirationalQuotes[currentQuote]}
                        </Text>
                    </View>
                    <View style={styles.profileSection}>
                        <View style={styles.modernAvatar}>
                            <Text style={styles.modernAvatarText}>
                                {getUserFirstName().charAt(0).toUpperCase()}
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
        marginTop: 0,
        marginBottom: 16,
        borderRadius: 20,
        overflow: "hidden",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    headerGradient: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        position: "relative",
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    greetingSection: {
        flex: 1,
        marginRight: 12,
    },
    greetingText: {
        fontSize: 20,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    inspirationalText: {
        fontSize: 14,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.9)",
        lineHeight: 18,
    },
    profileSection: {
        alignItems: "center",
    },
    modernAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    modernAvatarText: {
        fontSize: 16,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    quoteBubble: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        alignSelf: "flex-start",
    },
    quoteBubbleText: {
        fontSize: 13,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#FFFFFF",
        marginLeft: 6,
    },
});
