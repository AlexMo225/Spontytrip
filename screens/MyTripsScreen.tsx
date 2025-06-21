import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { useAuth } from "../contexts/AuthContext";
import { useUserTrips } from "../hooks/useTripSync";
import { FirestoreTrip } from "../services/firebaseService";
import { MainTabParamList } from "../types";

type MyTripsScreenNavigationProp = BottomTabNavigationProp<
    MainTabParamList,
    "MyTrips"
>;

interface Props {
    navigation: MyTripsScreenNavigationProp;
}

const MyTripsScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const { trips, loading, error, refreshTrips } = useUserTrips();
    const [selectedTab, setSelectedTab] = useState<"ongoing" | "completed">(
        "ongoing"
    );

    // Fonction pour déterminer le statut d'un voyage
    const getTripStatus = (trip: FirestoreTrip): "ongoing" | "completed" => {
        const today = new Date();
        const endDate = new Date(trip.endDate);
        return endDate >= today ? "ongoing" : "completed";
    };

    // Fonction pour formater les dates
    const formatDateRange = (startDate: Date, endDate: Date): string => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const startDay = start.getDate();
        const endDay = end.getDate();
        const month = start.toLocaleDateString("fr-FR", { month: "short" });

        return `${startDay} - ${endDay} ${month}`;
    };

    const filteredTrips = trips.filter(
        (trip) => getTripStatus(trip) === selectedTab
    );

    const renderTripCard = (trip: FirestoreTrip) => {
        const status = getTripStatus(trip);
        const dates = formatDateRange(trip.startDate, trip.endDate);

        return (
            <TouchableOpacity
                key={trip.id}
                style={styles.tripCard}
                onPress={() =>
                    navigation.navigate("TripDetails" as any, {
                        tripId: trip.id,
                    })
                }
            >
                <View style={styles.tripInfo}>
                    <Text style={styles.tripTitle}>{trip.title}</Text>
                    <Text style={styles.tripDestination}>
                        {trip.destination}
                    </Text>
                    <Text style={styles.tripDates}>{dates}</Text>
                    <View style={styles.tripMetaContainer}>
                        <View style={styles.membersContainer}>
                            <Ionicons
                                name="people-outline"
                                size={14}
                                color="#637887"
                            />
                            <Text style={styles.membersText}>
                                {trip.members.length} membre
                                {trip.members.length > 1 ? "s" : ""}
                            </Text>
                        </View>
                        {status === "ongoing" && (
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>En cours</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.tripImageContainer}>
                    {trip.coverImage ? (
                        <Image
                            source={{ uri: trip.coverImage }}
                            style={styles.tripImage}
                        />
                    ) : (
                        <View style={[styles.tripImage, styles.defaultImage]}>
                            <Ionicons
                                name="image-outline"
                                size={32}
                                color="#999"
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mes voyages</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate("CreateTrip" as any)}
                >
                    <Ionicons name="add" size={24} color="#4DA1A9" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        selectedTab === "ongoing" && styles.activeTab,
                    ]}
                    onPress={() => setSelectedTab("ongoing")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            selectedTab === "ongoing" && styles.activeTabText,
                        ]}
                    >
                        En cours
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        selectedTab === "completed" && styles.activeTab,
                    ]}
                    onPress={() => setSelectedTab("completed")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            selectedTab === "completed" && styles.activeTabText,
                        ]}
                    >
                        Terminés
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Trips List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4DA1A9" />
                    <Text style={styles.loadingText}>
                        Chargement de vos voyages...
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={64}
                        color="#FF6B6B"
                    />
                    <Text style={styles.errorTitle}>Erreur de chargement</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={refreshTrips}
                    >
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.tripsContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredTrips.length > 0 ? (
                        filteredTrips.map(renderTripCard)
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="airplane-outline"
                                size={64}
                                color="#E2E8F0"
                            />
                            <Text style={styles.emptyTitle}>
                                {selectedTab === "ongoing"
                                    ? "Aucun voyage en cours"
                                    : "Aucun voyage terminé"}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {selectedTab === "ongoing"
                                    ? "Créez votre premier voyage pour commencer l'aventure !"
                                    : "Vos voyages passés apparaîtront ici"}
                            </Text>
                            {selectedTab === "ongoing" && (
                                <TouchableOpacity
                                    style={styles.createButton}
                                    onPress={() =>
                                        navigation.navigate("CreateTrip" as any)
                                    }
                                >
                                    <Text style={styles.createButtonText}>
                                        Créer un voyage
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Bottom spacing */}
                    <View style={styles.bottomSpacing} />
                </ScrollView>
            )}
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
        paddingTop: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: Colors.text.primary,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0F8F0",
        justifyContent: "center",
        alignItems: "center",
    },
    tabsContainer: {
        flexDirection: "row",
        marginHorizontal: Spacing.medium,
        marginBottom: 24,
        backgroundColor: "#F0F2F5",
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    activeTab: {
        backgroundColor: Colors.backgroundColors.primary,
    },
    tabText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: "#637887",
    },
    activeTabText: {
        color: Colors.text.primary,
        fontWeight: "600",
    },
    tripsContainer: {
        flex: 1,
    },
    tripCard: {
        flexDirection: "row",
        backgroundColor: Colors.backgroundColors.primary,
        marginHorizontal: Spacing.medium,
        marginBottom: Spacing.medium,
        borderRadius: 12,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tripInfo: {
        flex: 1,
        padding: Spacing.medium,
        justifyContent: "space-between",
    },
    tripTitle: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: "#637887",
        marginBottom: 4,
    },
    tripDestination: {
        fontSize: 18,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 4,
    },
    tripDates: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginBottom: 12,
    },
    tripMetaContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    membersContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    membersText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginLeft: 4,
    },
    statusBadge: {
        backgroundColor: "#E8F5E8",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: "#4DA1A9",
    },
    tripImageContainer: {
        width: 120,
        height: 100,
        margin: 12,
    },
    tripImage: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
    },
    defaultImage: {
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
        paddingHorizontal: 32,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FF6B6B",
        marginTop: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: "#4DA1A9",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    emptySubtitle: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        color: "#637887",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },
    createButton: {
        backgroundColor: "#4DA1A9",
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    createButtonText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.backgroundColors.primary,
    },
    bottomSpacing: {
        height: 32,
    },
});

export default MyTripsScreen;
