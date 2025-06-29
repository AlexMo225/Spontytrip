import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { ExpenseItem, TripMember } from "../services/firebaseService";
import SpontyModal from "./SpontyModal";

interface ExpensesListProps {
    expenses: ExpenseItem[];
    members: TripMember[];
    loading: boolean;
    onDeleteExpense: (expenseId: string) => Promise<void>;
    currentUserId: string;
}

/**
 * 📋 Liste des dépenses avec cartes modernes
 */
export const ExpensesList: React.FC<ExpensesListProps> = ({
    expenses,
    members,
    loading,
    onDeleteExpense,
    currentUserId,
}) => {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
        visible: boolean;
        expense: ExpenseItem | null;
    }>({ visible: false, expense: null });
    const [errorModal, setErrorModal] = useState<{
        visible: boolean;
        message: string;
    }>({ visible: false, message: "" });

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>📋 Historique</Text>
                <View style={styles.loadingCard}>
                    <Text style={styles.loadingText}>💫 Chargement...</Text>
                </View>
            </View>
        );
    }

    if (expenses.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>📋 Historique</Text>
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>📝 Aucune dépense</Text>
                    <Text style={styles.emptySubtitle}>
                        Les dépenses ajoutées apparaîtront ici
                    </Text>
                </View>
            </View>
        );
    }

    const handleDeleteExpense = async (expense: ExpenseItem) => {
        const canDelete = expense.paidBy === currentUserId;

        if (!canDelete) {
            setErrorModal({
                visible: true,
                message:
                    "Seule la personne qui a ajouté cette dépense peut la supprimer.",
            });
            return;
        }

        setConfirmDeleteModal({
            visible: true,
            expense,
        });
    };

    const confirmDelete = async () => {
        if (!confirmDeleteModal.expense) return;

        try {
            setDeletingId(confirmDeleteModal.expense.id);
            await onDeleteExpense(confirmDeleteModal.expense.id);
            setConfirmDeleteModal({ visible: false, expense: null });
        } catch (error) {
            setErrorModal({
                visible: true,
                message: "Impossible de supprimer la dépense",
            });
        } finally {
            setDeletingId(null);
        }
    };

    const renderExpense = ({ item }: { item: ExpenseItem }) => (
        <ModernExpenseCard
            expense={item}
            members={members}
            currentUserId={currentUserId}
            onDelete={() => handleDeleteExpense(item)}
            isDeleting={deletingId === item.id}
        />
    );

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>
                    📋 Historique ({expenses.length})
                </Text>
                <FlatList
                    data={expenses}
                    renderItem={renderExpense}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false} // Car dans un ScrollView parent
                />
            </View>

            {/* Modal de confirmation de suppression */}
            <SpontyModal
                visible={confirmDeleteModal.visible}
                type="warning"
                title="Supprimer la dépense"
                message={
                    confirmDeleteModal.expense
                        ? `Êtes-vous sûr de vouloir supprimer "${confirmDeleteModal.expense.label}" (${confirmDeleteModal.expense.amount}€) ?`
                        : ""
                }
                buttons={[
                    {
                        text: "Annuler",
                        onPress: () =>
                            setConfirmDeleteModal({
                                visible: false,
                                expense: null,
                            }),
                        style: "cancel",
                    },
                    {
                        text: "Supprimer",
                        onPress: confirmDelete,
                        style: "destructive",
                    },
                ]}
            />

            {/* Modal d'erreur */}
            <SpontyModal
                visible={errorModal.visible}
                type="error"
                title="Erreur"
                message={errorModal.message}
                buttons={[
                    {
                        text: "OK",
                        onPress: () =>
                            setErrorModal({ visible: false, message: "" }),
                        style: "default",
                    },
                ]}
            />
        </>
    );
};

/**
 * 💳 Carte de dépense moderne et robuste
 */
const ModernExpenseCard: React.FC<{
    expense: ExpenseItem;
    members: TripMember[];
    currentUserId: string;
    onDelete: () => void;
    isDeleting: boolean;
}> = ({ expense, members, currentUserId, onDelete, isDeleting }) => {
    try {
        // 🛡️ Protection contre les données manquantes
        const amount = expense?.amount || 0;
        const label = expense?.label || "Dépense sans nom";
        const paidBy = expense?.paidBy || "";
        const participants = expense?.participants || [];
        const createdAt = expense?.createdAt;

        // Trouver qui a payé (avec fallback robuste)
        const payer = members.find((m) => m.userId === paidBy);
        const payerName = payer?.name || "Utilisateur inconnu";
        const isMyExpense = paidBy === currentUserId;

        // Noms des participants (avec fallback)
        const participantNames = participants
            .map((participantId) => {
                const participant = members.find(
                    (m) => m.userId === participantId
                );
                return participant?.name || "Inconnu";
            })
            .filter((name) => name !== "Inconnu") // Filtrer les inconnus
            .join(", ");

        // Formatage de la date (protection contre les dates invalides)
        let formattedDate = "Date inconnue";
        try {
            let dateObj: Date | null = null;

            // Gestion des différents types de timestamp
            if (createdAt) {
                if (createdAt instanceof Date) {
                    dateObj = createdAt;
                } else if (
                    createdAt &&
                    typeof (createdAt as any).toDate === "function"
                ) {
                    dateObj = (createdAt as any).toDate();
                } else if (typeof createdAt === "number") {
                    dateObj = new Date(createdAt);
                } else if (typeof createdAt === "string") {
                    dateObj = new Date(createdAt);
                }
            }

            if (dateObj && !isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            }
        } catch (dateError) {
            console.warn("⚠️ Erreur formatage date:", dateError);
        }

        // Calcul du montant par personne (protection division par zéro)
        const amountPerPerson =
            participants.length > 0 ? amount / participants.length : amount;

        return (
            <View
                style={[
                    styles.expenseCard,
                    isMyExpense && styles.expenseCardMine,
                    isDeleting && styles.expenseCardDeleting,
                ]}
            >
                {/* Header avec montant et actions */}
                <View style={styles.expenseHeader}>
                    <View style={styles.expenseAmount}>
                        <Text style={styles.expenseAmountText}>
                            {amount.toFixed(2)}€
                        </Text>
                        <Text style={styles.expenseAmountPerPerson}>
                            {amountPerPerson.toFixed(2)}€/pers
                        </Text>
                    </View>

                    {isMyExpense && !isDeleting && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={onDelete}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.deleteButtonText}>🗑️</Text>
                        </TouchableOpacity>
                    )}

                    {isDeleting && (
                        <View style={styles.deletingIndicator}>
                            <Text style={styles.deletingText}>⏳</Text>
                        </View>
                    )}
                </View>

                {/* Titre de la dépense */}
                <Text style={styles.expenseLabel}>{label}</Text>

                {/* Informations détaillées */}
                <View style={styles.expenseDetails}>
                    <Text style={styles.expenseDetailText}>
                        💳 Payé par{" "}
                        <Text style={styles.expensePayerName}>{payerName}</Text>
                        {isMyExpense && (
                            <Text style={styles.expenseMeBadge}> (vous)</Text>
                        )}
                    </Text>

                    {participantNames && (
                        <Text style={styles.expenseDetailText}>
                            👥 Pour : {participantNames}
                        </Text>
                    )}

                    <Text style={styles.expenseDate}>🕒 {formattedDate}</Text>
                </View>
            </View>
        );
    } catch (error) {
        // 🚨 Carte d'erreur en cas de problème
        console.error("❌ Erreur rendu expense card:", error, expense);
        return (
            <View style={[styles.expenseCard, styles.expenseCardError]}>
                <Text style={styles.errorTitle}>⚠️ Erreur d'affichage</Text>
                <Text style={styles.errorText}>
                    Impossible d'afficher cette dépense
                </Text>
                <Text style={styles.errorDetails}>
                    ID: {expense?.id || "inconnu"}
                </Text>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 16,
    },

    // États de chargement/vide
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
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: "center",
    },

    // Cartes de dépenses
    expenseCard: {
        backgroundColor: Colors.backgroundColors.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: Colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    expenseCardMine: {
        borderColor: Colors.primary,
        borderWidth: 2,
    },
    expenseCardDeleting: {
        opacity: 0.6,
    },
    expenseCardError: {
        borderColor: Colors.error,
        borderWidth: 2,
        backgroundColor: Colors.error + "10",
    },

    // Header de la carte
    expenseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    expenseAmount: {
        alignItems: "flex-start",
    },
    expenseAmountText: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.primary,
    },
    expenseAmountPerPerson: {
        fontSize: 12,
        color: Colors.text.secondary,
        fontWeight: "500",
    },

    // Boutons d'action
    deleteButton: {
        padding: 8,
        backgroundColor: Colors.error + "20",
        borderRadius: 8,
    },
    deleteButtonText: {
        fontSize: 16,
    },
    deletingIndicator: {
        padding: 8,
        backgroundColor: Colors.warning + "20",
        borderRadius: 8,
    },
    deletingText: {
        fontSize: 16,
    },

    // Contenu de la carte
    expenseLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 8,
    },

    expenseDetails: {
        gap: 4,
    },
    expenseDetailText: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    expensePayerName: {
        fontWeight: "600",
        color: Colors.text.primary,
    },
    expenseMeBadge: {
        fontWeight: "600",
        color: Colors.primary,
    },
    expenseDate: {
        fontSize: 12,
        color: Colors.text.muted,
        marginTop: 4,
    },

    // Cartes d'erreur
    errorTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.error,
        marginBottom: 4,
    },
    errorText: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginBottom: 4,
    },
    errorDetails: {
        fontSize: 12,
        color: Colors.text.muted,
        fontStyle: "italic",
    },
});
