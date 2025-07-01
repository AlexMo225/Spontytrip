import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants";
import { useExpensesSummaryHeaderStyles } from "../styles/components";
import { ExpensesSummary } from "../hooks/useExpenses";

interface ExpensesSummaryHeaderProps {
    summary: ExpensesSummary | null;
    loading: boolean;
    syncing: boolean;
    onRefresh: () => void;
}

/**
 * 📊 Header avec résumé des dépenses - Style moderne
 */
export const ExpensesSummaryHeader: React.FC<ExpensesSummaryHeaderProps> = ({
    summary,
    loading,
    syncing,
    onRefresh,
}) => {
    const styles = useExpensesSummaryHeaderStyles();

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingCard}>
                    <Text style={styles.loadingText}>
                        💫 Synchronisation...
                    </Text>
                </View>
            </View>
        );
    }

    if (!summary) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>💸 Aucune dépense</Text>
                    <Text style={styles.emptySubtitle}>
                        Ajoutez votre première dépense pour commencer
                    </Text>
                </View>
            </View>
        );
    }

    const { totalExpenses, averagePerPerson, myBalance } = summary;

    // Déterminer l'état de mon solde
    const myBalanceAmount = myBalance?.balance || 0;
    const isCreditor = myBalanceAmount > 0.01;
    const isDebtor = myBalanceAmount < -0.01;
    const isEven = Math.abs(myBalanceAmount) <= 0.01;

    const getBalanceColor = () => {
        if (isCreditor) return Colors.success;
        if (isDebtor) return Colors.error;
        return Colors.textSecondary;
    };

    const getBalanceText = () => {
        if (isCreditor) return `+${myBalanceAmount.toFixed(2)}€`;
        if (isDebtor) return `${myBalanceAmount.toFixed(2)}€`;
        return "Équilibré";
    };

    const getBalanceEmoji = () => {
        if (isCreditor) return "💰";
        if (isDebtor) return "💸";
        return "✅";
    };

    const getBalanceDescription = () => {
        if (isCreditor) return "On vous doit";
        if (isDebtor) return "Vous devez";
        return "Vous êtes à jour";
    };

    return (
        <View style={styles.container}>
            {/* 📊 Carte principale */}
            <View style={styles.mainCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.title}>Résumé des dépenses</Text>
                    {syncing && (
                        <View style={styles.syncIndicator}>
                            <Text style={styles.syncText}>🔄</Text>
                        </View>
                    )}
                </View>

                {/* Total et moyenne */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {totalExpenses.toFixed(2)}€
                        </Text>
                        <Text style={styles.statLabel}>Total dépensé</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {averagePerPerson.toFixed(2)}€
                        </Text>
                        <Text style={styles.statLabel}>Par personne</Text>
                    </View>
                </View>

                {/* Mon solde */}
                <View
                    style={[
                        styles.balanceCard,
                        { borderColor: getBalanceColor() },
                    ]}
                >
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceEmoji}>
                            {getBalanceEmoji()}
                        </Text>
                        <Text style={styles.balanceDescription}>
                            {getBalanceDescription()}
                        </Text>
                    </View>
                    <Text
                        style={[
                            styles.balanceAmount,
                            { color: getBalanceColor() },
                        ]}
                    >
                        {getBalanceText()}
                    </Text>
                </View>
            </View>

            {/* 🔄 Bouton de refresh (optionnel si problème) */}
            {!syncing && (
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                    activeOpacity={0.7}
                >
                    <Text style={styles.refreshText}>🔄 Actualiser</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
