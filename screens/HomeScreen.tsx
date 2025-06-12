import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Avatar from "../components/Avatar";
import { Colors, Fonts, Spacing } from "../constants/";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "../types";

type HomeScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "MainApp"
>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { user } = useAuth();

    // Debug : Afficher les données utilisateur
    console.log("🏠 Données utilisateur dans HomeScreen:", {
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName,
        firstName: user?.displayName?.split(" ")[0],
        photoURL: user?.photoURL,
    });

    // Détecter les changements de données utilisateur
    useEffect(() => {
        console.log("🔄 HomeScreen - Données utilisateur mises à jour:", {
            displayName: user?.displayName,
            email: user?.email,
            photoURL: user?.photoURL,
        });
    }, [user?.displayName, user?.email, user?.photoURL]);

    // Fonction pour extraire le prénom du displayName
    const getFirstName = (displayName: string | null): string => {
        if (!displayName) return "Utilisateur";
        return displayName.split(" ")[0]; // Prend le premier mot (prénom)
    };

    const recentTrips = [
        {
            id: 1,
            title: "Voyage à Paris",
            destination: "Paris",
            dates: "12 - 15 Oct",
            image: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=300&h=200&fit=crop&auto=format&q=80",
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
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIconContainer}>
                            <Ionicons
                                name="location"
                                size={20}
                                color="#7ED957"
                            />
                        </View>
                        <View style={styles.logoTextContainer}>
                            <Text style={styles.logoSponty}>Sponty</Text>
                            <Text style={styles.logoTrip}>Trip</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.profileButton}>
                        <Avatar
                            imageUrl={user?.photoURL}
                            size={32}
                            showBorder={true}
                        />
                    </TouchableOpacity>
                </View>

                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>
                        Bienvenue {getFirstName(user?.displayName)} 👋
                    </Text>
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
                            navigation.navigate("JoinTrip");
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
    logoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: Spacing.medium,
    },
    logoIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F0F8F0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    logoTextContainer: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    logoSponty: {
        fontSize: 22,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: "#4DA1A9",
    },
    logoTrip: {
        fontSize: 22,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: "#7ED957",
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
        borderRadius: 12,
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
