import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { useAuth } from "../contexts/AuthContext";
import { useTripSync } from "../hooks/useTripSync";
import firebaseService, { TripActivity } from "../services/firebaseService";
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

interface DayGroup {
    date: string;
    dateObj: Date;
    activities: TripActivity[];
    isToday: boolean;
    isPast: boolean;
}

type ViewMode = "timeline" | "list";

const ActivitiesScreen: React.FC<Props> = ({ navigation, route }) => {
    const { user } = useAuth();
    const { tripId } = route.params;
    const { trip, activities, loading, error } = useTripSync(tripId);

    const [localActivities, setLocalActivities] = useState<TripActivity[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>("timeline");
    const [selectedActivity, setSelectedActivity] =
        useState<TripActivity | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const animatedValues = useRef<{ [key: string]: Animated.Value }>({});

    // Synchroniser les activités locales avec Firebase
    React.useEffect(() => {
        if (activities?.activities) {
            const activitiesWithStatus = activities.activities.map(
                (activity) => ({
                    ...activity,
                    status: firebaseService.calculateActivityStatus(activity),
                    votes: activity.votes || [], // S'assurer que votes existe
                })
            );
            setLocalActivities(activitiesWithStatus);
        }
    }, [activities]);

    // Créer des valeurs d'animation pour les nouvelles activités
    const createAnimationForActivity = (activityId: string) => {
        if (!animatedValues.current[activityId]) {
            animatedValues.current[activityId] = new Animated.Value(0);

            // Animation d'apparition
            Animated.spring(animatedValues.current[activityId], {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        }
    };

    // Grouper les activités par jour et trier
    const groupedActivities = useMemo(() => {
        if (!localActivities.length) return [];

        // Filtrer les activités avec des dates valides et les trier
        const validActivities = localActivities.filter((activity) => {
            if (!activity.date) {
                console.warn("Activité sans date:", activity.title);
                return false;
            }
            // Vérifier que c'est bien un objet Date
            if (!(activity.date instanceof Date)) {
                console.warn(
                    "Date invalide pour l'activité:",
                    activity.title,
                    activity.date
                );
                return false;
            }
            return true;
        });

        // Trier les activités par date et heure
        const sortedActivities = [...validActivities].sort((a, b) => {
            const dateCompare = a.date.getTime() - b.date.getTime();
            if (dateCompare !== 0) return dateCompare;

            // Si même date, trier par heure
            if (a.startTime && b.startTime) {
                return a.startTime.localeCompare(b.startTime);
            }
            if (a.startTime) return -1;
            if (b.startTime) return 1;
            return 0;
        });

        // Grouper par jour
        const groups: { [key: string]: TripActivity[] } = {};
        sortedActivities.forEach((activity) => {
            try {
                const dateKey = activity.date.toDateString();
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].push(activity);

                // Créer animation pour cette activité
                createAnimationForActivity(activity.id);
            } catch (error) {
                console.error(
                    "Erreur groupement activité:",
                    activity.title,
                    error
                );
            }
        });

        // Convertir en tableau de groupes
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return Object.entries(groups)
            .map(([dateKey, dayActivities]) => {
                const dateObj = new Date(dateKey);
                const isToday = dateObj.getTime() === today.getTime();
                const isPast = dateObj.getTime() < today.getTime();

                return {
                    date: dateObj.toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                    }),
                    dateObj,
                    activities: dayActivities,
                    isToday,
                    isPast,
                } as DayGroup;
            })
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }, [localActivities]);

    // Trouver l'activité top (plus de votes)
    const topActivity = useMemo(() => {
        return firebaseService.getTopActivity(localActivities);
    }, [localActivities]);

    const handleVote = async (activityId: string, currentlyVoted: boolean) => {
        if (!user) return;

        try {
            // Animation de vote
            const animValue = animatedValues.current[activityId];
            if (animValue) {
                Animated.sequence([
                    Animated.timing(animValue, {
                        toValue: 1.1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]).start();
            }

            // Optimistic update
            setLocalActivities((prev) =>
                prev.map((activity) => {
                    if (activity.id === activityId) {
                        const votes = activity.votes || [];
                        const newVotes = currentlyVoted
                            ? votes.filter((vote) => vote !== user.uid)
                            : [...votes, user.uid];

                        return { ...activity, votes: newVotes };
                    }
                    return activity;
                })
            );

            await firebaseService.voteForActivity(
                tripId,
                activityId,
                user.uid,
                !currentlyVoted
            );
        } catch (error) {
            console.error("Erreur vote:", error);
            Alert.alert("Erreur", "Impossible de voter pour cette activité");

            // Rollback en cas d'erreur
            if (activities?.activities) {
                setLocalActivities(activities.activities);
            }
        }
    };

    const handleValidate = async (activityId: string, validated: boolean) => {
        if (!user || !trip || trip.creatorId !== user.uid) return;

        try {
            await firebaseService.validateActivity(
                tripId,
                activityId,
                user.uid,
                validated
            );
        } catch (error) {
            console.error("Erreur validation:", error);
            Alert.alert("Erreur", "Impossible de valider cette activité");
        }
    };

    const handleActivityPress = (activity: TripActivity) => {
        setSelectedActivity(activity);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setSelectedActivity(null);
        setShowDetailModal(false);
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case "validated":
                return "#4CAF50";
            case "in_progress":
                return "#FF9500";
            case "past":
                return "#999999";
            default:
                return "#4DA1A9";
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case "validated":
                return "checkmark-circle";
            case "in_progress":
                return "play-circle";
            case "past":
                return "time";
            default:
                return "help-circle";
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case "validated":
                return "Validée";
            case "in_progress":
                return "En cours";
            case "past":
                return "Passée";
            default:
                return "En attente";
        }
    };

    const renderVoteSection = (activity: TripActivity) => {
        const votes = activity.votes || [];
        const hasVoted = votes.includes(user?.uid || "");
        const voteCount = votes.length;
        const isTopActivity = topActivity?.id === activity.id && voteCount > 0;

        return (
            <View style={styles.voteSection}>
                <TouchableOpacity
                    style={[
                        styles.voteButton,
                        hasVoted && styles.voteButtonActive,
                        isTopActivity && styles.topActivityButton,
                    ]}
                    onPress={() => handleVote(activity.id, hasVoted)}
                >
                    <Ionicons
                        name={hasVoted ? "heart" : "heart-outline"}
                        size={16}
                        color={hasVoted ? "#FFFFFF" : "#4DA1A9"}
                    />
                    <Text
                        style={[
                            styles.voteButtonText,
                            hasVoted && styles.voteButtonTextActive,
                        ]}
                    >
                        {hasVoted ? "Voté" : "Voter"} ({voteCount})
                    </Text>
                </TouchableOpacity>

                {isTopActivity && (
                    <View style={styles.topBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.topBadgeText}>Top activité</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderValidationSection = (activity: TripActivity) => {
        const isCreator = trip?.creatorId === user?.uid;
        const votes = activity.votes || [];
        const memberCount = trip?.members.length || 1;
        const votePercentage = (votes.length / memberCount) * 100;

        if (!isCreator) return null;

        return (
            <View style={styles.validationSection}>
                <View style={styles.voteProgress}>
                    <View style={styles.voteProgressBar}>
                        <View
                            style={[
                                styles.voteProgressFill,
                                { width: `${Math.min(votePercentage, 100)}%` },
                            ]}
                        />
                    </View>
                    <Text style={styles.voteProgressText}>
                        {votes.length}/{memberCount} votes
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.validateButton,
                        activity.validated && styles.validateButtonActive,
                    ]}
                    onPress={() =>
                        handleValidate(activity.id, !activity.validated)
                    }
                >
                    <Ionicons
                        name={
                            activity.validated
                                ? "checkmark-circle"
                                : "checkmark-circle-outline"
                        }
                        size={16}
                        color={activity.validated ? "#FFFFFF" : "#4CAF50"}
                    />
                    <Text
                        style={[
                            styles.validateButtonText,
                            activity.validated &&
                                styles.validateButtonTextActive,
                        ]}
                    >
                        {activity.validated ? "Validée" : "Valider"}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    const handleDeleteActivity = async (activityId: string) => {
        Alert.alert(
            "Supprimer l'activité",
            "Êtes-vous sûr de vouloir supprimer cette activité ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Optimistic update
                            setLocalActivities((prev) =>
                                prev.filter((a) => a.id !== activityId)
                            );

                            // Supprimer dans Firebase
                            const updatedActivities = localActivities.filter(
                                (a) => a.id !== activityId
                            );
                            await firebaseService.updateActivities(
                                tripId,
                                updatedActivities,
                                user?.uid || ""
                            );
                        } catch (error) {
                            console.error(
                                "Erreur suppression activité:",
                                error
                            );
                            // Rollback en cas d'erreur
                            if (activities?.activities) {
                                setLocalActivities(activities.activities);
                            }
                            Alert.alert(
                                "Erreur",
                                "Impossible de supprimer l'activité"
                            );
                        }
                    },
                },
            ]
        );
    };

    const renderActivityCard = (activity: TripActivity) => {
        const animValue = animatedValues.current[activity.id];
        const canEdit =
            activity.createdBy === user?.uid || trip?.creatorId === user?.uid;
        const statusColor = getStatusColor(activity.status);

        return (
            <TouchableOpacity
                key={activity.id}
                onPress={() => handleActivityPress(activity)}
                activeOpacity={0.7}
            >
                <Animated.View
                    style={[
                        styles.activityCard,
                        {
                            transform: animValue
                                ? [
                                      {
                                          scale: animValue,
                                      },
                                  ]
                                : [],
                            opacity: animValue || 1,
                        },
                    ]}
                >
                    {/* Header avec statut */}
                    <View style={styles.activityHeader}>
                        <View style={styles.activityTitleRow}>
                            <Text style={styles.activityTitle}>
                                {activity.title}
                            </Text>
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: statusColor },
                                ]}
                            >
                                <Ionicons
                                    name={getStatusIcon(activity.status)}
                                    size={12}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.statusText}>
                                    {getStatusText(activity.status)}
                                </Text>
                            </View>
                        </View>

                        {/* Informations de l'activité */}
                        <View style={styles.activityInfo}>
                            {activity.startTime && (
                                <View style={styles.timeInfo}>
                                    <Ionicons
                                        name="time-outline"
                                        size={14}
                                        color="#637887"
                                    />
                                    <Text style={styles.timeText}>
                                        {activity.startTime}
                                        {activity.endTime &&
                                            ` - ${activity.endTime}`}
                                    </Text>
                                </View>
                            )}

                            {activity.location && (
                                <View style={styles.locationInfo}>
                                    <Ionicons
                                        name="location-outline"
                                        size={14}
                                        color="#637887"
                                    />
                                    <Text style={styles.locationText}>
                                        {activity.location}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {activity.description && (
                            <Text
                                style={styles.activityDescription}
                                numberOfLines={2}
                            >
                                {activity.description}
                            </Text>
                        )}
                    </View>

                    {/* Section vote */}
                    {renderVoteSection(activity)}

                    {/* Section validation (créateur seulement) */}
                    {renderValidationSection(activity)}

                    {/* Actions */}
                    <View style={styles.activityActions}>
                        <Text style={styles.createdBy}>
                            Par {activity.createdByName}
                        </Text>

                        {canEdit && (
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        navigation.navigate("AddActivity", {
                                            tripId,
                                            editActivity: activity,
                                        });
                                    }}
                                >
                                    <Ionicons
                                        name="pencil"
                                        size={16}
                                        color="#4DA1A9"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleDeleteActivity(activity.id);
                                    }}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={16}
                                        color="#EF4444"
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    const renderDayGroup = (group: DayGroup) => (
        <View key={group.date} style={styles.dayGroup}>
            {/* Header du jour */}
            <View
                style={[
                    styles.dayHeader,
                    group.isToday && styles.todayHeader,
                    group.isPast && styles.pastHeader,
                ]}
            >
                <Text
                    style={[
                        styles.dayTitle,
                        group.isToday && styles.todayTitle,
                        group.isPast && styles.pastTitle,
                    ]}
                >
                    {group.date}
                    {group.isToday && " (Aujourd'hui)"}
                </Text>

                <View style={styles.dayStats}>
                    <Text style={styles.dayStatsText}>
                        {group.activities.length} activité
                        {group.activities.length > 1 ? "s" : ""}
                    </Text>
                    <Text style={styles.dayStatsText}>
                        {group.activities.filter((a) => a.validated).length}{" "}
                        validée
                        {group.activities.filter((a) => a.validated).length > 1
                            ? "s"
                            : ""}
                    </Text>
                </View>
            </View>

            {/* Timeline des activités */}
            <View style={styles.timeline}>
                {group.activities.map((activity, index) => (
                    <View key={activity.id} style={styles.timelineItem}>
                        {/* Ligne de connexion */}
                        {index < group.activities.length - 1 && (
                            <View style={styles.timelineLine} />
                        )}

                        {/* Point de timeline */}
                        <View
                            style={[
                                styles.timelinePoint,
                                {
                                    backgroundColor: getStatusColor(
                                        activity.status
                                    ),
                                },
                            ]}
                        />

                        {/* Carte d'activité */}
                        <View style={styles.timelineContent}>
                            {renderActivityCard(activity)}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderViewModeToggle = () => (
        <View style={styles.viewModeToggle}>
            <TouchableOpacity
                style={[
                    styles.viewModeButton,
                    viewMode === "timeline" && styles.viewModeButtonActive,
                ]}
                onPress={() => setViewMode("timeline")}
            >
                <Ionicons
                    name="git-branch-outline"
                    size={16}
                    color={viewMode === "timeline" ? "#FFFFFF" : "#4DA1A9"}
                />
                <Text
                    style={[
                        styles.viewModeText,
                        viewMode === "timeline" && styles.viewModeTextActive,
                    ]}
                >
                    Timeline
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.viewModeButton,
                    viewMode === "list" && styles.viewModeButtonActive,
                ]}
                onPress={() => setViewMode("list")}
            >
                <Ionicons
                    name="list-outline"
                    size={16}
                    color={viewMode === "list" ? "#FFFFFF" : "#4DA1A9"}
                />
                <Text
                    style={[
                        styles.viewModeText,
                        viewMode === "list" && styles.viewModeTextActive,
                    ]}
                >
                    Liste
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderPlanningStats = () => {
        const totalActivities = localActivities.length;
        const validatedActivities = localActivities.filter(
            (a) => a.validated
        ).length;
        const myVotes = localActivities.filter((a) =>
            a.votes?.includes(user?.uid || "")
        ).length;
        const inProgressActivities = localActivities.filter(
            (a) => a.status === "in_progress"
        ).length;

        return (
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{totalActivities}</Text>
                    <Text style={styles.statLabel}>Activités</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{validatedActivities}</Text>
                    <Text style={styles.statLabel}>Validées</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{myVotes}</Text>
                    <Text style={styles.statLabel}>Mes votes</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {inProgressActivities}
                    </Text>
                    <Text style={styles.statLabel}>En cours</Text>
                </View>
            </View>
        );
    };

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

    return (
        <SafeAreaView style={styles.container}>
            {/* Header avec titre */}
            <View style={styles.header}>
                <Text style={styles.title}>Planning du voyage</Text>
            </View>

            {/* Statistiques */}
            {renderPlanningStats()}

            {/* Toggle de vue */}
            {renderViewModeToggle()}

            {/* Contenu principal */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {groupedActivities.length === 0 ? (
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
                        {viewMode === "timeline" ? (
                            groupedActivities.map(renderDayGroup)
                        ) : (
                            <View style={styles.listView}>
                                {localActivities.map(renderActivityCard)}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Bouton d'ajout flottant */}
            <TouchableOpacity
                style={styles.floatingAddButton}
                onPress={() => navigation.navigate("AddActivity", { tripId })}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Modal de détails d'activité */}
            <Modal
                visible={showDetailModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCloseDetailModal}
            >
                <SafeAreaView style={styles.modalContainer}>
                    {selectedActivity && (
                        <>
                            {/* Header du modal */}
                            <View style={styles.modalHeader}>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={handleCloseDetailModal}
                                >
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color="#637887"
                                    />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>
                                    Détails de l'activité
                                </Text>
                                <View style={styles.placeholder} />
                            </View>

                            <ScrollView
                                style={styles.modalContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Titre et statut */}
                                <View style={styles.detailHeader}>
                                    <Text style={styles.detailTitle}>
                                        {selectedActivity.title}
                                    </Text>
                                    <View
                                        style={[
                                            styles.detailStatusBadge,
                                            {
                                                backgroundColor: getStatusColor(
                                                    selectedActivity.status
                                                ),
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={getStatusIcon(
                                                selectedActivity.status
                                            )}
                                            size={16}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.detailStatusText}>
                                            {getStatusText(
                                                selectedActivity.status
                                            )}
                                        </Text>
                                    </View>
                                </View>

                                {/* Informations principales */}
                                <View style={styles.detailSection}>
                                    <Text style={styles.sectionTitle}>
                                        Informations
                                    </Text>

                                    {/* Date */}
                                    <View style={styles.detailRow}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={20}
                                            color="#4DA1A9"
                                        />
                                        <View style={styles.detailRowContent}>
                                            <Text style={styles.detailLabel}>
                                                Date
                                            </Text>
                                            <Text style={styles.detailValue}>
                                                {selectedActivity.date.toLocaleDateString(
                                                    "fr-FR",
                                                    {
                                                        weekday: "long",
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    }
                                                )}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Heure */}
                                    {(selectedActivity.startTime ||
                                        selectedActivity.endTime) && (
                                        <View style={styles.detailRow}>
                                            <Ionicons
                                                name="time-outline"
                                                size={20}
                                                color="#4DA1A9"
                                            />
                                            <View
                                                style={styles.detailRowContent}
                                            >
                                                <Text
                                                    style={styles.detailLabel}
                                                >
                                                    Horaire
                                                </Text>
                                                <Text
                                                    style={styles.detailValue}
                                                >
                                                    {selectedActivity.startTime ||
                                                        "Non définie"}
                                                    {selectedActivity.endTime &&
                                                        ` - ${selectedActivity.endTime}`}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Lieu */}
                                    {selectedActivity.location && (
                                        <View style={styles.detailRow}>
                                            <Ionicons
                                                name="location-outline"
                                                size={20}
                                                color="#4DA1A9"
                                            />
                                            <View
                                                style={styles.detailRowContent}
                                            >
                                                <Text
                                                    style={styles.detailLabel}
                                                >
                                                    Lieu
                                                </Text>
                                                <Text
                                                    style={styles.detailValue}
                                                >
                                                    {selectedActivity.location}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Créé par */}
                                    <View style={styles.detailRow}>
                                        <Ionicons
                                            name="person-outline"
                                            size={20}
                                            color="#4DA1A9"
                                        />
                                        <View style={styles.detailRowContent}>
                                            <Text style={styles.detailLabel}>
                                                Proposé par
                                            </Text>
                                            <Text style={styles.detailValue}>
                                                {selectedActivity.createdByName}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Description */}
                                {selectedActivity.description && (
                                    <View style={styles.detailSection}>
                                        <Text style={styles.sectionTitle}>
                                            Description
                                        </Text>
                                        <Text style={styles.descriptionText}>
                                            {selectedActivity.description}
                                        </Text>
                                    </View>
                                )}

                                {/* Section votes */}
                                <View style={styles.detailSection}>
                                    <Text style={styles.sectionTitle}>
                                        Votes (
                                        {selectedActivity.votes?.length || 0})
                                    </Text>
                                    {selectedActivity.votes &&
                                    selectedActivity.votes.length > 0 ? (
                                        <View style={styles.votersContainer}>
                                            {selectedActivity.votes.map(
                                                (voterId) => {
                                                    const voter =
                                                        trip?.members.find(
                                                            (m) =>
                                                                m.userId ===
                                                                voterId
                                                        );
                                                    return (
                                                        <View
                                                            key={voterId}
                                                            style={
                                                                styles.voterItem
                                                            }
                                                        >
                                                            <Ionicons
                                                                name="heart"
                                                                size={16}
                                                                color="#EF4444"
                                                            />
                                                            <Text
                                                                style={
                                                                    styles.voterName
                                                                }
                                                            >
                                                                {voterId ===
                                                                user?.uid
                                                                    ? "Vous"
                                                                    : voter?.name ||
                                                                      voter?.email ||
                                                                      "Membre"}
                                                            </Text>
                                                        </View>
                                                    );
                                                }
                                            )}
                                        </View>
                                    ) : (
                                        <Text style={styles.noVotesText}>
                                            Aucun vote pour le moment
                                        </Text>
                                    )}
                                </View>

                                {/* Actions dans le modal */}
                                <View style={styles.modalActions}>
                                    {/* Bouton de vote */}
                                    <TouchableOpacity
                                        style={[
                                            styles.modalActionButton,
                                            selectedActivity.votes?.includes(
                                                user?.uid || ""
                                            ) && styles.modalActionButtonActive,
                                        ]}
                                        onPress={() => {
                                            const hasVoted =
                                                selectedActivity.votes?.includes(
                                                    user?.uid || ""
                                                );
                                            handleVote(
                                                selectedActivity.id,
                                                hasVoted
                                            );
                                        }}
                                    >
                                        <Ionicons
                                            name={
                                                selectedActivity.votes?.includes(
                                                    user?.uid || ""
                                                )
                                                    ? "heart"
                                                    : "heart-outline"
                                            }
                                            size={20}
                                            color={
                                                selectedActivity.votes?.includes(
                                                    user?.uid || ""
                                                )
                                                    ? "#FFFFFF"
                                                    : "#4DA1A9"
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.modalActionText,
                                                selectedActivity.votes?.includes(
                                                    user?.uid || ""
                                                ) &&
                                                    styles.modalActionTextActive,
                                            ]}
                                        >
                                            {selectedActivity.votes?.includes(
                                                user?.uid || ""
                                            )
                                                ? "Voté"
                                                : "Voter"}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Bouton d'édition pour le créateur */}
                                    {(selectedActivity.createdBy ===
                                        user?.uid ||
                                        trip?.creatorId === user?.uid) && (
                                        <TouchableOpacity
                                            style={styles.modalActionButton}
                                            onPress={() => {
                                                handleCloseDetailModal();
                                                navigation.navigate(
                                                    "AddActivity",
                                                    {
                                                        tripId,
                                                        editActivity:
                                                            selectedActivity,
                                                    }
                                                );
                                            }}
                                        >
                                            <Ionicons
                                                name="pencil"
                                                size={20}
                                                color="#4DA1A9"
                                            />
                                            <Text
                                                style={styles.modalActionText}
                                            >
                                                Modifier
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </ScrollView>
                        </>
                    )}
                </SafeAreaView>
            </Modal>
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
    errorText: {
        fontSize: 16,
        color: "#637887",
        textAlign: "center",
        marginBottom: 24,
    },
    errorDescription: {
        fontSize: 16,
        color: "#637887",
        textAlign: "center",
        marginBottom: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: Colors.backgroundColors.primary,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    title: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        flex: 1,
        textAlign: "center",
        marginRight: 40,
    },

    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#F8F9FA",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    statCard: {
        alignItems: "center",
        paddingHorizontal: 12,
    },
    statNumber: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "bold",
        color: "#4DA1A9",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
        textAlign: "center",
    },
    content: {
        flex: 1,
    },
    emptyState: {
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
    emptyDescription: {
        fontSize: 16,
        color: "#637887",
        textAlign: "center",
        lineHeight: 24,
    },
    emptyButton: {
        backgroundColor: "#4DA1A9",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    viewModeToggle: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#F8F9FA",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    viewModeButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#4DA1A9",
    },
    viewModeButtonActive: {
        backgroundColor: "#4DA1A9",
    },
    viewModeText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#4DA1A9",
        marginLeft: 8,
    },
    viewModeTextActive: {
        color: "#FFFFFF",
    },
    dayGroup: {
        marginBottom: 24,
    },
    dayHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#F8F9FA",
        borderRadius: 8,
        marginBottom: 8,
    },
    dayTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.text.primary,
        textTransform: "capitalize",
    },
    todayHeader: {
        backgroundColor: "#E8F5E8",
        borderColor: "#4CAF50",
        borderWidth: 1,
    },
    todayTitle: {
        color: "#4CAF50",
    },
    pastHeader: {
        backgroundColor: "#FFF0F0",
        borderColor: "#FF9999",
        borderWidth: 1,
    },
    pastTitle: {
        color: "#FF6B6B",
    },
    dayStats: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dayStatsText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
    },
    timeline: {
        flex: 1,
    },
    timelineItem: {
        flexDirection: "row",
        marginBottom: 16,
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: "#E2E8F0",
        marginLeft: 5,
    },
    timelinePoint: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#4DA1A9",
        marginRight: 8,
    },
    timelineContent: {
        flex: 1,
    },
    activityCard: {
        backgroundColor: Colors.backgroundColors.primary,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: "#4DA1A9",
    },
    activityHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    activityTitleRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    activityTitle: {
        fontSize: 18,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginRight: 8,
    },
    statusBadge: {
        padding: 4,
        borderRadius: 8,
        backgroundColor: "#4DA1A9",
    },
    statusText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#FFFFFF",
    },
    activityInfo: {
        flex: 1,
        marginRight: 12,
    },
    timeInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    timeText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        fontWeight: "500",
    },
    locationInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    locationText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginLeft: 4,
    },
    activityDescription: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        lineHeight: 20,
        marginBottom: 8,
    },
    voteSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    voteButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#4DA1A9",
    },
    voteButtonActive: {
        backgroundColor: "#4DA1A9",
    },
    topActivityButton: {
        backgroundColor: "#FFD700",
    },
    voteButtonText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#4DA1A9",
        marginLeft: 8,
    },
    voteButtonTextActive: {
        color: "#FFFFFF",
    },
    topBadge: {
        backgroundColor: "#FFD700",
        borderRadius: 12,
        padding: 4,
        marginLeft: 8,
    },
    topBadgeText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#FFFFFF",
    },
    validationSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    voteProgress: {
        flex: 1,
        marginRight: 8,
    },
    voteProgressBar: {
        height: 12,
        borderRadius: 6,
        backgroundColor: "#E2E8F0",
    },
    voteProgressFill: {
        height: "100%",
        borderRadius: 6,
        backgroundColor: "#4DA1A9",
    },
    voteProgressText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
        textAlign: "center",
    },
    validateButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#4CAF50",
    },
    validateButtonActive: {
        backgroundColor: "#4CAF50",
    },
    validateButtonText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#4CAF50",
        marginLeft: 8,
    },
    validateButtonTextActive: {
        color: "#FFFFFF",
    },
    activityActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
    createdBy: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#999",
        fontStyle: "italic",
    },
    actionButtons: {
        flexDirection: "row",
        alignItems: "center",
    },
    editButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#4DA1A9",
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#EF4444",
    },
    listView: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    closeButton: {
        padding: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        flex: 1,
        textAlign: "center",
    },
    placeholder: {
        width: 40,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    detailHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    detailTitle: {
        fontSize: 18,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        flex: 1,
    },
    detailStatusBadge: {
        padding: 4,
        borderRadius: 8,
        backgroundColor: "#4DA1A9",
    },
    detailStatusText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#FFFFFF",
    },
    detailSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    detailRowContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
    },
    detailValue: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#4DA1A9",
    },
    descriptionText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        lineHeight: 20,
    },
    votersContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    voterItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 8,
    },
    voterName: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
    },
    noVotesText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        textAlign: "center",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    modalActionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#4DA1A9",
    },
    modalActionButtonActive: {
        backgroundColor: "#4DA1A9",
    },
    modalActionText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#4DA1A9",
        marginLeft: 8,
    },
    modalActionTextActive: {
        color: "#FFFFFF",
    },
    floatingAddButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#4DA1A9",
        justifyContent: "center",
        alignItems: "center",
    },
});

export default ActivitiesScreen;
