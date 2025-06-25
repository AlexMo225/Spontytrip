import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";

interface ChecklistCelebrationProps {
    visible: boolean;
    onHide: () => void;
    tripTitle?: string;
}

const { width, height } = Dimensions.get("window");

const ChecklistCelebration: React.FC<ChecklistCelebrationProps> = ({
    visible,
    onHide,
    tripTitle = "votre voyage",
}) => {
    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const confettiAnims = useRef(
        Array.from({ length: 20 }, () => ({
            translateY: new Animated.Value(-100),
            translateX: new Animated.Value(Math.random() * width),
            rotate: new Animated.Value(0),
            opacity: new Animated.Value(1),
        }))
    ).current;

    useEffect(() => {
        if (visible) {
            // Animation d'entrée
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();

            // Animation des confettis
            const confettiAnimations = confettiAnims.map((confetti, index) => {
                return Animated.parallel([
                    Animated.timing(confetti.translateY, {
                        toValue: height + 100,
                        duration: 3000 + Math.random() * 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(confetti.rotate, {
                        toValue: 360 * (2 + Math.random() * 3),
                        duration: 3000 + Math.random() * 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(confetti.opacity, {
                        toValue: 0,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                ]);
            });

            Animated.stagger(100, confettiAnimations).start();

            // Auto-hide après 4 secondes
            const timer = setTimeout(() => {
                handleHide();
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const handleHide = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.5,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Reset animations
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.5);
            confettiAnims.forEach((confetti) => {
                confetti.translateY.setValue(-100);
                confetti.translateX.setValue(Math.random() * width);
                confetti.rotate.setValue(0);
                confetti.opacity.setValue(1);
            });
            onHide();
        });
    };

    const confettiColors = [
        "#FF6B9D", // Rose
        "#7ED957", // Vert
        "#FFD93D", // Jaune
        "#6B73FF", // Bleu
        "#FF8C42", // Orange
        "#9FE2BF", // Vert clair
        "#E2CCFF", // Violet clair
        "#BAE1FF", // Bleu clair
    ];

    const confettiShapes = ["■", "●", "▲", "♦", "★"];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={handleHide}
        >
            <View style={styles.overlay}>
                {/* Confettis */}
                {confettiAnims.map((confetti, index) => (
                    <Animated.Text
                        key={index}
                        style={[
                            styles.confetti,
                            {
                                transform: [
                                    { translateX: confetti.translateX },
                                    { translateY: confetti.translateY },
                                    {
                                        rotate: confetti.rotate.interpolate({
                                            inputRange: [0, 360],
                                            outputRange: ["0deg", "360deg"],
                                        }),
                                    },
                                ],
                                opacity: confetti.opacity,
                                color: confettiColors[
                                    index % confettiColors.length
                                ],
                            },
                        ]}
                    >
                        {confettiShapes[index % confettiShapes.length]}
                    </Animated.Text>
                ))}

                {/* Contenu principal */}
                <Animated.View
                    style={[
                        styles.container,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.celebration}>
                        {/* Icône principale */}
                        <View style={styles.iconContainer}>
                            <Ionicons name="trophy" size={80} color="#FFD93D" />
                        </View>

                        {/* Titre */}
                        <Text style={styles.title}>🎉 BRAVO ! 🎉</Text>

                        {/* Message */}
                        <Text style={styles.message}>
                            Toutes les tâches de {tripTitle} sont terminées !
                        </Text>

                        {/* Sous-message */}
                        <Text style={styles.subMessage}>
                            Votre équipe a tout géré ! 🚀
                        </Text>

                        {/* Emojis animés */}
                        <View style={styles.emojiContainer}>
                            <Text style={styles.emoji}>🎊</Text>
                            <Text style={styles.emoji}>✨</Text>
                            <Text style={styles.emoji}>🎈</Text>
                            <Text style={styles.emoji}>🥳</Text>
                            <Text style={styles.emoji}>🎉</Text>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 32,
        margin: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 16,
    },
    celebration: {
        alignItems: "center",
    },
    iconContainer: {
        marginBottom: 20,
        padding: 20,
        backgroundColor: "#FFF8E1",
        borderRadius: 50,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: Colors.primary,
        textAlign: "center",
        marginBottom: 16,
    },
    message: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1E293B",
        textAlign: "center",
        marginBottom: 8,
        lineHeight: 28,
    },
    subMessage: {
        fontSize: 16,
        color: "#64748B",
        textAlign: "center",
        marginBottom: 24,
        fontWeight: "500",
    },
    emojiContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    emoji: {
        fontSize: 28,
    },
    confetti: {
        position: "absolute",
        fontSize: 20,
        fontWeight: "bold",
    },
});

export default ChecklistCelebration;
