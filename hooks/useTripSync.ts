import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import firebaseService, {
    FirestoreTrip,
    TripActivities,
    TripChecklist,
    TripExpenses,
    TripNote,
    TripNotes,
} from "../services/firebaseService";
import type { ActivityLogEntry } from "../types";

// Store global pour gérer les listeners actifs de tous les voyages
class TripListenersManager {
    private static instance: TripListenersManager;
    private activeListeners: Map<string, { [key: string]: () => void }> =
        new Map();

    static getInstance(): TripListenersManager {
        if (!TripListenersManager.instance) {
            TripListenersManager.instance = new TripListenersManager();
        }
        return TripListenersManager.instance;
    }

    // Enregistrer les listeners d'un voyage
    registerListeners(
        tripId: string,
        listeners: { [key: string]: () => void }
    ) {
        this.activeListeners.set(tripId, listeners);
        console.log(
            `📋 Listeners enregistrés pour voyage ${tripId}:`,
            Object.keys(listeners)
        );
    }

    // Nettoyer immédiatement tous les listeners d'un voyage
    cleanupTrip(tripId: string) {
        const listeners = this.activeListeners.get(tripId);
        if (listeners) {
            console.log(
                `🧹 Nettoyage forcé des listeners pour voyage ${tripId}`
            );
            Object.entries(listeners).forEach(([name, unsubscribe]) => {
                try {
                    unsubscribe();
                    console.log(`✅ Listener ${name} nettoyé`);
                } catch (error) {
                    console.warn(
                        `⚠️ Erreur nettoyage listener ${name}:`,
                        error
                    );
                }
            });
            this.activeListeners.delete(tripId);
        }
    }

    // Supprimer les listeners (lors du unmount normal)
    removeListeners(tripId: string) {
        this.activeListeners.delete(tripId);
    }
}

const tripListenersManager = TripListenersManager.getInstance();

export interface TripSyncData {
    trip: FirestoreTrip | null;
    checklist: TripChecklist | null;
    expenses: TripExpenses | null;
    notes: TripNotes | null;
    tripNotes: TripNote[];
    activities: TripActivities | null;
    activityFeed: ActivityLogEntry[];
    loading: boolean;
    error: string | null;
}

export const useTripSync = (tripId: string): TripSyncData => {
    const { user } = useAuth();
    const [trip, setTrip] = useState<FirestoreTrip | null>(null);
    const [checklist, setChecklist] = useState<TripChecklist | null>(null);
    const [expenses, setExpenses] = useState<TripExpenses | null>(null);
    const [notes, setNotes] = useState<TripNotes | null>(null);
    const [tripNotes, setTripNotes] = useState<TripNote[]>([]);
    const [activities, setActivities] = useState<TripActivities | null>(null);
    const [activityFeed, setActivityFeed] = useState<ActivityLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Flag pour éviter les erreurs multiples
    const deletionDetectedRef = useRef(false);
    const cleanupExecutedRef = useRef(false);

    // Utiliser useRef pour stocker les unsubscribe functions
    const unsubscribeRefs = useRef<{
        checklist?: () => void;
        expenses?: () => void;
        notes?: () => void;
        tripNotes?: () => void;
        activities?: () => void;
        activityFeed?: () => void;
        trip?: () => void;
    }>({});

    // Fonction de nettoyage centralisée pour éviter la duplication
    const executeCleanup = useCallback(
        (reason: string) => {
            if (cleanupExecutedRef.current) {
                console.log("🛑 Nettoyage déjà exécuté, ignoré");
                return;
            }

            cleanupExecutedRef.current = true;
            console.log(`🧹 Exécution du nettoyage: ${reason}`);

            // Nettoyer via le gestionnaire global
            tripListenersManager.cleanupTrip(tripId);

            // Nettoyer aussi localement par sécurité
            Object.values(unsubscribeRefs.current).forEach((unsubscribe) => {
                if (unsubscribe && typeof unsubscribe === "function") {
                    try {
                        unsubscribe();
                    } catch (error) {
                        // Supprimer les logs d'erreur pour éviter l'affichage
                    }
                }
            });
            unsubscribeRefs.current = {};

            // Réinitialiser l'état silencieusement
            setTrip(null);
            setChecklist(null);
            setExpenses(null);
            setNotes(null);
            setTripNotes([]);
            setActivities(null);
            setActivityFeed([]);
            setError("Voyage supprimé");
        },
        [tripId]
    );

    // Fonction de détection de suppression pour tous les listeners
    const createPermissionErrorHandler = useCallback(
        (listenerName: string) => {
            return (error: any) => {
                // Vérifier si c'est une erreur de permissions et si on n'a pas déjà détecté la suppression
                if (
                    !deletionDetectedRef.current &&
                    (error.code === "permission-denied" ||
                        error.code === "not-found" ||
                        error.message?.includes("permissions"))
                ) {
                    deletionDetectedRef.current = true;
                    console.log(
                        `🚨 Suppression détectée via ${listenerName} - nettoyage immédiat`
                    );
                    executeCleanup(`Permission denied - ${listenerName}`);
                }
                // Ne pas afficher l'erreur - retourner silencieusement
            };
        },
        [executeCleanup]
    );

    useEffect(() => {
        if (!tripId || !user) {
            setLoading(false);
            return;
        }

        const initializeSync = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Récupérer les données du voyage
                const tripData = await firebaseService.getTripById(tripId);
                if (!tripData) {
                    setError("Voyage introuvable");
                    setLoading(false);
                    return;
                }

                // 2. Vérifier que l'utilisateur est membre
                const isMember = tripData.members.some(
                    (member) => member.userId === user.uid
                );
                if (!isMember) {
                    setError("Accès non autorisé à ce voyage");
                    setLoading(false);
                    return;
                }

                setTrip(tripData);

                // 3. S'abonner aux mises à jour temps réel avec gestion d'erreurs robuste
                unsubscribeRefs.current.checklist =
                    firebaseService.subscribeToChecklist(
                        tripId,
                        (checklistData) => {
                            setChecklist(checklistData);
                        },
                        createPermissionErrorHandler("checklist")
                    );

                unsubscribeRefs.current.expenses =
                    firebaseService.subscribeToExpenses(
                        tripId,
                        (expensesData) => {
                            setExpenses(expensesData);
                        },
                        createPermissionErrorHandler("expenses")
                    );

                unsubscribeRefs.current.notes =
                    firebaseService.subscribeToNotes(
                        tripId,
                        (notesData) => {
                            setNotes(notesData);
                        },
                        createPermissionErrorHandler("notes")
                    );

                unsubscribeRefs.current.tripNotes =
                    firebaseService.subscribeToTripNotes(
                        tripId,
                        (tripNotesData) => {
                            setTripNotes(tripNotesData);
                        },
                        createPermissionErrorHandler("tripNotes")
                    );

                unsubscribeRefs.current.activities =
                    firebaseService.subscribeToActivities(
                        tripId,
                        (activitiesData) => {
                            setActivities(activitiesData);
                        },
                        createPermissionErrorHandler("activities")
                    );

                // 4. S'abonner au feed d'activités récentes
                unsubscribeRefs.current.activityFeed =
                    firebaseService.subscribeToActivityFeed(
                        tripId,
                        (feedData) => {
                            setActivityFeed(feedData);
                        },
                        createPermissionErrorHandler("activityFeed")
                    );

                // 5. S'abonner au voyage principal avec gestion des suppressions
                unsubscribeRefs.current.trip = firebaseService.subscribeToTrip(
                    tripId,
                    (updatedTrip: FirestoreTrip | null) => {
                        if (updatedTrip) {
                            setTrip(updatedTrip);
                        } else {
                            // Le voyage a été supprimé - nettoyer immédiatement
                            console.log(
                                "⚠️ Voyage supprimé détecté, nettoyage des listeners..."
                            );

                            // Nettoyer tous les listeners
                            Object.values(unsubscribeRefs.current).forEach(
                                (unsubscribe) => {
                                    if (
                                        unsubscribe &&
                                        typeof unsubscribe === "function"
                                    ) {
                                        try {
                                            unsubscribe();
                                        } catch (error) {
                                            console.warn(
                                                "Erreur nettoyage listener:",
                                                error
                                            );
                                        }
                                    }
                                }
                            );
                            unsubscribeRefs.current = {};

                            // Nettoyer aussi dans le gestionnaire global
                            tripListenersManager.removeListeners(tripId);

                            // Réinitialiser l'état
                            setTrip(null);
                            setChecklist(null);
                            setExpenses(null);
                            setNotes(null);
                            setTripNotes([]);
                            setActivities(null);
                            setActivityFeed([]);
                            setError("Voyage supprimé");
                        }
                    },
                    createPermissionErrorHandler("trip")
                );

                // Enregistrer tous les listeners dans le gestionnaire global
                tripListenersManager.registerListeners(
                    tripId,
                    unsubscribeRefs.current
                );

                setLoading(false);
            } catch (err) {
                console.error("Erreur initialisation sync:", err);
                setError("Erreur de synchronisation");
                setLoading(false);
            }
        };

        initializeSync();

        // Cleanup function sécurisée
        return () => {
            console.log("🧹 Nettoyage des listeners pour voyage:", tripId);

            // Nettoyer via le gestionnaire global d'abord
            tripListenersManager.removeListeners(tripId);

            // Nettoyer aussi localement par sécurité
            Object.values(unsubscribeRefs.current).forEach((unsubscribe) => {
                if (unsubscribe && typeof unsubscribe === "function") {
                    try {
                        unsubscribe();
                    } catch (error) {
                        console.warn("Erreur nettoyage listener:", error);
                    }
                }
            });
            unsubscribeRefs.current = {};
        };
    }, [tripId, user, createPermissionErrorHandler]);

    return {
        trip,
        checklist,
        expenses,
        notes,
        tripNotes,
        activities,
        activityFeed,
        loading,
        error,
    };
};

// Hook pour récupérer tous les voyages de l'utilisateur
export const useUserTrips = () => {
    const { user } = useAuth();
    const [trips, setTrips] = useState<FirestoreTrip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrips = async () => {
        if (!user) {
            setTrips([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log("🔄 Récupération des voyages pour:", user.uid);
            const userTrips = await firebaseService.getUserTrips(user.uid);
            console.log("✅ Voyages récupérés:", userTrips.length);
            setTrips(userTrips);
        } catch (err) {
            console.error("❌ Erreur récupération voyages:", err);

            // Gestion spécifique des erreurs de permissions
            if (
                err instanceof Error &&
                err.message?.includes("insufficient permissions")
            ) {
                setError(
                    "Problème de permissions Firebase. Tentative de correction..."
                );
                // Réessayer une fois après un délai
                setTimeout(() => {
                    console.log(
                        "🔄 Nouvelle tentative après erreur de permissions"
                    );
                    fetchTrips();
                }, 2000);
                return;
            }

            setError("Impossible de récupérer vos voyages");
            setTrips([]); // Réinitialiser les voyages en cas d'erreur
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            setTrips([]);
            setLoading(false);
            return;
        }

        // Fetch initial
        fetchTrips();

        // Écouter les événements de refresh global
        const unsubscribe = tripRefreshEmitter.subscribe((event) => {
            console.log("🔄 Événement reçu:", event);

            if (
                event.type === "refresh" ||
                event.type === "deleted" ||
                event.type === "joined"
            ) {
                console.log(
                    "🔄 Refresh des voyages déclenché par:",
                    event.type
                );
                fetchTrips();
            }
        });

        return unsubscribe;
    }, [user]);

    const refreshTrips = async () => {
        await fetchTrips();
    };

    return {
        trips,
        loading,
        error,
        refreshTrips,
    };
};

// Hook pour créer un voyage
export const useCreateTrip = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createTrip = async (tripData: {
        title: string;
        destination: string;
        startDate: Date;
        endDate: Date;
        type: "plage" | "montagne" | "citytrip" | "campagne";
        coverImage?: string;
    }): Promise<string | null> => {
        if (!user) {
            setError("Utilisateur non connecté");
            return null;
        }

        try {
            setLoading(true);
            setError(null);

            const inviteCode = await firebaseService.generateUniqueInviteCode();

            const newTrip = {
                ...tripData,
                creatorId: user.uid,
                creatorName: user.displayName || "Utilisateur",
                members: [
                    {
                        userId: user.uid,
                        name: user.displayName || "Utilisateur",
                        email: user.email || "",
                        role: "creator" as const,
                        joinedAt: new Date(),
                    },
                ],
                inviteCode,
            };

            const tripId = await firebaseService.createTrip(newTrip);
            return tripId;
        } catch (err) {
            console.error("Erreur création voyage:", err);
            setError("Impossible de créer le voyage");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        createTrip,
        loading,
        error,
    };
};

// Hook pour rejoindre un voyage
export const useJoinTrip = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const joinTrip = async (
        inviteCode: string,
        onSuccess?: () => void
    ): Promise<FirestoreTrip | null> => {
        if (!user) {
            setError("Utilisateur non connecté");
            return null;
        }

        try {
            setLoading(true);
            setError(null);

            // 1. Trouver le voyage par code
            const trip = await firebaseService.getTripByInviteCode(inviteCode);
            if (!trip) {
                setError("Code d'invitation invalide");
                return null;
            }

            // 2. Vérifier si déjà membre
            const isAlreadyMember = trip.members.some(
                (member) => member.userId === user.uid
            );
            if (isAlreadyMember) {
                // Déclencher le callback même si déjà membre
                onSuccess?.();
                tripRefreshEmitter.emitRefresh(); // Refresh pour voir le voyage
                return trip; // Déjà membre, retourner le voyage
            }

            // 3. Ajouter comme membre
            const newMember = {
                userId: user.uid,
                name: user.displayName || "Utilisateur",
                email: user.email || "",
                role: "member" as const,
                joinedAt: new Date(),
            };

            await firebaseService.joinTrip(trip.id, newMember);

            // 4. Déclencher le callback de succès et émettre l'événement
            onSuccess?.();
            tripRefreshEmitter.emitTripJoined(
                trip.id,
                user.uid,
                user.displayName || "Utilisateur"
            );

            // 5. Retourner le voyage mis à jour
            const updatedTrip = await firebaseService.getTripById(trip.id);
            return updatedTrip;
        } catch (err) {
            console.error("Erreur rejoindre voyage:", err);
            setError("Impossible de rejoindre le voyage");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        joinTrip,
        loading,
        error,
    };
};

// Event emitter amélioré pour notifier les différents types d'événements
export type TripEventType = "refresh" | "deleted" | "joined" | "updated";

export interface TripEvent {
    type: TripEventType;
    tripId?: string;
    userId?: string;
    userName?: string;
    message?: string;
}

class TripRefreshEmitter {
    private listeners: ((event: TripEvent) => void)[] = [];

    subscribe(callback: (event: TripEvent) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter((cb) => cb !== callback);
        };
    }

    emit(event: TripEvent) {
        console.log("🔔 Événement émis:", event);
        this.listeners.forEach((callback) => callback(event));
    }

    // Méthodes de convenance
    emitRefresh() {
        this.emit({ type: "refresh" });
    }

    emitTripDeleted(tripId: string, deletedBy: string, deletedByName: string) {
        this.emit({
            type: "deleted",
            tripId,
            userId: deletedBy,
            userName: deletedByName,
            message: `${deletedByName} a supprimé le voyage`,
        });
    }

    emitTripJoined(tripId: string, userId: string, userName: string) {
        this.emit({
            type: "joined",
            tripId,
            userId,
            userName,
            message: `${userName} a rejoint le voyage`,
        });
    }
}

const tripRefreshEmitter = new TripRefreshEmitter();

// Exporter l'emitter pour l'utiliser dans d'autres composants
export { tripRefreshEmitter };

// Exporter le gestionnaire de listeners pour le nettoyage externe
export { tripListenersManager };

// Fonction utilitaire pour nettoyer immédiatement les listeners d'un voyage
export const forceCleanupTripListeners = (tripId: string) => {
    console.log(`🚨 Nettoyage forcé des listeners pour voyage ${tripId}`);
    tripListenersManager.cleanupTrip(tripId);
};
