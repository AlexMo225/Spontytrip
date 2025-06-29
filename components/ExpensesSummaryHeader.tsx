import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";
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
        return Colors.text.secondary;
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

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },

    // États de chargement
    loadingCard: {
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
    loadingText: {
        fontSize: 16,
        color: Colors.text.secondary,
        fontWeight: "500",
    },

    // État vide
    emptyCard: {
        backgroundColor: Colors.backgroundColors.card,
        padding: 30,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: Colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: "center",
    },

    // Carte principale
    mainCard: {
        backgroundColor: Colors.backgroundColors.card,
        padding: 20,
        borderRadius: 16,
        shadowColor: Colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text.primary,
    },

    // Indicateur de sync
    syncIndicator: {
        backgroundColor: Colors.info + "20",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    syncText: {
        fontSize: 12,
    },

    // Stats row
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.text.secondary,
        textTransform: "uppercase",
        fontWeight: "500",
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.border,
        marginHorizontal: 20,
    },

    // Carte de mon solde
    balanceCard: {
        backgroundColor: Colors.backgroundColors.secondary,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    balanceHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    balanceEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    balanceDescription: {
        fontSize: 14,
        color: Colors.text.secondary,
        fontWeight: "500",
    },
    balanceAmount: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
    },

    // Bouton de refresh
    refreshButton: {
        alignSelf: "center",
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.backgroundColors.secondary,
        borderRadius: 20,
    },
    refreshText: {
        fontSize: 12,
        color: Colors.text.secondary,
        fontWeight: "500",
    },
});
