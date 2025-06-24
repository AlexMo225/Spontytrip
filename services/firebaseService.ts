import firebase from "firebase/app";
import "firebase/firestore";
import { getChecklistTemplate } from "../constants/ChecklistTemplates";

// Import des nouveaux types pour l'activity feed
import type { ActivityActionType, ActivityLogEntry } from "../types";

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
            data.members?.map((member: TripMember) => ({
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

// Convertit une activité Firestore avec timestamps
export const convertFirestoreActivities = (data: any): TripActivities => {
    return {
        tripId: data.tripId,
        activities: (data.activities || []).map((activity: any) => ({
            ...activity,
            date: convertFirebaseTimestamp(activity.date),
            createdAt: convertFirebaseTimestamp(activity.createdAt),
        })),
        updatedAt: convertFirebaseTimestamp(data.updatedAt),
        updatedBy: data.updatedBy,
    };
};

export interface TripMember {
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    role: "creator" | "member";
    joinedAt: Date;
}

export interface FirestoreTrip {
    id: string;
    title: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    type: "plage" | "montagne" | "citytrip" | "campagne";
    coverImage?: string;
    creatorId: string;
    creatorName: string;
    inviteCode: string;
    members: TripMember[];
    memberIds?: string[]; // Array simple des UIDs pour les règles Firebase
    createdAt: Date;
    updatedAt: Date;
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
    tripId: string;
    label: string;
    amount: number;
    paidBy: string;
    paidByName: string;
    participants: string[]; // UIDs des participants concernés
    participantNames: string[]; // Noms des participants
    date: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt?: Date;
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

// Nouvelle interface pour les notes individuelles
export interface TripNote {
    id: string;
    tripId: string;
    content: string;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    updatedAt: Date;
    authorAvatar?: string;
    isImportant?: boolean;
}

// Collection de notes pour un voyage
export interface TripNotesCollection {
    tripId: string;
    notes: TripNote[];
    totalNotes: number;
    lastUpdated: Date;
}

export interface TripActivity {
    id: string;
    title: string;
    description?: string;
    location?: string;
    link?: string; // Lien optionnel (URL vers billetterie, site officiel, etc.)
    date: Date;
    startTime?: string;
    endTime?: string;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    votes: string[]; // UIDs des membres ayant voté
    validated?: boolean; // Activité validée par le créateur
    status?: "pending" | "validated" | "in_progress" | "completed" | "past";
}

export interface TripActivities {
    tripId: string;
    activities: TripActivity[];
    updatedAt: Date;
    updatedBy: string;
}

export interface ExpensesSummary {
    totalExpenses: number;
    memberBalances: MemberBalance[];
    debtsToSettle: DebtCalculation[];
    myBalance: MemberBalance | null;
}

export interface MemberBalance {
    userId: string;
    userName: string;
    totalPaid: number;
    totalOwed: number;
    balance: number;
}

export interface DebtCalculation {
    from: string;
    fromName: string;
    to: string;
    toName: string;
    amount: number;
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
            console.log("🚀 Création d'un nouveau voyage:", tripData.title);

            // Nettoyer les valeurs undefined pour Firebase
            const cleanedData = Object.fromEntries(
                Object.entries(tripData).filter(
                    ([_, value]) => value !== undefined
                )
            );

            // CRITIQUE: Ajouter memberIds pour les règles Firebase
            const memberIds = [tripData.creatorId];

            // Ajouter les IDs des membres existants (si fournis)
            if (tripData.members && Array.isArray(tripData.members)) {
                tripData.members.forEach((member) => {
                    if (member.userId && !memberIds.includes(member.userId)) {
                        memberIds.push(member.userId);
                    }
                });
            }

            console.log("✅ memberIds créés:", memberIds);

            const docRef = await this.db.collection("trips").add({
                ...cleanedData,
                memberIds: memberIds, // AJOUT CRITIQUE pour les règles Firebase
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

            console.log("✅ Voyage créé avec ID:", docRef.id);

            // Créer les sous-collections vides
            await this.initializeTripSubcollections(
                docRef.id,
                tripData.type,
                tripData.creatorId,
                tripData.creatorName
            );

            console.log("✅ Sous-collections initialisées");
            return docRef.id;
        } catch (error) {
            console.error("❌ Erreur création voyage:", error);
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
                        members: trip.members.map((m: TripMember) => ({
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
            console.log(`🚀 Tentative de rejoindre le voyage ${tripId}`);
            console.log(`👤 Membre à ajouter:`, {
                userId: member.userId,
                name: member.name,
                email: member.email,
                role: member.role,
            });

            const tripRef = this.db.collection("trips").doc(tripId);

            // Vérifier d'abord que le voyage existe
            const tripDoc = await tripRef.get();
            if (!tripDoc.exists) {
                throw new Error("Voyage introuvable");
            }

            const tripData = tripDoc.data();
            console.log(`📊 Voyage trouvé:`, {
                title: tripData?.title,
                creatorId: tripData?.creatorId,
                currentMemberIds: tripData?.memberIds || [],
                currentMembersCount: tripData?.members?.length || 0,
            });

            // Vérifier si l'utilisateur n'est pas déjà membre
            const currentMemberIds = tripData?.memberIds || [];
            if (currentMemberIds.includes(member.userId)) {
                throw new Error("Vous êtes déjà membre de ce voyage");
            }

            console.log(`✅ Ajout du membre autorisé, mise à jour...`);

            await tripRef.update({
                members: firebase.firestore.FieldValue.arrayUnion(member),
                memberIds: firebase.firestore.FieldValue.arrayUnion(
                    member.userId
                ),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

            // Attendre un petit moment pour que les permissions se propagent
            await new Promise((resolve) => setTimeout(resolve, 500));

            console.log(`✅ Membre ajouté avec succès au voyage ${tripId}`);
        } catch (error) {
            console.error("❌ Erreur rejoindre voyage:", error);

            // Messages d'erreur plus spécifiques
            if (error instanceof Error) {
                if (error.message.includes("insufficient permissions")) {
                    throw new Error(
                        "Permissions insuffisantes pour rejoindre ce voyage"
                    );
                } else if (error.message.includes("déjà membre")) {
                    throw new Error(error.message);
                } else if (error.message.includes("introuvable")) {
                    throw new Error("Voyage introuvable");
                }
            }

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
        console.log(`🔄 Subscription checklist pour voyage ${tripId}`);

        const unsubscribe = this.db
            .collection("checklists")
            .where("tripId", "==", tripId)
            .onSnapshot(
                (snapshot) => {
                    try {
                        console.log(
                            `📊 Snapshot checklist reçu - ${snapshot.size} documents`
                        );

                        if (!snapshot.empty) {
                            const doc = snapshot.docs[0];
                            const rawData = doc.data();

                            console.log(`📝 Données brutes checklist:`, {
                                tripId: rawData.tripId,
                                itemsCount: rawData.items?.length || 0,
                                updatedBy: rawData.updatedBy,
                                items:
                                    rawData.items?.map((item: any) => ({
                                        id: item.id,
                                        title: item.title,
                                        category: item.category,
                                    })) || [],
                            });

                            const convertedChecklist =
                                convertFirestoreChecklist(rawData);

                            console.log(
                                `✅ Checklist convertie - ${convertedChecklist.items.length} items`
                            );
                            callback(convertedChecklist);
                        } else {
                            console.log("📭 Aucune checklist trouvée");
                            callback(null);
                        }
                    } catch (error) {
                        console.error(
                            "❌ Erreur dans subscribeToChecklist:",
                            error
                        );
                        callback(null);
                    }
                },
                (error) => {
                    console.error("❌ Erreur snapshot checklist:", error);
                    callback(null);
                }
            );

        return unsubscribe;
    }

    async updateChecklist(
        tripId: string,
        items: ChecklistItem[],
        userId: string
    ): Promise<void> {
        try {
            console.log(`🔄 Mise à jour checklist pour voyage ${tripId}`);
            console.log(`📝 ${items.length} items à traiter`);

            // Nettoyer les items pour supprimer les valeurs undefined
            const cleanedItems = items.map((item) => {
                const cleanedItem: any = {
                    id: item.id,
                    tripId: item.tripId,
                    title: item.title,
                    category: item.category,
                    isCompleted: item.isCompleted,
                    createdBy: item.createdBy,
                    createdAt: item.createdAt,
                };

                // Ajouter seulement les champs définis (non undefined)
                if (
                    item.description !== undefined &&
                    item.description !== null
                ) {
                    cleanedItem.description = item.description;
                }
                if (item.assignedTo !== undefined && item.assignedTo !== null) {
                    cleanedItem.assignedTo = item.assignedTo;
                }
                if (
                    item.completedBy !== undefined &&
                    item.completedBy !== null
                ) {
                    cleanedItem.completedBy = item.completedBy;
                }
                if (
                    item.completedAt !== undefined &&
                    item.completedAt !== null
                ) {
                    cleanedItem.completedAt = item.completedAt;
                }

                return cleanedItem as ChecklistItem;
            });

            console.log("✅ Items nettoyés:", cleanedItems.length);

            const querySnapshot = await this.db
                .collection("checklists")
                .where("tripId", "==", tripId)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;

                // Préparer les données pour Firebase (aucune valeur undefined)
                const updateData = {
                    items: cleanedItems,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: userId,
                };

                console.log("🚀 Envoi vers Firebase...");
                await docRef.update(updateData);
                console.log("✅ Checklist mise à jour avec succès");
            } else {
                console.log("⚠️ Aucune checklist trouvée pour ce voyage");
                throw new Error("Checklist introuvable pour ce voyage");
            }

            // Note: Le logging d'activité est géré séparément dans les screens
        } catch (error) {
            console.error("❌ Erreur mise à jour checklist:", error);
            throw new Error("Impossible de mettre à jour la checklist");
        }
    }

    // ==========================================
    // EXPENSES
    // ==========================================

    async addExpense(
        tripId: string,
        expense: Omit<ExpenseItem, "id" | "createdAt" | "updatedAt">,
        userId: string
    ): Promise<void> {
        try {
            const querySnapshot = await this.db
                .collection("expenses")
                .where("tripId", "==", tripId)
                .limit(1)
                .get();

            const expenseData = {
                ...expense,
                id: `${tripId}_expense_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            if (!querySnapshot.empty) {
                // Ajouter à la liste existante
                const docRef = querySnapshot.docs[0].ref;
                const currentData =
                    querySnapshot.docs[0].data() as TripExpenses;
                const updatedExpenses = [
                    ...(currentData.expenses || []),
                    expenseData,
                ];

                await docRef.update({
                    expenses: updatedExpenses,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: userId,
                });
            } else {
                // Créer le document dépenses
                await this.db.collection("expenses").add({
                    tripId,
                    expenses: [expenseData],
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: userId,
                });
            }

            // Note: Le logging d'activité est géré séparément dans les screens
        } catch (error) {
            console.error("Erreur ajout dépense:", error);
            throw new Error("Impossible d'ajouter la dépense");
        }
    }

    async updateExpense(
        tripId: string,
        expenseId: string,
        updates: Partial<ExpenseItem>,
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
                const currentData =
                    querySnapshot.docs[0].data() as TripExpenses;

                const updatedExpenses = currentData.expenses.map((expense) =>
                    expense.id === expenseId
                        ? { ...expense, ...updates, updatedAt: new Date() }
                        : expense
                );

                await docRef.update({
                    expenses: updatedExpenses,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: userId,
                });
            }
        } catch (error) {
            console.error("Erreur modification dépense:", error);
            throw new Error("Impossible de modifier la dépense");
        }
    }

    async deleteExpense(
        tripId: string,
        expenseId: string,
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
                const currentData =
                    querySnapshot.docs[0].data() as TripExpenses;

                const filteredExpenses = currentData.expenses.filter(
                    (expense) => expense.id !== expenseId
                );

                await docRef.update({
                    expenses: filteredExpenses,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: userId,
                });
            }
        } catch (error) {
            console.error("Erreur suppression dépense:", error);
            throw new Error("Impossible de supprimer la dépense");
        }
    }

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
                    const data = doc.data() as TripExpenses;
                    // Convertir les timestamps
                    const convertedData = {
                        ...data,
                        updatedAt: convertFirebaseTimestamp(data.updatedAt),
                        expenses:
                            data.expenses?.map((expense) => ({
                                ...expense,
                                date: convertFirebaseTimestamp(expense.date),
                                createdAt: convertFirebaseTimestamp(
                                    expense.createdAt
                                ),
                                updatedAt: expense.updatedAt
                                    ? convertFirebaseTimestamp(
                                          expense.updatedAt
                                      )
                                    : undefined,
                            })) || [],
                    };
                    callback(convertedData);
                } else {
                    callback(null);
                }
            });

        return unsubscribe;
    }

    // ==========================================
    // NOTES - Système de notes multiples
    // ==========================================

    // Souscrire aux notes d'un voyage (nouvelle structure)
    subscribeToTripNotes(
        tripId: string,
        callback: (notes: TripNote[]) => void
    ): () => void {
        const unsubscribe = this.db
            .collection("trips")
            .doc(tripId)
            .collection("notes")
            .orderBy("updatedAt", "desc")
            .onSnapshot((snapshot) => {
                const notes: TripNote[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    notes.push({
                        id: doc.id,
                        tripId: tripId,
                        content: data.content,
                        createdBy: data.createdBy,
                        createdByName: data.createdByName,
                        createdAt: convertFirebaseTimestamp(data.createdAt),
                        updatedAt: convertFirebaseTimestamp(data.updatedAt),
                        authorAvatar: data.authorAvatar,
                        isImportant: data.isImportant || false,
                    });
                });
                callback(notes);
            });

        return unsubscribe;
    }

    // Créer une nouvelle note
    async createNote(
        tripId: string,
        content: string,
        userId: string,
        userName: string,
        isImportant: boolean = false
    ): Promise<string> {
        try {
            const noteRef = this.db
                .collection("trips")
                .doc(tripId)
                .collection("notes")
                .doc();

            const now = firebase.firestore.FieldValue.serverTimestamp();

            await noteRef.set({
                content,
                createdBy: userId,
                createdByName: userName,
                createdAt: now,
                updatedAt: now,
                isImportant,
            });

            // Note: Le logging d'activité est géré séparément dans les screens

            return noteRef.id;
        } catch (error) {
            console.error("Erreur création note:", error);
            throw new Error("Impossible de créer la note");
        }
    }

    // Modifier une note existante
    async updateNote(
        tripId: string,
        noteId: string,
        content: string,
        userId: string,
        isImportant?: boolean
    ): Promise<void> {
        try {
            const noteRef = this.db
                .collection("trips")
                .doc(tripId)
                .collection("notes")
                .doc(noteId);

            const updateData: any = {
                content,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            if (isImportant !== undefined) {
                updateData.isImportant = isImportant;
            }

            await noteRef.update(updateData);
        } catch (error) {
            console.error("Erreur mise à jour note:", error);
            throw new Error("Impossible de mettre à jour la note");
        }
    }

    // Supprimer une note
    async deleteNote(tripId: string, noteId: string): Promise<void> {
        try {
            await this.db
                .collection("trips")
                .doc(tripId)
                .collection("notes")
                .doc(noteId)
                .delete();
        } catch (error) {
            console.error("Erreur suppression note:", error);
            throw new Error("Impossible de supprimer la note");
        }
    }

    // Vérifier si l'utilisateur peut modifier/supprimer une note
    canEditNote(
        note: TripNote,
        userId: string,
        tripCreatorId: string
    ): boolean {
        return note.createdBy === userId || tripCreatorId === userId;
    }

    // Migration des anciennes notes vers le nouveau système
    async migrateOldNotesToNewSystem(tripId: string): Promise<void> {
        try {
            // Récupérer l'ancienne note s'il y en a une
            const querySnapshot = await this.db
                .collection("notes")
                .where("tripId", "==", tripId)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const oldNoteDoc = querySnapshot.docs[0];
                const oldNoteData = oldNoteDoc.data();

                // Créer une nouvelle note dans le nouveau système
                const noteRef = this.db
                    .collection("trips")
                    .doc(tripId)
                    .collection("notes")
                    .doc();

                const now = firebase.firestore.FieldValue.serverTimestamp();

                await noteRef.set({
                    content: oldNoteData.content,
                    createdBy: oldNoteData.updatedBy,
                    createdByName: oldNoteData.updatedByName,
                    createdAt: oldNoteData.updatedAt,
                    updatedAt: now,
                    isImportant: false,
                });

                // Optionnel : supprimer l'ancienne note
                // await oldNoteDoc.ref.delete();

                console.log(`✅ Migration réussie pour le voyage ${tripId}`);
            }
        } catch (error) {
            console.error("Erreur migration notes:", error);
        }
    }

    // Ancienne fonction pour compatibilité (système de notes unique)
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
                    const data = doc.data();
                    callback({
                        tripId: data.tripId,
                        content: data.content,
                        updatedAt: convertFirebaseTimestamp(data.updatedAt),
                        updatedBy: data.updatedBy,
                        updatedByName: data.updatedByName,
                    } as TripNotes);
                } else {
                    callback(null);
                }
            });

        return unsubscribe;
    }

    // Ancienne fonction pour compatibilité (système de notes unique)
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
                    const rawData = doc.data();
                    const convertedData = convertFirestoreActivities(rawData);
                    callback(convertedData);
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
                const rawData = querySnapshot.docs[0].data();
                const convertedData = convertFirestoreActivities(rawData);
                return convertedData.activities || [];
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
            // Nettoyer les activités pour éviter les valeurs undefined
            const cleanedActivities = activities.map((activity) => {
                const cleaned: any = {
                    id: activity.id,
                    title: activity.title,
                    date: activity.date,
                    createdBy: activity.createdBy,
                    createdByName: activity.createdByName,
                    createdAt: activity.createdAt,
                };

                // Ajouter seulement les champs définis
                if (activity.description) {
                    cleaned.description = activity.description;
                }
                if (activity.startTime) {
                    cleaned.startTime = activity.startTime;
                }
                if (activity.endTime) {
                    cleaned.endTime = activity.endTime;
                }
                if (activity.location) {
                    cleaned.location = activity.location;
                }
                if (activity.link) {
                    cleaned.link = activity.link;
                }

                return cleaned as TripActivity;
            });

            const querySnapshot = await this.db
                .collection("activities")
                .where("tripId", "==", tripId)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await docRef.update({
                    activities: cleanedActivities,
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
    // UTILITIES - CALCULS DE DÉPENSES
    // ==========================================

    calculateExpensesSummary(
        expenses: ExpenseItem[],
        tripMembers: { userId: string; name: string }[],
        currentUserId: string
    ): ExpensesSummary {
        console.log("🧮 === CALCUL DES SOLDES ===");
        console.log("Dépenses:", expenses.length);
        console.log(
            "Membres:",
            tripMembers.map((m) => m.name)
        );

        // Initialiser les balances pour tous les membres
        const balances: { [userId: string]: MemberBalance } = {};
        tripMembers.forEach((member) => {
            balances[member.userId] = {
                userId: member.userId,
                userName: member.name,
                totalPaid: 0,
                totalOwed: 0,
                balance: 0,
            };
        });

        // Calculer les montants payés et dus
        expenses.forEach((expense) => {
            console.log(`\n💰 Dépense: ${expense.label} - ${expense.amount}€`);
            console.log(`   Payé par: ${expense.paidByName}`);
            console.log(
                `   Participants (${expense.participants.length}):`,
                expense.participantNames
            );

            // Debug approfondi si nécessaire
            this.debugExpense(expense, balances);

            // Celui qui a payé
            if (balances[expense.paidBy]) {
                balances[expense.paidBy].totalPaid += expense.amount;
                console.log(
                    `   ✅ ${expense.paidByName} a avancé ${expense.amount}€`
                );
            } else {
                console.log(
                    `   ⚠️ Payeur ${expense.paidByName} introuvable dans les membres`
                );
            }

            // Ceux qui doivent (répartition égale)
            const amountPerPerson =
                expense.amount / expense.participants.length;
            console.log(
                `   💸 Montant par personne: ${amountPerPerson.toFixed(2)}€`
            );

            expense.participants.forEach((participantId) => {
                if (balances[participantId]) {
                    balances[participantId].totalOwed += amountPerPerson;
                    const participantName = balances[participantId].userName;
                    console.log(
                        `   📋 ${participantName} doit ${amountPerPerson.toFixed(
                            2
                        )}€`
                    );
                } else {
                    console.log(
                        `   ⚠️ Participant ${participantId} introuvable dans les membres`
                    );
                }
            });
        });

        // Calculer les soldes finaux
        console.log("\n🏦 === CALCUL DES SOLDES FINAUX ===");
        let totalBalance = 0;
        Object.values(balances).forEach((balance) => {
            balance.balance =
                Math.round((balance.totalPaid - balance.totalOwed) * 100) / 100;
            totalBalance += balance.balance;

            console.log(`${balance.userName}:`);
            console.log(`  💳 Total avancé: ${balance.totalPaid.toFixed(2)}€`);
            console.log(`  💸 Total dû: ${balance.totalOwed.toFixed(2)}€`);
            console.log(
                `  🏦 Solde: ${
                    balance.balance >= 0 ? "+" : ""
                }${balance.balance.toFixed(2)}€`
            );
        });

        // Validation de l'équilibre
        const balanceArray = Object.values(balances);
        const isBalanced = this.validateBalances(balanceArray);

        // Vérification de l'équilibre (log supplémentaire)
        console.log(
            `\n⚖️ Somme totale des soldes: ${totalBalance.toFixed(2)}€`
        );
        if (Math.abs(totalBalance) > 0.01) {
            console.warn("⚠️ ATTENTION: Les soldes ne sont pas équilibrés !");
        } else {
            console.log("✅ Les soldes sont parfaitement équilibrés");
        }

        // Calculer les dettes à régler
        const debtsToSettle = this.calculateDebts(Object.values(balances));
        console.log(`\n💰 Remboursements nécessaires: ${debtsToSettle.length}`);
        debtsToSettle.forEach((debt) => {
            console.log(
                `  ${debt.fromName} doit ${debt.amount.toFixed(2)}€ à ${
                    debt.toName
                }`
            );
        });

        const result = {
            totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
            memberBalances: Object.values(balances),
            debtsToSettle,
            myBalance: balances[currentUserId] || null,
        };

        console.log(
            `\n👤 Mon solde (${
                balances[currentUserId]?.userName
            }): ${result.myBalance?.balance.toFixed(2)}€`
        );
        console.log("🧮 === FIN CALCUL ===\n");

        return result;
    }

    private calculateDebts(balances: MemberBalance[]): DebtCalculation[] {
        const debts: DebtCalculation[] = [];

        // Créer des copies pour ne pas modifier les originaux
        const creditors = balances
            .filter((b) => b.balance > 0.01)
            .map((b) => ({ ...b }));
        const debtors = balances
            .filter((b) => b.balance < -0.01)
            .map((b) => ({ ...b }));

        // Algorithme simple : chaque débiteur rembourse proportionnellement à tous les créditeurs
        debtors.forEach((debtor) => {
            const totalDebt = Math.abs(debtor.balance);
            const totalCredit = creditors.reduce(
                (sum, c) => sum + c.balance,
                0
            );

            creditors.forEach((creditor) => {
                if (creditor.balance > 0.01 && totalCredit > 0) {
                    // Calculer la part proportionnelle que ce débiteur doit à ce créditeur
                    const proportionalAmount =
                        (creditor.balance / totalCredit) * totalDebt;

                    if (proportionalAmount > 0.01) {
                        // Éviter les micro-centimes
                        debts.push({
                            from: debtor.userId,
                            fromName: debtor.userName,
                            to: creditor.userId,
                            toName: creditor.userName,
                            amount: Math.round(proportionalAmount * 100) / 100,
                        });
                    }
                }
            });
        });

        return debts;
    }

    // Fonction utilitaire pour valider l'équilibre des soldes
    private validateBalances(balances: MemberBalance[]): boolean {
        const totalBalance = balances.reduce(
            (sum, balance) => sum + balance.balance,
            0
        );
        const isBalanced = Math.abs(totalBalance) < 0.01; // Tolérance pour les arrondis

        if (!isBalanced) {
            console.error("❌ ERREUR: Les soldes ne sont pas équilibrés !");
            console.error("Somme totale:", totalBalance.toFixed(4));
            console.error("Détail des soldes:");
            balances.forEach((balance) => {
                console.error(
                    `  ${balance.userName}: ${balance.balance.toFixed(2)}€`
                );
            });
        }

        return isBalanced;
    }

    // Fonction utilitaire pour débugger une dépense spécifique
    private debugExpense(
        expense: ExpenseItem,
        balances: { [userId: string]: MemberBalance }
    ) {
        console.log(`\n🔍 DEBUG DÉPENSE: ${expense.label}`);
        console.log(`💰 Montant total: ${expense.amount}€`);
        console.log(`👤 Payé par: ${expense.paidByName} (${expense.paidBy})`);
        console.log(`👥 Participants: ${expense.participantNames.join(", ")}`);
        console.log(
            `💸 Montant par personne: ${(
                expense.amount / expense.participants.length
            ).toFixed(2)}€`
        );

        // Vérifier que tous les participants existent
        expense.participants.forEach((participantId) => {
            if (!balances[participantId]) {
                console.error(
                    `❌ ERREUR: Participant ${participantId} introuvable !`
                );
            }
        });

        // Vérifier que le payeur existe
        if (!balances[expense.paidBy]) {
            console.error(`❌ ERREUR: Payeur ${expense.paidBy} introuvable !`);
        }
    }

    // ==========================================
    // UTILITIES - GÉNÉRATION ET VALIDATION
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
        const querySnapshot = await this.db
            .collection("trips")
            .where("inviteCode", "==", code)
            .limit(1)
            .get();
        return querySnapshot.empty;
    }

    async generateUniqueInviteCode(): Promise<string> {
        let code: string;
        let isUnique = false;

        do {
            code = this.generateInviteCode();
            isUnique = await this.isInviteCodeUnique(code);
        } while (!isUnique);

        return code;
    }

    // ==========================================
    // TRIP MANAGEMENT - SUPPRESSION
    // ==========================================

    async deleteTrip(tripId: string, userId: string): Promise<void> {
        try {
            const trip = await this.getTripById(tripId);
            if (!trip) {
                throw new Error("Voyage introuvable");
            }

            if (trip.creatorId !== userId) {
                throw new Error("Seul le créateur du voyage peut le supprimer");
            }

            // Supprimer toutes les sous-collections
            const batch = this.db.batch();

            // Supprimer la checklist
            const checklistQuery = await this.db
                .collection("checklist")
                .where("tripId", "==", tripId)
                .get();
            checklistQuery.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // Supprimer les dépenses
            const expensesQuery = await this.db
                .collection("expenses")
                .where("tripId", "==", tripId)
                .get();
            expensesQuery.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // Supprimer les notes (ancien système)
            const notesQuery = await this.db
                .collection("notes")
                .where("tripId", "==", tripId)
                .get();
            notesQuery.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // Supprimer les activités
            const activitiesQuery = await this.db
                .collection("activities")
                .where("tripId", "==", tripId)
                .get();
            activitiesQuery.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // Supprimer les notes du nouveau système
            const tripNotesQuery = await this.db
                .collection("trips")
                .doc(tripId)
                .collection("notes")
                .get();
            tripNotesQuery.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // Supprimer le voyage lui-même
            batch.delete(this.db.collection("trips").doc(tripId));

            await batch.commit();
        } catch (error) {
            console.error("Erreur suppression voyage:", error);
            throw error;
        }
    }

    // ==========================================
    // TRIP MANAGEMENT - MISE À JOUR COVER IMAGE
    // ==========================================

    async updateTripCoverImage(
        tripId: string,
        coverImage: string | null,
        userId: string
    ): Promise<void> {
        try {
            const trip = await this.getTripById(tripId);
            if (!trip) {
                throw new Error("Voyage introuvable");
            }

            if (trip.creatorId !== userId) {
                throw new Error(
                    "Seul le créateur peut modifier l'image de couverture"
                );
            }

            await this.db.collection("trips").doc(tripId).update({
                coverImage,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error("Erreur mise à jour image:", error);
            throw error;
        }
    }

    // ==========================================
    // TRIP SUBSCRIPTION - TEMPS RÉEL
    // ==========================================

    subscribeToTrip(
        tripId: string,
        callback: (trip: FirestoreTrip | null) => void
    ): () => void {
        const unsubscribe = this.db
            .collection("trips")
            .doc(tripId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data) {
                        // Convertir manuellement au lieu d'utiliser convertFirestoreTrip
                        const convertedTrip: FirestoreTrip = {
                            id: doc.id,
                            ...data,
                            startDate: convertFirebaseTimestamp(data.startDate),
                            endDate: convertFirebaseTimestamp(data.endDate),
                            createdAt: convertFirebaseTimestamp(data.createdAt),
                            updatedAt: convertFirebaseTimestamp(data.updatedAt),
                            members:
                                data.members?.map((member: TripMember) => ({
                                    ...member,
                                    joinedAt: convertFirebaseTimestamp(
                                        member.joinedAt
                                    ),
                                })) || [],
                        } as FirestoreTrip;
                        callback(convertedTrip);
                    } else {
                        callback(null);
                    }
                } else {
                    callback(null);
                }
            });

        return unsubscribe;
    }

    // ==========================================
    // ACTIVITIES - VOTE ET VALIDATION
    // ==========================================

    async voteForActivity(
        tripId: string,
        activityId: string,
        userId: string,
        isVoting: boolean // true = ajouter vote, false = retirer vote
    ): Promise<void> {
        try {
            const querySnapshot = await this.db
                .collection("activities")
                .where("tripId", "==", tripId)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                const docData = querySnapshot.docs[0].data();
                const activities = docData.activities || [];

                const activityIndex = activities.findIndex(
                    (activity: any) => activity.id === activityId
                );

                if (activityIndex !== -1) {
                    const activity = activities[activityIndex];
                    const currentVotes = activity.votes || [];

                    if (isVoting) {
                        // Ajouter le vote si pas déjà présent
                        if (!currentVotes.includes(userId)) {
                            activity.votes = [...currentVotes, userId];
                        }
                    } else {
                        // Retirer le vote
                        activity.votes = currentVotes.filter(
                            (vote: string) => vote !== userId
                        );
                    }

                    activities[activityIndex] = activity;

                    await docRef.update({
                        activities,
                        updatedAt:
                            firebase.firestore.FieldValue.serverTimestamp(),
                        updatedBy: userId,
                    });

                    // Note: Le logging d'activité est géré séparément dans les screens
                }
            }
        } catch (error) {
            console.error("Erreur vote activité:", error);
            throw new Error("Impossible de voter pour cette activité");
        }
    }

    async validateActivity(
        tripId: string,
        activityId: string,
        userId: string,
        validated: boolean
    ): Promise<void> {
        try {
            const querySnapshot = await this.db
                .collection("activities")
                .where("tripId", "==", tripId)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                const docData = querySnapshot.docs[0].data();
                const activities = docData.activities || [];

                const activityIndex = activities.findIndex(
                    (activity: any) => activity.id === activityId
                );

                if (activityIndex !== -1) {
                    const activity = activities[activityIndex];
                    activity.validated = validated;
                    activity.status = validated ? "validated" : "pending";

                    activities[activityIndex] = activity;

                    await docRef.update({
                        activities,
                        updatedAt:
                            firebase.firestore.FieldValue.serverTimestamp(),
                        updatedBy: userId,
                    });
                }
            }
        } catch (error) {
            console.error("Erreur validation activité:", error);
            throw new Error("Impossible de valider cette activité");
        }
    }

    // ==========================================
    // ACTIVITIES - HELPERS
    // ==========================================

    calculateActivityStatus(
        activity: TripActivity
    ): "pending" | "validated" | "in_progress" | "completed" | "past" {
        const now = new Date();
        const activityDate = new Date(activity.date);

        // Si l'activité est dans le passé
        if (activityDate < now) {
            return "past";
        }

        // Si l'activité est validée
        if (activity.validated) {
            return "validated";
        }

        // Sinon, en attente
        return "pending";
    }

    getTopActivity(activities: TripActivity[]): TripActivity | null {
        if (!activities || activities.length === 0) return null;

        let topActivity = activities[0];
        let maxVotes = topActivity.votes?.length || 0;

        activities.forEach((activity) => {
            const voteCount = activity.votes?.length || 0;
            if (voteCount > maxVotes) {
                maxVotes = voteCount;
                topActivity = activity;
            }
        });

        return maxVotes > 0 ? topActivity : null;
    }

    // ==========================================
    // ACTIVITY FEED (LOGS D'ACTIVITÉS)
    // ==========================================

    // Utilitaire pour filtrer les valeurs undefined (Firebase n'accepte pas undefined)
    private cleanFirebaseObject(obj: any): any {
        const cleaned: any = {};
        Object.keys(obj).forEach((key) => {
            if (obj[key] !== undefined) {
                cleaned[key] = obj[key];
            }
        });
        return cleaned;
    }

    // Helper pour retry le logging avec délai (pour les nouveaux membres)
    async retryLogActivity(
        tripId: string,
        userId: string,
        userName: string,
        action: ActivityActionType,
        actionData: any = {},
        userAvatar?: string,
        retryCount: number = 0
    ): Promise<void> {
        const maxRetries = 3;
        const delayMs = 1000 * (retryCount + 1); // 1s, 2s, 3s

        try {
            // Attendre un peu pour que les permissions se propagent
            if (retryCount > 0) {
                console.log(
                    `⏳ Retry ${retryCount}/${maxRetries} dans ${delayMs}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }

            await this.logActivity(
                tripId,
                userId,
                userName,
                action,
                actionData,
                userAvatar
            );
            console.log(`✅ Logging réussi après ${retryCount} retry(s)`);
        } catch (error: any) {
            if (error.code === "permission-denied" && retryCount < maxRetries) {
                console.log(
                    `🔄 Retry ${
                        retryCount + 1
                    }/${maxRetries} pour permissions...`
                );
                return this.retryLogActivity(
                    tripId,
                    userId,
                    userName,
                    action,
                    actionData,
                    userAvatar,
                    retryCount + 1
                );
            } else {
                console.error(
                    `❌ Logging définitivement échoué après ${retryCount} retry(s):`,
                    error
                );
                throw error;
            }
        }
    }

    async logActivity(
        tripId: string,
        userId: string,
        userName: string,
        action: ActivityActionType,
        actionData: any = {},
        userAvatar?: string
    ): Promise<void> {
        try {
            console.log(`📝 Tentative de logging activité:`, {
                tripId,
                userId,
                userName,
                action,
                actionData,
            });

            // Vérifier d'abord l'accès au voyage pour diagnostiquer les permissions
            const tripDoc = await this.db.collection("trips").doc(tripId).get();
            if (tripDoc.exists) {
                const tripData = tripDoc.data();
                console.log(`🔍 Vérification permissions:`, {
                    userId,
                    creatorId: tripData?.creatorId,
                    memberIds: tripData?.memberIds || [],
                    isCreator: tripData?.creatorId === userId,
                    isMember: (tripData?.memberIds || []).includes(userId),
                });
            }

            // Nettoyer les données avant envoi
            const cleanedActionData = this.cleanFirebaseObject(actionData);
            const cleanedUserAvatar = userAvatar || null;

            const activityDetails = this.getActivityDetails(
                action,
                cleanedActionData,
                userName
            );

            const activityEntry = this.cleanFirebaseObject({
                tripId,
                userId,
                userName,
                userAvatar: cleanedUserAvatar,
                action,
                actionData: cleanedActionData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                description: activityDetails.description,
                icon: activityDetails.icon,
                color: activityDetails.color,
            });

            console.log(`📤 Données à envoyer:`, activityEntry);

            await this.db.collection("activity-feed").add(activityEntry);
            console.log("✅ Activité loggée avec succès");
        } catch (error: any) {
            console.error("❌ Erreur logging activité:", error);

            // Logs détaillés pour diagnostiquer les problèmes de permissions
            if (error.code === "permission-denied") {
                console.error("🚫 Erreur de permissions détectée:", {
                    errorCode: error.code,
                    errorMessage: error.message,
                    userId,
                    tripId,
                    action,
                });

                // Essayer de récupérer des infos sur le voyage pour diagnostiquer
                try {
                    const tripDoc = await this.db
                        .collection("trips")
                        .doc(tripId)
                        .get();
                    if (tripDoc.exists) {
                        const tripData = tripDoc.data();
                        console.error("🔍 Diagnostic permissions:", {
                            tripExists: true,
                            creatorId: tripData?.creatorId,
                            memberIds: tripData?.memberIds || [],
                            userIsCreator: tripData?.creatorId === userId,
                            userIsMember: (tripData?.memberIds || []).includes(
                                userId
                            ),
                        });
                    } else {
                        console.error("❌ Voyage introuvable pour diagnostic");
                    }
                } catch (diagError) {
                    console.error("❌ Erreur diagnostic:", diagError);
                }
            }

            // Ne pas faire échouer l'action principale si le logging échoue
            console.log("⚠️ Logging échoué mais action principale continue");
        }
    }

    // Initialiser la collection activity-feed
    private async initializeActivityFeedCollection(
        tripId: string
    ): Promise<void> {
        try {
            // Créer une activité d'initialisation du système
            const systemEntry = {
                tripId,
                userId: "system",
                userName: "SpontyTrip",
                action: "trip_update" as ActivityActionType,
                actionData: {},
                timestamp: new Date(),
                description: "Système d'activités initialisé",
                icon: "checkmark-circle",
                color: "#7ED957",
            };

            await this.db.collection("activity-feed").add(systemEntry);
            console.log(
                "✅ Collection activity-feed initialisée pour le voyage:",
                tripId
            );
        } catch (error) {
            console.error("❌ Erreur initialisation collection:", error);
        }
    }

    // Obtenir les détails visuels d'une activité
    private getActivityDetails(
        action: ActivityActionType,
        actionData: any,
        userName: string
    ): { description: string; icon: string; color: string } {
        switch (action) {
            case "checklist_add":
                return {
                    description: `${userName} a ajouté "${actionData.title}" à la checklist`,
                    icon: "checkmark-circle",
                    color: "#7ED957",
                };

            case "checklist_complete":
                return {
                    description: `${userName} a terminé "${actionData.title}"`,
                    icon: "checkmark-done",
                    color: "#10B981",
                };

            case "expense_add":
                return {
                    description: `${userName} a payé ${actionData.label} (${actionData.amount}€)`,
                    icon: "card",
                    color: "#EF4444",
                };

            case "expense_update":
                return {
                    description: `${userName} a modifié une dépense`,
                    icon: "pencil",
                    color: "#F59E0B",
                };

            case "note_add":
                return {
                    description: `${userName} a ajouté une ${
                        actionData.isImportant ? "note importante" : "note"
                    }`,
                    icon: actionData.isImportant ? "star" : "document-text",
                    color: actionData.isImportant ? "#FFD93D" : "#3B82F6",
                };

            case "note_delete":
                return {
                    description: `${userName} a supprimé une note`,
                    icon: "trash",
                    color: "#EF4444",
                };

            case "activity_add":
                return {
                    description: `${userName} a proposé "${actionData.title}"`,
                    icon: "add-circle",
                    color: "#8B5CF6",
                };

            case "activity_delete":
                return {
                    description: `${userName} a supprimé "${actionData.title}"`,
                    icon: "trash",
                    color: "#EF4444",
                };

            case "activity_vote":
                return {
                    description: `${userName} a voté pour "${actionData.title}"`,
                    icon: "heart",
                    color: "#EC4899",
                };

            case "activity_validate":
                return {
                    description: `${userName} a validé "${actionData.title}"`,
                    icon: "star",
                    color: "#FFD93D",
                };

            case "expense_delete":
                return {
                    description: `${userName} a supprimé une dépense (${actionData.label})`,
                    icon: "trash",
                    color: "#EF4444",
                };

            case "checklist_delete":
                return {
                    description: `${userName} a supprimé "${actionData.title}" de la checklist`,
                    icon: "trash",
                    color: "#EF4444",
                };

            case "trip_join":
                return {
                    description: `${userName} a rejoint le voyage`,
                    icon: "person-add",
                    color: "#4DA1A9",
                };

            case "trip_update":
                return {
                    description: `${userName} a mis à jour le voyage`,
                    icon: "settings",
                    color: "#6B7280",
                };

            default:
                return {
                    description: `${userName} a effectué une action`,
                    icon: "ellipsis-horizontal",
                    color: "#6B7280",
                };
        }
    }

    // S'abonner au feed d'activités d'un voyage
    subscribeToActivityFeed(
        tripId: string,
        callback: (feed: ActivityLogEntry[]) => void
    ): () => void {
        const unsubscribe = this.db
            .collection("activity-feed")
            .where("tripId", "==", tripId)
            .orderBy("timestamp", "desc")
            .limit(50) // Limiter aux 50 dernières activités
            .onSnapshot(
                (snapshot) => {
                    const activities: ActivityLogEntry[] = snapshot.docs.map(
                        (doc) =>
                            ({
                                id: doc.id,
                                ...doc.data(),
                                timestamp: convertFirebaseTimestamp(
                                    doc.data().timestamp
                                ),
                            } as ActivityLogEntry)
                    );

                    callback(activities);
                },
                (error) => {
                    console.error("❌ Erreur écoute activity feed:", error);

                    // Si c'est un problème de permissions ou collection inexistante,
                    // retourner un array vide sans crash
                    if (
                        error.code === "permission-denied" ||
                        error.code === "not-found" ||
                        error.message.includes("permissions")
                    ) {
                        console.log(
                            "🔧 Collection activity-feed pas encore accessible, retour d'un feed vide"
                        );
                        callback([]);
                    } else {
                        callback([]);
                    }
                }
            );

        return unsubscribe;
    }

    // Nettoyer les anciennes activités (plus de 30 jours)
    async cleanOldActivities(): Promise<void> {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const oldActivities = await this.db
                .collection("activity-feed")
                .where("timestamp", "<", thirtyDaysAgo)
                .get();

            const batch = this.db.batch();
            oldActivities.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            if (oldActivities.docs.length > 0) {
                await batch.commit();
                console.log(
                    `✅ ${oldActivities.docs.length} anciennes activités nettoyées`
                );
            }
        } catch (error) {
            console.error("❌ Erreur nettoyage activités:", error);
        }
    }

    // 🧪 FONCTION DE TEST - À supprimer plus tard
    async createTestActivity(tripId: string): Promise<void> {
        try {
            const user = firebase.auth().currentUser;
            if (user) {
                await this.logActivity(
                    tripId,
                    user.uid,
                    user.displayName || "Utilisateur Test",
                    "checklist_complete",
                    { title: "Test de l'activity feed" }
                );
                console.log("🧪 Activité test créée avec succès !");
            }
        } catch (error) {
            console.error("❌ Erreur création activité test:", error);
        }
    }
}

const firebaseService = new FirebaseService();
export default firebaseService;
