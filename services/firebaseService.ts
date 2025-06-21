import firebase from "firebase/app";
import "firebase/firestore";
import { getChecklistTemplate } from "../constants/ChecklistTemplates";

// ==========================================
// UTILITAIRES DE CONVERSION
// ==========================================

// Convertit un timestamp Firebase en Date JavaScript
export const convertFirebaseTimestamp = (timestamp: any): Date => {
    if (!timestamp) return new Date();

    // Si c'est déjà un objet Date
    if (timestamp instanceof Date) return timestamp;

    // Si c'est un timestamp Firebase
    if (
        timestamp &&
        timestamp.toDate &&
        typeof timestamp.toDate === "function"
    ) {
        return timestamp.toDate();
    }

    // Si c'est un timestamp en millisecondes
    if (typeof timestamp === "number") {
        return new Date(timestamp);
    }

    // Si c'est une string
    if (typeof timestamp === "string") {
        return new Date(timestamp);
    }

    // Fallback
    return new Date();
};

// Convertit un objet Firestore en objet avec dates converties
export const convertFirestoreTrip = (doc: any): FirestoreTrip => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        startDate: convertFirebaseTimestamp(data.startDate),
        endDate: convertFirebaseTimestamp(data.endDate),
        createdAt: convertFirebaseTimestamp(data.createdAt),
        updatedAt: convertFirebaseTimestamp(data.updatedAt),
        members:
            data.members?.map((member: any) => ({
                ...member,
                joinedAt: convertFirebaseTimestamp(member.joinedAt),
            })) || [],
    };
};

// Convertit une checklist Firestore avec timestamps
export const convertFirestoreChecklist = (data: any): TripChecklist => {
    return {
        ...data,
        updatedAt: convertFirebaseTimestamp(data.updatedAt),
        items:
            data.items?.map((item: any) => ({
                ...item,
                createdAt: convertFirebaseTimestamp(item.createdAt),
                completedAt: item.completedAt
                    ? convertFirebaseTimestamp(item.completedAt)
                    : undefined,
            })) || [],
    };
};

// ==========================================
// TYPES FIRESTORE
// ==========================================

export interface FirestoreTrip {
    id: string;
    title: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    type: "plage" | "montagne" | "citytrip" | "campagne";
    coverImage?: string;
    creatorId: string;
    creatorName: string;
    members: TripMember[];
    inviteCode: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TripMember {
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    role: "creator" | "member";
    joinedAt: Date;
}

export interface ChecklistItem {
    id: string;
    tripId: string;
    title: string;
    description?: string;
    category: string;
    assignedTo?: string;
    isCompleted: boolean;
    completedBy?: string;
    completedAt?: Date;
    createdBy: string;
    createdAt: Date;
}

export interface TripChecklist {
    tripId: string;
    items: ChecklistItem[];
    updatedAt: Date;
    updatedBy: string;
}

export interface ExpenseItem {
    id: string;
    label: string;
    amount: number;
    paidBy: string;
    paidByName: string;
    splitBetween: string[]; // userIds
    date: Date;
    createdAt: Date;
}

export interface TripExpenses {
    tripId: string;
    expenses: ExpenseItem[];
    updatedAt: Date;
    updatedBy: string;
}

export interface TripNotes {
    tripId: string;
    content: string;
    updatedAt: Date;
    updatedBy: string;
    updatedByName: string;
}

export interface TripActivity {
    id: string;
    title: string;
    description?: string;
    date: Date;
    startTime?: string;
    endTime?: string;
    location?: string;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
}

export interface TripActivities {
    tripId: string;
    activities: TripActivity[];
    updatedAt: Date;
    updatedBy: string;
}

// ==========================================
// SERVICE PRINCIPAL
// ==========================================

class FirebaseService {
    private db = firebase.firestore();

    // ==========================================
    // TRIPS
    // ==========================================

    async createTrip(
        tripData: Omit<FirestoreTrip, "id" | "createdAt" | "updatedAt">
    ): Promise<string> {
        try {
            // Nettoyer les valeurs undefined pour Firebase
            const cleanedData = Object.fromEntries(
                Object.entries(tripData).filter(
                    ([_, value]) => value !== undefined
                )
            );

            const docRef = await this.db.collection("trips").add({
                ...cleanedData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

            // Créer les sous-collections vides
            await this.initializeTripSubcollections(
                docRef.id,
                tripData.type,
                tripData.creatorId,
                tripData.creatorName
            );

            return docRef.id;
        } catch (error) {
            console.error("Erreur création voyage:", error);
            throw new Error("Impossible de créer le voyage");
        }
    }

    private async initializeTripSubcollections(
        tripId: string,
        tripType: "plage" | "montagne" | "citytrip" | "campagne",
        creatorId: string,
        creatorName: string
    ) {
        // Obtenir le template de checklist pour ce type de voyage
        const checklistTemplate = getChecklistTemplate(tripType);

        // Créer les items de checklist avec des IDs uniques
        const checklistItems: ChecklistItem[] = checklistTemplate.map(
            (template, index) => {
                const item: any = {
                    id: `${tripId}_item_${Date.now()}_${index}`,
                    tripId: tripId,
                    title: template.title,
                    category: template.category,
                    isCompleted: false,
                    createdBy: creatorId,
                    createdAt: new Date(),
                };

                // Ajouter description seulement si elle existe
                if (template.description) {
                    item.description = template.description;
                }

                // assignedTo sera ajouté plus tard par l'utilisateur
                // Pas besoin de l'initialiser ici

                return item;
            }
        );

        const batch = [
            // Checklist pré-remplie selon le type de voyage
            this.db.collection("checklists").add({
                tripId,
                items: checklistItems,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: creatorId,
            }),
            // Dépenses vides
            this.db.collection("expenses").add({
                tripId,
                expenses: [],
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: creatorId,
            }),
            // Notes vides
            this.db.collection("notes").add({
                tripId,
                content: "",
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: creatorId,
                updatedByName: creatorName,
            }),
            // Activités vides
            this.db.collection("activities").add({
                tripId,
                activities: [],
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: creatorId,
            }),
        ];

        await Promise.all(batch);
    }

    async getTripById(tripId: string): Promise<FirestoreTrip | null> {
        try {
            const docRef = this.db.collection("trips").doc(tripId);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                return convertFirestoreTrip(docSnap);
            }
            return null;
        } catch (error) {
            console.error("Erreur récupération voyage:", error);
            return null;
        }
    }

    async getTripByInviteCode(
        inviteCode: string
    ): Promise<FirestoreTrip | null> {
        try {
            const querySnapshot = await this.db
                .collection("trips")
                .where("inviteCode", "==", inviteCode)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return convertFirestoreTrip(doc);
            }
            return null;
        } catch (error) {
            console.error("Erreur recherche code invitation:", error);
            return null;
        }
    }

    async getUserTrips(userId: string): Promise<FirestoreTrip[]> {
        try {
            console.log(
                "🔍 Récupération des voyages pour l'utilisateur:",
                userId
            );

            // Récupérer tous les voyages sans orderBy pour éviter les erreurs d'index
            const querySnapshot = await this.db.collection("trips").get();

            console.log("📊 Nombre de voyages trouvés:", querySnapshot.size);

            // Filtrer côté client pour les membres
            const trips = querySnapshot.docs
                .map((doc) => {
                    const data = doc.data();
                    console.log("🏷️ Voyage trouvé:", doc.id, data);

                    // Utiliser la fonction de conversion
                    const trip = convertFirestoreTrip(doc);

                    return trip;
                })
                .filter((trip) => {
                    const isMember = trip.members.some(
                        (member) => member.userId === userId
                    );
                    const isCreator = trip.creatorId === userId;
                    const hasAccess = isMember || isCreator;

                    console.log("🔐 Vérification accès voyage:", {
                        tripId: trip.id,
                        userId,
                        creatorId: trip.creatorId,
                        isCreator,
                        isMember,
                        hasAccess,
                        members: trip.members.map((m) => ({
                            userId: m.userId,
                            name: m.name || "Nom inconnu",
                        })),
                    });

                    return hasAccess;
                });

            console.log("✅ Voyages filtrés pour l'utilisateur:", trips.length);
            return trips;
        } catch (error) {
            console.error("❌ Erreur récupération voyages utilisateur:", error);
            return [];
        }
    }

    async joinTrip(tripId: string, member: TripMember): Promise<void> {
        try {
            const tripRef = this.db.collection("trips").doc(tripId);
            await tripRef.update({
                members: firebase.firestore.FieldValue.arrayUnion(member),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error("Erreur rejoindre voyage:", error);
            throw new Error("Impossible de rejoindre le voyage");
        }
    }

    // ==========================================
    // CHECKLIST
    // ==========================================

    subscribeToChecklist(
        tripId: string,
        callback: (checklist: TripChecklist | null) => void
    ): () => void {
        const unsubscribe = this.db
            .collection("checklists")
            .where("tripId", "==", tripId)
            .onSnapshot((snapshot) => {
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    const convertedChecklist = convertFirestoreChecklist(
                        doc.data()
                    );
                    callback(convertedChecklist);
                } else {
                    callback(null);
                }
            });

        return unsubscribe;
    }

    async updateChecklist(
        tripId: string,
        items: ChecklistItem[],
        userId: string
    ): Promise<void> {
        try {
            const querySnapshot = await this.db
                .collection("checklists")
                .where("tripId", "==", tripId)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await docRef.update({
                    items,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: userId,
                });
            }
        } catch (error) {
            console.error("Erreur mise à jour checklist:", error);
            throw new Error("Impossible de mettre à jour la checklist");
        }
    }

    // ==========================================
    // EXPENSES
    // ==========================================

    subscribeToExpenses(
        tripId: string,
        callback: (expenses: TripExpenses | null) => void
    ): () => void {
        const unsubscribe = this.db
            .collection("expenses")
            .where("tripId", "==", tripId)
            .onSnapshot((snapshot) => {
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    callback({
                        ...doc.data(),
                    } as TripExpenses);
                } else {
                    callback(null);
                }
            });

        return unsubscribe;
    }

    async updateExpenses(
        tripId: string,
        expenses: ExpenseItem[],
        userId: string
    ): Promise<void> {
        try {
            const querySnapshot = await this.db
                .collection("expenses")
                .where("tripId", "==", tripId)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await docRef.update({
                    expenses,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: userId,
                });
            }
        } catch (error) {
            console.error("Erreur mise à jour dépenses:", error);
            throw new Error("Impossible de mettre à jour les dépenses");
        }
    }

    // ==========================================
    // NOTES
    // ==========================================

    subscribeToNotes(
        tripId: string,
        callback: (notes: TripNotes | null) => void
    ): () => void {
        const unsubscribe = this.db
            .collection("notes")
            .where("tripId", "==", tripId)
            .onSnapshot((snapshot) => {
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    callback({
                        ...doc.data(),
                    } as TripNotes);
                } else {
                    callback(null);
                }
            });

        return unsubscribe;
    }

    async updateNotes(
        tripId: string,
        content: string,
        userId: string,
        userName: string
    ): Promise<void> {
        try {
            const querySnapshot = await this.db
                .collection("notes")
                .where("tripId", "==", tripId)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await docRef.update({
                    content,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: userId,
                    updatedByName: userName,
                });
            }
        } catch (error) {
            console.error("Erreur mise à jour notes:", error);
            throw new Error("Impossible de mettre à jour les notes");
        }
    }

    // ==========================================
    // ACTIVITIES
    // ==========================================

    subscribeToActivities(
        tripId: string,
        callback: (activities: TripActivities | null) => void
    ): () => void {
        const unsubscribe = this.db
            .collection("activities")
            .where("tripId", "==", tripId)
            .onSnapshot((snapshot) => {
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    callback({
                        ...doc.data(),
                    } as TripActivities);
                } else {
                    callback(null);
                }
            });

        return unsubscribe;
    }

    async getActivities(tripId: string): Promise<TripActivity[]> {
        try {
            const querySnapshot = await this.db
                .collection("activities")
                .where("tripId", "==", tripId)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const activitiesData = querySnapshot.docs[0].data();
                return activitiesData.activities || [];
            }
            return [];
        } catch (error) {
            console.error("Erreur récupération activités:", error);
            return [];
        }
    }

    async updateActivities(
        tripId: string,
        activities: TripActivity[],
        userId: string
    ): Promise<void> {
        try {
            const querySnapshot = await this.db
                .collection("activities")
                .where("tripId", "==", tripId)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await docRef.update({
                    activities,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: userId,
                });
            }
        } catch (error) {
            console.error("Erreur mise à jour activités:", error);
            throw new Error("Impossible de mettre à jour les activités");
        }
    }

    // ==========================================
    // UTILS
    // ==========================================

    generateInviteCode(): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    async isInviteCodeUnique(code: string): Promise<boolean> {
        const trip = await this.getTripByInviteCode(code);
        return trip === null;
    }

    async generateUniqueInviteCode(): Promise<string> {
        let code: string;
        let isUnique: boolean;

        do {
            code = this.generateInviteCode();
            isUnique = await this.isInviteCodeUnique(code);
        } while (!isUnique);

        return code;
    }

    // ==========================================
    // DELETE TRIP
    // ==========================================

    async deleteTrip(tripId: string, userId: string): Promise<void> {
        try {
            // Vérifier que l'utilisateur est le créateur
            const trip = await this.getTripById(tripId);
            if (!trip) {
                throw new Error("Voyage introuvable");
            }

            if (trip.creatorId !== userId) {
                throw new Error("Seul le créateur peut supprimer le voyage");
            }

            // Supprimer toutes les sous-collections en parallèle
            const deletePromises = [
                // Supprimer la checklist
                this.db
                    .collection("checklists")
                    .where("tripId", "==", tripId)
                    .get()
                    .then((snapshot) => {
                        const batch = this.db.batch();
                        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
                        return batch.commit();
                    }),

                // Supprimer les dépenses
                this.db
                    .collection("expenses")
                    .where("tripId", "==", tripId)
                    .get()
                    .then((snapshot) => {
                        const batch = this.db.batch();
                        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
                        return batch.commit();
                    }),

                // Supprimer les notes
                this.db
                    .collection("notes")
                    .where("tripId", "==", tripId)
                    .get()
                    .then((snapshot) => {
                        const batch = this.db.batch();
                        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
                        return batch.commit();
                    }),

                // Supprimer les activités
                this.db
                    .collection("activities")
                    .where("tripId", "==", tripId)
                    .get()
                    .then((snapshot) => {
                        const batch = this.db.batch();
                        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
                        return batch.commit();
                    }),
            ];

            // Attendre que toutes les sous-collections soient supprimées
            await Promise.all(deletePromises);

            // Enfin, supprimer le voyage principal
            await this.db.collection("trips").doc(tripId).delete();

            console.log("✅ Voyage supprimé avec succès:", tripId);

            // Émettre l'événement de suppression pour notifier tous les utilisateurs
            const { tripRefreshEmitter } = await import("../hooks/useTripSync");
            tripRefreshEmitter.emitTripDeleted(
                tripId,
                userId,
                trip.creatorName
            );
        } catch (error) {
            console.error("❌ Erreur suppression voyage:", error);
            throw new Error("Impossible de supprimer le voyage");
        }
    }
}

export default new FirebaseService();
