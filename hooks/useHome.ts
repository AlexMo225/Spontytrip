import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { FirestoreTrip } from "../services/firebaseService";
import { useUserTrips } from "./useTripSync";

// 🎨 Citations inspirantes pour l'effet "wow"
const inspirationalQuotes = [
    "L'aventure commence ici ! ✈️",
    "Voyager, c'est vivre ! 🌍",
    "Chaque voyage commence par un rêve ⭐",
    "Le monde t'attend ! 🗺️",
    "Partir, c'est découvrir ! 🧭",
];

export interface UseHomeReturn {
    // Données utilisateur et voyages
    user: any;
    trips: FirestoreTrip[];
    loading: boolean;
    error: string | null;
    refreshTrips: () => Promise<void>;

    // État local
    refreshing: boolean;
    currentQuote: number;

    // Animations
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    scaleAnim: Animated.Value;
    actionButtonsAnim: Animated.Value;

    // Handlers
    onRefresh: () => Promise<void>;
    animateButtonPress: (callback: () => void) => void;

    // Utilitaires
    formatDateRange: (startDate: Date | any, endDate: Date | any) => string;
    getDaysUntilTrip: (startDate: Date | any) => number;
    getTripStatus: (trip: FirestoreTrip) => {
        text: string;
        color: string;
        emoji: string;
    };
    getTypeEmoji: (type: string) => string;

    // Citations
    inspirationalQuotes: string[];
}

export const useHome = (): UseHomeReturn => {
    const { user } = useAuth();
    const { trips, loading, error, refreshTrips } = useUserTrips();
    const [refreshing, setRefreshing] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(0);

    // 🎯 Animations pour l'effet "wow"
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const actionButtonsAnim = useRef(new Animated.Value(0)).current;

    // 🚀 Animation d'entrée au chargement
    useEffect(() => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(actionButtonsAnim, {
                    toValue: 1,
                    duration: 400,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    // 🔄 Changer de citation toutes les 4 secondes
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // 🔄 Fonction de refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await refreshTrips();
        setRefreshing(false);
    };

    // 📅 Utilitaires de formatage
    const formatDateRange = (
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

            const startDay = start.getDate();
            const endDay = end.getDate();
            const month = start.toLocaleDateString("fr-FR", { month: "long" });

            return `${startDay} - ${endDay} ${month}`;
        } catch (error) {
            console.error("Erreur formatage dates:", error);
            return "Dates invalides";
        }
    };

    const getDaysUntilTrip = (startDate: Date | any): number => {
        try {
            const today = new Date();
            const tripDate =
                startDate instanceof Date ? startDate : new Date(startDate);

            if (isNaN(tripDate.getTime())) {
                return 0;
            }

            const diffTime = tripDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            console.error("Erreur calcul jours:", error);
            return 0;
        }
    };

    const getTripStatus = (
        trip: FirestoreTrip
    ): { text: string; color: string; emoji: string } => {
        try {
            const daysUntil = getDaysUntilTrip(trip.startDate);
            const today = new Date();
            const startDate =
                trip.startDate instanceof Date
                    ? trip.startDate
                    : new Date(trip.startDate);
            const endDate =
                trip.endDate instanceof Date
                    ? trip.endDate
                    : new Date(trip.endDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return { text: "Date invalide", color: "#666", emoji: "❓" };
            }

            if (today >= startDate && today <= endDate) {
                return { text: "En cours", color: "#7ED957", emoji: "🔥" };
            } else if (daysUntil > 0) {
                return {
                    text: `Dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}`,
                    color: "#4DA1A9",
                    emoji: "⏳",
                };
            } else {
                return { text: "Terminé", color: "#94A3B8", emoji: "✅" };
            }
        } catch (error) {
            console.error("Erreur calcul statut voyage:", error);
            return { text: "Statut inconnu", color: "#666", emoji: "❓" };
        }
    };

    const getTypeEmoji = (type: string): string => {
        switch (type) {
            case "plage":
                return "🏖️";
            case "montagne":
                return "🏔️";
            case "citytrip":
                return "🏙️";
            case "campagne":
                return "🌾";
            default:
                return "✈️";
        }
    };

    // 🎯 Animation au tap des boutons d'action
    const animateButtonPress = (callback: () => void) => {
        const scaleDown = new Animated.Value(1);

        Animated.sequence([
            Animated.timing(scaleDown, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleDown, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            callback();
        });
    };

    return {
        // Données utilisateur et voyages
        user,
        trips,
        loading,
        error,
        refreshTrips,

        // État local
        refreshing,
        currentQuote,

        // Animations
        fadeAnim,
        slideAnim,
        scaleAnim,
        actionButtonsAnim,

        // Handlers
        onRefresh,
        animateButtonPress,

        // Utilitaires
        formatDateRange,
        getDaysUntilTrip,
        getTripStatus,
        getTypeEmoji,

        // Citations
        inspirationalQuotes,
    };
};
