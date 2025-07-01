import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    ActivityCard,
    ActivityDetailModal,
    ActivityFilters,
    ActivityTimeline,
} from "../components/activities";
import { useActivities } from "../hooks/useActivities";
import { useActivitiesScreenStyle } from "../hooks/useActivitiesScreenStyle";
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
    const styles = useActivitiesScreenStyle();

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

export default ActivitiesScreen;
