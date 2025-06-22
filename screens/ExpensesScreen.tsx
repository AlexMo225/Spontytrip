import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { useTripSync } from "../hooks/useTripSync";
import firebaseService, {
    DebtCalculation,
    ExpenseItem,
    ExpensesSummary,
    TripMember,
} from "../services/firebaseService";
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
    const { tripId } = route.params;
    const { user } = useAuth();
    const { trip, expenses, loading, error } = useTripSync(tripId);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [summary, setSummary] = useState<ExpensesSummary | null>(null);

    // États pour le formulaire d'ajout
    const [newExpense, setNewExpense] = useState({
        label: "",
        amount: "",
        paidBy: user?.uid || "",
        participants: [user?.uid || ""],
    });

    useEffect(() => {
        if (expenses && trip && user) {
            console.log("📊 === ÉCRAN DÉPENSES - CALCUL ===");
            console.log("Utilisateur connecté:", user.uid, user.displayName);
            console.log("Voyage:", trip.title);
            console.log(
                "Membres du voyage:",
                trip.members.map((m: TripMember) => `${m.name} (${m.userId})`)
            );
            console.log("Nombre de dépenses:", expenses.expenses?.length || 0);

            const tripMembers = trip.members.map((member) => ({
                userId: member.userId,
                name: member.name,
            }));

            const calculatedSummary = firebaseService.calculateExpensesSummary(
                expenses.expenses || [],
                tripMembers,
                user.uid
            );

            console.log("Résumé calculé pour", user.displayName, ":");
            console.log(
                "- Total dépenses:",
                calculatedSummary.totalExpenses.toFixed(2),
                "€"
            );
            console.log(
                "- Mon solde:",
                calculatedSummary.myBalance?.balance.toFixed(2),
                "€"
            );
            console.log(
                "- Nombre de remboursements:",
                calculatedSummary.debtsToSettle.length
            );
            console.log("📊 === FIN CALCUL ÉCRAN ===\n");

            setSummary(calculatedSummary);
        }
    }, [expenses, trip, user]);

    const handleAddExpense = async () => {
        if (
            !newExpense.label.trim() ||
            !newExpense.amount ||
            newExpense.participants.length === 0
        ) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        if (!trip || !user) return;

        try {
            const paidByMember = trip.members.find(
                (m: TripMember) => m.userId === newExpense.paidBy
            );
            const participantMembers = trip.members.filter((m: TripMember) =>
                newExpense.participants.includes(m.userId)
            );

            const expense: Omit<ExpenseItem, "id" | "createdAt" | "updatedAt"> =
                {
                    tripId,
                    label: newExpense.label.trim(),
                    amount: parseFloat(newExpense.amount),
                    paidBy: newExpense.paidBy,
                    paidByName: paidByMember?.name || "Inconnu",
                    participants: newExpense.participants,
                    participantNames: participantMembers.map(
                        (m: TripMember) => m.name
                    ),
                    date: new Date(),
                    createdBy: user.uid,
                };

            await firebaseService.addExpense(tripId, expense, user.uid);

            // Réinitialiser le formulaire
            setNewExpense({
                label: "",
                amount: "",
                paidBy: user.uid,
                participants: [user.uid],
            });
            setShowAddModal(false);

            Alert.alert("Succès", "Dépense ajoutée avec succès");
        } catch (error) {
            console.error("Erreur ajout dépense:", error);
            Alert.alert("Erreur", "Impossible d'ajouter la dépense");
        }
    };

    const handleDeleteExpense = (expense: ExpenseItem) => {
        if (!user || !trip) return;

        const canDelete =
            expense.createdBy === user.uid || trip.creatorId === user.uid;

        if (!canDelete) {
            Alert.alert(
                "Erreur",
                "Vous ne pouvez supprimer que vos propres dépenses"
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
                        try {
                            await firebaseService.deleteExpense(
                                tripId,
                                expense.id,
                                user.uid
                            );
                            Alert.alert("Succès", "Dépense supprimée");
                        } catch (error) {
                            Alert.alert(
                                "Erreur",
                                "Impossible de supprimer la dépense"
                            );
                        }
                    },
                },
            ]
        );
    };

    const toggleParticipant = (userId: string) => {
        setNewExpense((prev) => ({
            ...prev,
            participants: prev.participants.includes(userId)
                ? prev.participants.filter((id) => id !== userId)
                : [...prev.participants, userId],
        }));
    };

    const renderExpenseItem = ({ item }: { item: ExpenseItem }) => {
        const canDelete =
            item.createdBy === user?.uid || trip?.creatorId === user?.uid;
        const amountPerPerson = item.amount / item.participants.length;

        return (
            <View style={styles.expenseCard}>
                <View style={styles.expenseHeader}>
                    <View style={styles.expenseInfo}>
                        <Text style={styles.expenseLabel}>{item.label}</Text>
                        <Text style={styles.expenseAmount}>
                            {item.amount.toFixed(2)}€
                        </Text>
                    </View>
                    {canDelete && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteExpense(item)}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={20}
                                color="#FF6B6B"
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.expenseDetails}>
                    <Text style={styles.expenseDetailText}>
                        Payé par:{" "}
                        <Text style={styles.boldText}>{item.paidByName}</Text>
                    </Text>
                    <Text style={styles.expenseDetailText}>
                        {amountPerPerson.toFixed(2)}€ par personne
                    </Text>
                    <Text style={styles.expenseDetailText}>
                        Participants: {item.participantNames.join(", ")}
                    </Text>
                    <Text style={styles.expenseDate}>
                        {item.date.toLocaleDateString("fr-FR")}
                    </Text>
                </View>
            </View>
        );
    };

    const renderDebtItem = ({ item }: { item: DebtCalculation }) => (
        <View style={styles.debtCard}>
            <Ionicons name="arrow-forward" size={20} color="#4DA1A9" />
            <Text style={styles.debtText}>
                <Text style={styles.boldText}>{item.fromName}</Text> doit{" "}
                <Text style={styles.amountText}>{item.amount.toFixed(2)}€</Text>{" "}
                à <Text style={styles.boldText}>{item.toName}</Text>
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4DA1A9" />
                <Text style={styles.loadingText}>
                    Chargement des dépenses...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryButtonText}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                        color={Colors.text.primary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dépenses</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddModal(true)}
                >
                    <Ionicons name="add" size={24} color="#4DA1A9" />
                </TouchableOpacity>
            </View>

            {/* Summary Cards */}
            {summary && (
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>
                            Total des dépenses
                        </Text>
                        <Text style={styles.summaryAmount}>
                            {summary.totalExpenses.toFixed(2)}€
                        </Text>
                    </View>

                    {summary.myBalance && (
                        <View
                            style={[
                                styles.summaryCard,
                                summary.myBalance.balance >= 0
                                    ? styles.positiveBalance
                                    : styles.negativeBalance,
                            ]}
                        >
                            <Text style={styles.summaryTitle}>Mon solde</Text>
                            <Text
                                style={[
                                    styles.summaryAmount,
                                    summary.myBalance.balance >= 0
                                        ? { color: "#4CAF50" }
                                        : { color: "#FF6B6B" },
                                ]}
                            >
                                {summary.myBalance.balance >= 0 ? "+" : ""}
                                {summary.myBalance.balance.toFixed(2)}€
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.balanceButton}
                        onPress={() => setShowBalanceModal(true)}
                    >
                        <Text style={styles.balanceButtonText}>
                            Voir les remboursements
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Expenses List */}
            <FlatList
                data={expenses?.expenses || []}
                renderItem={renderExpenseItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="wallet-outline"
                            size={64}
                            color="#CCC"
                        />
                        <Text style={styles.emptyText}>
                            Aucune dépense pour le moment
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Ajoutez votre première dépense !
                        </Text>
                    </View>
                }
            />

            {/* Add Expense Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setShowAddModal(false)}
                        >
                            <Text style={styles.cancelText}>Annuler</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Nouvelle dépense</Text>
                        <TouchableOpacity onPress={handleAddExpense}>
                            <Text style={styles.saveText}>Ajouter</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Label */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Libellé</Text>
                            <TextInput
                                style={styles.textInput}
                                value={newExpense.label}
                                onChangeText={(text) =>
                                    setNewExpense((prev) => ({
                                        ...prev,
                                        label: text,
                                    }))
                                }
                                placeholder="Ex: Courses, Essence, Restaurant..."
                            />
                        </View>

                        {/* Amount */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Montant (€)</Text>
                            <TextInput
                                style={styles.textInput}
                                value={newExpense.amount}
                                onChangeText={(text) =>
                                    setNewExpense((prev) => ({
                                        ...prev,
                                        amount: text,
                                    }))
                                }
                                placeholder="0.00"
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Paid By */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Payé par</Text>
                            {trip?.members.map((member) => (
                                <TouchableOpacity
                                    key={member.userId}
                                    style={[
                                        styles.memberOption,
                                        newExpense.paidBy === member.userId &&
                                            styles.selectedMember,
                                    ]}
                                    onPress={() =>
                                        setNewExpense((prev) => ({
                                            ...prev,
                                            paidBy: member.userId,
                                        }))
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.memberText,
                                            newExpense.paidBy ===
                                                member.userId &&
                                                styles.selectedMemberText,
                                        ]}
                                    >
                                        {member.name}
                                    </Text>
                                    {newExpense.paidBy === member.userId && (
                                        <Ionicons
                                            name="checkmark"
                                            size={20}
                                            color="#4DA1A9"
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Participants */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Participants</Text>
                            {trip?.members.map((member) => (
                                <TouchableOpacity
                                    key={member.userId}
                                    style={[
                                        styles.memberOption,
                                        newExpense.participants.includes(
                                            member.userId
                                        ) && styles.selectedMember,
                                    ]}
                                    onPress={() =>
                                        toggleParticipant(member.userId)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.memberText,
                                            newExpense.participants.includes(
                                                member.userId
                                            ) && styles.selectedMemberText,
                                        ]}
                                    >
                                        {member.name}
                                    </Text>
                                    {newExpense.participants.includes(
                                        member.userId
                                    ) && (
                                        <Ionicons
                                            name="checkmark"
                                            size={20}
                                            color="#4DA1A9"
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Balance Modal */}
            <Modal
                visible={showBalanceModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setShowBalanceModal(false)}
                        >
                            <Text style={styles.cancelText}>Fermer</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Remboursements</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {summary?.debtsToSettle &&
                        summary.debtsToSettle.length > 0 ? (
                            <FlatList
                                data={summary.debtsToSettle}
                                renderItem={renderDebtItem}
                                keyExtractor={(item, index) =>
                                    `${item.from}-${item.to}-${index}`
                                }
                                scrollEnabled={false}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={64}
                                    color="#4CAF50"
                                />
                                <Text style={styles.emptyText}>
                                    Tout est réglé !
                                </Text>
                                <Text style={styles.emptySubtext}>
                                    Aucun remboursement nécessaire
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    addButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    summaryContainer: {
        padding: 16,
        gap: 12,
    },
    summaryCard: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    positiveBalance: {
        borderColor: "#4CAF50",
        backgroundColor: "#F8FFF8",
    },
    negativeBalance: {
        borderColor: "#FF6B6B",
        backgroundColor: "#FFF8F8",
    },
    summaryTitle: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    summaryAmount: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
    },
    balanceButton: {
        backgroundColor: "#4DA1A9",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    balanceButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    listContainer: {
        padding: 16,
        gap: 12,
    },
    expenseCard: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    expenseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    expenseInfo: {
        flex: 1,
    },
    expenseLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    expenseAmount: {
        fontSize: 18,
        fontWeight: "700",
        color: "#4DA1A9",
    },
    deleteButton: {
        padding: 4,
    },
    expenseDetails: {
        gap: 4,
    },
    expenseDetailText: {
        fontSize: 14,
        color: "#666",
    },
    boldText: {
        fontWeight: "600",
        color: "#333",
    },
    expenseDate: {
        fontSize: 12,
        color: "#999",
        marginTop: 4,
    },
    debtCard: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    debtText: {
        flex: 1,
        fontSize: 14,
        color: "#333",
    },
    amountText: {
        fontWeight: "700",
        color: "#4DA1A9",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#999",
        marginTop: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    errorText: {
        fontSize: 16,
        color: "#FF6B6B",
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#4DA1A9",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    cancelText: {
        fontSize: 16,
        color: "#666",
    },
    saveText: {
        fontSize: 16,
        color: "#4DA1A9",
        fontWeight: "600",
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    memberOption: {
        backgroundColor: "#FFFFFF",
        padding: 12,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    selectedMember: {
        borderColor: "#4DA1A9",
        backgroundColor: "#F0F8FF",
    },
    memberText: {
        fontSize: 16,
        color: "#333",
    },
    selectedMemberText: {
        color: "#4DA1A9",
        fontWeight: "600",
    },
});

export default ExpensesScreen;
