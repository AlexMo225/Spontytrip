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

interface HomeActionButtonsProps {
    actionButtonsAnim: Animated.Value;
    animateButtonPress: (callback: () => void) => void;
    onCreateTrip: () => void;
    onJoinTrip: () => void;
}

export const HomeActionButtons: React.FC<HomeActionButtonsProps> = ({
    actionButtonsAnim,
    animateButtonPress,
    onCreateTrip,
    onJoinTrip,
}) => {
    return (
        <Animated.View
            style={[
                styles.modernActionButtons,
                {
                    opacity: actionButtonsAnim,
                    transform: [
                        {
                            scale: actionButtonsAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                            }),
                        },
                    ],
                },
            ]}
        >
            <TouchableOpacity
                style={styles.modernActionButton}
                onPress={() => animateButtonPress(onCreateTrip)}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={["#7ED957", "#4DA1A9"]}
                    style={styles.modernActionButtonGradient}
                >
                    <View style={styles.modernActionButtonContent}>
                        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                        <View style={styles.modernActionButtonTextContainer}>
                            <Text style={styles.modernActionButtonTitle}>
                                Créer un voyage
                            </Text>
                            <Text style={styles.modernActionButtonSubtitle}>
                                Démarre une nouvelle aventure
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.modernActionButton}
                onPress={() => animateButtonPress(onJoinTrip)}
                activeOpacity={0.9}
            >
                <View style={styles.modernActionButtonSecondary}>
                    <View style={styles.modernActionButtonContent}>
                        <Ionicons name="people" size={24} color="#4DA1A9" />
                        <View style={styles.modernActionButtonTextContainer}>
                            <Text
                                style={styles.modernActionButtonTitleSecondary}
                            >
                                Rejoindre un voyage
                            </Text>
                            <Text
                                style={
                                    styles.modernActionButtonSubtitleSecondary
                                }
                            >
                                Rejoins tes amis dans l'aventure
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#4DA1A9" />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    // 🎯 BOUTONS D'ACTION MODERNES
    modernActionButtons: {
        marginHorizontal: 20,
        marginBottom: 32,
        gap: 12,
    },
    modernActionButton: {
        borderRadius: 16,
        overflow: "hidden",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    modernActionButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    modernActionButtonSecondary: {
        backgroundColor: "#F8FAFC",
        borderWidth: 2,
        borderColor: "#E2E8F0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    modernActionButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    modernActionButtonTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    modernActionButtonTitle: {
        fontSize: 18,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 2,
    },
    modernActionButtonTitleSecondary: {
        fontSize: 18,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#2D3748",
        marginBottom: 2,
    },
    modernActionButtonSubtitle: {
        fontSize: 14,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.8)",
    },
    modernActionButtonSubtitleSecondary: {
        fontSize: 14,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "#64748B",
    },
});
