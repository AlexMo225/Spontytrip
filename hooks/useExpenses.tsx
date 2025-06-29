import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import firebaseService, {
    ExpenseItem,
    TripExpenses,
    TripMember,
} from "../services/firebaseService";


export interface MemberBalance {
    userId: string;
    userName: string;
    totalPaid: number;
    totalOwed: number;
    balance: number; // positif = on lui doit, négatif = il doit
}

export interface DebtSettlement {
    from: string;
    fromName: string;
    to: string;
    toName: string;
    amount: number;
}

export interface ExpensesSummary {
    totalExpenses: number;
    totalMembers: number;
    myBalance: MemberBalance | null;
    memberBalances: MemberBalance[];
    settlements: DebtSettlement[];
    averagePerPerson: number;
}

export interface UseExpensesState {
    // Données
    expenses: ExpenseItem[];
    summary: ExpensesSummary | null;
    members: TripMember[];

    // États
    loading: boolean;
    error: string | null;
    syncing: boolean;

    // Actions
    addExpense: (
        expense: Omit<ExpenseItem, "id" | "createdAt" | "updatedAt">
    ) => Promise<void>;
    deleteExpense: (expenseId: string) => Promise<void>;
    refreshExpenses: () => void;
}

/**
 * 🎯 Hook custom pour la gestion complète des dépenses
 * calcul automatique des soldes et remboursements
 */
export const useExpenses = (
    tripId: string,
    tripMembers: TripMember[]
): UseExpensesState => {
    const { user } = useAuth();

    // 📊 États
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);

    // 🧮 Calcul des soldes (optimisé avec useMemo)
    const summary = useMemo<ExpensesSummary | null>(() => {
        if (!expenses.length || !tripMembers.length || !user) {
            return null;
        }

        try {
            console.log(
                "🧮 Calcul des soldes  pour",
                expenses.length,
                "dépenses"
            );

            // Initialiser les soldes de tous les membres
            const memberBalances: { [userId: string]: MemberBalance } = {};
            tripMembers.forEach((member) => {
                memberBalances[member.userId] = {
                    userId: member.userId,
                    userName: member.name,
                    totalPaid: 0,
                    totalOwed: 0,
                    balance: 0,
                };
            });

            let totalExpenses = 0;

            // Traiter chaque dépense
            expenses.forEach((expense) => {
                totalExpenses += expense.amount;

                // Qui a payé la dépense
                const payer = memberBalances[expense.paidBy];
                if (payer) {
                    payer.totalPaid += expense.amount;
                }

                // Répartir équitablement entre les participants
                const participantCount = expense.participants.length;
                const amountPerParticipant = expense.amount / participantCount;

                expense.participants.forEach((participantId) => {
                    const participant = memberBalances[participantId];
                    if (participant) {
                        participant.totalOwed += amountPerParticipant;
                    }
                });

                console.log(
                    `💰 Dépense "${expense.label}": ${
                        expense.amount
                    }€ payée par ${
                        payer?.userName
                    }, répartie sur ${participantCount} personnes (${amountPerParticipant.toFixed(
                        2
                    )}€/personne)`
                );
            });

            // Calculer les soldes finaux
            const memberBalancesArray = Object.values(memberBalances).map(
                (member) => ({
                    ...member,
                    balance: member.totalPaid - member.totalOwed,
                })
            );

            console.log(
                "📊 Soldes calculés:",
                memberBalancesArray.map(
                    (m) => `${m.userName}: ${m.balance.toFixed(2)}€`
                )
            );

            // Calcul des remboursements optimisés
            const settlements =
                calculateOptimalSettlements(memberBalancesArray);

            // Mon solde personnel
            const myBalance =
                memberBalancesArray.find((m) => m.userId === user.uid) || null;

            const result: ExpensesSummary = {
                totalExpenses,
                totalMembers: tripMembers.length,
                myBalance,
                memberBalances: memberBalancesArray,
                settlements,
                averagePerPerson: totalExpenses / tripMembers.length,
            };

            console.log("✅ Résumé calculé:", {
                total: totalExpenses,
                myBalance: myBalance?.balance,
                settlementsCount: settlements.length,
            });

            return result;
        } catch (error) {
            console.error("❌ Erreur calcul soldes:", error);
            return null;
        }
    }, [expenses, tripMembers, user]);

    // 🔄 Listener Firestore pour synchronisation temps réel
    useEffect(() => {
        if (!tripId) return;

        console.log("🔄 Initialisation listener expenses pour:", tripId);
        setLoading(true);
        setError(null);

        const unsubscribe = firebaseService.subscribeToExpenses(
            tripId,
            (expensesData: TripExpenses | null) => {
                try {
                    if (expensesData?.expenses) {
                        console.log(
                            "📦 Expenses reçues:",
                            expensesData.expenses.length
                        );
                        setExpenses(expensesData.expenses);
                        setError(null);
                    } else {
                        console.log("📦 Aucune expense");
                        setExpenses([]);
                    }
                } catch (error) {
                    console.error("❌ Erreur traitement expenses:", error);
                    setError("Erreur de synchronisation");
                } finally {
                    setLoading(false);
                    setSyncing(false);
                }
            },
            (error) => {
                console.error("❌ Erreur listener expenses:", error);
                setError("Erreur de connexion");
                setLoading(false);
                setSyncing(false);
            }
        );

        return () => {
            console.log("🧹 Nettoyage listener expenses");
            unsubscribe();
        };
    }, [tripId]);

    // 🚀 Action : Ajouter une dépense
    const addExpense = useCallback(
        async (
            expenseData: Omit<ExpenseItem, "id" | "createdAt" | "updatedAt">
        ) => {
            if (!user || !tripId) {
                throw new Error("Utilisateur ou voyage manquant");
            }

            try {
                setSyncing(true);
                console.log(
                    "🚀 Ajout dépense:",
                    expenseData.label,
                    expenseData.amount
                );

                await firebaseService.addExpense(tripId, expenseData, user.uid);

                // Log de l'activité
                await firebaseService.retryLogActivity(
                    tripId,
                    user.uid,
                    user.displayName || user.email || "Utilisateur",
                    "expense_add",
                    { label: expenseData.label, amount: expenseData.amount }
                );

                console.log("✅ Dépense ajoutée avec succès");
            } catch (error) {
                console.error("❌ Erreur ajout dépense:", error);
                setSyncing(false);
                throw new Error("Impossible d'ajouter la dépense");
            }
        },
        [user, tripId]
    );

    // 🗑️ Action : Supprimer une dépense
    const deleteExpense = useCallback(
        async (expenseId: string) => {
            if (!user || !tripId) {
                throw new Error("Utilisateur ou voyage manquant");
            }

            try {
                setSyncing(true);
                console.log("🗑️ Suppression dépense:", expenseId);

                await firebaseService.deleteExpense(
                    tripId,
                    expenseId,
                    user.uid
                );

                console.log("✅ Dépense supprimée avec succès");
            } catch (error) {
                console.error("❌ Erreur suppression dépense:", error);
                setSyncing(false);
                throw new Error("Impossible de supprimer la dépense");
            }
        },
        [user, tripId]
    );

    // 🔄 Action : Forcer la resynchronisation
    const refreshExpenses = useCallback(() => {
        console.log("🔄 Refresh manuel des expenses");
        setSyncing(true);
        // Le listener se chargera de recharger les données
    }, []);

    return {
        // Données
        expenses,
        summary,
        members: tripMembers,

        // États
        loading,
        error,
        syncing,

        // Actions
        addExpense,
        deleteExpense,
        refreshExpenses,
    };
};

/**
 * 🧮 Algorithme de calcul des remboursements optimaux
 * Minimise le nombre de transactions nécessaires
 */
function calculateOptimalSettlements(
    balances: MemberBalance[]
): DebtSettlement[] {
    console.log("🧮 Calcul des remboursements optimaux");

    // Séparer créditeurs et débiteurs
    const creditors = balances
        .filter((b) => b.balance > 0.01)
        .sort((a, b) => b.balance - a.balance);
    const debtors = balances
        .filter((b) => b.balance < -0.01)
        .sort((a, b) => a.balance - b.balance);

    const settlements: DebtSettlement[] = [];

    // Créer des copies pour manipuler les montants
    const creditorsWork = creditors.map((c) => ({ ...c }));
    const debtorsWork = debtors.map((d) => ({
        ...d,
        balance: Math.abs(d.balance),
    }));

    console.log(
        "💳 Créditeurs:",
        creditorsWork.map((c) => `${c.userName}: +${c.balance.toFixed(2)}€`)
    );
    console.log(
        "💸 Débiteurs:",
        debtorsWork.map((d) => `${d.userName}: -${d.balance.toFixed(2)}€`)
    );

    // Algorithme d'appariement optimal
    while (creditorsWork.length > 0 && debtorsWork.length > 0) {
        const creditor = creditorsWork[0];
        const debtor = debtorsWork[0];

        const amount = Math.min(creditor.balance, debtor.balance);

        // Créer le remboursement
        settlements.push({
            from: debtor.userId,
            fromName: debtor.userName,
            to: creditor.userId,
            toName: creditor.userName,
            amount: Math.round(amount * 100) / 100, // Arrondir à 2 décimales
        });

        console.log(
            `💰 Remboursement: ${debtor.userName} → ${
                creditor.userName
            }: ${amount.toFixed(2)}€`
        );

        // Mettre à jour les soldes
        creditor.balance -= amount;
        debtor.balance -= amount;

        // Supprimer ceux qui sont à zéro
        if (creditor.balance < 0.01) {
            creditorsWork.shift();
        }
        if (debtor.balance < 0.01) {
            debtorsWork.shift();
        }
    }

    console.log(`✅ ${settlements.length} remboursements calculés`);
    return settlements;
}
