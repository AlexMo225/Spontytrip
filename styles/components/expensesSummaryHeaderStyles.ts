import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { Colors } from "../../constants";

interface ExpensesSummaryHeaderStyles {
    container: ViewStyle;
    loadingCard: ViewStyle;
    loadingText: TextStyle;
    emptyCard: ViewStyle;
    emptyTitle: TextStyle;
    emptySubtitle: TextStyle;
    mainCard: ViewStyle;
    cardHeader: ViewStyle;
    title: TextStyle;
    syncIndicator: ViewStyle;
    syncText: TextStyle;
    statsRow: ViewStyle;
    statItem: ViewStyle;
    statValue: TextStyle;
    statLabel: TextStyle;
    statDivider: ViewStyle;
    balanceCard: ViewStyle;
    balanceHeader: ViewStyle;
    balanceEmoji: TextStyle;
    balanceDescription: TextStyle;
    balanceAmount: TextStyle;
    refreshButton: ViewStyle;
    refreshText: TextStyle;
}

export const useExpensesSummaryHeaderStyle = () => {
    return StyleSheet.create<ExpensesSummaryHeaderStyles>({
        container: {
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 10,
        },

        // États de chargement
        loadingCard: {
            backgroundColor: Colors.white,
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
            color: Colors.textSecondary,
            fontWeight: "500",
        },

        // État vide
        emptyCard: {
            backgroundColor: Colors.white,
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
            color: Colors.textPrimary,
            marginBottom: 8,
        },
        emptySubtitle: {
            fontSize: 14,
            color: Colors.textSecondary,
            textAlign: "center",
        },

        // Carte principale
        mainCard: {
            backgroundColor: Colors.white,
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
            color: Colors.textPrimary,
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
            color: Colors.textSecondary,
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
            backgroundColor: Colors.background,
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
            color: Colors.textSecondary,
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
            backgroundColor: Colors.background,
            borderRadius: 20,
        },
        refreshText: {
            fontSize: 12,
            color: Colors.textSecondary,
            fontWeight: "500",
        },
    });
};
