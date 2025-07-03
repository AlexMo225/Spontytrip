import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Animated, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WelcomeModal } from "../components";
import {
    HomeActionButtons,
    HomeEmptyState,
    HomeHeader,
    HomeTripsList,
} from "../components/home";
import { useHome } from "../hooks";
import { useHomeStyles } from "../styles/screens";
import { FirestoreTrip, RootStackParamList } from "../types";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
    navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const {
        // Données utilisateur et voyages
        user,
        trips,
        loading,
        error,
        refreshTrips,

        // État local
        refreshing,
        currentQuote,
        showWelcomeModal,
        setShowWelcomeModal,

        // Animations
        fadeAnim,
        slideAnim,
        scaleAnim,
        actionButtonsAnim,

        // Handlers
        onRefresh,
        animateButtonPress,
        handleWelcomeComplete,

        // Utilitaires
        formatDateRange,
        getTripStatus,
        getTypeEmoji,

        // Citations
        inspirationalQuotes,
    } = useHome();

    const styles = useHomeStyles();

    // Navigation handlers
    const handleCreateTrip = () => {
        navigation.navigate("CreateTrip");
    };

    const handleJoinTrip = () => {
        navigation.navigate("JoinTrip");
    };

    const handleTripPress = (trip: FirestoreTrip) => {
        navigation.navigate("TripDetails", { tripId: trip.id });
    };

    const handleSeeAllTrips = () => {
        navigation.navigate("MainApp", { screen: "MyTrips" });
    };

    // Obtenir le prénom de l'utilisateur pour la modale de bienvenue
    const getFirstName = () => {
        if (!user?.displayName) return "Aventurier";
        return user.displayName.split(" ")[0] || "Aventurier";
    };

    // Vérifications défensives pour éviter les erreurs
    const safeAnimatedStyle = (opacity: any, transform?: any) => {
        // Valeur par défaut si undefined
        if (!opacity) return { opacity: 1 };

        const style: any = { opacity };

        // Gestion des transformations
        if (transform) {
            const transforms = [];
            if (transform.translateY) {
                transforms.push({ translateY: transform.translateY });
            }
            if (transform.scale) {
                transforms.push({ scale: transform.scale });
            }
            if (transforms.length > 0) {
                style.transform = transforms;
            }
        }
        return style;
    };

    // Styles par défaut pour éviter les erreurs
    const defaultStyle = { opacity: 1 };
    const defaultTransform = { translateY: 0 };
    const defaultScale = { scale: 1 };

    return (
        <SafeAreaView style={styles.container || {}}>
            {/* Modale de bienvenue pour les nouveaux utilisateurs */}
            <WelcomeModal
                visible={showWelcomeModal || false}
                onComplete={handleWelcomeComplete || (() => {})}
                userName={getFirstName()}
            />

            {/* Header avec salutation */}
            <Animated.View
                style={[
                    styles.headerContainer || {},
                    fadeAnim && slideAnim
                        ? safeAnimatedStyle(fadeAnim, { translateY: slideAnim })
                        : defaultStyle,
                ]}
            >
                <HomeHeader
                    user={user || null}
                    currentQuote={currentQuote || 0}
                    inspirationalQuotes={inspirationalQuotes || []}
                    fadeAnim={fadeAnim}
                    slideAnim={slideAnim}
                />
            </Animated.View>

            {/* Contenu principal avec pull-to-refresh */}
            <ScrollView
                style={styles.scrollView || {}}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || false}
                        onRefresh={async () => {
                            if (refreshTrips) {
                                try {
                                    await refreshTrips();
                                } catch (error) {
                                    console.error(
                                        "Erreur lors du refresh:",
                                        error
                                    );
                                }
                            }
                        }}
                        colors={["#4DA1A9"]}
                        tintColor="#4DA1A9"
                    />
                }
            >
                {/* Boutons d'action */}
                <Animated.View
                    style={[
                        styles.actionButtonsContainer || {},
                        actionButtonsAnim && scaleAnim
                            ? safeAnimatedStyle(actionButtonsAnim, {
                                  scale: scaleAnim,
                              })
                            : defaultScale,
                    ]}
                >
                    <HomeActionButtons
                        actionButtonsAnim={actionButtonsAnim}
                        animateButtonPress={animateButtonPress || (() => {})}
                        onCreateTrip={() =>
                            animateButtonPress
                                ? animateButtonPress(handleCreateTrip)
                                : handleCreateTrip()
                        }
                        onJoinTrip={() =>
                            animateButtonPress
                                ? animateButtonPress(handleJoinTrip)
                                : handleJoinTrip()
                        }
                    />
                </Animated.View>

                {/* Zone de contenu dynamique */}
                <Animated.View
                    style={[
                        styles.contentContainer || {},
                        fadeAnim && slideAnim
                            ? safeAnimatedStyle(fadeAnim, {
                                  translateY: slideAnim,
                              })
                            : defaultStyle,
                    ]}
                >
                    {loading ? (
                        <View style={styles.loadingContainer || {}}>
                            <Text style={styles.loadingText || {}}>
                                Chargement de tes voyages...
                            </Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer || {}}>
                            <Text style={styles.errorTitle || {}}>
                                ❌ Oups, une erreur !
                            </Text>
                            <Text style={styles.errorText || {}}>{error}</Text>
                        </View>
                    ) : !trips || trips.length === 0 ? (
                        // État vide avec call-to-action
                        <HomeEmptyState
                            fadeAnim={fadeAnim}
                            scaleAnim={scaleAnim}
                        />
                    ) : (
                        // Liste des voyages
                        <HomeTripsList
                            trips={trips || []}
                            loading={loading || false}
                            error={error || null}
                            refreshTrips={refreshTrips || (() => {})}
                            formatDateRange={formatDateRange || (() => "")}
                            getTripStatus={
                                getTripStatus ||
                                (() => ({ text: "", color: "", emoji: "" }))
                            }
                            getTypeEmoji={getTypeEmoji || (() => "✈️")}
                            currentUserId={user?.uid || ""}
                            fadeAnim={fadeAnim}
                            scaleAnim={scaleAnim}
                            onTripPress={handleTripPress || (() => {})}
                            onCreateTrip={handleCreateTrip || (() => {})}
                            onJoinTrip={handleJoinTrip || (() => {})}
                            onSeeAllTrips={handleSeeAllTrips || (() => {})}
                        />
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;
