import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { useUserTrips } from "../hooks/useTripSync";
import { FirestoreTrip } from "../services/firebaseService";
import { useMyTripsStyles } from "../styles/screens";
import { MainTabParamList } from "../types";

type MyTripsScreenNavigationProp = BottomTabNavigationProp<
    MainTabParamList,
    "MyTrips"
>;

interface Props {
    navigation: MyTripsScreenNavigationProp;
}

const MyTripsScreen: React.FC<Props> = ({ navigation }) => {
    const styles = useMyTripsStyles();
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
                                color={Colors.textSecondary}
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
                                color={Colors.textSecondary}
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="map-outline"
                size={64}
                color={Colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>
                {selectedTab === "ongoing"
                    ? "Aucun voyage en cours"
                    : "Aucun voyage terminé"}
            </Text>
            <Text style={styles.emptyText}>
                {selectedTab === "ongoing"
                    ? "Commencez à planifier votre prochain voyage !"
                    : "Vos voyages terminés apparaîtront ici."}
            </Text>
            {selectedTab === "ongoing" && (
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate("CreateTrip" as any)}
                >
                    <Ionicons name="add" size={24} color={Colors.white} />
                    <Text style={styles.createButtonText}>
                        Créer un nouveau voyage
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mes voyages</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate("CreateTrip" as any)}
                >
                    <Ionicons name="add" size={24} color={Colors.secondary} />
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
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>
                        Chargement de vos voyages...
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={64}
                        color={Colors.error}
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
                    {filteredTrips.length > 0
                        ? filteredTrips.map(renderTripCard)
                        : renderEmptyState()}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default MyTripsScreen;
