import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors, Fonts, Spacing } from "../constants";
import SpontyTripLogoAnimated from "./SpontyTripLogoAnimated";

interface WelcomeModalProps {
    visible: boolean;
    onComplete: () => void;
    userName?: string;
}

const { width, height } = Dimensions.get("window");

const WelcomeModal: React.FC<WelcomeModalProps> = ({
    visible,
    onComplete,
    userName = "Aventurier",
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const logoAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Séquence d'animations d'entrée
            Animated.sequence([
                // Fade in du background
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                // Apparition du logo avec scale
                Animated.parallel([
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        tension: 50,
                        friction: 7,
                        useNativeDriver: true,
                    }),
                    Animated.timing(logoAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ]),
                // Slide in du texte
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Reset des animations
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.3);
            slideAnim.setValue(50);
            logoAnim.setValue(0);
        }
    }, [visible]);

    const handleComplete = () => {
        // Animation de sortie
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(onComplete);
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
        >
            <Animated.View
                style={[
                    styles.overlay,
                    {
                        opacity: fadeAnim,
                    },
                ]}
            >
                <BlurView intensity={20} style={styles.blurContainer}>
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            {
                                transform: [{ scale: scaleAnim }],
                                opacity: fadeAnim,
                            },
                        ]}
                    >
                        {/* Logo animé */}
                        <Animated.View
                            style={[
                                styles.logoContainer,
                                {
                                    opacity: logoAnim,
                                    transform: [{ scale: scaleAnim }],
                                },
                            ]}
                        >
                            <SpontyTripLogoAnimated
                                size="large"
                                autoPlay={true}
                            />
                        </Animated.View>

                        {/* Contenu de bienvenue */}
                        <Animated.View
                            style={[
                                styles.contentContainer,
                                {
                                    transform: [{ translateY: slideAnim }],
                                    opacity: fadeAnim,
                                },
                            ]}
                        >
                            <Text style={styles.welcomeTitle}>
                                🎉 Bienvenue {userName} !
                            </Text>

                            <Text style={styles.welcomeSubtitle}>
                                Ton aventure SpontyTrip commence maintenant
                            </Text>

                            <View style={styles.featuresContainer}>
                                <View style={styles.featureItem}>
                                    <Text style={styles.featureEmoji}>✈️</Text>
                                    <Text style={styles.featureText}>
                                        Organise tes voyages spontanés
                                    </Text>
                                </View>

                                <View style={styles.featureItem}>
                                    <Text style={styles.featureEmoji}>👥</Text>
                                    <Text style={styles.featureText}>
                                        Invite tes amis en un clic
                                    </Text>
                                </View>

                                <View style={styles.featureItem}>
                                    <Text style={styles.featureEmoji}>💰</Text>
                                    <Text style={styles.featureText}>
                                        Gère tes dépenses facilement
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.startButton}
                                onPress={handleComplete}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.startButtonText}>
                                    Commencer l'aventure !
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                </BlurView>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    blurContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: Spacing.lg,
    },
    modalContainer: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: Spacing.xl,
        alignItems: "center",
        maxWidth: width * 0.9,
        width: "100%",
        shadowColor: Colors.cardShadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    logoContainer: {
        marginBottom: Spacing.xl,
        alignItems: "center",
    },
    contentContainer: {
        alignItems: "center",
        width: "100%",
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: Colors.primary,
        textAlign: "center",
        marginBottom: Spacing.sm,
        fontFamily: Fonts.bold,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: "center",
        marginBottom: Spacing.xl,
        fontFamily: Fonts.regular,
        lineHeight: 22,
    },
    featuresContainer: {
        width: "100%",
        marginBottom: Spacing.xl,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.sm,
    },
    featureEmoji: {
        fontSize: 24,
        marginRight: Spacing.md,
        width: 40,
        textAlign: "center",
    },
    featureText: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontFamily: Fonts.medium,
        flex: 1,
    },
    startButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: 16,
        shadowColor: Colors.buttonShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        minWidth: 200,
    },
    startButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        fontFamily: Fonts.semiBold,
    },
});

export default WelcomeModal;
