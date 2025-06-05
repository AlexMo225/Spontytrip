import { StackNavigationProp } from "@react-navigation/stack";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { RootStackParamList } from "../types";

type OnboardingScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Onboarding"
>;

interface Props {
    navigation: OnboardingScreenNavigationProp;
}

const { width } = Dimensions.get("window");

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const onboardingData = [
        {
            id: 1,
            title: "Sponty Trip",
            subtitle: "Préparez, partez. Ensemble.",
            description: "",
            showLogo: true,
            buttonText: "Commencer",
            showPagination: false,
        },
        {
            id: 2,
            title: "Organize without stress",
            subtitle: "",
            description:
                "SpontyTrip simplifies weekend planning, so you can focus on the fun with your friends.",
            showLogo: false,
            buttonText: "",
            showPagination: true,
            imageColor: "#4DA1A9", // Couleur placeholder pour l'image
        },
        {
            id: 3,
            title: "Répartissez les objets facilement",
            subtitle: "",
            description:
                "Plus besoin de se demander qui apporte quoi. SpontyTrip vous permet de répartir les objets à emporter en un clin d'oeil.",
            showLogo: false,
            buttonText: "Suivant",
            showPagination: true,
            imageColor: "#7ED957", // Couleur placeholder pour l'image
        },
    ];

    const handleNext = () => {
        if (currentPage < onboardingData.length - 1) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            scrollViewRef.current?.scrollTo({
                x: nextPage * width,
                animated: true,
            });
        } else {
            // Dernière page, aller vers Login
            navigation.replace("Login");
        }
    };

    const handleStart = () => {
        // Premier bouton "Commencer"
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        scrollViewRef.current?.scrollTo({
            x: nextPage * width,
            animated: true,
        });
    };

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / width);
        setCurrentPage(currentIndex);
    };

    const renderLogo = () => (
        <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
                <View style={styles.logoInnerCircle} />
            </View>
            <Text style={styles.logoText}>Sponty Trip</Text>
        </View>
    );

    const renderPagination = () => (
        <View style={styles.paginationContainer}>
            {onboardingData.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        index === currentPage
                            ? styles.paginationDotActive
                            : styles.paginationDotInactive,
                    ]}
                />
            ))}
        </View>
    );

    const renderPage = (item: any, index: number) => (
        <View key={item.id} style={styles.page}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    {/* Header avec logo ou image */}
                    <View style={styles.headerContainer}>
                        {item.showLogo ? (
                            renderLogo()
                        ) : (
                            <View
                                style={[
                                    styles.imageContainer,
                                    { backgroundColor: item.imageColor },
                                ]}
                            >
                                <View style={styles.imagePlaceholder}>
                                    <Text style={styles.imagePlaceholderText}>
                                        📱
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Texte principal */}
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{item.title}</Text>
                        {item.subtitle ? (
                            <Text style={styles.subtitle}>{item.subtitle}</Text>
                        ) : null}
                        {item.description ? (
                            <Text style={styles.description}>
                                {item.description}
                            </Text>
                        ) : null}
                    </View>

                    {/* Pagination */}
                    <View style={styles.bottomContainer}>
                        {item.showPagination && renderPagination()}

                        {/* Bouton */}
                        {item.buttonText ? (
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    index === 0
                                        ? styles.startButton
                                        : styles.nextButton,
                                ]}
                                onPress={index === 0 ? handleStart : handleNext}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        index === 0
                                            ? styles.startButtonText
                                            : styles.nextButtonText,
                                    ]}
                                >
                                    {item.buttonText}
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
            >
                {onboardingData.map((item, index) => renderPage(item, index))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    scrollView: {
        flex: 1,
    },
    page: {
        width: width,
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.md,
    },
    headerContainer: {
        flex: 0.4,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: Spacing.xl,
    },
    logoContainer: {
        alignItems: "center",
        marginTop: Spacing.xl,
    },
    logoCircle: {
        width: 72,
        height: 74,
        borderRadius: 37,
        backgroundColor: Colors.secondary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    logoInnerCircle: {
        width: 29,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    logoText: {
        ...TextStyles.h1,
        color: Colors.textPrimary,
        fontWeight: "700",
        textAlign: "center",
    },
    imageContainer: {
        width: "100%",
        height: 320,
        borderRadius: 12,
        overflow: "hidden",
        marginHorizontal: Spacing.md,
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    imagePlaceholderText: {
        fontSize: 80,
        opacity: 0.7,
    },
    textContainer: {
        flex: 0.3,
        justifyContent: "center",
        paddingHorizontal: Spacing.sm,
    },
    title: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        textAlign: "center",
        marginBottom: Spacing.sm,
        fontWeight: "600",
    },
    subtitle: {
        ...TextStyles.h3,
        color: "rgba(0, 0, 0, 0.8)",
        textAlign: "center",
        marginBottom: Spacing.md,
        fontWeight: "500",
    },
    description: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
        textAlign: "center",
        lineHeight: 24,
        paddingHorizontal: Spacing.xs,
    },
    bottomContainer: {
        flex: 0.3,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: Spacing.xl,
    },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.lg,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 6,
    },
    paginationDotActive: {
        backgroundColor: Colors.textPrimary,
    },
    paginationDotInactive: {
        backgroundColor: "#DCE0E5",
    },
    button: {
        borderRadius: 24,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        minWidth: 200,
        alignItems: "center",
    },
    startButton: {
        backgroundColor: Colors.secondary,
        opacity: 0.91,
    },
    nextButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: Colors.textSecondary,
    },
    buttonText: {
        ...TextStyles.button,
        fontWeight: "600",
    },
    startButtonText: {
        color: Colors.white,
    },
    nextButtonText: {
        color: Colors.textSecondary,
    },
});

export default OnboardingScreen;
