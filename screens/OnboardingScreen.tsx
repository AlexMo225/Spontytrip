import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useRef, useState } from "react";
import { Animated, SafeAreaView, Text, View } from "react-native";
import { useOnboardingScreenStyle } from "../hooks/useOnboardingScreenStyle";
import { RootStackParamList } from "../types";

type OnboardingScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Onboarding"
>;

interface Props {
    navigation: OnboardingScreenNavigationProp;
}

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
    const [logoOpacity] = useState(new Animated.Value(0));
    const [textOpacity] = useState(new Animated.Value(0));
    const circleAnimation = useRef(new Animated.Value(0)).current;
    const styles = useOnboardingScreenStyle();

    useEffect(() => {
        // Animation d'apparition du logo
        Animated.sequence([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Animation continue du petit cercle blanc
        const animateCircle = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(circleAnimation, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(circleAnimation, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        // Démarrer l'animation du cercle après l'apparition du logo
        const circleTimer = setTimeout(() => {
            animateCircle();
        }, 1200);

        // Timer de redirection après 5 secondes
        const redirectTimer = setTimeout(() => {
            // TODO: Vérifier si l'utilisateur est connecté
            const isUserLoggedIn = false; // À remplacer par la vraie logique d'auth

            if (isUserLoggedIn) {
                // Si connecté, aller directement à l'app
                navigation.replace("MainApp");
            } else {
                // Sinon, aller vers login
                navigation.replace("Login");
            }
        }, 5000); // 5 secondes

        // Nettoyage des timers si le component est démonté
        return () => {
            clearTimeout(redirectTimer);
            clearTimeout(circleTimer);
        };
    }, [navigation, logoOpacity, textOpacity, circleAnimation]);

    // Calculer les positions du petit cercle (mouvement circulaire)
    const circleTranslateX = circleAnimation.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [0, 20, 0, -20, 0],
    });

    const circleTranslateY = circleAnimation.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [-20, 0, 20, 0, -20],
    });

    const circleScale = circleAnimation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.2, 1],
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo animé */}
                <Animated.View
                    style={[styles.logoContainer, { opacity: logoOpacity }]}
                >
                    <View style={styles.logoCircle}>
                        <Animated.View
                            style={[
                                styles.logoInnerCircle,
                                {
                                    transform: [
                                        { translateX: circleTranslateX },
                                        { translateY: circleTranslateY },
                                        { scale: circleScale },
                                    ],
                                },
                            ]}
                        />
                    </View>
                    <Text style={styles.logoText}>
                        <Text style={styles.logoTextSponty}>Sponty</Text>
                        {"\n"}
                        <Text style={styles.logoTextTrip}>Trip</Text>
                    </Text>
                </Animated.View>

                {/* Slogan animé */}
                <Animated.View
                    style={[styles.sloganContainer, { opacity: textOpacity }]}
                >
                    <Text style={styles.slogan}>
                        Préparez, partez. Ensemble.
                    </Text>
                </Animated.View>
            </View>

            {/* Indicateur de chargement subtil */}
            <View style={styles.footer}>
                <View style={styles.loadingDots}>
                    <LoadingDot delay={0} />
                    <LoadingDot delay={300} />
                    <LoadingDot delay={600} />
                </View>
            </View>
        </SafeAreaView>
    );
};

// Composant pour les points de chargement animés
const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => {
    const [opacity] = useState(new Animated.Value(0.3));
    const styles = useOnboardingScreenStyle();

    useEffect(() => {
        const animate = () => {
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start(() => animate());
        };

        const timer = setTimeout(animate, delay);
        return () => clearTimeout(timer);
    }, [opacity, delay]);

    return <Animated.View style={[styles.dot, { opacity }]} />;
};

export default OnboardingScreen;
