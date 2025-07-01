import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityCard } from "../components/activities/ActivityCard";
import { ActivityDetailModal } from "../components/activities/ActivityDetailModal";
import { ActivityFilters } from "../components/activities/ActivityFilters";
import { ActivityTimeline } from "../components/activities/ActivityTimeline";
import { Colors } from "../constants/Colors";
import { useActivities } from "../hooks/useActivities";
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

/**
 * 🎯 Écran des activités refactorisé - Version modulaire
 */
const ActivitiesScreen: React.FC<Props> = ({ navigation, route }) => {
    const { tripId } = route.params;

    // 🎪 Hook central qui gère toute la logique métier
    const {
        // États
        localActivities,
        viewMode,
        setViewMode,
        selectedActivity,
        showDetailModal,
        filterType,
        setFilterType,
        realtimeNotification,
        animatedValues,
        voteAnimations,

        // Données calculées
        groupedActivities,
        topActivity,

        // Handlers
        handleActivityPress,
        handleVote,
        handleValidate,
        handleEditActivity,
        handleDeleteActivity,
        handleCloseDetailModal,
        getStatusColor,

        // Données du voyage
        trip,
        loading,
        error,
        user,
    } = useActivities(tripId);

    // 🚫 Redirection automatique si le voyage est supprimé
    React.useEffect(() => {
        if (
            (error === "Voyage introuvable" ||
                error === "Accès non autorisé à ce voyage" ||
                error === "Voyage supprimé") &&
            !loading
        ) {
            console.log(
                "🚨 ActivitiesScreen - Redirection automatique - voyage supprimé"
            );
            const timer = setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "MainApp" }],
                });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [error, navigation, loading]);

    // Handler pour l'édition d'activité
    const handleEdit = (activity: TripActivity) => {
        navigation.navigate("AddActivity", {
            tripId,
            editActivity: activity,
        });
    };

    // Handler pour la suppression d'activité
    const handleDelete = async (activityId: string) => {
        await handleDeleteActivity(activityId);
    };

    // 🔄 États de chargement et d'erreur
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4DA1A9" />
                    <Text style={styles.loadingText}>
                        Chargement du planning...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Erreur de chargement</Text>
                    <Text style={styles.errorDescription}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    // 📱 Rendu principal de l'écran
    return (
        <SafeAreaView style={styles.container}>
            {/* Header avec titre */}
            <View style={styles.header}>
                <Text style={styles.title}>Planning du voyage</Text>
            </View>

            {/* 🔔 Notification temps réel */}
            {realtimeNotification && (
                <View style={styles.notificationContainer}>
                    <Text style={styles.notificationText}>
                        {realtimeNotification}
                    </Text>
                </View>
            )}

            {/* 🎛️ Composant de filtres, stats et contrôles */}
            <ActivityFilters
                localActivities={localActivities}
                filterType={filterType}
                setFilterType={setFilterType}
                viewMode={viewMode}
                setViewMode={setViewMode}
                user={user}
            />

            {/* 📋 Contenu principal */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {groupedActivities.length === 0 ? (
                    // 🚫 État vide
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="calendar-outline"
                            size={64}
                            color="#CBD5E1"
                        />
                        <Text style={styles.emptyTitle}>
                            Aucune activité planifiée
                        </Text>
                        <Text style={styles.emptyDescription}>
                            Commencez à organiser votre voyage en ajoutant des
                            activités !
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() =>
                                navigation.navigate("AddActivity", { tripId })
                            }
                        >
                            <Text style={styles.emptyButtonText}>
                                Ajouter une activité
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* 📅 Mode Timeline */}
                        {viewMode === "timeline" ? (
                            <ActivityTimeline
                                groupedActivities={groupedActivities}
                                trip={trip}
                                user={user}
                                topActivity={topActivity}
                                animatedValues={animatedValues}
                                voteAnimations={voteAnimations}
                                onActivityPress={handleActivityPress}
                                onVote={handleVote}
                                onValidate={handleValidate}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                getStatusColor={getStatusColor}
                            />
                        ) : (
                            // 📋 Mode Liste
                            <View style={styles.listView}>
                                {localActivities.map((activity) => (
                                    <ActivityCard
                                        key={activity.id}
                                        activity={activity}
                                        trip={trip}
                                        user={user}
                                        topActivity={topActivity}
                                        animatedValues={animatedValues}
                                        voteAnimations={voteAnimations}
                                        onPress={handleActivityPress}
                                        onVote={handleVote}
                                        onValidate={handleValidate}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        getStatusColor={getStatusColor}
                                    />
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* ➕ Bouton d'ajout flottant */}
            <TouchableOpacity
                style={styles.floatingAddButton}
                onPress={() => navigation.navigate("AddActivity", { tripId })}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* 📋 Modal de détail d'activité */}
            <ActivityDetailModal
                visible={showDetailModal}
                activity={selectedActivity}
                onClose={handleCloseDetailModal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onVote={handleVote}
                user={user}
                trip={trip}
                getStatusColor={getStatusColor}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.text.primary,
        textAlign: "center",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.text.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    errorText: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.error,
        marginBottom: 8,
        textAlign: "center",
    },
    errorDescription: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: "center",
    },
    notificationContainer: {
        backgroundColor: "#4DA1A9",
        marginHorizontal: 16,
        marginTop: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: "#4DA1A9",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    notificationText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    content: {
        flex: 1,
    },
    listView: {
        paddingBottom: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    emptyDescription: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    emptyButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    floatingAddButton: {
        position: "absolute",
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    modalHeader: {
        padding: 16,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalCloseButton: {
        position: "absolute",
        top: 16,
        right: 16,
    },
    modalHeaderTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text.primary,
        textAlign: "center",
    },
    modalHeaderSpacer: {
        flex: 1,
    },
    modalContent: {
        flex: 1,
    },
    modalTitleSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text.primary,
        marginRight: 16,
    },
    modalStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: Colors.backgroundColors.secondary,
    },
    modalStatusText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    modalSection: {
        marginBottom: 16,
    },
    modalSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
        marginRight: 8,
    },
    modalText: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    modalLinkText: {
        fontSize: 14,
        color: "#4DA1A9",
        textDecorationLine: "underline",
    },
    modalTimeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    modalTimeText: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginRight: 8,
    },
    modalVoteButton: {
        padding: 8,
        borderWidth: 2,
        borderColor: Colors.border,
        borderRadius: 12,
    },
    modalVoteButtonActive: {
        borderColor: Colors.primary,
    },
    modalVoteButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    modalVoteButtonTextActive: {
        color: Colors.primary,
    },
    modalActionsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 16,
    },
    modalActionButton: {
        padding: 12,
        borderWidth: 2,
        borderColor: Colors.border,
        borderRadius: 12,
    },
    modalEditButton: {
        borderColor: Colors.primary,
    },
    modalDeleteButton: {
        borderColor: Colors.error,
    },
    modalActionButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text.primary,
    },
});

export default ActivitiesScreen;
