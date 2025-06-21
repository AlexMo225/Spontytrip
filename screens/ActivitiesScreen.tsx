import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { useAuth } from "../contexts/AuthContext";
import { useTripSync } from "../hooks/useTripSync";
import { TripActivity } from "../services/firebaseService";
import { RootStackParamList } from "../types";

type ActivitiesScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Activities"
>;
type ActivitiesScreenRouteProp = RouteProp<RootStackParamList, "Activities">;

interface Props {
    navigation: ActivitiesScreenNavigationProp;
    route: ActivitiesScreenRouteProp;
}

const ActivitiesScreen: React.FC<Props> = ({ navigation, route }) => {
    const { user } = useAuth();
    const { tripId } = route.params;
    const { trip, activities, loading, error } = useTripSync(tripId);

    const [localActivities, setLocalActivities] = useState<TripActivity[]>([]);

    // Synchroniser les activités locales avec Firebase
    React.useEffect(() => {
        if (activities?.activities) {
            setLocalActivities(activities.activities);
        }
    }, [activities]);

    const handleDeleteActivity = async (activityId: string) => {
        try {
            // Optimistic update
            setLocalActivities((prev) =>
                prev.filter((a) => a.id !== activityId)
            );

            // Supprimer dans Firebase
            const firebaseService = (
                await import("../services/firebaseService")
            ).default;
            const updatedActivities = localActivities.filter(
                (a) => a.id !== activityId
            );
            await firebaseService.updateActivities(
                tripId,
                updatedActivities,
                user?.uid || ""
            );
        } catch (error) {
            console.error("Erreur suppression activité:", error);
            // Rollback en cas d'erreur
            if (activities?.activities) {
                setLocalActivities(activities.activities);
            }
        }
    };

    const renderActivity = ({ item }: { item: TripActivity }) => (
        <View style={styles.activityCard}>
            <View style={styles.activityContent}>
                <Text style={styles.suggestedBy}>
                    Suggéré par {item.createdByName}
                </Text>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDescription}>
                    {item.description || "Aucune description"}
                </Text>

                {item.location && (
                    <View style={styles.locationContainer}>
                        <Ionicons
                            name="location-outline"
                            size={16}
                            color="#637887"
                        />
                        <Text style={styles.locationText}>{item.location}</Text>
                    </View>
                )}

                <View style={styles.activityFooter}>
                    <View style={styles.dateContainer}>
                        <Ionicons
                            name="calendar-outline"
                            size={16}
                            color="#637887"
                        />
                        <Text style={styles.dateText}>
                            {item.date.toLocaleDateString("fr-FR")}
                        </Text>
                        {item.startTime && (
                            <Text style={styles.timeText}>
                                à {item.startTime}
                            </Text>
                        )}
                    </View>

                    {(trip?.creatorId === user?.uid ||
                        item.createdBy === user?.uid) && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteActivity(item.id)}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={16}
                                color="#FF6B6B"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.activityImageContainer}>
                <View style={styles.activityImagePlaceholder}>
                    <Ionicons name="image-outline" size={24} color="#E5E5E5" />
                </View>
            </View>
        </View>
    );

    const handleAddActivity = () => {
        navigation.navigate("AddActivity", { tripId });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7ED957" />
                    <Text style={styles.loadingText}>
                        Chargement des activités...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !trip) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={64}
                        color="#FF6B6B"
                    />
                    <Text style={styles.errorTitle}>Erreur</Text>
                    <Text style={styles.errorText}>
                        {error || "Impossible de charger les activités"}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.retryButtonText}>Retour</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={Colors.text.primary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Activités</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Activities List */}
            {localActivities.length > 0 ? (
                <FlatList
                    data={localActivities}
                    renderItem={renderActivity}
                    keyExtractor={(item) => item.id}
                    style={styles.activitiesList}
                    contentContainerStyle={styles.activitiesContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons
                        name="calendar-outline"
                        size={64}
                        color="#E5E5E5"
                    />
                    <Text style={styles.emptyTitle}>Aucune activité</Text>
                    <Text style={styles.emptyText}>
                        Commencez par ajouter des activités à votre voyage
                    </Text>
                </View>
            )}

            {/* Add Activity Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddActivity}
            >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Ajouter activité</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#637887",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FF6B6B",
        marginTop: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: "#637887",
        textAlign: "center",
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: Colors.backgroundColors.primary,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        flex: 1,
        textAlign: "center",
        marginRight: 40,
    },
    headerSpacer: {
        width: 40,
    },
    activitiesList: {
        flex: 1,
    },
    activitiesContainer: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    activityCard: {
        flexDirection: "row",
        backgroundColor: Colors.backgroundColors.primary,
        borderRadius: 12,
        marginBottom: 20,
        padding: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    activityContent: {
        flex: 1,
        marginRight: 16,
    },
    suggestedBy: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginBottom: 4,
    },
    activityTitle: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 8,
    },
    activityDescription: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        color: "#637887",
        lineHeight: 22,
        marginBottom: 12,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    locationText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginLeft: 4,
    },
    activityFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginLeft: 4,
    },
    timeText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginLeft: 8,
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#FFE5E5",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#637887",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: "#637887",
        textAlign: "center",
    },
    activityImageContainer: {
        width: 120,
        height: 80,
    },
    activityImagePlaceholder: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
        backgroundColor: "#F8F9FA",
        justifyContent: "center",
        alignItems: "center",
    },
    addButton: {
        position: "absolute",
        bottom: 30,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4DA1A9",
        borderRadius: 25,
        paddingVertical: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    addButtonText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#FFFFFF",
        marginLeft: 8,
    },
});

export default ActivitiesScreen;
