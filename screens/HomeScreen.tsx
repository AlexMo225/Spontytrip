import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors, Fonts, Spacing } from "../constants";
import { RootStackParamList } from "../types";

type HomeScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "MainTab"
>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();

    const recentTrips = [
        {
            id: 1,
            title: "Voyage à Paris",
            destination: "Paris",
            dates: "12 - 15 Oct",
            image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300&h=200&fit=crop",
        },
        {
            id: 2,
            title: "Week-end à Barcelone",
            destination: "Barcelone",
            dates: "20 - 23 Sep",
            image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300&h=200&fit=crop",
        },
    ];

    const popularDestinations = [
        {
            id: 1,
            name: "Rome",
            image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&h=300&fit=crop",
        },
        {
            id: 2,
            name: "Londres",
            image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300&h=300&fit=crop",
        },
        {
            id: 3,
            name: "New York",
            image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&h=300&fit=crop",
        },
        {
            id: 4,
            name: "Tokyo",
            image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=300&fit=crop",
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>SpontyTrip</Text>
                    <TouchableOpacity style={styles.profileButton}>
                        <Ionicons
                            name="person-circle-outline"
                            size={24}
                            color={Colors.text.primary}
                        />
                    </TouchableOpacity>
                </View>

                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Bienvenue Alex 👋</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.createTripButton]}
                        onPress={() => navigation.navigate("CreateTrip")}
                    >
                        <Text style={styles.createTripButtonText}>
                            Créer un voyage
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.joinTripButton]}
                        onPress={() => {
                            // Pour l'instant, on peut naviguer vers MyTrips ou implémenter une logique de scan QR
                            console.log(
                                "Fonctionnalité 'Rejoindre un voyage' à implémenter"
                            );
                        }}
                    >
                        <Text style={styles.joinTripButtonText}>
                            Rejoindre un voyage
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Trips Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Voyages récents</Text>
                    {recentTrips.map((trip) => (
                        <TouchableOpacity key={trip.id} style={styles.tripCard}>
                            <View style={styles.tripInfo}>
                                <Text style={styles.tripTitle}>
                                    {trip.title}
                                </Text>
                                <Text style={styles.tripDestination}>
                                    {trip.destination}
                                </Text>
                                <Text style={styles.tripDates}>
                                    {trip.dates}
                                </Text>
                            </View>
                            <View style={styles.tripImageContainer}>
                                <Image
                                    source={{ uri: trip.image }}
                                    style={styles.tripImage}
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Popular Destinations Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>
                        Destinations populaires
                    </Text>
                    <View style={styles.destinationsGrid}>
                        <View style={styles.destinationsRow}>
                            {popularDestinations
                                .slice(0, 2)
                                .map((destination) => (
                                    <TouchableOpacity
                                        key={destination.id}
                                        style={styles.destinationCard}
                                    >
                                        <Image
                                            source={{ uri: destination.image }}
                                            style={styles.destinationImage}
                                        />
                                        <View style={styles.destinationOverlay}>
                                            <Text
                                                style={styles.destinationName}
                                            >
                                                {destination.name}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                        </View>
                        <View style={styles.destinationsRow}>
                            {popularDestinations
                                .slice(2, 4)
                                .map((destination) => (
                                    <TouchableOpacity
                                        key={destination.id}
                                        style={styles.destinationCard}
                                    >
                                        <Image
                                            source={{ uri: destination.image }}
                                            style={styles.destinationImage}
                                        />
                                        <View style={styles.destinationOverlay}>
                                            <Text
                                                style={styles.destinationName}
                                            >
                                                {destination.name}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                        </View>
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: Spacing.medium,
        paddingVertical: Spacing.large,
        backgroundColor: Colors.backgroundColors.primary,
    },
    logo: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: Fonts.heading.weight,
        color: Colors.text.primary,
        marginLeft: Spacing.large + Spacing.small,
    },
    profileButton: {
        padding: Spacing.small,
    },
    welcomeSection: {
        paddingHorizontal: Spacing.medium,
        paddingVertical: Spacing.medium,
    },
    welcomeText: {
        fontSize: 28,
        fontFamily: Fonts.heading.family,
        fontWeight: Fonts.heading.weight,
        color: Colors.text.primary,
    },
    actionButtonsContainer: {
        paddingHorizontal: Spacing.medium,
        gap: Spacing.small,
    },
    actionButton: {
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.small,
    },
    createTripButton: {
        backgroundColor: "#4DA1A9",
    },
    createTripButtonText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.backgroundColors.primary,
    },
    joinTripButton: {
        backgroundColor: "#F0F2F5",
    },
    joinTripButtonText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    sectionContainer: {
        paddingTop: Spacing.large,
    },
    sectionTitle: {
        fontSize: 22,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        paddingHorizontal: Spacing.medium,
        marginBottom: Spacing.medium,
    },
    tripCard: {
        flexDirection: "row",
        backgroundColor: Colors.backgroundColors.primary,
        marginHorizontal: Spacing.medium,
        marginBottom: Spacing.medium,
        borderRadius: 12,
        overflow: "hidden",
    },
    tripInfo: {
        flex: 1,
        padding: Spacing.medium,
        justifyContent: "space-between",
    },
    tripTitle: {
        fontSize: 16,
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
        fontSize: 16,
        fontFamily: Fonts.body.family,
        color: "#637887",
    },
    tripImageContainer: {
        width: 130,
        height: 70,
    },
    tripImage: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
    },
    destinationsGrid: {
        paddingHorizontal: Spacing.medium,
    },
    destinationsRow: {
        flexDirection: "row",
        gap: Spacing.small,
        marginBottom: Spacing.small,
    },
    destinationCard: {
        flex: 1,
        height: 173,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
    },
    destinationImage: {
        width: "100%",
        height: "100%",
    },
    destinationOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        justifyContent: "flex-end",
        paddingHorizontal: Spacing.medium,
        paddingBottom: Spacing.medium,
    },
    destinationName: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.backgroundColors.primary,
    },
    bottomSpacing: {
        height: 20,
    },
});

export default HomeScreen;
