import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { ExpenseItem as ExpenseType } from "../services/firebaseService";

interface TripMember {
    userId: string;
    name: string;
    isCreator: boolean;
}

interface Balance {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number;
}

interface TripBalanceSummaryProps {
    expenses: ExpenseType[];
    members: TripMember[];
    currentUserId: string;
}

const TripBalanceSummary: React.FC<TripBalanceSummaryProps> = ({
    expenses,
    members,
    currentUserId,
}) => {
    const calculateBalances = (): Balance[] => {
        if (expenses.length === 0 || members.length === 0) {
            return [];
        }

        // Calculer le total des dépenses
        const totalExpenses = expenses.reduce(
            (sum, expense) => sum + (expense.amount || 0),
            0
        );

        if (totalExpenses === 0) {
            return []; // Pas de dépenses = pas de remboursements
        }

        // Calculer ce que chaque personne a payé
        const paidByPerson = members.reduce((acc, member) => {
            const totalPaid = expenses
                .filter((expense) => expense.paidBy === member.userId)
                .reduce((sum, expense) => sum + (expense.amount || 0), 0);
            acc[member.userId] = totalPaid;
            return acc;
        }, {} as Record<string, number>);

        // Calculer ce que chaque personne doit (basé sur les participants de chaque dépense)
        const owedByPerson = members.reduce((acc, member) => {
            acc[member.userId] = 0;
            return acc;
        }, {} as Record<string, number>);

        expenses.forEach((expense) => {
            if (
                expense.participants &&
                expense.participants.length > 0 &&
                expense.amount > 0
            ) {
                const amountPerParticipant =
                    expense.amount / expense.participants.length;
                expense.participants.forEach((participantId) => {
                    if (owedByPerson[participantId] !== undefined) {
                        owedByPerson[participantId] += amountPerParticipant;
                    }
                });
            }
        });

        // Calculer les soldes (positif = doit recevoir, négatif = doit payer)
        const balances = members
            .map((member) => ({
                userId: member.userId,
                name: member.name,
                balance:
                    (paidByPerson[member.userId] || 0) -
                    (owedByPerson[member.userId] || 0),
            }))
            .filter((balance) => Math.abs(balance.balance) >= 0.01); // Ignorer les centimes

        // Générer les transactions pour équilibrer
        const transactions: Balance[] = [];
        const debtors = balances
            .filter((b) => b.balance < -0.01)
            .sort((a, b) => a.balance - b.balance);
        const creditors = balances
            .filter((b) => b.balance > 0.01)
            .sort((a, b) => b.balance - a.balance);

        let i = 0,
            j = 0;
        while (i < debtors.length && j < creditors.length) {
            const debt = Math.abs(debtors[i].balance);
            const credit = creditors[j].balance;
            const amount = Math.min(debt, credit);

            if (amount >= 0.01) {
                // Ignorer les centimes
                transactions.push({
                    fromUserId: debtors[i].userId,
                    fromUserName: debtors[i].name,
                    toUserId: creditors[j].userId,
                    toUserName: creditors[j].name,
                    amount: Math.round(amount * 100) / 100, // Arrondir à 2 décimales
                });
            }

            debtors[i].balance += amount;
            creditors[j].balance -= amount;

            if (Math.abs(debtors[i].balance) < 0.01) i++;
            if (Math.abs(creditors[j].balance) < 0.01) j++;
        }

        return transactions;
    };

    const renderBalanceItem = ({ item }: { item: Balance }) => {
        // Adapter les noms pour l'utilisateur actuel
        const fromName =
            item.fromUserId === currentUserId ? "Vous" : item.fromUserName;
        const toName =
            item.toUserId === currentUserId ? "vous" : item.toUserName;

        return (
            <View style={styles.balanceItem}>
                <View style={styles.balanceContent}>
                    <Text style={styles.balanceText}>
                        <Text style={styles.balanceFrom}>{fromName}</Text>
                        <Text style={styles.balanceAction}> doit </Text>
                        <Text style={styles.balanceAmount}>
                            {item.amount.toFixed(2)}€
                        </Text>
                        <Text style={styles.balanceAction}> à </Text>
                        <Text style={styles.balanceTo}>{toName}</Text>
                    </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#7ED957" />
            </View>
        );
    };

    const balances = calculateBalances();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="calculator" size={20} color="#7ED957" />
                <Text style={styles.title}>Qui doit quoi ?</Text>
            </View>

            {balances.length > 0 ? (
                <FlatList
                    data={balances}
                    renderItem={renderBalanceItem}
                    keyExtractor={(item, index) =>
                        `${item.fromUserId}-${item.toUserId}-${index}`
                    }
                    scrollEnabled={false}
                    style={styles.list}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons
                        name="checkmark-circle"
                        size={48}
                        color="#7ED957"
                    />
                    <Text style={styles.emptyTitle}>Tout est équilibré !</Text>
                    <Text style={styles.emptySubtitle}>
                        Personne ne doit d'argent à personne
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    title: {
        ...TextStyles.h4,
        color: Colors.textPrimary,
        marginLeft: Spacing.md,
        fontWeight: "600",
    },
    list: {
        flexGrow: 0,
    },
    balanceItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F8F9FA",
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.sm,
    },
    balanceContent: {
        flex: 1,
    },
    balanceText: {
        ...TextStyles.body1,
        lineHeight: 20,
    },
    balanceFrom: {
        fontWeight: "600",
        color: "#FF6B6B",
    },
    balanceTo: {
        fontWeight: "600",
        color: "#7ED957",
    },
    balanceAction: {
        color: Colors.textPrimary,
    },
    balanceAmount: {
        fontWeight: "700",
        color: Colors.textPrimary,
        fontSize: 16,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: Spacing.xl,
    },
    emptyTitle: {
        ...TextStyles.h4,
        color: Colors.textPrimary,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    emptySubtitle: {
        ...TextStyles.body2,
        color: "#999",
        textAlign: "center",
    },
});

export default TripBalanceSummary;
