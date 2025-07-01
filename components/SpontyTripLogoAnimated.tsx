import React, { useEffect, useRef } from "react";
import { Text, View, ViewStyle } from "react-native";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useSpontyTripLogoAnimatedStyles } from "../styles/components";

interface SpontyTripLogoAnimatedProps {
    size?: "small" | "medium" | "large";
    onAnimationComplete?: () => void;
    autoPlay?: boolean;
    style?: ViewStyle;
}

const SpontyTripLogoAnimated: React.FC<SpontyTripLogoAnimatedProps> = ({
    size = "medium",
    onAnimationComplete,
    autoPlay = true,
    style,
}) => {
    const styles = useSpontyTripLogoAnimatedStyles();
    const sizeConfig = {
        small: { circleSize: 50, fontSize: 28, spacing: 14, lineHeight: 30 },
        medium: { circleSize: 80, fontSize: 40, spacing: 20, lineHeight: 42 },
        large: { circleSize: 120, fontSize: 52, spacing: 24, lineHeight: 54 },
    };

    const config = sizeConfig[size];

    const colors = {
        spontyBlue: "rgb(77, 161, 169)", // #4DA1A9
        tripGreen: "rgb(126, 217, 87)", // #7ED957
        gradientStart: "#7ED957",
        gradientEnd: "#4DA1A9",
    };

    const circleScale = useSharedValue(0);
    const circleOpacity = useSharedValue(0);
    const spontyOpacity = useSharedValue(0);
    const spontyTranslateX = useSharedValue(-30);
    const tripOpacity = useSharedValue(0);
    const tripTranslateY = useSharedValue(20);

    // Animation micro pour le cercle blanc
    const smallCircleY = useSharedValue(0);
    const intervalRef = useRef<any>(null);

    // Animation continue avec setInterval (plus fiable)
    const startContinuousAnimation = () => {
        if (intervalRef.current) return; // Éviter les doublons

        let direction = 1; // 1 pour descendre, -1 pour monter

        intervalRef.current = setInterval(() => {
            const targetValue = direction === 1 ? 12 : -12;
            smallCircleY.value = withTiming(targetValue, { duration: 800 });
            direction *= -1; // Inverser la direction
        }, 900); // 800ms d'animation + 100ms de pause
    };

    // Cleanup de l'interval
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    const startAnimation = () => {
        circleScale.value = 0;
        circleOpacity.value = 0;
        spontyOpacity.value = 0;
        spontyTranslateX.value = -30;
        tripOpacity.value = 0;
        tripTranslateY.value = 20;

        // Animation plus lente et plus visible
        circleScale.value = withTiming(1, { duration: 800 });
        circleOpacity.value = withTiming(1, { duration: 800 });

        spontyOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
        spontyTranslateX.value = withDelay(500, withSpring(0, { damping: 12 }));

        tripOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));
        tripTranslateY.value = withDelay(900, withSpring(0, { damping: 12 }));

        // Démarrer l'animation continue du cercle blanc après l'animation principale
        setTimeout(() => {
            startContinuousAnimation();
        }, 1500);

        if (onAnimationComplete) {
            // Laisser le temps d'apprécier l'animation complète + pause
            setTimeout(() => {
                runOnJS(onAnimationComplete)();
            }, 3500); // 3.5 secondes au total
        }
    };

    useEffect(() => {
        if (autoPlay) {
            const timer = setTimeout(startAnimation, 500); // Délai initial plus naturel
            return () => clearTimeout(timer);
        }
    }, [autoPlay]);

    const circleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: circleScale.value }],
        opacity: circleOpacity.value,
    }));

    const spontyAnimatedStyle = useAnimatedStyle(() => ({
        opacity: spontyOpacity.value,
        transform: [{ translateX: spontyTranslateX.value }],
    }));

    const tripAnimatedStyle = useAnimatedStyle(() => ({
        opacity: tripOpacity.value,
        transform: [{ translateY: tripTranslateY.value }],
    }));

    // Style animé pour le cercle blanc
    const smallCircleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: smallCircleY.value }],
    }));

    const CircleLogo = () => (
        <View style={{ position: "relative" }}>
            <Svg
                width={config.circleSize}
                height={config.circleSize}
                viewBox="0 0 100 100"
            >
                <Defs>
                    <LinearGradient
                        id="circleGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <Stop
                            offset="0%"
                            stopColor={colors.gradientStart}
                            stopOpacity="1"
                        />
                        <Stop
                            offset="100%"
                            stopColor={colors.gradientEnd}
                            stopOpacity="1"
                        />
                    </LinearGradient>
                </Defs>
                <Circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="url(#circleGradient)"
                    stroke="none"
                />
            </Svg>

            {/* Petit cercle blanc animé verticalement */}
            <Animated.View
                style={[
                    smallCircleAnimatedStyle,
                    {
                        position: "absolute",
                        top: "40%",
                        left: "50%",
                        width: config.circleSize * 0.25,
                        height: config.circleSize * 0.25,
                        borderRadius: (config.circleSize * 0.25) / 2,
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        marginLeft: -(config.circleSize * 0.25) / 2,
                        marginTop: -(config.circleSize * 0.25) / 2,
                    },
                ]}
            />
        </View>
    );

    return (
        <View style={[styles.container, style]}>
            <View style={styles.logoContainer}>
                <Animated.View
                    style={[
                        circleAnimatedStyle,
                        { marginRight: config.spacing },
                    ]}
                >
                    <CircleLogo />
                </Animated.View>
                <View style={styles.textContainer}>
                    <Animated.View style={spontyAnimatedStyle}>
                        <Text
                            style={[
                                styles.logoText,
                                {
                                    fontSize: config.fontSize,
                                    lineHeight: config.lineHeight,
                                    color: colors.spontyBlue,
                                },
                            ]}
                        >
                            Sponty
                        </Text>
                    </Animated.View>
                    <Animated.View style={tripAnimatedStyle}>
                        <Text
                            style={[
                                styles.logoText,
                                {
                                    fontSize: config.fontSize,
                                    lineHeight: config.lineHeight,
                                    color: colors.tripGreen,
                                },
                            ]}
                        >
                            Trip
                        </Text>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
};

export default SpontyTripLogoAnimated;
