import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { TextStyles } from "../../constants/Fonts";

interface HomeEmptyStateProps {
    fadeAnim: Animated.Value;
    scaleAnim: Animated.Value;
    onCreateTrip: () => void;
    onJoinTrip: () => void;
}

export const HomeEmptyState: React.FC<HomeEmptyStateProps> = ({
    fadeAnim,
    scaleAnim,
    onCreateTrip,
    onJoinTrip,
}) => {
    return (
        <Animated.View
            style={[
                styles.modernEmptyState,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
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

            <View style={styles.modernEmptyActions}>
                <TouchableOpacity
                    style={styles.modernPrimaryButton}
                    onPress={onCreateTrip}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={["#7ED957", "#4DA1A9"]}
                        style={styles.modernPrimaryButtonGradient}
                    >
                        <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.modernPrimaryButtonText}>
                            Créer un voyage
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.modernSecondaryButton}
                    onPress={onJoinTrip}
                    activeOpacity={0.9}
                >
                    <Text style={styles.modernSecondaryButtonText}>
                        Rejoindre un voyage
                    </Text>
                </TouchableOpacity>
            </View>
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
    modernEmptyActions: {
        width: "100%",
        gap: 12,
    },
    modernPrimaryButton: {
        borderRadius: 16,
        overflow: "hidden",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    modernPrimaryButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
    },
    modernPrimaryButtonText: {
        fontSize: 16,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    modernSecondaryButton: {
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E2E8F0",
    },
    modernSecondaryButtonText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },
});
