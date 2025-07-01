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
                id:
                    item.id ||
                    `${data.tripId}_item_${Date.now()}_${Math.random()
                        .toString(36)
                        .substring(2, 8)}`,
                tripId: item.tripId || data.tripId,
                title: item.title || "",
                category: item.category || "essentials",
                description: item.description,
                assignedTo: item.assignedTo,
                isCompleted: item.isCompleted || false,
                completedBy: item.completedBy,
                completedAt: item.completedAt
                    ? convertFirebaseTimestamp(item.completedAt)
                    : undefined,
                createdBy: item.createdBy || data.updatedBy,
                createdAt: convertFirebaseTimestamp(
                    item.createdAt || data.updatedAt
                ),
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
            console.log(`📥 Tentative de récupération du voyage ${tripId}`);
            const tripDoc = await this.db.collection("trips").doc(tripId).get();

            if (!tripDoc.exists) {
                console.log(`❌ Voyage ${tripId} non trouvé`);
                return null;
            }

            const tripData = convertFirestoreTrip(tripDoc);
            console.log(`✅ Voyage ${tripId} récupéré avec succès:`, {
                title: tripData.title,
                members: tripData.members.length,
                memberIds: tripData.memberIds,
            });
            return tripData;
        } catch (error) {
            console.error(
                `🚨 Erreur lors de la récupération du voyage ${tripId}:`,
                error
            );
            throw error;
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
        callback: (checklist: TripChecklist | null) => void,
        errorHandler?: (error: any) => void
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

                            console.log(
                                `📝 Données brutes checklist:`,
                                rawData
                            );

                            const convertedChecklist =
                                convertFirestoreChecklist(rawData);

                            console.log(
                                `✅ Checklist convertie - ${convertedChecklist.items.length} items`,
                                convertedChecklist.items.map((item) => ({
                                    id: item.id,
                                    title: item.title,
                                    category: item.category,
                                    isCompleted: item.isCompleted,
                                    assignedTo: item.assignedTo,
                                }))
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
                    // Utiliser le gestionnaire d'erreur personnalisé si fourni
                    if (errorHandler) {
                        errorHandler(error);
                        return;
                    }

                    // Comportement par défaut (pour compatibilité)
                    console.error("❌ Erreur snapshot checklist:", error);

                    // Si c'est une erreur de permissions et que le voyage n'existe plus, arrêter le listener
                    if (
                        error.code === "permission-denied" ||
                        error.code === "not-found"
                    ) {
                        console.log(
                            "🛑 Arrêt du listener checklist - voyage probablement supprimé"
                        );
                        callback(null);
                        return;
                    }

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
                    isCompleted: item.isCompleted || false,
                    createdBy: item.createdBy || userId,
                    createdAt: item.createdAt || new Date(),
                    assignedTo: item.assignedTo || null,
                    completedBy: item.completedBy || null,
                    completedAt: item.completedAt || null,
                    description: item.description || null,
                };

                return cleanedItem as ChecklistItem;
            });

            console.log("✅ Items nettoyés:", cleanedItems.length);
            console.log("📝 Items après nettoyage:", cleanedItems);

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
        } catch (error) {
            console.error("❌ Erreur mise à jour checklist:", error);
            throw error; // Propager l'erreur originale pour un meilleur debugging
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
            console.log("🚀 Ajout dépense:", {
                tripId,
                label: expense.label,
                amount: expense.amount,
                paidBy: expense.paidBy,
                paidByName: expense.paidByName,
                participants: expense.participants,
                participantNames: expense.participantNames,
            });

            // Générer un ID unique avec timestamp pour éviter les collisions
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const expenseId = `${tripId}_expense_${timestamp}_${randomSuffix}`;

            // ✨ Utiliser serverTimestamp() pour garantir la cohérence
            const serverTime = firebase.firestore.FieldValue.serverTimestamp();

            const expenseData: ExpenseItem = {
                ...expense,
                id: expenseId,
                // ⚠️ Important : Pour les arrays, on utilise new Date() mais basé sur serverTime quand possible
                createdAt: new Date(), // Timestamp immédiat pour l'ordre local
                updatedAt: new Date(),
            };

            console.log("📝 Données expense prêtes:", {
                id: expenseData.id,
                label: expenseData.label,
                amount: expenseData.amount,
                createdAt: expenseData.createdAt.toISOString(),
                timestampMs: expenseData.createdAt.getTime(),
            });

            // Vérifier si le document expenses existe déjà
            const querySnapshot = await this.db
                .collection("expenses")
                .where("tripId", "==", tripId)
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                // Document existe : ajouter à la liste
                const docRef = querySnapshot.docs[0].ref;
                const currentData =
                    querySnapshot.docs[0].data() as TripExpenses;

                console.log(
                    "📋 Document expenses existant trouvé, ajout à la liste"
                );
                console.log(
                    "📊 Dépenses actuelles:",
                    currentData.expenses?.length || 0
                );

                const updatedExpenses = [
                    ...(currentData.expenses || []),
                    expenseData,
                ];

                console.log(
                    "📊 Nouvelles dépenses après ajout:",
                    updatedExpenses.length
                );

                await docRef.update({
                    expenses: updatedExpenses,
                    updatedAt: serverTime,
                    updatedBy: userId,
                });

                console.log("✅ Dépense ajoutée au document existant");
            } else {
                // Créer un nouveau document
                console.log("📋 Création nouveau document expenses");

                await this.db.collection("expenses").add({
                    tripId,
                    expenses: [expenseData],
                    updatedAt: serverTime,
                    updatedBy: userId,
                });

                console.log("✅ Nouveau document expenses créé");
            }

            console.log("🎉 Dépense ajoutée avec succès:", expenseData.id);

            // Log des détails pour le debug
            console.log("🔍 Détails finaux de la dépense:", {
                id: expenseData.id,
                label: expenseData.label,
                amount: expenseData.amount,
                paidBy: expenseData.paidBy,
                paidByName: expenseData.paidByName,
                participants: expenseData.participants,
                participantNames: expenseData.participantNames,
                createdAt: expenseData.createdAt.toISOString(),
                createdAtTimestamp: expenseData.createdAt.getTime(),
            });
        } catch (error) {
            console.error("❌ Erreur ajout dépense:", error);
            console.error("📝 Données de la dépense qui a échoué:", {
                tripId,
                label: expense.label,
                amount: expense.amount,
                paidBy: expense.paidBy,
            });
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
        callback: (expenses: TripExpenses | null) => void,
        errorHandler?: (error: any) => void
    ): () => void {
        console.log("🔄 Initialisation listener expenses pour:", tripId);

        const unsubscribe = this.db
            .collection("expenses")
            .where("tripId", "==", tripId)
            .onSnapshot(
                (snapshot) => {
                    if (!snapshot.empty) {
                        const doc = snapshot.docs[0];
                        const data = doc.data() as TripExpenses;

                        console.log("📦 Données expenses reçues:", {
                            tripId,
                            expenseCount: data.expenses?.length || 0,
                            updatedAt: data.updatedAt,
                            updatedBy: data.updatedBy,
                        });

                        // Convertir les timestamps ET trier les dépenses
                        const convertedData = {
                            ...data,
                            updatedAt: convertFirebaseTimestamp(data.updatedAt),
                            expenses:
                                data.expenses
                                    ?.map((expense) => {
                                        const convertedExpense = {
                                            ...expense,
                                            date: convertFirebaseTimestamp(
                                                expense.date
                                            ),
                                            createdAt: convertFirebaseTimestamp(
                                                expense.createdAt
                                            ),
                                            updatedAt: expense.updatedAt
                                                ? convertFirebaseTimestamp(
                                                      expense.updatedAt
                                                  )
                                                : undefined,
                                        };

                                        // Log de debug pour chaque dépense
                                        console.log("🔄 Conversion expense:", {
                                            id: expense.id,
                                            label: expense.label,
                                            amount: expense.amount,
                                            originalCreatedAt:
                                                expense.createdAt,
                                            convertedCreatedAt:
                                                convertedExpense.createdAt.toISOString(),
                                            isValidDate: !isNaN(
                                                convertedExpense.createdAt.getTime()
                                            ),
                                        });

                                        return convertedExpense;
                                    })
                                    // ✨ TRI AUTOMATIQUE par date de création décroissante (plus récent en premier)
                                    .sort((a, b) => {
                                        try {
                                            const result =
                                                b.createdAt.getTime() -
                                                a.createdAt.getTime();
                                            console.log("🔄 Tri:", {
                                                aLabel: a.label,
                                                bLabel: b.label,
                                                aTime: a.createdAt.getTime(),
                                                bTime: b.createdAt.getTime(),
                                                result,
                                            });
                                            return result;
                                        } catch (error) {
                                            console.warn(
                                                "⚠️ Erreur tri dépenses, ordre original conservé:",
                                                error
                                            );
                                            return 0; // Garde l'ordre original en cas d'erreur
                                        }
                                    }) || [],
                        };

                        console.log("✅ Expenses traitées et triées:", {
                            count: convertedData.expenses.length,
                            expensesList: convertedData.expenses.map((e) => ({
                                id: e.id,
                                label: e.label,
                                amount: e.amount,
                                createdAt: e.createdAt.toISOString(),
                            })),
                        });

                        callback(convertedData);
                    } else {
                        console.log(
                            "ℹ️ Aucune dépense trouvée pour le voyage:",
                            tripId
                        );
                        callback(null);
                    }
                },
                (error) => {
                    console.error("❌ Erreur listener expenses:", error);

                    // Utiliser le gestionnaire d'erreur personnalisé si fourni
                    if (errorHandler) {
                        errorHandler(error);
                        return;
                    }

                    // Comportement par défaut (pour compatibilité)
                    console.error("❌ Erreur snapshot expenses:", error);

                    // Si c'est une erreur de permissions et que le voyage n'existe plus, arrêter le listener
                    if (
                        error.code === "permission-denied" ||
                        error.code === "not-found"
                    ) {
                        console.log(
                            "🛑 Arrêt du listener expenses - voyage probablement supprimé"
                        );
                        callback(null);
                        return;
                    }

                    callback(null);
                }
            );

        console.log("✅ Listener expenses initialisé pour:", tripId);
        return unsubscribe;
    }

    // ==========================================
    // NOTES - Système de notes multiples
    // ==========================================

    // Souscrire aux notes d'un voyage (nouvelle structure)
    subscribeToTripNotes(
        tripId: string,
        callback: (notes: TripNote[]) => void,
        errorHandler?: (error: any) => void
    ): () => void {
        const unsubscribe = this.db
            .collection("trips")
            .doc(tripId)
            .collection("notes")
            .orderBy("updatedAt", "desc")
            .onSnapshot(
                (snapshot) => {
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
                },
                (error) => {
                    // Utiliser le gestionnaire d'erreur personnalisé si fourni
                    if (errorHandler) {
                        errorHandler(error);
                        return;
                    }

                    // Comportement par défaut (pour compatibilité)
                    console.error("❌ Erreur snapshot trip notes:", error);

                    // Si c'est une erreur de permissions et que le voyage n'existe plus, arrêter le listener
                    if (
                        error.code === "permission-denied" ||
                        error.code === "not-found"
                    ) {
                        console.log(
                            "🛑 Arrêt du listener trip notes - voyage probablement supprimé"
                        );
                        callback([]);
                        return;
                    }

                    callback([]);
                }
            );

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
        callback: (notes: TripNotes | null) => void,
        errorHandler?: (error: any) => void
    ): () => void {
        const unsubscribe = this.db
            .collection("notes")
            .where("tripId", "==", tripId)
            .onSnapshot(
                (snapshot) => {
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
                },
                (error) => {
                    // Utiliser le gestionnaire d'erreur personnalisé si fourni
                    if (errorHandler) {
                        errorHandler(error);
                        return;
                    }

                    // Comportement par défaut (pour compatibilité)
                    console.error("❌ Erreur snapshot notes:", error);
                    callback(null);
                }
            );

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
        callback: (activities: TripActivities | null) => void,
        errorHandler?: (error: any) => void
    ): () => void {
        const unsubscribe = this.db
            .collection("activities")
            .where("tripId", "==", tripId)
            .onSnapshot(
                (snapshot) => {
                    if (!snapshot.empty) {
                        const doc = snapshot.docs[0];
                        const rawData = doc.data();
                        const convertedData =
                            convertFirestoreActivities(rawData);
                        callback(convertedData);
                    } else {
                        callback(null);
                    }
                },
                (error) => {
                    // Utiliser le gestionnaire d'erreur personnalisé si fourni
                    if (errorHandler) {
                        errorHandler(error);
                        return;
                    }

                    // Comportement par défaut (pour compatibilité)
                    console.error("❌ Erreur snapshot activities:", error);

                    // Si c'est une erreur de permissions et que le voyage n'existe plus, arrêter le listener
                    if (
                        error.code === "permission-denied" ||
                        error.code === "not-found"
                    ) {
                        console.log(
                            "🛑 Arrêt du listener activities - voyage probablement supprimé"
                        );
                        callback(null);
                        return;
                    }

                    callback(null);
                }
            );

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
            console.log(
                "🗑️ Début suppression voyage:",
                tripId,
                "par utilisateur:",
                userId
            );

            // CRITIQUE: Nettoyer immédiatement tous les listeners de ce voyage
            try {
                const { forceCleanupTripListeners } = await import(
                    "../hooks/useTripSync"
                );
                forceCleanupTripListeners(tripId);
                console.log("🧹 Listeners nettoyés immédiatement");
            } catch (cleanupError) {
                console.warn("⚠️ Erreur nettoyage listeners:", cleanupError);
            }

            // Vérifier d'abord les permissions
            const trip = await this.getTripById(tripId);
            if (!trip) {
                throw new Error("Voyage introuvable");
            }

            if (trip.creatorId !== userId) {
                throw new Error("Seul le créateur du voyage peut le supprimer");
            }

            // Étape 1: Supprimer les collections globales et sous-collections
            await this.cleanupOrphanedData(tripId);

            // Étape 2: Supprimer l'image de couverture si elle existe
            if (trip.coverImage) {
                try {
                    const { ImageService } = await import("./imageService");
                    await ImageService.deleteTripCoverImage(trip.coverImage);
                } catch (error) {
                    console.warn(
                        "⚠️ Erreur suppression image de couverture:",
                        error
                    );
                }
            }

            // Étape 3: Supprimer le voyage principal avec retry
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    await this.db.collection("trips").doc(tripId).delete();
                    console.log("✅ Voyage principal supprimé");
                    break;
                } catch (error) {
                    console.warn(
                        `⚠️ Erreur suppression voyage (tentative ${attempt}):`,
                        error
                    );
                    if (attempt === 3) throw error;
                    await new Promise((resolve) =>
                        setTimeout(resolve, 1000 * attempt)
                    );
                }
            }

            // Vérification finale et nettoyage des données orphelines si nécessaire
            const tripExists = await this.verifyTripExists(tripId);
            if (!tripExists) {
                console.log("✅ Vérification finale OK");
            } else {
                console.warn(
                    "⚠️ Le voyage existe toujours, tentative de nettoyage forcé..."
                );
                await this.cleanupOrphanedData(tripId);
                await this.db.collection("trips").doc(tripId).delete();
            }

            // Émettre un événement pour informer les autres composants
            try {
                const { tripRefreshEmitter } = await import(
                    "../hooks/useTripSync"
                );
                tripRefreshEmitter.emitTripDeleted(tripId, userId, "Créateur");
            } catch (emitError) {
                console.warn(
                    "⚠️ Erreur émission événement suppression:",
                    emitError
                );
            }

            console.log("🎉 Voyage supprimé avec succès:", tripId);
        } catch (error) {
            console.error("❌ Erreur suppression voyage:", error);

            // Dernière tentative de nettoyage en cas d'erreur
            try {
                await this.cleanupOrphanedData(tripId);
            } catch (cleanupError) {
                console.error("❌ Erreur nettoyage final:", cleanupError);
            }

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
        callback: (trip: FirestoreTrip | null) => void,
        errorHandler?: (error: any) => void
    ): () => void {
        console.log(`🔄 Abonnement aux mises à jour du voyage ${tripId}`);

        return this.db
            .collection("trips")
            .doc(tripId)
            .onSnapshot(
                (doc) => {
                    if (!doc.exists) {
                        console.log(
                            `❌ Voyage ${tripId} non trouvé (onSnapshot)`
                        );
                        callback(null);
                        return;
                    }

                    const tripData = convertFirestoreTrip(doc);
                    console.log(`📦 Mise à jour du voyage ${tripId} reçue:`, {
                        title: tripData.title,
                        members: tripData.members.length,
                        memberIds: tripData.memberIds,
                    });
                    callback(tripData);
                },
                (error) => {
                    console.error(
                        `🚨 Erreur d'abonnement au voyage ${tripId}:`,
                        error
                    );
                    if (errorHandler) {
                        errorHandler(error);
                    }
                }
            );
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

    async deleteActivity(
        tripId: string,
        activityId: string,
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
                const docData = querySnapshot.docs[0].data();
                const activities = docData.activities || [];

                const activityIndex = activities.findIndex(
                    (activity: any) => activity.id === activityId
                );

                if (activityIndex !== -1) {
                    // Supprimer l'activité de l'array
                    const updatedActivities = activities.filter(
                        (activity: any) => activity.id !== activityId
                    );

                    await docRef.update({
                        activities: updatedActivities,
                        updatedAt:
                            firebase.firestore.FieldValue.serverTimestamp(),
                        updatedBy: userId,
                    });

                    console.log(
                        `✅ Activité ${activityId} supprimée avec succès`
                    );
                } else {
                    throw new Error("Activité introuvable");
                }
            } else {
                throw new Error(
                    "Document activities introuvable pour ce voyage"
                );
            }
        } catch (error) {
            console.error("Erreur suppression activité:", error);
            throw new Error("Impossible de supprimer cette activité");
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
                // Gestion des différents types d'actions checklist
                if (actionData.action === "assigned") {
                    return {
                        description: `${userName} a assigné "${actionData.title}" à ${actionData.assignedTo}`,
                        icon: "person-add",
                        color: "#3B82F6",
                    };
                } else if (actionData.action === "unassigned") {
                    return {
                        description: `${userName} a désassigné "${actionData.title}"`,
                        icon: "person-remove",
                        color: "#F59E0B",
                    };
                } else if (actionData.action === "auto_assigned") {
                    return {
                        description: `🤖 ${userName} a réparti automatiquement ${actionData.taskCount} tâches entre ${actionData.memberCount} membres`,
                        icon: "shuffle",
                        color: "#8B5CF6",
                    };
                } else {
                    return {
                        description: `${userName} a ajouté "${actionData.title}" à la checklist`,
                        icon: "add-circle",
                        color: "#7ED957",
                    };
                }

            case "checklist_complete":
                if (actionData.action === "all_completed") {
                    return {
                        description: `🎉 ${userName} a terminé la dernière tâche ! CHECKLIST COMPLÈTE ! 🚀`,
                        icon: "trophy",
                        color: "#FFD93D",
                    };
                } else {
                    return {
                        description: `✅ ${userName} a coché "${actionData.title}"`,
                        icon: "checkmark-done-circle",
                        color: "#10B981",
                    };
                }

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
                    description: `🗑️ ${userName} a supprimé "${actionData.title}" de la checklist`,
                    icon: "trash-bin",
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
        callback: (feed: ActivityLogEntry[]) => void,
        errorHandler?: (error: any) => void
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
                    // Utiliser le gestionnaire d'erreur personnalisé si fourni
                    if (errorHandler) {
                        errorHandler(error);
                        return;
                    }

                    // Comportement par défaut (pour compatibilité)
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

    async cleanupOrphanedData(tripId: string): Promise<void> {
        try {
            console.log(
                `🧹 Début nettoyage données orphelines pour trip ${tripId}...`
            );

            const collections = [
                "checklists",
                "expenses",
                "notes",
                "activities",
                "messages",
                "gallery",
                "activity-feed",
            ];

            for (const col of collections) {
                try {
                    const snapshot = await this.db
                        .collection(col)
                        .where("tripId", "==", tripId)
                        .get();

                    if (snapshot.empty) {
                        console.log(`✅ Aucune donnée orpheline dans ${col}`);
                        continue;
                    }

                    const batch = this.db.batch();
                    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
                    await batch.commit();
                    console.log(
                        `🗑️ ${snapshot.size} documents orphelins supprimés dans ${col}`
                    );
                } catch (error) {
                    console.warn(`⚠️ Erreur nettoyage ${col}:`, error);
                }
            }

            console.log(
                `✨ Nettoyage des données orphelines terminé pour trip ${tripId}`
            );
        } catch (error) {
            console.error("❌ Erreur nettoyage données orphelines:", error);
            throw error;
        }
    }

    // Méthode pour vérifier si un voyage existe
    async verifyTripExists(tripId: string): Promise<boolean> {
        try {
            const tripDoc = await this.db.collection("trips").doc(tripId).get();
            return tripDoc.exists;
        } catch (error) {
            console.error("❌ Erreur vérification existence voyage:", error);
            return false;
        }
    }
}

const firebaseService = new FirebaseService();
export default firebaseService;
