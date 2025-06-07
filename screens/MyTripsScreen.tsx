import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import {
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
import { MainTabParamList } from "../types";

type MyTripsScreenNavigationProp = BottomTabNavigationProp<
    MainTabParamList,
    "MyTrips"
>;

interface Props {
    navigation: MyTripsScreenNavigationProp;
}

// Mock data pour les voyages
const mockTrips = [
    {
        id: "1",
        title: "Week-end à Barcelone",
        destination: "Barcelone",
        dates: "20 - 23 Sep",
        status: "ongoing",
        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        members: 4,
    },
    {
        id: "2",
        title: "Escapade à Prague",
        destination: "Prague",
        dates: "15 - 18 Juil",
        status: "ongoing",
        image: "https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        members: 2,
    },
    {
        id: "3",
        title: "Voyage à Paris",
        destination: "Paris",
        dates: "12 - 15 Oct",
        status: "completed",
        image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        members: 3,
    },
    {
        id: "4",
        title: "Week-end à Rome",
        destination: "Rome",
        dates: "8 - 11 Sep",
        status: "completed",
        image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        members: 5,
    },
];

const MyTripsScreen: React.FC<Props> = ({ navigation }) => {
    const [selectedTab, setSelectedTab] = useState<"ongoing" | "completed">(
        "ongoing"
    );

    const filteredTrips = mockTrips.filter(
        (trip) => trip.status === selectedTab
    );

    const renderTripCard = (trip: any) => (
        <TouchableOpacity key={trip.id} style={styles.tripCard}>
            <View style={styles.tripInfo}>
                <Text style={styles.tripTitle}>{trip.title}</Text>
                <Text style={styles.tripDestination}>{trip.destination}</Text>
                <Text style={styles.tripDates}>{trip.dates}</Text>
                <View style={styles.tripMetaContainer}>
                    <View style={styles.membersContainer}>
                        <Ionicons
                            name="people-outline"
                            size={14}
                            color="#637887"
                        />
                        <Text style={styles.membersText}>
                            {trip.members} membres
                        </Text>
                    </View>
                    {trip.status === "ongoing" && (
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>En cours</Text>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.tripImageContainer}>
                <Image source={{ uri: trip.image }} style={styles.tripImage} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mes voyages</Text>
                <TouchableOpacity style={styles.addButton}>
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
                            <TouchableOpacity style={styles.createButton}>
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
