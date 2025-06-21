import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { ExpenseItem as ExpenseType } from "../services/firebaseService";

interface ExpenseItemProps {
    expense: ExpenseType;
    payerName: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
    expense,
    payerName,
    onEdit,
    onDelete,
}) => {
    const canEdit = onEdit !== undefined;
    const canDelete = onDelete !== undefined;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.label}>{expense.label}</Text>
                    <Text style={styles.amount}>
                        {expense.amount.toFixed(2)}€
                    </Text>
                </View>

                <View style={styles.details}>
                    <View style={styles.detailItem}>
                        <Ionicons name="person" size={14} color="#7ED957" />
                        <Text style={styles.detailText}>
                            Payé par {payerName}
                        </Text>
                    </View>

                    <Text style={styles.date}>
                        {expense.date.toLocaleDateString("fr-FR")}
                    </Text>
                </View>
            </View>

            {(canEdit || canDelete) && (
                <View style={styles.actions}>
                    {canEdit && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={onEdit}
                        >
                            <Ionicons name="pencil" size={16} color="#666" />
                        </TouchableOpacity>
                    )}

                    {canDelete && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={onDelete}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={16}
                                color="#FF4444"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: Spacing.xs,
    },
    label: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
        fontWeight: "600",
        flex: 1,
    },
    amount: {
        ...TextStyles.h4,
        color: "#7ED957",
        fontWeight: "700",
    },
    details: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailText: {
        ...TextStyles.body2,
        color: Colors.textPrimary,
        marginLeft: Spacing.xs,
    },
    date: {
        ...TextStyles.body2,
        color: "#999",
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default ExpenseItem;
