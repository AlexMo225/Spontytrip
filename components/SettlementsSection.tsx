import React from "react";
import { Text, View } from "react-native";
import { Colors } from "../constants";
import { useSettlementsSectionStyles } from "../styles/components";
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
    const styles = useSettlementsSectionStyles();
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
    const styles = useSettlementsSectionStyles();
    const myBalanceAmount = myBalance?.balance || 0;
    const totalIowe = myDebts.reduce((sum, debt) => sum + debt.amount, 0);
    const totalOwedToMe = myCredits.reduce(
        (sum, credit) => sum + credit.amount,
        0
    );

    const getStatusColor = () => {
        if (myBalanceAmount > 0.01) return Colors.success;
        if (myBalanceAmount < -0.01) return Colors.error;
        return Colors.textSecondary;
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
    const styles = useSettlementsSectionStyles();
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
                            : Colors.textSecondary,
                    },
                ]}
            >
                {balance.balance > 0 ? "+" : ""}
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
    const styles = useSettlementsSectionStyles();
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
