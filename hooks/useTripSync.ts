import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import firebaseService, {
    FirestoreTrip,
    TripActivities,
    TripChecklist,
    TripExpenses,
    TripNote,
    TripNotes,
} from "../services/firebaseService";

export interface TripSyncData {
    trip: FirestoreTrip | null;
    checklist: TripChecklist | null;
    expenses: TripExpenses | null;
    notes: TripNotes | null;
    tripNotes: TripNote[];
    activities: TripActivities | null;
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Utiliser useRef pour stocker les unsubscribe functions
    const unsubscribeRefs = useRef<{
        checklist?: () => void;
        expenses?: () => void;
        notes?: () => void;
        tripNotes?: () => void;
        activities?: () => void;
        trip?: () => void;
    }>({});

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

                // 3. S'abonner aux mises à jour temps réel
                unsubscribeRefs.current.checklist =
                    firebaseService.subscribeToChecklist(
                        tripId,
                        (checklistData) => {
                            setChecklist(checklistData);
                        }
                    );

                unsubscribeRefs.current.expenses =
                    firebaseService.subscribeToExpenses(
                        tripId,
                        (expensesData) => {
                            setExpenses(expensesData);
                        }
                    );

                unsubscribeRefs.current.notes =
                    firebaseService.subscribeToNotes(tripId, (notesData) => {
                        setNotes(notesData);
                    });

                unsubscribeRefs.current.tripNotes =
                    firebaseService.subscribeToTripNotes(
                        tripId,
                        (tripNotesData) => {
                            setTripNotes(tripNotesData);
                        }
                    );

                unsubscribeRefs.current.activities =
                    firebaseService.subscribeToActivities(
                        tripId,
                        (activitiesData) => {
                            setActivities(activitiesData);
                        }
                    );

                unsubscribeRefs.current.trip = firebaseService.subscribeToTrip(
                    tripId,
                    (updatedTrip: FirestoreTrip | null) => {
                        if (updatedTrip) {
                            setTrip(updatedTrip);
                        }
                    }
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
            Object.values(unsubscribeRefs.current).forEach((unsubscribe) => {
                if (unsubscribe && typeof unsubscribe === "function") {
                    unsubscribe();
                }
            });
            unsubscribeRefs.current = {};
        };
    }, [tripId, user]);

    return {
        trip,
        checklist,
        expenses,
        notes,
        tripNotes,
        activities,
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
