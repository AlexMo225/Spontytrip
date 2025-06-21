import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ExpenseItem from "../components/ExpenseItem";
import TripBalanceSummary from "../components/TripBalanceSummary";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { useAuth } from "../contexts/AuthContext";
import { useTripSync } from "../hooks/useTripSync";
import { ExpenseItem as ExpenseType } from "../services/firebaseService";
import { RootStackParamList } from "../types";

type ExpensesScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Expenses"
>;
type ExpensesScreenRouteProp = RouteProp<RootStackParamList, "Expenses">;

interface Props {
    navigation: ExpensesScreenNavigationProp;
    route: ExpensesScreenRouteProp;
}

const ExpensesScreen: React.FC<Props> = ({ navigation, route }) => {
    const { user } = useAuth();
    const { tripId } = route.params;
    const { trip, expenses, loading, error } = useTripSync(tripId);

    const [localExpenses, setLocalExpenses] = useState<ExpenseType[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<ExpenseType | null>(
        null
    );

    // Form state
    const [formData, setFormData] = useState({
        label: "",
        amount: "",
        paidBy: user?.uid || "",
    });

    // Synchroniser les dépenses locales avec Firebase
    useEffect(() => {
        if (expenses?.expenses) {
            setLocalExpenses(expenses.expenses);
        }
    }, [expenses]);

    const isCreator = trip?.creatorId === user?.uid;

    const resetForm = () => {
        setFormData({
            label: "",
            amount: "",
            paidBy: user?.uid || "",
        });
        setEditingExpense(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleEditExpense = (expense: ExpenseType) => {
        setFormData({
            label: expense.label,
            amount: expense.amount.toString(),
            paidBy: expense.paidBy,
        });
        setEditingExpense(expense);
        setShowAddModal(true);
    };

    const handleSaveExpense = async () => {
        if (!formData.label.trim() || !formData.amount.trim()) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Erreur", "Le montant doit être un nombre positif");
            return;
        }

        const expenseData: ExpenseType = {
            id: editingExpense?.id || `exp_${Date.now()}`,
            label: formData.label.trim(),
            amount: amount,
            paidBy: formData.paidBy,
            paidByName:
                trip?.members.find((m) => m.userId === formData.paidBy)?.name ||
                "Inconnu",
            splitBetween: trip?.members.map((m) => m.userId) || [],
            date: editingExpense?.date || new Date(),
            createdAt: editingExpense?.createdAt || new Date(),
        };

        try {
            if (editingExpense) {
                // Optimistic update pour modification
                setLocalExpenses((prev) =>
                    prev.map((exp) =>
                        exp.id === editingExpense.id ? expenseData : exp
                    )
                );
            } else {
                // Optimistic update pour ajout
                setLocalExpenses((prev) => [...prev, expenseData]);
            }

            // Sauvegarder dans Firebase
            const firebaseService = (
                await import("../services/firebaseService")
            ).default;
            await firebaseService.updateExpenses(
                tripId,
                editingExpense
                    ? localExpenses.map((exp) =>
                          exp.id === editingExpense.id ? expenseData : exp
                      )
                    : [...localExpenses, expenseData],
                user?.uid || ""
            );

            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error("Erreur sauvegarde dépense:", error);
            // Rollback en cas d'erreur
            if (expenses?.expenses) {
                setLocalExpenses(expenses.expenses);
            }
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        const expense = localExpenses.find((e) => e.id === expenseId);
        if (!expense) return;

        // Vérifier permissions
        if (!isCreator && expense.paidBy !== user?.uid) {
            Alert.alert(
                "Permission refusée",
                "Vous ne pouvez supprimer que vos propres dépenses."
            );
            return;
        }

        Alert.alert(
            "Supprimer la dépense",
            `Êtes-vous sûr de vouloir supprimer "${expense.label}" ?`,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        // Optimistic update
                        setLocalExpenses((prev) =>
                            prev.filter((e) => e.id !== expenseId)
                        );

                        try {
                            // Supprimer dans Firebase
                            const firebaseService = (
                                await import("../services/firebaseService")
                            ).default;
                            const updatedExpenses = localExpenses.filter(
                                (e) => e.id !== expenseId
                            );
                            await firebaseService.updateExpenses(
                                tripId,
                                updatedExpenses,
                                user?.uid || ""
                            );
                        } catch (error) {
                            console.error("Erreur suppression dépense:", error);
                            // Rollback en cas d'erreur
                            if (expenses?.expenses) {
                                setLocalExpenses(expenses.expenses);
                            }
                        }
                    },
                },
            ]
        );
    };

    const calculateStats = () => {
        const total = localExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );
        const myExpenses = localExpenses
            .filter((expense) => expense.paidBy === user?.uid)
            .reduce((sum, expense) => sum + expense.amount, 0);

        return {
            total,
            myExpenses,
            count: localExpenses.length,
        };
    };

    const renderExpenseItem = ({ item }: { item: ExpenseType }) => {
        const payer = trip?.members.find((m) => m.userId === item.paidBy);
        const canEdit = isCreator || item.paidBy === user?.uid;

        return (
            <ExpenseItem
                expense={item}
                payerName={
                    payer?.userId === user?.uid
                        ? "Vous"
                        : payer?.name || "Inconnu"
                }
                onEdit={canEdit ? () => handleEditExpense(item) : () => {}}
                onDelete={
                    canEdit ? () => handleDeleteExpense(item.id) : () => {}
                }
            />
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7ED957" />
                    <Text style={styles.loadingText}>
                        Chargement des dépenses...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !trip) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={64}
                        color="#FF6B6B"
                    />
                    <Text style={styles.errorTitle}>Erreur</Text>
                    <Text style={styles.errorText}>
                        {error || "Impossible de charger les dépenses"}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.retryButtonText}>Retour</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const stats = calculateStats();

    // Adapter les membres pour TripBalanceSummary
    const adaptedMembers = trip.members.map((member) => ({
        userId: member.userId,
        name: member.name,
        isCreator: member.userId === trip.creatorId,
    }));

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={Colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dépenses</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleOpenAddModal}
                >
                    <Ionicons name="add" size={24} color="#7ED957" />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.total}€</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.myExpenses}€</Text>
                    <Text style={styles.statLabel}>Mes dépenses</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.count}</Text>
                    <Text style={styles.statLabel}>Transactions</Text>
                </View>
            </View>

            {/* Balance Summary */}
            <TripBalanceSummary
                expenses={localExpenses}
                members={adaptedMembers}
                currentUserId={user?.uid || ""}
            />

            {/* Expenses List */}
            {localExpenses.length > 0 ? (
                <FlatList
                    data={localExpenses}
                    renderItem={renderExpenseItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="wallet-outline" size={64} color="#E5E5E5" />
                    <Text style={styles.emptyTitle}>Aucune dépense</Text>
                    <Text style={styles.emptyText}>
                        Commencez par ajouter vos premières dépenses
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={handleOpenAddModal}
                    >
                        <Text style={styles.emptyButtonText}>
                            Ajouter une dépense
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Add/Edit Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {editingExpense
                                ? "Modifier la dépense"
                                : "Nouvelle dépense"}
                        </Text>

                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    Description
                                </Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Ex: Restaurant, Hôtel..."
                                    value={formData.label}
                                    onChangeText={(text) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            label: text,
                                        }))
                                    }
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    Montant (€)
                                </Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChangeText={(text) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            amount: text,
                                        }))
                                    }
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Payé par</Text>
                                <View style={styles.memberSelector}>
                                    {trip.members.map((member) => (
                                        <TouchableOpacity
                                            key={member.userId}
                                            style={[
                                                styles.memberOption,
                                                formData.paidBy ===
                                                    member.userId &&
                                                    styles.memberOptionSelected,
                                            ]}
                                            onPress={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    paidBy: member.userId,
                                                }))
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.memberOptionText,
                                                    formData.paidBy ===
                                                        member.userId &&
                                                        styles.memberOptionTextSelected,
                                                ]}
                                            >
                                                {member.userId === user?.uid
                                                    ? "Vous"
                                                    : member.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowAddModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Annuler
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveExpense}
                            >
                                <Text style={styles.saveButtonText}>
                                    {editingExpense ? "Modifier" : "Ajouter"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#637887",
        fontFamily: "Inter_400Regular",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        backgroundColor: "#F8F9FA",
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FF6B6B",
        marginTop: 16,
        marginBottom: 8,
        fontFamily: "Inter_600SemiBold",
    },
    errorText: {
        fontSize: 16,
        color: "#637887",
        textAlign: "center",
        marginBottom: 24,
        fontFamily: "Inter_400Regular",
    },
    retryButton: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#F8F9FA",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
        flex: 1,
        textAlign: "center",
        marginHorizontal: 16,
        fontFamily: "Inter_600SemiBold",
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#7ED957",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
        fontFamily: "Inter_700Bold",
    },
    statLabel: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        fontFamily: "Inter_400Regular",
    },
    balanceSection: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    balanceCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    balanceHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    balanceIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#7ED957",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    balanceTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        fontFamily: "Inter_600SemiBold",
    },
    balanceText: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        fontFamily: "Inter_500Medium",
    },
    balanceAmount: {
        fontSize: 20,
        fontWeight: "600",
        color: "#7ED957",
        textAlign: "center",
        fontFamily: "Inter_600SemiBold",
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    expenseCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    expenseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    expenseTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        flex: 1,
        marginRight: 12,
        fontFamily: "Inter_600SemiBold",
    },
    expenseAmount: {
        fontSize: 18,
        fontWeight: "700",
        color: "#7ED957",
        fontFamily: "Inter_700Bold",
    },
    expenseDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    expenseInfo: {
        flex: 1,
    },
    expensePaidBy: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 2,
        fontFamily: "Inter_400Regular",
    },
    expenseDate: {
        fontSize: 12,
        color: "#9CA3AF",
        fontFamily: "Inter_400Regular",
    },
    expenseActions: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    editButton: {
        backgroundColor: "#F3F4F6",
    },
    deleteButton: {
        backgroundColor: "#FEF2F2",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingBottom: 100,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: "#6B7280",
        marginTop: 24,
        marginBottom: 12,
        textAlign: "center",
        fontFamily: "Inter_600SemiBold",
    },
    emptyText: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
        fontFamily: "Inter_400Regular",
    },
    emptyButton: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
        fontFamily: "Inter_600SemiBold",
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    formContainer: {
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#374151",
        marginBottom: 8,
        fontFamily: "Inter_500Medium",
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: "#1F2937",
        backgroundColor: "#FFFFFF",
        fontFamily: "Inter_400Regular",
    },
    memberSelector: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.sm,
    },
    memberOption: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#DBE0E5",
        backgroundColor: "#FFFFFF",
    },
    memberOptionSelected: {
        backgroundColor: "#7ED957",
        borderColor: "#7ED957",
    },
    memberOptionText: {
        ...TextStyles.body2,
        color: Colors.textPrimary,
    },
    memberOptionTextSelected: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        backgroundColor: "#F3F4F6",
    },
    saveButton: {
        backgroundColor: "#7ED957",
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    cancelButtonText: {
        color: "#6B7280",
    },
    saveButtonText: {
        color: "#FFFFFF",
    },
});

export default ExpensesScreen;
