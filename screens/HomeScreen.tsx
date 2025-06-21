import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    RefreshControl,
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

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const { trips, loading, error, refreshTrips } = useUserTrips();
    const [refreshing, setRefreshing] = useState(false);

    // Logs de débogage
    console.log("🏠 HomeScreen - État actuel:", {
        loading,
        error,
        tripsCount: trips.length,
        trips: trips.map((t) => ({
            id: t.id,
            title: t.title,
            destination: t.destination,
        })),
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshTrips();
        setRefreshing(false);
    };

    const formatDateRange = (
        startDate: Date | any,
        endDate: Date | any
    ): string => {
        try {
            // S'assurer qu'on a des objets Date valides
            const start =
                startDate instanceof Date ? startDate : new Date(startDate);
            const end = endDate instanceof Date ? endDate : new Date(endDate);

            // Vérifier que les dates sont valides
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

            // Vérifier que la date est valide
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
    ): { text: string; color: string } => {
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

            // Vérifier que les dates sont valides
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return { text: "Date invalide", color: "#666" };
            }

            if (today >= startDate && today <= endDate) {
                return { text: "En cours", color: "#7ED957" };
            } else if (daysUntil > 0) {
                return {
                    text: `Dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}`,
                    color: "#4DA1A9",
                };
            } else {
                return { text: "Terminé", color: "#666" };
            }
        } catch (error) {
            console.error("Erreur calcul statut voyage:", error);
            return { text: "Statut inconnu", color: "#666" };
        }
    };

    const getTypeIcon = (type: string): string => {
        switch (type) {
            case "plage":
                return "sunny";
            case "montagne":
                return "mountain";
            case "citytrip":
                return "business";
            case "campagne":
                return "leaf";
            default:
                return "location";
        }
    };

    const renderTripCard = (trip: FirestoreTrip) => {
        const status = getTripStatus(trip);
        const isCreator = trip.creatorId === user?.uid;

        return (
            <TouchableOpacity
                key={trip.id}
                style={styles.tripCard}
                onPress={() =>
                    navigation.navigate("TripDetails", { tripId: trip.id })
                }
                activeOpacity={0.9}
            >
                <View style={styles.tripImageContainer}>
                    {trip.coverImage ? (
                        <Image
                            source={{ uri: trip.coverImage }}
                            style={styles.tripImage}
                        />
                    ) : (
                        <LinearGradient
                            colors={["#7ED957", "#4DA1A9"]}
                            style={styles.tripImage}
                        >
                            <Ionicons
                                name={getTypeIcon(trip.type) as any}
                                size={32}
                                color="#FFFFFF"
                            />
                        </LinearGradient>
                    )}
                    <View style={styles.tripOverlay}>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: status.color },
                            ]}
                        >
                            <Text style={styles.statusText}>{status.text}</Text>
                        </View>
                        {isCreator && (
                            <View style={styles.creatorBadge}>
                                <Ionicons
                                    name="star"
                                    size={12}
                                    color="#FFD93D"
                                />
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.tripInfo}>
                    <Text style={styles.tripTitle} numberOfLines={1}>
                        {trip.title}
                    </Text>
                    <View style={styles.tripDetails}>
                        <View style={styles.tripLocation}>
                            <Ionicons
                                name="location-outline"
                                size={14}
                                color="#666"
                            />
                            <Text
                                style={styles.tripLocationText}
                                numberOfLines={1}
                            >
                                {trip.destination}
                            </Text>
                        </View>
                        <Text style={styles.tripDate}>
                            {formatDateRange(trip.startDate, trip.endDate)}
                        </Text>
                    </View>
                    <View style={styles.tripMembers}>
                        <View style={styles.membersAvatars}>
                            {trip.members.slice(0, 3).map((member, index) => (
                                <View
                                    key={member.userId}
                                    style={[
                                        styles.memberAvatar,
                                        { marginLeft: index > 0 ? -8 : 0 },
                                    ]}
                                >
                                    <Text style={styles.memberAvatarText}>
                                        {(
                                            member.name ||
                                            member.email ||
                                            member.userId ||
                                            "?"
                                        )
                                            .charAt(0)
                                            .toUpperCase()}
                                    </Text>
                                </View>
                            ))}
                            {trip.members.length > 3 && (
                                <View
                                    style={[
                                        styles.memberAvatar,
                                        styles.moreMembers,
                                        { marginLeft: -8 },
                                    ]}
                                >
                                    <Text style={styles.memberAvatarText}>
                                        +{trip.members.length - 3}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.membersCount}>
                            {trip.members.length} membre
                            {trip.members.length > 1 ? "s" : ""}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <LinearGradient
                colors={["#7ED957", "#4DA1A9"]}
                style={styles.emptyIcon}
            >
                <Ionicons name="airplane" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Aucun voyage pour le moment</Text>
            <Text style={styles.emptySubtitle}>
                Créez votre premier voyage ou rejoignez celui d'un ami !
            </Text>
            <View style={styles.emptyActions}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate("CreateTrip")}
                >
                    <Text style={styles.primaryButtonText}>
                        Créer un voyage
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate("JoinTrip")}
                >
                    <Text style={styles.secondaryButtonText}>
                        Rejoindre un voyage
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderLoadingState = () => (
        <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#7ED957" />
            <Text style={styles.loadingText}>Chargement de vos voyages...</Text>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.errorState}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Erreur de chargement</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshTrips}>
                <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.greeting}>Salut,</Text>
                    <Text style={styles.userName}>
                        {user?.displayName ||
                            user?.email?.split("@")[0] ||
                            "Voyageur"}{" "}
                        ! 👋
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate("Profile")}
                >
                    <View style={styles.profileAvatar}>
                        <Text style={styles.profileAvatarText}>
                            {(user?.displayName || user?.email || "U")
                                .charAt(0)
                                .toUpperCase()}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.quickAction}
                    onPress={() => navigation.navigate("CreateTrip")}
                >
                    <LinearGradient
                        colors={["#7ED957", "#4DA1A9"]}
                        style={styles.quickActionIcon}
                    >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.quickActionText}>Créer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickAction}
                    onPress={() => navigation.navigate("JoinTrip")}
                >
                    <View
                        style={[
                            styles.quickActionIcon,
                            { backgroundColor: "#F8FAFC" },
                        ]}
                    >
                        <Ionicons
                            name="enter-outline"
                            size={24}
                            color="#4DA1A9"
                        />
                    </View>
                    <Text style={styles.quickActionText}>Rejoindre</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickAction}
                    onPress={() =>
                        navigation.navigate("MainApp", { screen: "Discover" })
                    }
                >
                    <View
                        style={[
                            styles.quickActionIcon,
                            { backgroundColor: "#F8FAFC" },
                        ]}
                    >
                        <Ionicons
                            name="compass-outline"
                            size={24}
                            color="#4DA1A9"
                        />
                    </View>
                    <Text style={styles.quickActionText}>Découvrir</Text>
                </TouchableOpacity>
            </View>

            {/* Trips Section */}
            <View style={styles.tripsSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mes voyages</Text>
                    {trips.length > 0 && (
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate("MainApp", {
                                    screen: "MyTrips",
                                })
                            }
                        >
                            <Text style={styles.seeAllText}>Voir tout</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Debug info visible */}
                <View
                    style={{
                        padding: 16,
                        backgroundColor: "#f0f0f0",
                        margin: 16,
                        borderRadius: 8,
                    }}
                >
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                        Debug Info:
                    </Text>
                    <Text>Loading: {loading ? "true" : "false"}</Text>
                    <Text>Error: {error || "none"}</Text>
                    <Text>Trips count: {trips.length}</Text>
                    <Text>User: {user?.email || "none"}</Text>
                </View>

                <ScrollView
                    style={styles.tripsContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#7ED957"]}
                            tintColor="#7ED957"
                        />
                    }
                >
                    {loading && (
                        <View style={styles.loadingState}>
                            <ActivityIndicator size="large" color="#7ED957" />
                            <Text style={styles.loadingText}>
                                Chargement de vos voyages...
                            </Text>
                        </View>
                    )}

                    {error && !loading && (
                        <View style={styles.errorState}>
                            <Ionicons
                                name="alert-circle-outline"
                                size={48}
                                color="#FF6B6B"
                            />
                            <Text style={styles.errorTitle}>
                                Erreur de chargement
                            </Text>
                            <Text style={styles.errorSubtitle}>{error}</Text>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={refreshTrips}
                            >
                                <Text style={styles.retryButtonText}>
                                    Réessayer
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!loading && !error && trips.length === 0 && (
                        <View style={styles.emptyState}>
                            <LinearGradient
                                colors={["#7ED957", "#4DA1A9"]}
                                style={styles.emptyIcon}
                            >
                                <Ionicons
                                    name="airplane"
                                    size={32}
                                    color="#FFFFFF"
                                />
                            </LinearGradient>
                            <Text style={styles.emptyTitle}>
                                Aucun voyage pour le moment
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                Créez votre premier voyage ou rejoignez celui
                                d'un ami !
                            </Text>
                            <View style={styles.emptyActions}>
                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={() =>
                                        navigation.navigate("CreateTrip")
                                    }
                                >
                                    <Text style={styles.primaryButtonText}>
                                        Créer un voyage
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={() =>
                                        navigation.navigate("JoinTrip")
                                    }
                                >
                                    <Text style={styles.secondaryButtonText}>
                                        Rejoindre un voyage
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {!loading && !error && trips.length > 0 && (
                        <View style={styles.tripsGrid}>
                            <Text
                                style={{
                                    padding: 16,
                                    fontWeight: "bold",
                                    color: "red",
                                }}
                            >
                                🎯 VOYAGES TROUVÉS : {trips.slice(0, 3).length}{" "}
                                sur {trips.length}
                            </Text>
                            {trips.slice(0, 3).map((trip, index) => {
                                console.log(
                                    `🏠 Rendu voyage ${index}:`,
                                    trip.title
                                );
                                return (
                                    <View
                                        key={trip.id}
                                        style={{
                                            backgroundColor: "#e0f2fe",
                                            margin: 16,
                                            padding: 16,
                                            borderRadius: 12,
                                            borderWidth: 2,
                                            borderColor: "#4DA1A9",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 18,
                                                fontWeight: "bold",
                                                color: "#4DA1A9",
                                            }}
                                        >
                                            {trip.title}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                color: "#666",
                                                marginTop: 4,
                                            }}
                                        >
                                            📍 {trip.destination}
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: "#666",
                                                marginTop: 2,
                                            }}
                                        >
                                            👥 {trip.members.length} membre(s)
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: "#666",
                                                marginTop: 2,
                                            }}
                                        >
                                            📅{" "}
                                            {formatDateRange(
                                                trip.startDate,
                                                trip.endDate
                                            )}
                                        </Text>
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: "#4DA1A9",
                                                padding: 8,
                                                borderRadius: 8,
                                                marginTop: 8,
                                                alignItems: "center",
                                            }}
                                            onPress={() =>
                                                navigation.navigate(
                                                    "TripDetails",
                                                    {
                                                        tripId: trip.id,
                                                    }
                                                )
                                            }
                                        >
                                            <Text
                                                style={{
                                                    color: "white",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                Voir les détails
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: Spacing.medium,
        paddingVertical: Spacing.large,
        backgroundColor: Colors.backgroundColors.primary,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    greeting: {
        fontSize: 22,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#4DA1A9",
    },
    userName: {
        fontSize: 22,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#7ED957",
    },
    profileButton: {
        padding: Spacing.small,
    },
    profileAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F0F8F0",
        justifyContent: "center",
        alignItems: "center",
    },
    profileAvatarText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },
    quickActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.medium,
        paddingVertical: Spacing.medium,
    },
    quickAction: {
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.small,
        borderRadius: 12,
        backgroundColor: "#F0F2F5",
    },
    quickActionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: Spacing.small,
    },
    quickActionText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },
    tripsSection: {
        paddingTop: Spacing.large,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: Spacing.medium,
        paddingBottom: Spacing.medium,
    },
    sectionTitle: {
        fontSize: 22,
        fontFamily: TextStyles.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    seeAllText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },
    tripsContainer: {
        flex: 1,
    },
    tripsGrid: {
        paddingHorizontal: Spacing.medium,
        gap: Spacing.medium,
    },
    tripCard: {
        backgroundColor: Colors.backgroundColors.primary,
        marginBottom: Spacing.medium,
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    tripImageContainer: {
        width: "100%",
        height: 180,
        position: "relative",
    },
    tripImage: {
        width: "100%",
        height: "100%",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    tripOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        justifyContent: "space-between",
        padding: Spacing.medium,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: Spacing.small,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: "#7ED957",
    },
    statusText: {
        fontSize: 12,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: Colors.backgroundColors.primary,
    },
    creatorBadge: {
        position: "absolute",
        top: Spacing.small,
        right: Spacing.small,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(255, 217, 61, 0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    tripInfo: {
        padding: Spacing.medium,
    },
    tripTitle: {
        fontSize: 18,
        fontFamily: TextStyles.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: Spacing.small,
    },
    tripDetails: {
        marginBottom: Spacing.small,
    },
    tripLocation: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    tripLocationText: {
        fontSize: 14,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "#666",
        marginLeft: 4,
    },
    tripDate: {
        fontSize: 14,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "#666",
    },
    tripMembers: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    membersAvatars: {
        flexDirection: "row",
    },
    memberAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#F0F8F0",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    memberAvatarText: {
        fontSize: 12,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },
    moreMembers: {
        backgroundColor: "#E5E7EB",
    },
    membersCount: {
        fontSize: 12,
        fontFamily: TextStyles.body.family,
        fontWeight: "500",
        color: "#666",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: Spacing.medium,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.medium,
    },
    emptyTitle: {
        fontSize: 22,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: Colors.text.primary,
        marginBottom: Spacing.small,
    },
    emptySubtitle: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: Colors.text.primary,
        textAlign: "center",
    },
    emptyActions: {
        flexDirection: "row",
        gap: Spacing.small,
        marginTop: Spacing.medium,
    },
    primaryButton: {
        padding: Spacing.medium,
        borderRadius: 12,
        backgroundColor: "#4DA1A9",
    },
    primaryButtonText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: Colors.backgroundColors.primary,
    },
    secondaryButton: {
        padding: Spacing.medium,
        borderRadius: 12,
        backgroundColor: "#F0F2F5",
    },
    secondaryButtonText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    loadingState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
        marginTop: Spacing.small,
    },
    errorState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorTitle: {
        fontSize: 22,
        fontFamily: TextStyles.heading.family,
        fontWeight: "700",
        color: "#FF6B6B",
        marginBottom: Spacing.small,
    },
    errorSubtitle: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#FF6B6B",
        textAlign: "center",
    },
    retryButton: {
        padding: Spacing.medium,
        borderRadius: 12,
        backgroundColor: "#4DA1A9",
    },
    retryButtonText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: Colors.backgroundColors.primary,
    },
});

export default HomeScreen;
