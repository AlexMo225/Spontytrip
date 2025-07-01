import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { Colors } from "../constants";

interface SettlementsSectionStyles {
    container: ViewStyle;
    sectionTitle: TextStyle;
    emptyCard: ViewStyle;
    emptyText: TextStyle;
    emptySubtext: TextStyle;
    personalCard: ViewStyle;
    personalHeader: ViewStyle;
    personalEmoji: TextStyle;
    personalTitle: TextStyle;
    personalSection: ViewStyle;
    personalSectionTitle: TextStyle;
    debtText: TextStyle;
    creditText: TextStyle;
    totalDebt: TextStyle;
    totalCredit: TextStyle;
    balancedText: TextStyle;
    overviewCard: ViewStyle;
    overviewTitle: TextStyle;
    balanceItem: ViewStyle;
    balanceItemMe: ViewStyle;
    balanceItemLeft: ViewStyle;
    balanceItemName: TextStyle;
    balanceItemDetails: TextStyle;
    balanceItemAmount: TextStyle;
    allSettlementsCard: ViewStyle;
    allSettlementsTitle: TextStyle;
    settlementItem: ViewStyle;
    settlementItemContent: ViewStyle;
    settlementItemLeft: ViewStyle;
}

export const useSettlementsSectionStyle = () => {
    return StyleSheet.create<SettlementsSectionStyles>({
        container: {
            paddingHorizontal: 20,
            paddingBottom: 10,
        },

        sectionTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: Colors.textPrimary,
            marginBottom: 16,
        },

        // État vide
        emptyCard: {
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
        emptyText: {
            fontSize: 16,
            fontWeight: "600",
            color: Colors.success,
            marginBottom: 8,
        },
        emptySubtext: {
            fontSize: 14,
            color: Colors.textSecondary,
            textAlign: "center",
        },

        // Carte personnelle
        personalCard: {
            backgroundColor: Colors.white,
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
            color: Colors.textPrimary,
        },
        personalSection: {
            marginBottom: 12,
        },
        personalSectionTitle: {
            fontSize: 14,
            fontWeight: "600",
            color: Colors.textPrimary,
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
            backgroundColor: Colors.white,
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
            color: Colors.textPrimary,
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
            color: Colors.textPrimary,
        },
        balanceItemDetails: {
            fontSize: 12,
            color: Colors.textSecondary,
        },
        balanceItemAmount: {
            fontSize: 14,
            fontWeight: "700",
        },

        // Tous les remboursements
        allSettlementsCard: {
            backgroundColor: Colors.white,
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
            color: Colors.textPrimary,
            marginBottom: 12,
        },

        // Items de remboursement
        settlementItem: {
            backgroundColor: Colors.white,
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
            color: Colors.textPrimary,
            flex: 1,
        },
        settlementItemFrom: {
            fontWeight: "500",
        },
        settlementItemArrow: {
            color: Colors.textSecondary,
        },
        settlementItemTo: {
            fontWeight: "500",
        },
        settlementItemAmount: {
            fontSize: 16,
            fontWeight: "600",
            color: Colors.textPrimary,
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
};
