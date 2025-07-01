import { useRef, useState } from "react";
import { Animated } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreTrip, TripNote } from "../services/firebaseService";
import { useModal } from "./useModal";
import { useTripSync } from "./useTripSync";

export interface TripStats {
    checklistProgress: number;
    totalExpenses: number;
    myExpenses: number;
    activitiesCount: number;
    notesUpdated: string;
    daysUntilTrip: number;
}

export interface UseTripDetailsReturn {
    // Données du hook useTripSync
    trip: FirestoreTrip | null;
    tripNotes: TripNote[];
    activityFeed: any[];
    loading: boolean;
    error: string | null;

    // États locaux
    showMemberNames: boolean;
    scrollY: Animated.Value;

    // Données calculées
    tripStats: TripStats;
    isCreator: boolean;

    // Handlers
    setShowMemberNames: (show: boolean) => void;
    handleNavigateToFeature: (feature: string, navigation: any) => void;
    handleDeleteTrip: (navigation: any) => void;
    updateCoverImage: (newImageUri: string | null) => Promise<void>;

    // Utilitaires
    formatDates: (startDate: Date | any, endDate: Date | any) => string;
    calculateDuration: (startDate: Date | any, endDate: Date | any) => string;
}

export const useTripDetails = (tripId: string): UseTripDetailsReturn => {
    const { user } = useAuth();
    const modal = useModal();
    const {
        trip,
        checklist,
        expenses,
        tripNotes,
        activities,
        activityFeed,
        loading,
        error,
    } = useTripSync(tripId);

    const scrollY = useRef(new Animated.Value(0)).current;
    const [showMemberNames, setShowMemberNames] = useState(false);

    // Calculer les statistiques en temps réel
    const getChecklistProgress = (): number => {
        if (!checklist?.items || checklist.items.length === 0) return 0;
        const completed = checklist.items.filter(
            (item) => item.isCompleted
        ).length;
        return Math.round((completed / checklist.items.length) * 100);
    };

    const getTotalExpenses = (): number => {
        if (!expenses?.expenses) return 0;
        return expenses.expenses.reduce(
            (total, expense) => total + expense.amount,
            0
        );
    };

    const getMyExpenses = (): number => {
        if (!expenses?.expenses || !user) return 0;
        return expenses.expenses
            .filter((expense) => expense.paidBy === user.uid)
            .reduce((total, expense) => total + expense.amount, 0);
    };

    const getActivitiesCount = (): number => {
        return activities?.activities?.length || 0;
    };

    const getNotesLastUpdate = (): string => {
        if (!tripNotes || tripNotes.length === 0) {
            return "Aucune note";
        }

        // Trouver la note la plus récente (soit par updatedAt ou createdAt)
        const mostRecentNote = tripNotes.reduce((latest, note) => {
            const noteDate =
                note.updatedAt && note.updatedAt > note.createdAt
                    ? note.updatedAt
                    : note.createdAt;
            const latestDate =
                latest.updatedAt && latest.updatedAt > latest.createdAt
                    ? latest.updatedAt
                    : latest.createdAt;

            return noteDate > latestDate ? note : latest;
        });

        const lastUpdateDate =
            mostRecentNote.updatedAt &&
            mostRecentNote.updatedAt > mostRecentNote.createdAt
                ? mostRecentNote.updatedAt
                : mostRecentNote.createdAt;

        // Formatage direct
        const now = new Date();
        const diffMs = now.getTime() - lastUpdateDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return "À l'instant";
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        const diffDays = Math.floor(diffHours / 24);
        return `Il y a ${diffDays}j`;
    };

    const getDaysUntilTrip = (): number => {
        if (!trip || !trip.startDate) return 0;

        try {
            const today = new Date();
            const tripDate =
                trip.startDate instanceof Date
                    ? trip.startDate
                    : new Date(trip.startDate);

            // Vérifier que la date est valide
            if (isNaN(tripDate.getTime())) {
                return 0;
            }

            const diffTime = tripDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(0, diffDays);
        } catch (error) {
            console.error("Erreur calcul jours restants:", error);
            return 0;
        }
    };

    const formatDates = (
        startDate: Date | any,
        endDate: Date | any
    ): string => {
        try {
            const start =
                startDate instanceof Date ? startDate : new Date(startDate);
            const end = endDate instanceof Date ? endDate : new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return "Dates non définies";
            }

            const options: Intl.DateTimeFormatOptions = {
                day: "2-digit",
                month: "short",
                year: "numeric",
            };

            const startStr = start.toLocaleDateString("fr-FR", options);
            const endStr = end.toLocaleDateString("fr-FR", options);

            // Si même mois et année, afficher "2 - 15 juin 2024"
            if (
                start.getMonth() === end.getMonth() &&
                start.getFullYear() === end.getFullYear()
            ) {
                return `${start.getDate()} - ${endStr}`;
            }

            return `${startStr} - ${endStr}`;
        } catch (error) {
            console.error("Erreur formatage dates:", error);
            return "Dates invalides";
        }
    };

    const calculateDuration = (
        startDate: Date | any,
        endDate: Date | any
    ): string => {
        try {
            const start =
                startDate instanceof Date ? startDate : new Date(startDate);
            const end = endDate instanceof Date ? endDate : new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return "Durée inconnue";
            }

            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) return "1 jour";
            if (diffDays < 7) return `${diffDays} jours`;
            const weeks = Math.floor(diffDays / 7);
            const remainingDays = diffDays % 7;

            if (weeks === 1 && remainingDays === 0) return "1 semaine";
            if (weeks === 1)
                return `1 semaine et ${remainingDays} jour${
                    remainingDays > 1 ? "s" : ""
                }`;
            if (remainingDays === 0) return `${weeks} semaines`;
            return `${weeks} semaines et ${remainingDays} jour${
                remainingDays > 1 ? "s" : ""
            }`;
        } catch (error) {
            console.error("Erreur calcul durée:", error);
            return "Durée inconnue";
        }
    };

    const handleNavigateToFeature = (feature: string, navigation: any) => {
        switch (feature) {
            case "Checklist":
                navigation.navigate("Checklist", { tripId });
                break;
            case "Expenses":
                navigation.navigate("Expenses", { tripId });
                break;
            case "Activities":
                navigation.navigate("Activities", { tripId });
                break;
            case "Notes":
                navigation.navigate("Notes", { tripId });
                break;
        }
    };

    const handleDeleteTrip = (navigation: any) => {
        if (!isCreator) {
            modal.showError(
                "Erreur",
                "Seul le créateur peut supprimer le voyage"
            );
            return;
        }

        modal.showDelete(
            "Supprimer le voyage",
            `Êtes-vous sûr de vouloir supprimer "${trip?.title}" ?\n\nCette action est irréversible et supprimera :\n• Toutes les checklists\n• Toutes les dépenses\n• Toutes les notes\n• Toutes les activités`,
            async () => {
                try {
                    // ÉTAPE 1: Nettoyer immédiatement les listeners pour éviter les erreurs
                    console.log("🛑 Nettoyage préventif des listeners...");
                    try {
                        const { forceCleanupTripListeners } = await import(
                            "./useTripSync"
                        );
                        forceCleanupTripListeners(tripId);
                    } catch (cleanupError) {
                        console.warn(
                            "⚠️ Erreur nettoyage listeners:",
                            cleanupError
                        );
                    }

                    // ÉTAPE 2: Supprimer le voyage
                    console.log("🗑️ Suppression du voyage...");
                    const firebaseService = (
                        await import("../services/firebaseService")
                    ).default;
                    await firebaseService.deleteTrip(tripId, user!.uid);

                    console.log("✅ Voyage supprimé avec succès");

                    // ÉTAPE 3: Navigation immédiate vers l'accueil
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "MainApp" }],
                    });

                    // ÉTAPE 4: Afficher le message de succès après navigation
                    setTimeout(() => {
                        modal.showSuccess(
                            "Voyage supprimé",
                            "Le voyage et toutes ses données ont été supprimés avec succès."
                        );
                    }, 500);
                } catch (error) {
                    console.error("❌ Erreur suppression voyage:", error);
                    modal.showError(
                        "Erreur de suppression",
                        "Une erreur est survenue lors de la suppression du voyage. Veuillez réessayer."
                    );
                }
            }
        );
    };

    const updateCoverImage = async (newImageUri: string | null) => {
        if (!trip || !user) return;

        try {
            let imageUrl: string | null = null;

            if (newImageUri) {
                // Upload de la nouvelle image
                const { ImageService } = await import(
                    "../services/imageService"
                );
                const result = await ImageService.uploadTripCoverImage(
                    tripId,
                    newImageUri
                );
                if (result.success) {
                    imageUrl = result.url || null;
                } else {
                    throw new Error(result.error || "Erreur upload image");
                }
            }

            // Mise à jour du voyage avec la nouvelle URL d'image
            const firebaseService = (
                await import("../services/firebaseService")
            ).default;
            await firebaseService.updateTripCoverImage(
                tripId,
                imageUrl,
                user!.uid
            );

            console.log("✅ Image de couverture mise à jour");
        } catch (error) {
            console.error("❌ Erreur mise à jour image:", error);
            modal.showError(
                "Erreur",
                "Une erreur est survenue lors de la mise à jour de l'image de couverture."
            );
        }
    };

    // Données calculées
    const tripStats: TripStats = {
        checklistProgress: getChecklistProgress(),
        totalExpenses: getTotalExpenses(),
        myExpenses: getMyExpenses(),
        activitiesCount: getActivitiesCount(),
        notesUpdated: getNotesLastUpdate(),
        daysUntilTrip: getDaysUntilTrip(),
    };

    const isCreator = trip?.creatorId === user?.uid;

    return {
        // Données du hook useTripSync
        trip,
        tripNotes,
        activityFeed,
        loading,
        error,

        // États locaux
        showMemberNames,
        scrollY,

        // Données calculées
        tripStats,
        isCreator,

        // Handlers
        setShowMemberNames,
        handleNavigateToFeature,
        handleDeleteTrip,
        updateCoverImage,

        // Utilitaires
        formatDates,
        calculateDuration,
    };
};
