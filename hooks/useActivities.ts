import { useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import firebaseService, { TripActivity } from "../services/firebaseService";
import { useModal, useQuickModals } from "./useModal";
import { useTripSync } from "./useTripSync";

export interface DayGroup {
    date: string;
    dateObj: Date;
    activities: TripActivity[];
    isToday: boolean;
    isPast: boolean;
}

export type ViewMode = "timeline" | "list";
export type FilterType = "all" | "validated" | "pending" | "past";

export interface UseActivitiesReturn {
    // États
    localActivities: TripActivity[];
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    selectedActivity: TripActivity | null;
    setSelectedActivity: (activity: TripActivity | null) => void;
    showDetailModal: boolean;
    setShowDetailModal: (show: boolean) => void;
    filterType: FilterType;
    setFilterType: (filter: FilterType) => void;
    realtimeNotification: string | null;
    setRealtimeNotification: (notification: string | null) => void;
    animatedValues: React.MutableRefObject<{ [key: string]: Animated.Value }>;
    voteAnimations: React.MutableRefObject<{ [key: string]: Animated.Value }>;
    notificationAnim: React.MutableRefObject<Animated.Value>;

    // Données calculées
    filteredActivities: TripActivity[];
    groupedActivities: DayGroup[];
    topActivity: TripActivity | null;

    // Handlers
    handleVote: (activityId: string, currentlyVoted: boolean) => Promise<void>;
    handleValidate: (activityId: string, validated: boolean) => Promise<void>;
    handleActivityPress: (activity: TripActivity) => void;
    handleEditActivity: (activity: TripActivity) => TripActivity;
    handleDeleteActivity: (activityId: string) => Promise<void>;
    handleCloseDetailModal: () => void;
    createAnimationForActivity: (activityId: string) => void;
    createVoteAnimation: (activityId: string) => void;
    createValidationAnimation: (activityId: string) => void;

    // Utilitaires
    getStatusColor: (status?: string) => string;
    getStatusIcon: (status?: string) => string;
    getStatusText: (status?: string) => string;

    // Données du voyage
    trip: any;
    activities: any;
    loading: boolean;
    error: string | null;
    user: any;
    modal: any;
    quickModals: any;
}

export const useActivities = (tripId: string): UseActivitiesReturn => {
    const modal = useModal();
    const quickModals = useQuickModals();
    const { user } = useAuth();
    const { trip, activities, loading, error } = useTripSync(tripId);

    // États locaux
    const [localActivities, setLocalActivities] = useState<TripActivity[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>("timeline");
    const [selectedActivity, setSelectedActivity] =
        useState<TripActivity | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filterType, setFilterType] = useState<FilterType>("all");
    const [realtimeNotification, setRealtimeNotification] = useState<
        string | null
    >(null);

    // Animations
    const animatedValues = useRef<{ [key: string]: Animated.Value }>({});
    const voteAnimations = useRef<{ [key: string]: Animated.Value }>({});
    const notificationAnim = useRef(new Animated.Value(0));

    // 🔄 Synchroniser les activités locales avec Firebase
    useEffect(() => {
        if (activities?.activities) {
            const activitiesWithStatus = activities.activities.map(
                (activity) => ({
                    ...activity,
                    status: firebaseService.calculateActivityStatus(activity),
                    votes: activity.votes || [],
                })
            );
            setLocalActivities(activitiesWithStatus);
        }
    }, [activities]);

    // 🔥 Synchronisation temps réel de l'activité sélectionnée
    useEffect(() => {
        if (selectedActivity && localActivities.length > 0) {
            const updatedActivity = localActivities.find(
                (activity) => activity.id === selectedActivity.id
            );

            if (updatedActivity) {
                const oldVoteCount = selectedActivity.votes?.length || 0;
                const newVoteCount = updatedActivity.votes?.length || 0;
                const oldVotes = selectedActivity.votes || [];
                const newVotes = updatedActivity.votes || [];

                if (newVoteCount !== oldVoteCount) {
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
                            setTimeout(
                                () => setRealtimeNotification(null),
                                3000
                            );
                        }
                    }
                }

                setSelectedActivity(updatedActivity);
            }
        }
    }, [localActivities, selectedActivity?.id, user?.uid, trip?.members]);

    // 🎨 Créer des valeurs d'animation pour les nouvelles activités
    const createAnimationForActivity = (activityId: string) => {
        if (!animatedValues.current[activityId]) {
            animatedValues.current[activityId] = new Animated.Value(0);
            voteAnimations.current[activityId] = new Animated.Value(1);

            Animated.spring(animatedValues.current[activityId], {
                toValue: 1,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
            }).start();
        }
    };

    // 🎨 Animation de vote
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

    // 🎨 Animation de validation
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

    // 🗳️ Filtrer les activités selon le filtre sélectionné
    const filteredActivities = useMemo(() => {
        if (!localActivities.length) return [];

        return localActivities.filter((activity) => {
            if (filterType === "all") return true;
            if (filterType === "validated") return activity.validated;
            if (filterType === "pending")
                return !activity.validated && activity.status !== "past";
            if (filterType === "past") return activity.status === "past";
            return true;
        });
    }, [localActivities, filterType]);

    // 📅 Grouper les activités par jour et trier
    const groupedActivities = useMemo(() => {
        if (!filteredActivities.length) return [];

        const validActivities = filteredActivities.filter((activity) => {
            if (!activity.date) {
                console.warn("Activité sans date:", activity.title);
                return false;
            }
            if (!(activity.date instanceof Date)) {
                console.warn("Date invalide:", activity.title, activity.date);
                return false;
            }
            return true;
        });

        const sortedActivities = [...validActivities].sort((a, b) => {
            const dateCompare = a.date.getTime() - b.date.getTime();
            if (dateCompare !== 0) return dateCompare;

            if (a.startTime && b.startTime) {
                return a.startTime.localeCompare(b.startTime);
            }
            if (a.startTime) return -1;
            if (b.startTime) return 1;
            return 0;
        });

        const groups: { [key: string]: TripActivity[] } = {};
        sortedActivities.forEach((activity) => {
            try {
                const dateKey = activity.date.toDateString();
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].push(activity);
                createAnimationForActivity(activity.id);
            } catch (error) {
                console.error("Erreur groupement:", activity.title, error);
            }
        });

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

    // 🏆 Trouver l'activité top (plus de votes)
    const topActivity = useMemo(() => {
        return firebaseService.getTopActivity(localActivities);
    }, [localActivities]);

    // 🗳️ Handler de vote
    const handleVote = async (activityId: string, currentlyVoted: boolean) => {
        if (!user) return;

        try {
            createVoteAnimation(activityId);

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

            // Mise à jour activité sélectionnée
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

            await firebaseService.voteForActivity(
                tripId,
                activityId,
                user.uid,
                !currentlyVoted
            );
        } catch (error) {
            console.error("Erreur vote:", error);
            modal.showError(
                "Erreur",
                "Impossible de voter pour cette activité"
            );

            // Rollback
            if (activities?.activities) {
                setLocalActivities(activities.activities);
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

    // ✅ Handler de validation
    const handleValidate = async (activityId: string, validated: boolean) => {
        if (!user || !trip || trip.creatorId !== user.uid) return;

        try {
            createValidationAnimation(activityId);
            await firebaseService.validateActivity(
                tripId,
                activityId,
                user.uid,
                validated
            );
        } catch (error) {
            console.error("Erreur validation:", error);
            modal.showError("Erreur", "Impossible de valider cette activité");
        }
    };

    // 🔍 Handler d'ouverture de détail
    const handleActivityPress = (activity: TripActivity) => {
        setSelectedActivity(activity);
        setShowDetailModal(true);
    };

    // ✏️ Handler d'édition d'activité
    const handleEditActivity = (activity: TripActivity) => {
        return activity; // On retourne l'activité pour que le composant parent gère la navigation
    };

    // 🗑️ Handler de suppression d'activité
    const handleDeleteActivity = async (activityId: string) => {
        if (!user) return;

        const activity = localActivities.find((a) => a.id === activityId);
        if (!activity) return;

        // Vérifier les permissions
        const canDelete =
            activity.createdBy === user.uid || trip?.creatorId === user.uid;
        if (!canDelete) {
            modal.showError(
                "Autorisation refusée",
                "Seul le créateur de l'activité ou du voyage peut la supprimer"
            );
            return;
        }

        modal.showDelete(
            "Supprimer l'activité",
            `Êtes-vous sûr de vouloir supprimer "${activity.title}" ?\n\nCette action est irréversible.`,
            async () => {
                try {
                    // Suppression côté Firebase
                    await firebaseService.deleteActivity(
                        tripId,
                        activityId,
                        user.uid
                    );

                    // Fermer le modal de détail si ouvert
                    if (selectedActivity?.id === activityId) {
                        setShowDetailModal(false);
                        setSelectedActivity(null);
                    }

                    quickModals.success("Activité supprimée avec succès");
                } catch (error) {
                    console.error("Erreur suppression:", error);
                    modal.showError(
                        "Erreur",
                        "Impossible de supprimer l'activité"
                    );
                }
            }
        );
    };

    // ❌ Handler de fermeture de modal
    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedActivity(null);
    };

    // 🎨 Utilitaires de statut
    const getStatusColor = (status?: string) => {
        switch (status) {
            case "upcoming":
                return "#4DA1A9";
            case "in_progress":
                return "#FFD93D";
            case "past":
                return "#94A3B8";
            default:
                return "#6B7280";
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case "upcoming":
                return "calendar-outline";
            case "in_progress":
                return "play-circle-outline";
            case "past":
                return "checkmark-circle-outline";
            default:
                return "help-circle-outline";
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case "upcoming":
                return "À venir";
            case "in_progress":
                return "En cours";
            case "past":
                return "Terminée";
            default:
                return "Statut inconnu";
        }
    };

    return {
        // États
        localActivities,
        viewMode,
        setViewMode,
        selectedActivity,
        setSelectedActivity,
        showDetailModal,
        setShowDetailModal,
        filterType,
        setFilterType,
        realtimeNotification,
        setRealtimeNotification,
        animatedValues,
        voteAnimations,
        notificationAnim,

        // Données calculées
        filteredActivities,
        groupedActivities,
        topActivity,

        // Handlers
        handleVote,
        handleValidate,
        handleActivityPress,
        handleEditActivity,
        handleDeleteActivity,
        handleCloseDetailModal,
        createAnimationForActivity,
        createVoteAnimation,
        createValidationAnimation,

        // Utilitaires
        getStatusColor,
        getStatusIcon,
        getStatusText,

        // Données du voyage
        trip,
        activities,
        loading,
        error,
        user,
        modal,
        quickModals,
    };
};
