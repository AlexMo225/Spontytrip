import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Linking from "expo-linking";
import React, { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Clipboard,
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
type FilterType = "all" | "validated" | "pending" | "past";

const ActivitiesScreen: React.FC<Props> = ({ navigation, route }) => {
    const { user } = useAuth();
    const { tripId } = route.params;
    const { trip, activities, loading, error } = useTripSync(tripId);

    const [localActivities, setLocalActivities] = useState<TripActivity[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>("timeline");
    const [selectedActivity, setSelectedActivity] =
        useState<TripActivity | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filterType, setFilterType] = useState<FilterType>("all");
    const [realtimeNotification, setRealtimeNotification] = useState<
        string | null
    >(null);
    const animatedValues = useRef<{ [key: string]: Animated.Value }>({});
    const voteAnimations = useRef<{ [key: string]: Animated.Value }>({});
    const notificationAnim = useRef(new Animated.Value(0));

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

    // 🔥 Synchronisation temps réel de l'activité sélectionnée
    React.useEffect(() => {
        if (selectedActivity && localActivities.length > 0) {
            const updatedActivity = localActivities.find(
                (activity) => activity.id === selectedActivity.id
            );

            if (updatedActivity) {
                // Vérifier si les votes ont changé pour déclencher une animation
                const oldVoteCount = selectedActivity.votes?.length || 0;
                const newVoteCount = updatedActivity.votes?.length || 0;
                const oldVotes = selectedActivity.votes || [];
                const newVotes = updatedActivity.votes || [];

                if (newVoteCount !== oldVoteCount) {
                    // Animation de changement de vote
                    createVoteAnimation(updatedActivity.id);

                    // 🔔 Détecter qui a voté (nouveau votant)
                    if (newVoteCount > oldVoteCount) {
                        const newVoters = newVotes.filter(
                            (vote) => !oldVotes.includes(vote)
                        );
                        const newVoter = newVoters.find(
                            (voterId) => voterId !== user?.uid
                        );

                        if (newVoter && trip?.members) {
                            const voterMember = trip.members.find(
                                (m) => m.userId === newVoter
                            );
                            const voterName =
                                voterMember?.name ||
                                voterMember?.email ||
                                "Quelqu'un";
                            setRealtimeNotification(`❤️ ${voterName} a voté !`);

                            // Masquer la notification après 3 secondes
                            setTimeout(
                                () => setRealtimeNotification(null),
                                3000
                            );
                        }
                    }

                    // 🔔 Détecter qui a retiré son vote
                    if (newVoteCount < oldVoteCount) {
                        const removedVoters = oldVotes.filter(
                            (vote) => !newVotes.includes(vote)
                        );
                        const removedVoter = removedVoters.find(
                            (voterId) => voterId !== user?.uid
                        );

                        if (removedVoter && trip?.members) {
                            const voterMember = trip.members.find(
                                (m) => m.userId === removedVoter
                            );
                            const voterName =
                                voterMember?.name ||
                                voterMember?.email ||
                                "Quelqu'un";
                            setRealtimeNotification(
                                `💔 ${voterName} a retiré son vote`
                            );

                            // Masquer la notification après 3 secondes
                            setTimeout(
                                () => setRealtimeNotification(null),
                                3000
                            );
                        }
                    }
                }

                // Mettre à jour l'activité sélectionnée avec les nouvelles données
                setSelectedActivity(updatedActivity);
            }
        }
    }, [localActivities, selectedActivity?.id, user?.uid, trip?.members]);

    // Créer des valeurs d'animation pour les nouvelles activités
    const createAnimationForActivity = (activityId: string) => {
        if (!animatedValues.current[activityId]) {
            animatedValues.current[activityId] = new Animated.Value(0);
            voteAnimations.current[activityId] = new Animated.Value(1);

            // Animation d'apparition avec slide + fade
            Animated.spring(animatedValues.current[activityId], {
                toValue: 1,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
            }).start();
        }
    };

    // Créer animation de vote avec confetti discret
    const createVoteAnimation = (activityId: string) => {
        const voteAnim = voteAnimations.current[activityId];
        if (voteAnim) {
            Animated.sequence([
                Animated.timing(voteAnim, {
                    toValue: 1.15,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(voteAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 150,
                    friction: 6,
                }),
            ]).start();
        }
    };

    // Animation pour la validation
    const createValidationAnimation = (activityId: string) => {
        const validationAnim = voteAnimations.current[activityId];
        if (validationAnim) {
            Animated.sequence([
                Animated.timing(validationAnim, {
                    toValue: 1.1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(validationAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 200,
                    friction: 8,
                }),
            ]).start();
        }
    };

    // Filtrer les activités selon le filtre sélectionné
    const filteredActivities = useMemo(() => {
        if (!localActivities.length) return [];

        // Filtrer selon le type sélectionné
        return localActivities.filter((activity) => {
            if (filterType === "all") return true;
            if (filterType === "validated") return activity.validated;
            if (filterType === "pending")
                return !activity.validated && activity.status !== "past";
            if (filterType === "past") return activity.status === "past";
            return true;
        });
    }, [localActivities, filterType]);

    // Grouper les activités par jour et trier
    const groupedActivities = useMemo(() => {
        if (!filteredActivities.length) return [];

        // Filtrer les activités avec des dates valides et les trier
        const validActivities = filteredActivities.filter((activity) => {
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
    }, [filteredActivities]);

    // Trouver l'activité top (plus de votes)
    const topActivity = useMemo(() => {
        return firebaseService.getTopActivity(localActivities);
    }, [localActivities]);

    const handleVote = async (activityId: string, currentlyVoted: boolean) => {
        if (!user) return;

        try {
            // 🎯 Animation de vote immédiate pour feedback utilisateur
            createVoteAnimation(activityId);

            // 🔄 Optimistic update pour réactivité immédiate
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

            // 🔥 Mise à jour immédiate de l'activité sélectionnée si c'est celle-ci
            if (selectedActivity && selectedActivity.id === activityId) {
                const votes = selectedActivity.votes || [];
                const newVotes = currentlyVoted
                    ? votes.filter((vote) => vote !== user.uid)
                    : [...votes, user.uid];

                setSelectedActivity({
                    ...selectedActivity,
                    votes: newVotes,
                });
            }

            // 💾 Sauvegarde dans Firebase (en arrière-plan)
            await firebaseService.voteForActivity(
                tripId,
                activityId,
                user.uid,
                !currentlyVoted
            );
        } catch (error) {
            console.error("Erreur vote:", error);
            Alert.alert("Erreur", "Impossible de voter pour cette activité");

            // 🔄 Rollback en cas d'erreur
            if (activities?.activities) {
                setLocalActivities(activities.activities);

                // Rollback aussi pour l'activité sélectionnée
                if (selectedActivity && selectedActivity.id === activityId) {
                    const originalActivity = activities.activities.find(
                        (a) => a.id === activityId
                    );
                    if (originalActivity) {
                        setSelectedActivity(originalActivity);
                    }
                }
            }
        }
    };

    const handleValidate = async (activityId: string, validated: boolean) => {
        if (!user || !trip || trip.creatorId !== user.uid) return;

        try {
            // Animation de validation
            createValidationAnimation(activityId);

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
                return "#10B981"; // Vert plus doux
            case "in_progress":
                return "#F59E0B"; // Orange plus doux
            case "past":
                return "#94A3B8"; // Gris plus doux
            default:
                return "#6366F1"; // Bleu plus doux pour "En attente"
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

    const renderActivityCard = (activity: TripActivity) => {
        const animValue = animatedValues.current[activity.id];
        const canEdit =
            activity.createdBy === user?.uid || trip?.creatorId === user?.uid;
        const statusColor = getStatusColor(activity.status);
        const votes = activity.votes || [];
        const hasVoted = votes.includes(user?.uid || "");
        const voteCount = votes.length;
        const memberCount = trip?.members.length || 1;
        const votePercentage = (voteCount / memberCount) * 100;
        const isTopActivity = topActivity?.id === activity.id && voteCount > 0;
        const isCreator = trip?.creatorId === user?.uid;
        const voteAnim =
            voteAnimations.current[activity.id] || new Animated.Value(1);

        return (
            <TouchableOpacity
                key={activity.id}
                onPress={() => handleActivityPress(activity)}
                activeOpacity={0.8}
                style={styles.modernCardContainer}
            >
                <Animated.View
                    style={[
                        styles.modernActivityCard,
                        {
                            transform: animValue ? [{ scale: animValue }] : [],
                            opacity: animValue || 1,
                        },
                    ]}
                >
                    {/* Header avec titre et badges */}
                    <View style={styles.modernCardHeader}>
                        <View style={styles.modernTitleContainer}>
                            <Text
                                style={styles.modernActivityTitle}
                                numberOfLines={2}
                            >
                                {activity.title}
                            </Text>

                            {/* Badges en haut à droite */}
                            <View style={styles.modernBadgesContainer}>
                                {/* Badge statut "Passée" */}
                                {activity.status === "past" && (
                                    <View
                                        style={[
                                            styles.modernStatusBadge,
                                            styles.pastBadge,
                                        ]}
                                    >
                                        <Ionicons
                                            name="time-outline"
                                            size={10}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.modernBadgeText}>
                                            Passée
                                        </Text>
                                    </View>
                                )}

                                {/* Badge "Validée" */}
                                {activity.validated && (
                                    <View
                                        style={[
                                            styles.modernStatusBadge,
                                            styles.validatedBadge,
                                        ]}
                                    >
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={10}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.modernBadgeText}>
                                            Validée
                                        </Text>
                                    </View>
                                )}

                                {/* Badge "Top activité" */}
                                {isTopActivity && (
                                    <View style={styles.modernTopBadge}>
                                        <Ionicons
                                            name="star"
                                            size={12}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.modernTopBadgeText}>
                                            Top activité
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Informations principales sur une ligne */}
                        <View style={styles.modernInfoRow}>
                            {activity.startTime && (
                                <View style={styles.modernInfoItem}>
                                    <Ionicons
                                        name="time-outline"
                                        size={14}
                                        color="#4DA1A9"
                                    />
                                    <Text style={styles.modernInfoText}>
                                        {activity.startTime}
                                        {activity.endTime &&
                                            ` - ${activity.endTime}`}
                                    </Text>
                                </View>
                            )}

                            {activity.location && (
                                <View style={styles.modernInfoItem}>
                                    <Ionicons
                                        name="location-outline"
                                        size={14}
                                        color="#4DA1A9"
                                    />
                                    <Text
                                        style={styles.modernInfoText}
                                        numberOfLines={1}
                                    >
                                        {activity.location}
                                    </Text>
                                </View>
                            )}

                            {activity.link && (
                                <View style={styles.modernInfoItem}>
                                    <Ionicons
                                        name="link-outline"
                                        size={14}
                                        color="#4DA1A9"
                                    />
                                    <Text style={styles.modernInfoText}>
                                        Lien disponible
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Description si présente */}
                        {activity.description && (
                            <Text
                                style={styles.modernDescription}
                                numberOfLines={2}
                            >
                                {activity.description}
                            </Text>
                        )}
                    </View>

                    {/* Section vote avec progress bar large */}
                    <View style={styles.modernVoteSection}>
                        {/* Progress bar large et colorée */}
                        <View style={styles.modernProgressContainer}>
                            <View style={styles.modernProgressBar}>
                                <Animated.View
                                    style={[
                                        styles.modernProgressFill,
                                        {
                                            width: `${Math.min(
                                                votePercentage,
                                                100
                                            )}%`,
                                            transform: [{ scaleY: voteAnim }],
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.modernProgressText}>
                                {voteCount}/{memberCount} votes
                            </Text>
                        </View>

                        {/* Boutons d'action principaux */}
                        <View style={styles.modernActionRow}>
                            {/* Bouton Vote */}
                            <TouchableOpacity
                                style={[
                                    styles.modernVoteButton,
                                    hasVoted && styles.modernVoteButtonActive,
                                ]}
                                onPress={() =>
                                    handleVote(activity.id, hasVoted)
                                }
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={hasVoted ? "heart" : "heart-outline"}
                                    size={16}
                                    color={hasVoted ? "#FFFFFF" : "#4DA1A9"}
                                />
                                <Text
                                    style={[
                                        styles.modernVoteButtonText,
                                        hasVoted &&
                                            styles.modernVoteButtonTextActive,
                                    ]}
                                >
                                    Voté ({voteCount})
                                </Text>
                            </TouchableOpacity>

                            {/* Bouton Valider (créateur seulement) */}
                            {isCreator && (
                                <Animated.View
                                    style={{
                                        transform: [{ scale: voteAnim }],
                                    }}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.modernValidateButton,
                                            activity.validated &&
                                                styles.modernValidateButtonActive,
                                        ]}
                                        onPress={() =>
                                            handleValidate(
                                                activity.id,
                                                !activity.validated
                                            )
                                        }
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons
                                            name={
                                                activity.validated
                                                    ? "checkmark-circle"
                                                    : "checkmark-circle-outline"
                                            }
                                            size={16}
                                            color={
                                                activity.validated
                                                    ? "#FFFFFF"
                                                    : "#7ED957"
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.modernValidateButtonText,
                                                activity.validated &&
                                                    styles.modernValidateButtonTextActive,
                                            ]}
                                        >
                                            {activity.validated
                                                ? "Validée"
                                                : "Valider"}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        </View>
                    </View>

                    {/* Footer avec auteur et actions d'édition */}
                    <View style={styles.modernCardFooter}>
                        <Text style={styles.modernAuthorText}>
                            Par {activity.createdByName}
                        </Text>

                        {/* Boutons éditer/supprimer en bas à droite */}
                        {canEdit && (
                            <View style={styles.modernEditActions}>
                                <TouchableOpacity
                                    style={styles.modernEditButton}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        navigation.navigate("AddActivity", {
                                            tripId,
                                            editActivity: activity,
                                        });
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name="pencil"
                                        size={14}
                                        color="#4DA1A9"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modernDeleteButton}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleDeleteActivity(activity.id);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={14}
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

    const renderVoteSection = (activity: TripActivity) => {
        const votes = activity.votes || [];
        const hasVoted = votes.includes(user?.uid || "");
        const voteCount = votes.length;
        const memberCount = trip?.members.length || 1;
        const votePercentage = (voteCount / memberCount) * 100;
        const isTopActivity = topActivity?.id === activity.id && voteCount > 0;
        const voteAnim =
            voteAnimations.current[activity.id] || new Animated.Value(1);

        return (
            <View style={styles.voteSection}>
                <TouchableOpacity
                    style={[
                        styles.voteButton,
                        hasVoted && styles.voteButtonActive,
                    ]}
                    onPress={() => handleVote(activity.id, hasVoted)}
                >
                    <Ionicons
                        name={hasVoted ? "heart" : "heart-outline"}
                        size={18}
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

                {/* Badge Top activité */}
                {isTopActivity && (
                    <View style={styles.topBadge}>
                        <Ionicons name="star" size={14} color="#FFD700" />
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

    const renderFilterButtons = () => (
        <View
            style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: "#F8F9FA",
                borderBottomWidth: 1,
                borderBottomColor: "#E2E8F0",
            }}
        >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                    { key: "all", label: "Toutes", icon: "apps-outline" },
                    {
                        key: "validated",
                        label: "Validées",
                        icon: "checkmark-circle-outline",
                    },
                    {
                        key: "pending",
                        label: "À valider",
                        icon: "time-outline",
                    },
                    { key: "past", label: "Passées", icon: "archive-outline" },
                ].map((filter) => (
                    <TouchableOpacity
                        key={filter.key}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            marginRight: 12,
                            borderRadius: 20,
                            backgroundColor:
                                filterType === filter.key
                                    ? "#4DA1A9"
                                    : "#FFFFFF",
                            borderWidth: 1,
                            borderColor: "#4DA1A9",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 2,
                        }}
                        onPress={() => setFilterType(filter.key as FilterType)}
                    >
                        <Ionicons
                            name={filter.icon as any}
                            size={16}
                            color={
                                filterType === filter.key
                                    ? "#FFFFFF"
                                    : "#4DA1A9"
                            }
                        />
                        <Text
                            style={{
                                fontSize: 14,
                                fontFamily: Fonts.body.family,
                                color:
                                    filterType === filter.key
                                        ? "#FFFFFF"
                                        : "#4DA1A9",
                                marginLeft: 6,
                                fontWeight: "500",
                            }}
                        >
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
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

            {/* Filtres */}
            {renderFilterButtons()}

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

            {/* Modal de détails d'activité - Version améliorée */}
            <Modal
                visible={showDetailModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCloseDetailModal}
            >
                <SafeAreaView style={styles.modalContainer}>
                    {selectedActivity && (
                        <>
                            {/* Header moderne avec fermeture */}
                            <View style={styles.modernModalHeader}>
                                <TouchableOpacity
                                    style={styles.modernCloseButton}
                                    onPress={handleCloseDetailModal}
                                >
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>

                                {/* Badge de statut en haut à droite */}
                                <View
                                    style={[
                                        styles.modernStatusBadge,
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
                                        size={14}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.modernStatusText}>
                                        {getStatusText(selectedActivity.status)}
                                    </Text>
                                </View>
                            </View>

                            <ScrollView
                                style={styles.modernModalContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* 🔔 Notification temps réel */}
                                {realtimeNotification && (
                                    <Animated.View
                                        style={[
                                            styles.realtimeNotification,
                                            {
                                                opacity: 1,
                                                transform: [{ translateY: 0 }],
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={
                                                styles.realtimeNotificationText
                                            }
                                        >
                                            {realtimeNotification}
                                        </Text>
                                    </Animated.View>
                                )}

                                {/* Titre principal avec emoji */}
                                <View style={styles.modernTitleSection}>
                                    <Text style={styles.modernActivityTitle}>
                                        🎯 {selectedActivity.title}
                                    </Text>
                                </View>

                                {/* Carte d'informations principales */}
                                <View style={styles.modernInfoCard}>
                                    {/* Date */}
                                    <View style={styles.modernInfoRow}>
                                        <View style={styles.modernInfoIcon}>
                                            <Ionicons
                                                name="calendar"
                                                size={20}
                                                color="#4DA1A9"
                                            />
                                        </View>
                                        <View style={styles.modernInfoContent}>
                                            <Text
                                                style={styles.modernInfoLabel}
                                            >
                                                Date
                                            </Text>
                                            <Text
                                                style={styles.modernInfoValue}
                                            >
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
                                        <View style={styles.modernInfoRow}>
                                            <View style={styles.modernInfoIcon}>
                                                <Ionicons
                                                    name="time"
                                                    size={20}
                                                    color="#4DA1A9"
                                                />
                                            </View>
                                            <View
                                                style={styles.modernInfoContent}
                                            >
                                                <Text
                                                    style={
                                                        styles.modernInfoLabel
                                                    }
                                                >
                                                    Horaire
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.modernInfoValue
                                                    }
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
                                        <View style={styles.modernInfoRow}>
                                            <View style={styles.modernInfoIcon}>
                                                <Ionicons
                                                    name="location"
                                                    size={20}
                                                    color="#4DA1A9"
                                                />
                                            </View>
                                            <View
                                                style={styles.modernInfoContent}
                                            >
                                                <Text
                                                    style={
                                                        styles.modernInfoLabel
                                                    }
                                                >
                                                    Lieu
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.modernInfoValue
                                                    }
                                                >
                                                    {selectedActivity.location}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Lien */}
                                    {selectedActivity.link && (
                                        <View style={styles.modernInfoRow}>
                                            <View style={styles.modernInfoIcon}>
                                                <Ionicons
                                                    name="link"
                                                    size={20}
                                                    color="#4DA1A9"
                                                />
                                            </View>
                                            <View
                                                style={styles.modernInfoContent}
                                            >
                                                <Text
                                                    style={
                                                        styles.modernInfoLabel
                                                    }
                                                >
                                                    Lien utile
                                                </Text>
                                                <TouchableOpacity
                                                    style={styles.linkButton}
                                                    onPress={() => {
                                                        // Ouvrir le lien dans le navigateur
                                                        Linking.openURL(
                                                            selectedActivity.link!
                                                        );
                                                    }}
                                                    onLongPress={() => {
                                                        // Copier le lien dans le presse-papiers
                                                        Clipboard.setString(
                                                            selectedActivity.link!
                                                        );
                                                        Alert.alert(
                                                            "Copié !",
                                                            "Le lien a été copié dans le presse-papiers"
                                                        );
                                                    }}
                                                >
                                                    <Ionicons
                                                        name="open-outline"
                                                        size={16}
                                                        color="#FFFFFF"
                                                    />
                                                    <Text
                                                        style={
                                                            styles.linkButtonText
                                                        }
                                                    >
                                                        {selectedActivity.link.includes(
                                                            "ticket"
                                                        ) ||
                                                        selectedActivity.link.includes(
                                                            "billet"
                                                        ) ||
                                                        selectedActivity.link.includes(
                                                            "booking"
                                                        )
                                                            ? "Acheter un billet"
                                                            : selectedActivity.link.includes(
                                                                  "official"
                                                              ) ||
                                                              selectedActivity.link.includes(
                                                                  "officiel"
                                                              )
                                                            ? "Site officiel"
                                                            : "Voir le lien"}
                                                    </Text>
                                                </TouchableOpacity>
                                                <Text
                                                    style={styles.linkHintText}
                                                >
                                                    Appui long pour copier
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Proposé par */}
                                    <View style={styles.modernInfoRow}>
                                        <View style={styles.modernInfoIcon}>
                                            <Ionicons
                                                name="person"
                                                size={20}
                                                color="#4DA1A9"
                                            />
                                        </View>
                                        <View style={styles.modernInfoContent}>
                                            <Text
                                                style={styles.modernInfoLabel}
                                            >
                                                Proposé par
                                            </Text>
                                            <Text
                                                style={styles.modernInfoValue}
                                            >
                                                {selectedActivity.createdByName}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Description si elle existe */}
                                {selectedActivity.description && (
                                    <View style={styles.modernDescriptionCard}>
                                        <Text
                                            style={
                                                styles.modernDescriptionTitle
                                            }
                                        >
                                            💬 Description
                                        </Text>
                                        <Text
                                            style={styles.modernDescriptionText}
                                        >
                                            {selectedActivity.description}
                                        </Text>
                                    </View>
                                )}

                                {/* Section votes moderne */}
                                <View style={styles.modernVotesCard}>
                                    <Text style={styles.modernVotesTitle}>
                                        ❤️ Votes (
                                        {selectedActivity.votes?.length || 0})
                                    </Text>

                                    {selectedActivity.votes &&
                                    selectedActivity.votes.length > 0 ? (
                                        <>
                                            {/* Barre de progression des votes */}
                                            <View
                                                style={
                                                    styles.modernVoteProgress
                                                }
                                            >
                                                <View
                                                    style={
                                                        styles.modernVoteProgressBar
                                                    }
                                                >
                                                    <Animated.View
                                                        style={[
                                                            styles.modernVoteProgressFill,
                                                            {
                                                                width: `${Math.min(
                                                                    ((selectedActivity
                                                                        .votes
                                                                        ?.length ||
                                                                        0) /
                                                                        (trip
                                                                            ?.members
                                                                            .length ||
                                                                            1)) *
                                                                        100,
                                                                    100
                                                                )}%`,
                                                                transform: [
                                                                    {
                                                                        scaleY:
                                                                            voteAnimations
                                                                                .current[
                                                                                selectedActivity
                                                                                    .id
                                                                            ] ||
                                                                            1,
                                                                    },
                                                                ],
                                                            },
                                                        ]}
                                                    />
                                                </View>
                                                <View
                                                    style={
                                                        styles.modernVoteProgressInfo
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.modernVoteProgressText
                                                        }
                                                    >
                                                        {selectedActivity.votes
                                                            ?.length || 0}
                                                        /
                                                        {trip?.members.length ||
                                                            1}{" "}
                                                        votes
                                                    </Text>
                                                    {/* Pourcentage de participation */}
                                                    <Text
                                                        style={
                                                            styles.modernVoteProgressPercentage
                                                        }
                                                    >
                                                        {Math.round(
                                                            ((selectedActivity
                                                                .votes
                                                                ?.length || 0) /
                                                                (trip?.members
                                                                    .length ||
                                                                    1)) *
                                                                100
                                                        )}
                                                        %
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Avatars des votants */}
                                            <View
                                                style={styles.modernVotersRow}
                                            >
                                                {selectedActivity.votes
                                                    .slice(0, 5)
                                                    .map((voterId, index) => {
                                                        const voter =
                                                            trip?.members.find(
                                                                (m) =>
                                                                    m.userId ===
                                                                    voterId
                                                            );
                                                        const initials =
                                                            voter?.name
                                                                ? voter.name
                                                                      .split(
                                                                          " "
                                                                      )
                                                                      .map(
                                                                          (n) =>
                                                                              n[0]
                                                                      )
                                                                      .join("")
                                                                      .toUpperCase()
                                                                : voter?.email
                                                                      ?.charAt(
                                                                          0
                                                                      )
                                                                      .toUpperCase() ||
                                                                  "?";

                                                        return (
                                                            <Animated.View
                                                                key={voterId}
                                                                style={[
                                                                    styles.modernVoterAvatar,
                                                                    {
                                                                        marginLeft:
                                                                            index >
                                                                            0
                                                                                ? -12
                                                                                : 0,
                                                                        transform:
                                                                            [
                                                                                {
                                                                                    scale:
                                                                                        voteAnimations
                                                                                            .current[
                                                                                            selectedActivity
                                                                                                .id
                                                                                        ] ||
                                                                                        1,
                                                                                },
                                                                            ],
                                                                    },
                                                                ]}
                                                            >
                                                                <Text
                                                                    style={
                                                                        styles.modernVoterInitials
                                                                    }
                                                                >
                                                                    {initials}
                                                                </Text>
                                                                {/* Indicateur "Vous" pour l'utilisateur actuel */}
                                                                {voterId ===
                                                                    user?.uid && (
                                                                    <View
                                                                        style={
                                                                            styles.currentUserIndicator
                                                                        }
                                                                    >
                                                                        <Text
                                                                            style={
                                                                                styles.currentUserText
                                                                            }
                                                                        >
                                                                            Vous
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </Animated.View>
                                                        );
                                                    })}
                                                {(selectedActivity.votes
                                                    ?.length || 0) > 5 && (
                                                    <Animated.View
                                                        style={[
                                                            styles.modernVoterAvatar,
                                                            {
                                                                marginLeft: -12,
                                                                transform: [
                                                                    {
                                                                        scale:
                                                                            voteAnimations
                                                                                .current[
                                                                                selectedActivity
                                                                                    .id
                                                                            ] ||
                                                                            1,
                                                                    },
                                                                ],
                                                            },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={
                                                                styles.modernVoterInitials
                                                            }
                                                        >
                                                            +
                                                            {(selectedActivity
                                                                .votes
                                                                ?.length || 0) -
                                                                5}
                                                        </Text>
                                                    </Animated.View>
                                                )}
                                            </View>
                                        </>
                                    ) : (
                                        <View style={styles.modernEmptyVotes}>
                                            <Text
                                                style={
                                                    styles.modernEmptyVotesEmoji
                                                }
                                            >
                                                🗳️
                                            </Text>
                                            <Text
                                                style={
                                                    styles.modernEmptyVotesText
                                                }
                                            >
                                                Soyez le premier à voter !
                                            </Text>
                                            <Text
                                                style={
                                                    styles.modernEmptyVotesSubtext
                                                }
                                            >
                                                Montrez votre intérêt pour cette
                                                activité
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>

                            {/* Actions en bas - Version moderne */}
                            <View style={styles.modernModalActions}>
                                {/* Bouton de vote principal */}
                                <TouchableOpacity
                                    style={[
                                        styles.modernVoteButton,
                                        selectedActivity.votes?.includes(
                                            user?.uid || ""
                                        ) && styles.modernVoteButtonActive,
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
                                        size={22}
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
                                            styles.modernVoteButtonText,
                                            selectedActivity.votes?.includes(
                                                user?.uid || ""
                                            ) &&
                                                styles.modernVoteButtonTextActive,
                                        ]}
                                    >
                                        {selectedActivity.votes?.includes(
                                            user?.uid || ""
                                        )
                                            ? "Voté !"
                                            : "Voter"}
                                    </Text>
                                </TouchableOpacity>

                                {/* Actions secondaires */}
                                <View style={styles.modernSecondaryActions}>
                                    {/* Bouton Modifier (si créateur) */}
                                    {(selectedActivity.createdBy ===
                                        user?.uid ||
                                        trip?.creatorId === user?.uid) && (
                                        <TouchableOpacity
                                            style={styles.modernSecondaryButton}
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
                                                color="#6B7280"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
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
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#374151",
        marginTop: 24,
        marginBottom: 12,
    },
    emptyDescription: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    emptyButton: {
        backgroundColor: "#4DA1A9",
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    emptyButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
    },
    viewModeToggle: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#F8FAFC",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    viewModeButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#4DA1A9",
        marginHorizontal: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
        marginBottom: 32,
    },
    dayHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 18,
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        marginBottom: 16,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    dayTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.text.primary,
        textTransform: "capitalize",
    },
    todayHeader: {
        backgroundColor: "#ECFDF5",
        borderColor: "#10B981",
        borderWidth: 2,
    },
    todayTitle: {
        color: "#10B981",
        fontWeight: "700",
    },
    pastHeader: {
        backgroundColor: "#FEF2F2",
        borderColor: "#F87171",
        borderWidth: 1,
    },
    pastTitle: {
        color: "#EF4444",
        fontWeight: "600",
    },
    dayStats: {
        flexDirection: "column",
        alignItems: "flex-end",
    },
    dayStatsText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginBottom: 2,
    },
    timeline: {
        flex: 1,
        paddingHorizontal: 16,
    },
    timelineItem: {
        flexDirection: "row",
        marginBottom: 24,
        position: "relative",
    },
    timelineLine: {
        position: "absolute",
        left: 6,
        top: 14,
        bottom: -24,
        width: 2,
        backgroundColor: "#E2E8F0",
    },
    timelinePoint: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#4DA1A9",
        marginRight: 16,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        marginTop: 6,
    },
    timelineContent: {
        flex: 1,
    },
    activityCard: {
        backgroundColor: Colors.backgroundColors.primary,
        borderRadius: 20,
        marginHorizontal: 16,
        marginBottom: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        overflow: "hidden",
    },
    activityHeader: {
        padding: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    activityTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    activityTitle: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: Colors.text.primary,
        flex: 1,
        marginRight: 12,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "#4DA1A9",
    },
    statusText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#FFFFFF",
        fontWeight: "600",
        marginLeft: 4,
    },
    activityInfo: {
        gap: 8,
    },
    timeInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeText: {
        fontSize: 15,
        fontFamily: Fonts.body.family,
        color: "#475569",
        fontWeight: "500",
        marginLeft: 8,
    },
    locationInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationText: {
        fontSize: 15,
        fontFamily: Fonts.body.family,
        color: "#475569",
        marginLeft: 8,
    },
    linkInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    linkIndicatorText: {
        fontSize: 13,
        color: "#4DA1A9",
        marginLeft: 8,
        fontWeight: "500",
    },
    activityDescription: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#64748B",
        lineHeight: 20,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    voteSection: {
        padding: 20,
        paddingTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    voteButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#4DA1A9",
        shadowColor: "#4DA1A9",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        alignSelf: "flex-start",
        marginBottom: 12,
    },
    voteButtonActive: {
        backgroundColor: "#4DA1A9",
        transform: [{ scale: 1.02 }],
    },
    voteButtonText: {
        fontSize: 15,
        fontFamily: Fonts.body.family,
        color: "#4DA1A9",
        marginLeft: 8,
        fontWeight: "600",
    },
    voteButtonTextActive: {
        color: "#FFFFFF",
    },
    topBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFD700",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginTop: 12,
        alignSelf: "flex-start",
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    topBadgeText: {
        fontSize: 13,
        fontFamily: Fonts.body.family,
        color: "#FFFFFF",
        fontWeight: "700",
        marginLeft: 6,
    },
    validationSection: {
        padding: 20,
        paddingTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    voteProgress: {
        marginBottom: 16,
    },
    voteProgressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: "#F1F5F9",
        overflow: "hidden",
        marginBottom: 8,
    },
    voteProgressFill: {
        height: "100%",
        borderRadius: 4,
        backgroundColor: "#4DA1A9",
        minWidth: 4,
    },
    voteProgressText: {
        fontSize: 13,
        fontFamily: Fonts.body.family,
        color: "#64748B",
        textAlign: "center",
        fontWeight: "500",
    },
    validateButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#4CAF50",
        alignSelf: "flex-start",
    },
    validateButtonActive: {
        backgroundColor: "#4CAF50",
    },
    validateButtonText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#4CAF50",
        marginLeft: 8,
        fontWeight: "600",
    },
    validateButtonTextActive: {
        color: "#FFFFFF",
    },
    activityActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        paddingTop: 16,
        backgroundColor: "#FAFBFC",
    },
    createdBy: {
        fontSize: 13,
        fontFamily: Fonts.body.family,
        color: "#64748B",
        fontStyle: "italic",
    },
    actionButtons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    editButton: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#4DA1A9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    deleteButton: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#EF4444",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    listView: {
        paddingTop: 8,
        paddingBottom: 100,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    modernModalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    modernCloseButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: "#F8FAFC",
    },
    modernStatusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    modernStatusText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    modernModalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    modernTitleSection: {
        alignItems: "center",
        paddingVertical: 20,
    },
    modernActivityTitle: {
        fontSize: 24,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: Colors.text.primary,
        textAlign: "center",
        lineHeight: 32,
    },
    modernInfoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
    },
    modernInfoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    modernInfoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0F9FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    modernInfoContent: {
        flex: 1,
        paddingTop: 2,
    },
    modernInfoLabel: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    modernInfoValue: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: Colors.text.primary,
        lineHeight: 22,
    },
    modernDescriptionCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
    },
    modernDescriptionTitle: {
        fontSize: 18,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 12,
    },
    modernDescriptionText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        color: "#64748B",
        lineHeight: 24,
    },
    modernVotesCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
    },
    modernVotesTitle: {
        fontSize: 18,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 16,
    },
    modernVoteProgress: {
        marginBottom: 16,
    },
    modernVoteProgressBar: {
        height: 8,
        flex: 1,
        backgroundColor: "#F1F5F9",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    modernVoteProgressFill: {
        height: "100%",
        backgroundColor: "#10B981",
        borderRadius: 4,
        minWidth: 4,
    },
    modernVoteProgressText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#64748B",
        textAlign: "center",
    },
    modernVoteProgressInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modernVoteProgressPercentage: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#64748B",
        textAlign: "right",
    },
    modernVotersRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 4,
    },
    modernVoterAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#4DA1A9",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    modernVoterInitials: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    modernEmptyVotes: {
        alignItems: "center",
        paddingVertical: 24,
    },
    modernEmptyVotesEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    modernEmptyVotesText: {
        fontSize: 18,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 4,
    },
    modernEmptyVotesSubtext: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#94A3B8",
        textAlign: "center",
    },
    modernModalActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        backgroundColor: "#FAFBFC",
    },
    modernVoteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#4DA1A9",
        shadowColor: "#4DA1A9",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        minWidth: 120,
    },
    modernVoteButtonActive: {
        backgroundColor: "#4DA1A9",
        borderColor: "#4DA1A9",
        transform: [{ scale: 1.02 }],
    },
    modernVoteButtonText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
        marginLeft: 8,
    },
    modernVoteButtonTextActive: {
        color: "#FFFFFF",
    },
    modernSecondaryActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    modernSecondaryButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    currentUserIndicator: {
        position: "absolute",
        top: 0,
        right: 0,
        padding: 4,
        borderRadius: 12,
        backgroundColor: "#4DA1A9",
    },
    currentUserText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    realtimeNotification: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
    },
    realtimeNotificationText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#64748B",
        textAlign: "center",
    },
    linkButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4DA1A9",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 4,
    },
    linkButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    linkHintText: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 4,
        fontStyle: "italic",
    },
    // ===============================
    // STYLES MODERNES DES CARTES D'ACTIVITÉ
    // ===============================
    modernCardContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    modernActivityCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 0.5,
        borderColor: "#E2E8F0",
    },
    modernCardHeader: {
        marginBottom: 16,
    },
    modernTitleContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    modernActivityTitle: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: Colors.text.primary,
        flex: 1,
        marginRight: 12,
        lineHeight: 26,
    },
    modernBadgesContainer: {
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6,
    },
    modernStatusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    pastBadge: {
        backgroundColor: "#94A3B8",
    },
    validatedBadge: {
        backgroundColor: "#7ED957",
    },
    modernBadgeText: {
        fontSize: 10,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#FFFFFF",
        textTransform: "uppercase",
    },
    modernTopBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "#FFD93D",
        gap: 4,
        shadowColor: "#FFD93D",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    modernTopBadgeText: {
        fontSize: 11,
        fontFamily: Fonts.body.family,
        fontWeight: "700",
        color: "#FFFFFF",
        textTransform: "uppercase",
    },
    modernInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 12,
    },
    modernInfoItem: {
        flexDirection: "row",
        alignItems: "center",
        flex: 0,
        minWidth: 0,
    },
    modernInfoText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: "#64748B",
        marginLeft: 8,
        flexShrink: 1,
    },
    modernDescription: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#64748B",
        lineHeight: 20,
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    modernVoteSection: {
        marginBottom: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    modernProgressContainer: {
        marginBottom: 16,
    },
    modernProgressBar: {
        height: 12,
        borderRadius: 6,
        backgroundColor: "#F1F5F9",
        overflow: "hidden",
        marginBottom: 8,
    },
    modernProgressFill: {
        height: "100%",
        backgroundColor: "#4DA1A9",
        borderRadius: 6,
        minWidth: 6,
    },
    modernProgressText: {
        fontSize: 13,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#64748B",
        textAlign: "center",
    },
    modernActionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    modernVoteButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#4DA1A9",
        shadowColor: "#4DA1A9",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
        minWidth: 120,
    },
    modernVoteButtonActive: {
        backgroundColor: "#4DA1A9",
        borderColor: "#4DA1A9",
        transform: [{ scale: 1.02 }],
    },
    modernVoteButtonText: {
        fontSize: 15,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
        marginLeft: 8,
    },
    modernVoteButtonTextActive: {
        color: "#FFFFFF",
    },
    modernValidateButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#7ED957",
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
        minWidth: 100,
    },
    modernValidateButtonActive: {
        backgroundColor: "#7ED957",
        borderColor: "#7ED957",
        transform: [{ scale: 1.02 }],
    },
    modernValidateButtonText: {
        fontSize: 15,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#7ED957",
        marginLeft: 8,
    },
    modernValidateButtonTextActive: {
        color: "#FFFFFF",
    },
    modernCardFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    modernAuthorText: {
        fontSize: 13,
        fontFamily: Fonts.body.family,
        color: "#94A3B8",
        fontStyle: "italic",
    },
    modernEditActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    modernEditButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#4DA1A9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    modernDeleteButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#EF4444",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
});

export default ActivitiesScreen;
