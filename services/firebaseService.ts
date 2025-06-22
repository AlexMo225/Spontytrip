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

export interface TripActivity {
    id: string;
    title: string;
    description?: string;
    location?: string;
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

    async updateTripCoverImage(
        tripId: string,
        coverImage: string | null,
        userId: string
    ): Promise<void> {
        try {
            const tripRef = this.db.collection("trips").doc(tripId);
            const updateData: any = {
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            if (coverImage) {
                updateData.coverImage = coverImage;
            } else {
                // Supprimer le champ coverImage
                updateData.coverImage = firebase.firestore.FieldValue.delete();
            }

            await tripRef.update(updateData);
        } catch (error) {
            console.error("Erreur mise à jour photo de couverture:", error);
            throw new Error(
                "Impossible de mettre à jour la photo de couverture"
            );
        }
    }

    // Écouter les mises à jour temps réel d'un voyage
    subscribeToTrip(
        tripId: string,
        callback: (trip: FirestoreTrip | null) => void
    ): () => void {
        const unsubscribe = this.db
            .collection("trips")
            .doc(tripId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const trip = convertFirestoreTrip(doc);
                    callback(trip);
                } else {
                    callback(null);
                }
            });

        return unsubscribe;
    }

    // ==========================================
    // VOTES ET VALIDATION DES ACTIVITÉS
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

                // Trouver l'activité à mettre à jour
                const updatedActivities = activities.map((activity: any) => {
                    if (activity.id === activityId) {
                        const currentVotes = activity.votes || [];

                        if (isVoting) {
                            // Ajouter le vote si pas déjà présent
                            if (!currentVotes.includes(userId)) {
                                return {
                                    ...activity,
                                    votes: [...currentVotes, userId],
                                };
                            }
                        } else {
                            // Retirer le vote
                            return {
                                ...activity,
                                votes: currentVotes.filter(
                                    (vote: string) => vote !== userId
                                ),
                            };
                        }
                    }
                    return activity;
                });

                await docRef.update({
                    activities: updatedActivities,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: userId,
                });
            }
        } catch (error) {
            console.error("Erreur vote activité:", error);
            throw new Error("Impossible de voter pour l'activité");
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

                // Trouver l'activité à valider
                const updatedActivities = activities.map((activity: any) => {
                    if (activity.id === activityId) {
                        return {
                            ...activity,
                            validated,
                        };
                    }
                    return activity;
                });

                await docRef.update({
                    activities: updatedActivities,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: userId,
                });
            }
        } catch (error) {
            console.error("Erreur validation activité:", error);
            throw new Error("Impossible de valider l'activité");
        }
    }

    // Calculer le statut d'une activité
    calculateActivityStatus(
        activity: TripActivity
    ): "pending" | "validated" | "in_progress" | "completed" | "past" {
        const now = new Date();
        const activityDate = new Date(activity.date);

        // Définir les heures de début et fin de l'activité
        const activityStart = new Date(activityDate);
        const activityEnd = new Date(activityDate);

        if (activity.startTime) {
            const [hours, minutes] = activity.startTime.split(":");
            activityStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        if (activity.endTime) {
            const [hours, minutes] = activity.endTime.split(":");
            activityEnd.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
            // Si pas d'heure de fin, considérer 2h par défaut
            activityEnd.setHours(activityStart.getHours() + 2);
        }

        // Logique de statut
        if (now > activityEnd) {
            return "past";
        } else if (now >= activityStart && now <= activityEnd) {
            return "in_progress";
        } else if (activity.validated) {
            return "validated";
        } else {
            return "pending";
        }
    }

    // Trouver l'activité avec le plus de votes
    getTopActivity(activities: TripActivity[]): TripActivity | null {
        if (!activities.length) return null;

        return activities.reduce((top, current) => {
            const topVotes = top.votes?.length || 0;
            const currentVotes = current.votes?.length || 0;
            return currentVotes > topVotes ? current : top;
        });
    }
}

export default new FirebaseService();
