import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextStyles } from "../constants/Fonts";
import { useAuth } from "../contexts/AuthContext";
import { useUserTrips } from "../hooks/useTripSync";
import { FirestoreTrip } from "../services/firebaseService";
import { RootStackParamList } from "../types";

type HomeScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "MainApp"
>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

const { width: screenWidth } = Dimensions.get("window");

// 🎨 Citations inspirantes pour l'effet "wow"
const inspirationalQuotes = [
    "L'aventure commence ici ! ✈️",
    "Voyager, c'est vivre ! 🌍",
    "Chaque voyage commence par un rêve ⭐",
    "Le monde t'attend ! 🗺️",
    "Partir, c'est découvrir ! 🧭",
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const { trips, loading, error, refreshTrips } = useUserTrips();
    const [refreshing, setRefreshing] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(0);

    // 🎯 Animations pour l'effet "wow"
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const actionButtonsAnim = useRef(new Animated.Value(0)).current;

    // 🚀 Animation d'entrée au chargement
    useEffect(() => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(actionButtonsAnim, {
                    toValue: 1,
                    duration: 400,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    // 🔄 Changer de citation toutes les 4 secondes
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // 🔄 Fonction de refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await refreshTrips();
        setRefreshing(false);
    };

    // 📅 Utilitaires de formatage (gardés de l'ancienne version)
    const formatDateRange = (
        startDate: Date | any,
        endDate: Date | any
    ): string => {
        try {
            const start =
                startDate instanceof Date ? startDate : new Date(startDate);
            const end = endDate instanceof Date ? endDate : new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return "Dates non définies";
            }

            const startDay = start.getDate();
            const endDay = end.getDate();
            const month = start.toLocaleDateString("fr-FR", { month: "long" });

            return `${startDay} - ${endDay} ${month}`;
        } catch (error) {
            console.error("Erreur formatage dates:", error);
            return "Dates invalides";
        }
    };

    const getDaysUntilTrip = (startDate: Date | any): number => {
        try {
            const today = new Date();
            const tripDate =
                startDate instanceof Date ? startDate : new Date(startDate);

            if (isNaN(tripDate.getTime())) {
                return 0;
            }

            const diffTime = tripDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            console.error("Erreur calcul jours:", error);
            return 0;
        }
    };

    const getTripStatus = (
        trip: FirestoreTrip
    ): { text: string; color: string; emoji: string } => {
        try {
            const daysUntil = getDaysUntilTrip(trip.startDate);
            const today = new Date();
            const startDate =
                trip.startDate instanceof Date
                    ? trip.startDate
                    : new Date(trip.startDate);
            const endDate =
                trip.endDate instanceof Date
                    ? trip.endDate
                    : new Date(trip.endDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return { text: "Date invalide", color: "#666", emoji: "❓" };
            }

            if (today >= startDate && today <= endDate) {
                return { text: "En cours", color: "#7ED957", emoji: "🔥" };
            } else if (daysUntil > 0) {
                return {
                    text: `Dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}`,
                    color: "#4DA1A9",
                    emoji: "⏳",
                };
            } else {
                return { text: "Terminé", color: "#94A3B8", emoji: "✅" };
            }
        } catch (error) {
            console.error("Erreur calcul statut voyage:", error);
            return { text: "Statut inconnu", color: "#666", emoji: "❓" };
        }
    };

    const getTypeEmoji = (type: string): string => {
        switch (type) {
            case "plage":
                return "🏖️";
            case "montagne":
                return "🏔️";
            case "citytrip":
                return "🏙️";
            case "campagne":
                return "🌾";
            default:
                return "✈️";
        }
    };

    // 🎯 Animation au tap des boutons d'action
    const animateButtonPress = (callback: () => void) => {
        const scaleDown = new Animated.Value(1);

        Animated.sequence([
            Animated.timing(scaleDown, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleDown, {
                toValue: 1,
                tension: 150,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        setTimeout(callback, 100);
    };

    // 🏠 HEADER ULTRA-MODERNE avec effet dégradé
    const renderModernHeader = () => {
        const firstName =
            user?.displayName?.split(" ")[0] ||
            user?.email?.split("@")[0] ||
            "Voyageur";

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
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    {/* 🎨 Éléments décoratifs flottants */}
                    <View style={styles.floatingElements}>
                        <Ionicons
                            name="airplane"
                            size={20}
                            color="rgba(255,255,255,0.2)"
                            style={styles.floatingIcon1}
                        />
                        <Ionicons
                            name="location"
                            size={16}
                            color="rgba(255,255,255,0.15)"
                            style={styles.floatingIcon2}
                        />
                        <Ionicons
                            name="sunny"
                            size={18}
                            color="rgba(255,255,255,0.1)"
                            style={styles.floatingIcon3}
                        />
                    </View>

                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.modernGreeting}>Salut,</Text>
                            <Text style={styles.modernUserName}>
                                {firstName} 👋
                            </Text>
                            <Text style={styles.modernSubtitle}>
                                Prêt pour l'aventure ?
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.modernProfileButton}
                            onPress={() => navigation.navigate("Profile")}
                            activeOpacity={0.8}
                        >
                            <View style={styles.modernProfileAvatar}>
                                <Text style={styles.modernProfileAvatarText}>
                                    {firstName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    };

    // 🎯 BOUTONS D'ACTION MODERNES avec animations
    const renderModernActionButtons = () => {
        const actions = [
            {
                id: "create",
                title: "Créer",
                subtitle: "un voyage",
                icon: "add-circle",
                gradient: ["#7ED957", "#4DA1A9"],
                onPress: () =>
                    animateButtonPress(() => navigation.navigate("CreateTrip")),
            },
            {
                id: "join",
                title: "Rejoindre",
                subtitle: "un groupe",
                icon: "people",
                gradient: ["#4DA1A9", "#7ED957"],
                onPress: () =>
                    animateButtonPress(() => navigation.navigate("JoinTrip")),
            },
        ];

        return (
            <Animated.View
                style={[
                    styles.modernActionsContainer,
                    { opacity: actionButtonsAnim },
                ]}
            >
                {actions.map((action, index) => (
                    <Animated.View
                        key={action.id}
                        style={[
                            styles.modernActionButton,
                            {
                                transform: [
                                    {
                                        translateY:
                                            actionButtonsAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [50, 0],
                                            }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={action.onPress}
                            activeOpacity={0.9}
                            style={styles.actionButtonTouchable}
                        >
                            <LinearGradient
                                colors={action.gradient}
                                style={styles.actionButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons
                                    name={action.icon as any}
                                    size={28}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.actionButtonTitle}>
                                    {action.title}
                                </Text>
                                <Text style={styles.actionButtonSubtitle}>
                                    {action.subtitle}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </Animated.View>
        );
    };

    // 🗂️ CARTES DE VOYAGES HORIZONTALES MODERNES
    const renderModernTripCard = ({ item: trip }: { item: FirestoreTrip }) => {
        const status = getTripStatus(trip);
        const isCreator = trip.creatorId === user?.uid;

        return (
            <TouchableOpacity
                style={styles.modernTripCard}
                onPress={() =>
                    navigation.navigate("TripDetails", { tripId: trip.id })
                }
                activeOpacity={0.9}
            >
                <View style={styles.modernTripImageContainer}>
                    {trip.coverImage ? (
                        <Image
                            source={{ uri: trip.coverImage }}
                            style={styles.modernTripImage}
                        />
                    ) : (
                        <LinearGradient
                            colors={["#7ED957", "#4DA1A9"]}
                            style={styles.modernTripImage}
                        >
                            <Text style={styles.tripEmojiIcon}>
                                {getTypeEmoji(trip.type)}
                            </Text>
                        </LinearGradient>
                    )}

                    {/* 🏷️ Badge de statut moderne */}
                    <View
                        style={[
                            styles.modernStatusBadge,
                            { backgroundColor: status.color },
                        ]}
                    >
                        <Text style={styles.modernStatusEmoji}>
                            {status.emoji}
                        </Text>
                        <Text style={styles.modernStatusText}>
                            {status.text}
                        </Text>
                    </View>

                    {/* ⭐ Badge créateur */}
                    {isCreator && (
                        <View style={styles.modernCreatorBadge}>
                            <Ionicons name="star" size={12} color="#FFD93D" />
                        </View>
                    )}
                </View>

                <View style={styles.modernTripInfo}>
                    <Text style={styles.modernTripTitle} numberOfLines={1}>
                        {trip.title}
                    </Text>
                    <Text
                        style={styles.modernTripDestination}
                        numberOfLines={1}
                    >
                        📍 {trip.destination}
                    </Text>
                    <Text style={styles.modernTripDate}>
                        📅 {formatDateRange(trip.startDate, trip.endDate)}
                    </Text>

                    {/* 👥 Membres */}
                    <View style={styles.modernTripMembers}>
                        <Text style={styles.modernMembersText}>
                            👥 {trip.members.length} membre
                            {trip.members.length > 1 ? "s" : ""}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // ✨ ZONE FUN AVEC ASTUCES ET WIDGETS
    const renderFunZone = () => {
        return (
            <Animated.View
                style={[
                    styles.funZone,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* 💬 Citation inspirante */}
                <View style={styles.quoteCard}>
                    <LinearGradient
                        colors={[
                            "rgba(126, 217, 87, 0.1)",
                            "rgba(77, 161, 169, 0.1)",
                        ]}
                        style={styles.quoteGradient}
                    >
                        <Ionicons name="sparkles" size={24} color="#7ED957" />
                        <Text style={styles.quoteText}>
                            {inspirationalQuotes[currentQuote]}
                        </Text>
                    </LinearGradient>
                </View>

                {/* 📊 Widget de progression */}
                {trips.length > 0 && (
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>Vos aventures</Text>
                        <View style={styles.statsContent}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {trips.length}
                                </Text>
                                <Text style={styles.statLabel}>
                                    Voyage{trips.length > 1 ? "s" : ""}
                                </Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {new Set(
                                        trips.map((t) =>
                                            t.destination.split(",")[1]?.trim()
                                        )
                                    ).size || trips.length}
                                </Text>
                                <Text style={styles.statLabel}>Pays</Text>
                            </View>
                        </View>
                    </View>
                )}
            </Animated.View>
        );
    };

    // 🎭 État vide moderne
    const renderModernEmptyState = () => {
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
                        onPress={() => navigation.navigate("CreateTrip")}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={["#7ED957", "#4DA1A9"]}
                            style={styles.modernPrimaryButtonGradient}
                        >
                            <Ionicons
                                name="add-circle"
                                size={20}
                                color="#FFFFFF"
                            />
                            <Text style={styles.modernPrimaryButtonText}>
                                Créer un voyage
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modernSecondaryButton}
                        onPress={() => navigation.navigate("JoinTrip")}
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

    return (
        <SafeAreaView style={styles.modernContainer}>
            <ScrollView
                style={styles.modernScrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#7ED957"]}
                        tintColor="#7ED957"
                        progressBackgroundColor="#FFFFFF"
                    />
                }
            >
                {/* 🏠 Header moderne */}
                {renderModernHeader()}

                {/* 🎯 Boutons d'action modernes */}
                {renderModernActionButtons()}

                {/* ✨ Zone fun */}
                {renderFunZone()}

                {/* 🗂️ Section des voyages */}
                <View style={styles.modernTripsSection}>
                    <View style={styles.modernSectionHeader}>
                        <Text style={styles.modernSectionTitle}>
                            Mes voyages
                        </Text>
                        {trips.length > 3 && (
                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate("MainApp", {
                                        screen: "MyTrips",
                                    })
                                }
                                activeOpacity={0.7}
                            >
                                <Text style={styles.modernSeeAllText}>
                                    Voir tout
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading && (
                        <View style={styles.modernLoadingState}>
                            <ActivityIndicator size="large" color="#7ED957" />
                            <Text style={styles.modernLoadingText}>
                                Chargement de vos voyages...
                            </Text>
                        </View>
                    )}

                    {error && !loading && (
                        <View style={styles.modernErrorState}>
                            <Ionicons
                                name="alert-circle-outline"
                                size={48}
                                color="#FF6B6B"
                            />
                            <Text style={styles.modernErrorTitle}>
                                Erreur de chargement
                            </Text>
                            <Text style={styles.modernErrorSubtitle}>
                                {error}
                            </Text>
                            <TouchableOpacity
                                style={styles.modernRetryButton}
                                onPress={refreshTrips}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.modernRetryButtonText}>
                                    Réessayer
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!loading &&
                        !error &&
                        trips.length === 0 &&
                        renderModernEmptyState()}

                    {!loading && !error && trips.length > 0 && (
                        <FlatList
                            data={trips.slice(0, 3)}
                            keyExtractor={(item) => item.id}
                            renderItem={renderModernTripCard}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={
                                styles.modernTripsHorizontalList
                            }
                            ItemSeparatorComponent={() => (
                                <View style={{ width: 16 }} />
                            )}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// 🎨 STYLES ULTRA-MODERNES
const styles = StyleSheet.create({
    modernContainer: {
        flex: 1,
        backgroundColor: "#FAFBFC",
    },
    modernScrollView: {
        flex: 1,
    },

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
    floatingElements: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    floatingIcon1: {
        position: "absolute",
        top: 20,
        right: 80,
        transform: [{ rotate: "15deg" }],
    },
    floatingIcon2: {
        position: "absolute",
        bottom: 30,
        right: 30,
        transform: [{ rotate: "-10deg" }],
    },
    floatingIcon3: {
        position: "absolute",
        top: 50,
        left: 30,
        transform: [{ rotate: "20deg" }],
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1,
    },
    headerLeft: {
        flex: 1,
    },
    modernGreeting: {
        fontSize: 18,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.9)",
        marginBottom: 4,
    },
    modernUserName: {
        fontSize: 28,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    modernSubtitle: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.8)",
    },
    modernProfileButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    modernProfileAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    modernProfileAvatarText: {
        fontSize: 22,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    // 🎯 BOUTONS D'ACTION MODERNES
    modernActionsContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 32,
        gap: 12,
    },
    modernActionButton: {
        flex: 1,
    },
    actionButtonTouchable: {
        borderRadius: 16,
        overflow: "hidden",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
    },
    actionButtonGradient: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 100,
    },
    actionButtonTitle: {
        fontSize: 16,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#FFFFFF",
        marginTop: 8,
        textAlign: "center",
    },
    actionButtonSubtitle: {
        fontSize: 12,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.8)",
        marginTop: 2,
        textAlign: "center",
    },

    // ✨ ZONE FUN
    funZone: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    quoteCard: {
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    quoteGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#FFFFFF",
    },
    quoteText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#2D3748",
        marginLeft: 12,
        flex: 1,
    },
    statsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    statsTitle: {
        fontSize: 18,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#2D3748",
        marginBottom: 16,
        textAlign: "center",
    },
    statsContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statNumber: {
        fontSize: 28,
        fontFamily: TextStyles.heading.family,
        fontWeight: "800",
        color: "#7ED957",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#64748B",
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#E2E8F0",
        marginHorizontal: 20,
    },

    // 🗂️ SECTION VOYAGES MODERNE
    modernTripsSection: {
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    modernSectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modernSectionTitle: {
        fontSize: 24,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#2D3748",
    },
    modernSeeAllText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },
    modernTripsHorizontalList: {
        paddingLeft: 0,
    },

    // 🎫 CARTES DE VOYAGE MODERNES
    modernTripCard: {
        width: screenWidth * 0.75,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        overflow: "hidden",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
    },
    modernTripImageContainer: {
        height: 160,
        position: "relative",
    },
    modernTripImage: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    tripEmojiIcon: {
        fontSize: 48,
    },
    modernStatusBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    modernStatusEmoji: {
        fontSize: 12,
    },
    modernStatusText: {
        fontSize: 12,
        fontFamily: TextStyles.body.family,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    modernCreatorBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(255, 217, 61, 0.95)",
        justifyContent: "center",
        alignItems: "center",
    },
    modernTripInfo: {
        padding: 20,
    },
    modernTripTitle: {
        fontSize: 20,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#2D3748",
        marginBottom: 8,
    },
    modernTripDestination: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 6,
    },
    modernTripDate: {
        fontSize: 14,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "#94A3B8",
        marginBottom: 12,
    },
    modernTripMembers: {
        flexDirection: "row",
        alignItems: "center",
    },
    modernMembersText: {
        fontSize: 14,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },

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

    // ➕ BOUTON D'AJOUT
    modernAddButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F0F8F0",
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 24,
        marginTop: 16,
        borderWidth: 2,
        borderColor: "#E6F7E6",
        borderStyle: "dashed",
    },
    modernAddButtonText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#7ED957",
        marginLeft: 8,
    },

    // 🔄 ÉTATS DE CHARGEMENT MODERNES
    modernLoadingState: {
        alignItems: "center",
        paddingVertical: 40,
    },
    modernLoadingText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
        marginTop: 16,
    },
    modernErrorState: {
        alignItems: "center",
        paddingVertical: 40,
    },
    modernErrorTitle: {
        fontSize: 20,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#EF4444",
        marginTop: 16,
        marginBottom: 8,
    },
    modernErrorSubtitle: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "#94A3B8",
        textAlign: "center",
        marginBottom: 24,
    },
    modernRetryButton: {
        backgroundColor: "#4DA1A9",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    modernRetryButtonText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});

export default HomeScreen;
