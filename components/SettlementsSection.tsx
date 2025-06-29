import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";
import {
    DebtSettlement,
    ExpensesSummary,
    MemberBalance,
} from "../hooks/useExpenses";

interface SettlementsSectionProps {
    summary: ExpensesSummary | null;
    currentUserId: string;
}

/**
 * 💰 Section "Qui doit qui" - Logique Splitwise complète
 */
export const SettlementsSection: React.FC<SettlementsSectionProps> = ({
    summary,
    currentUserId,
}) => {
    if (!summary || summary.settlements.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>💸 Remboursements</Text>
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                        ✅ Tout le monde est à jour !
                    </Text>
                    <Text style={styles.emptySubtext}>
                        Aucun remboursement nécessaire pour le moment
                    </Text>
                </View>
            </View>
        );
    }

    const { settlements, myBalance, memberBalances } = summary;

    // Filtrer les remboursements qui me concernent
    const myDebts = settlements.filter((s) => s.from === currentUserId);
    const myCredits = settlements.filter((s) => s.to === currentUserId);

    // Membres avec soldes pour affichage complet
    const sortedBalances = memberBalances
        .filter((b) => Math.abs(b.balance) > 0.01)
        .sort((a, b) => b.balance - a.balance);

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>💸 Remboursements</Text>

            {/* 👤 Ma situation personnelle */}
            <PersonalSettlementCard
                myDebts={myDebts}
                myCredits={myCredits}
                myBalance={myBalance}
            />

            {/* 📊 Vue d'ensemble des soldes */}
            <View style={styles.overviewCard}>
                <Text style={styles.overviewTitle}>📊 Soldes du groupe</Text>
                {sortedBalances.map((balance) => (
                    <BalanceItem
                        key={balance.userId}
                        balance={balance}
                        isMe={balance.userId === currentUserId}
                    />
                ))}
            </View>

            {/* 🔄 Tous les remboursements nécessaires */}
            <View style={styles.allSettlementsCard}>
                <Text style={styles.allSettlementsTitle}>
                    🔄 Tous les remboursements ({settlements.length})
                </Text>
                {settlements.map((settlement, index) => (
                    <SettlementItem
                        key={`${settlement.from}-${settlement.to}-${index}`}
                        settlement={settlement}
                        isMyDebt={settlement.from === currentUserId}
                        isMyCredit={settlement.to === currentUserId}
                    />
                ))}
            </View>
        </View>
    );
};

/**
 * 👤 Carte de ma situation personnelle
 */
const PersonalSettlementCard: React.FC<{
    myDebts: DebtSettlement[];
    myCredits: DebtSettlement[];
    myBalance: MemberBalance | null;
}> = ({ myDebts, myCredits, myBalance }) => {
    const myBalanceAmount = myBalance?.balance || 0;
    const totalIowe = myDebts.reduce((sum, debt) => sum + debt.amount, 0);
    const totalOwedToMe = myCredits.reduce(
        (sum, credit) => sum + credit.amount,
        0
    );

    const getStatusColor = () => {
        if (myBalanceAmount > 0.01) return Colors.success;
        if (myBalanceAmount < -0.01) return Colors.error;
        return Colors.text.secondary;
    };

    const getStatusEmoji = () => {
        if (myBalanceAmount > 0.01) return "💰";
        if (myBalanceAmount < -0.01) return "💸";
        return "✅";
    };

    return (
        <View style={[styles.personalCard, { borderColor: getStatusColor() }]}>
            <View style={styles.personalHeader}>
                <Text style={styles.personalEmoji}>{getStatusEmoji()}</Text>
                <Text style={styles.personalTitle}>Ma situation</Text>
            </View>

            {/* Mes dettes */}
            {myDebts.length > 0 && (
                <View style={styles.personalSection}>
                    <Text style={styles.personalSectionTitle}>
                        💸 Je dois :
                    </Text>
                    {myDebts.map((debt) => (
                        <Text key={debt.to} style={styles.debtText}>
                            • {debt.amount.toFixed(2)}€ à {debt.toName}
                        </Text>
                    ))}
                    <Text style={styles.totalDebt}>
                        Total : {totalIowe.toFixed(2)}€
                    </Text>
                </View>
            )}

            {/* Mes créances */}
            {myCredits.length > 0 && (
                <View style={styles.personalSection}>
                    <Text style={styles.personalSectionTitle}>
                        💰 On me doit :
                    </Text>
                    {myCredits.map((credit) => (
                        <Text key={credit.from} style={styles.creditText}>
                            • {credit.amount.toFixed(2)}€ de {credit.fromName}
                        </Text>
                    ))}
                    <Text style={styles.totalCredit}>
                        Total : +{totalOwedToMe.toFixed(2)}€
                    </Text>
                </View>
            )}

            {/* État équilibré */}
            {myDebts.length === 0 && myCredits.length === 0 && (
                <Text style={styles.balancedText}>🎉 Vous êtes à jour !</Text>
            )}
        </View>
    );
};

/**
 * 📊 Item de solde individuel
 */
const BalanceItem: React.FC<{
    balance: MemberBalance;
    isMe: boolean;
}> = ({ balance, isMe }) => {
    const isPositive = balance.balance > 0.01;
    const isNegative = balance.balance < -0.01;

    return (
        <View style={[styles.balanceItem, isMe && styles.balanceItemMe]}>
            <View style={styles.balanceItemLeft}>
                <Text style={styles.balanceItemName}>
                    {balance.userName}
                    {isMe ? " (moi)" : ""}
                </Text>
                <Text style={styles.balanceItemDetails}>
                    Payé {balance.totalPaid.toFixed(2)}€ • Doit{" "}
                    {balance.totalOwed.toFixed(2)}€
                </Text>
            </View>
            <Text
                style={[
                    styles.balanceItemAmount,
                    {
                        color: isPositive
                            ? Colors.success
                            : isNegative
                            ? Colors.error
                            : Colors.text.secondary,
                    },
                ]}
            >
                {isPositive ? "+" : ""}
                {balance.balance.toFixed(2)}€
            </Text>
        </View>
    );
};

/**
 * 🔄 Item de remboursement
 */
const SettlementItem: React.FC<{
    settlement: DebtSettlement;
    isMyDebt: boolean;
    isMyCredit: boolean;
}> = ({ settlement, isMyDebt, isMyCredit }) => {
    const getItemStyle = () => {
        if (isMyDebt)
            return [styles.settlementItem, styles.settlementItemMyDebt];
        if (isMyCredit)
            return [styles.settlementItem, styles.settlementItemMyCredit];
        return styles.settlementItem;
    };

    return (
        <View style={getItemStyle()}>
            <View style={styles.settlementItemContent}>
                <View style={styles.settlementItemLeft}>
                    <Text style={styles.settlementItemText}>
                        <Text style={styles.settlementItemFrom}>
                            {settlement.fromName}
                        </Text>
                        <Text style={styles.settlementItemArrow}> → </Text>
                        <Text style={styles.settlementItemTo}>
                            {settlement.toName}
                        </Text>
                    </Text>
                    {(isMyDebt || isMyCredit) && (
                        <View style={styles.settlementItemBadge}>
                            <Text style={styles.settlementItemBadgeText}>
                                {isMyDebt ? "💸 Vous" : "💰 Vous"}
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={styles.settlementItemAmount}>
                    {settlement.amount.toFixed(2)}€
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 16,
    },

    // État vide
    emptyCard: {
        backgroundColor: Colors.backgroundColors.card,
        padding: 20,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: Colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.success,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: "center",
    },

    // Carte personnelle
    personalCard: {
        backgroundColor: Colors.backgroundColors.card,
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        marginBottom: 16,
        shadowColor: Colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    personalHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    personalEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    personalTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    personalSection: {
        marginBottom: 12,
    },
    personalSectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 6,
    },
    debtText: {
        fontSize: 14,
        color: Colors.error,
        marginBottom: 2,
    },
    creditText: {
        fontSize: 14,
        color: Colors.success,
        marginBottom: 2,
    },
    totalDebt: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.error,
        marginTop: 4,
    },
    totalCredit: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.success,
        marginTop: 4,
    },
    balancedText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.success,
        textAlign: "center",
    },

    // Vue d'ensemble
    overviewCard: {
        backgroundColor: Colors.backgroundColors.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: Colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    overviewTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 12,
    },

    // Items de solde
    balanceItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    balanceItemMe: {
        backgroundColor: Colors.primary + "10",
        marginHorizontal: -16,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderBottomWidth: 0,
    },
    balanceItemLeft: {
        flex: 1,
    },
    balanceItemName: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    balanceItemDetails: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
    balanceItemAmount: {
        fontSize: 14,
        fontWeight: "700",
    },

    // Tous les remboursements
    allSettlementsCard: {
        backgroundColor: Colors.backgroundColors.card,
        padding: 16,
        borderRadius: 16,
        shadowColor: Colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    allSettlementsTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 12,
    },

    // Items de remboursement
    settlementItem: {
        backgroundColor: Colors.backgroundColors.card,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        shadowColor: Colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    },
    settlementItemContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    settlementItemLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginRight: 16,
    },
    settlementItemText: {
        fontSize: 14,
        color: Colors.text.primary,
        flex: 1,
    },
    settlementItemFrom: {
        fontWeight: "500",
    },
    settlementItemArrow: {
        color: Colors.text.secondary,
    },
    settlementItemTo: {
        fontWeight: "500",
    },
    settlementItemAmount: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
        minWidth: 70,
        textAlign: "right",
    },
    settlementItemBadge: {
        backgroundColor: Colors.primary + "20",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    settlementItemBadgeText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: "500",
    },
    settlementItemMyDebt: {
        borderColor: Colors.error,
        borderWidth: 1,
    },
    settlementItemMyCredit: {
        borderColor: Colors.success,
        borderWidth: 1,
    },
});
