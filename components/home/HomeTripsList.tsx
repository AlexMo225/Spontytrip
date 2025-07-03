import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { TextStyles } from "../../constants/Fonts";
import { FirestoreTrip } from "../../services/firebaseService";
import { HomeEmptyState } from "./HomeEmptyState";
import { HomeTripCard } from "./HomeTripCard";

interface HomeTripsListProps {
    trips: FirestoreTrip[];
    loading: boolean;
    error: string | null;
    refreshTrips: () => Promise<void>;
    formatDateRange: (startDate: Date | any, endDate: Date | any) => string;
    getTripStatus: (trip: FirestoreTrip) => {
        text: string;
        color: string;
        emoji: string;
    };
    getTypeEmoji: (type: string) => string;
    currentUserId?: string;
    fadeAnim: any;
    scaleAnim: any;
    onTripPress: (trip: FirestoreTrip) => void;
    onCreateTrip: () => void;
    onJoinTrip: () => void;
    onSeeAllTrips: () => void;
}

export const HomeTripsList: React.FC<HomeTripsListProps> = ({
    trips,
    loading,
    error,
    refreshTrips,
    formatDateRange,
    getTripStatus,
    getTypeEmoji,
    currentUserId,
    fadeAnim,
    scaleAnim,
    onTripPress,
    onCreateTrip,
    onJoinTrip,
    onSeeAllTrips,
}) => {
    const renderTripCard = ({ item: trip }: { item: FirestoreTrip }) => (
        <HomeTripCard
            trip={trip}
            formatDateRange={formatDateRange}
            getTripStatus={getTripStatus}
            getTypeEmoji={getTypeEmoji}
            currentUserId={currentUserId}
            onPress={() => onTripPress(trip)}
        />
    );

    return (
        <View style={styles.modernTripsSection}>
            <View style={styles.modernSectionHeader}>
                <Text style={styles.modernSectionTitle}>Mes voyages</Text>
                {trips.length > 3 && (
                    <TouchableOpacity
                        onPress={onSeeAllTrips}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.modernSeeAllText}>Voir tout</Text>
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
                    <Text style={styles.modernErrorSubtitle}>{error}</Text>
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

            {!loading && !error && trips.length === 0 && (
                <HomeEmptyState
                    fadeAnim={fadeAnim}
                    scaleAnim={scaleAnim}
                    onCreateTrip={onCreateTrip}
                    onJoinTrip={onJoinTrip}
                />
            )}

            {!loading && !error && trips.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.modernTripsHorizontalList}
                    contentContainerStyle={styles.horizontalScrollContent}
                    decelerationRate="fast"
                    snapToInterval={300} // Largeur approximative d'une carte + espacement (75% screen width + 16px)
                    snapToAlignment="start"
                >
                    {trips.slice(0, 5).map((trip, index) => (
                        <View
                            key={trip.id}
                            style={[
                                styles.tripCardContainer,
                                { marginLeft: index === 0 ? 20 : 0 },
                            ]}
                        >
                            <HomeTripCard
                                trip={trip}
                                formatDateRange={formatDateRange}
                                getTripStatus={getTripStatus}
                                getTypeEmoji={getTypeEmoji}
                                currentUserId={currentUserId}
                                onPress={() => onTripPress(trip)}
                            />
                        </View>
                    ))}
                    {/* Espacement à la fin pour le scroll */}
                    <View style={styles.endSpacing} />
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // 🗂️ SECTION DES VOYAGES
    modernTripsSection: {
        marginBottom: 32,
    },
    modernSectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 20,
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
        flexGrow: 0,
    },
    horizontalScrollContent: {
        paddingRight: 20,
    },
    tripCardContainer: {
        marginRight: 16,
    },
    endSpacing: {
        width: 4,
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
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    modernRetryButton: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    modernRetryButtonText: {
        fontSize: 16,
        fontFamily: TextStyles.body.family,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
