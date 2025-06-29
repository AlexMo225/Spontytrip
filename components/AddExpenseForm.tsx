import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { ExpenseItem, TripMember } from "../services/firebaseService";
import SpontyModal from "./SpontyModal";

interface AddExpenseFormProps {
    members: TripMember[];
    currentUserId: string;
    onAddExpense: (
        expense: Omit<ExpenseItem, "id" | "createdAt" | "updatedAt">
    ) => Promise<void>;
    syncing: boolean;
}

/**
 * ➕ Formulaire d'ajout de dépense moderne
 */
export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({
    members,
    currentUserId,
    onAddExpense,
    syncing,
}) => {
    const [showForm, setShowForm] = useState(false);
    const [label, setLabel] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
        []
    );
    const [isAdding, setIsAdding] = useState(false);

    // États pour les modals
    const [errorModal, setErrorModal] = useState<{
        visible: boolean;
        message: string;
    }>({
        visible: false,
        message: "",
    });
    const [successModal, setSuccessModal] = useState(false);

    // Pré-sélectionner tous les membres par défaut
    React.useEffect(() => {
        if (members.length > 0 && selectedParticipants.length === 0) {
            setSelectedParticipants(members.map((m) => m.userId));
        }
    }, [members, selectedParticipants.length]);

    const resetForm = () => {
        setLabel("");
        setAmount("");
        setSelectedParticipants(members.map((m) => m.userId));
    };

    const handleSubmit = async () => {
        // Validation
        if (!label.trim()) {
            setErrorModal({
                visible: true,
                message: "Veuillez saisir un nom pour la dépense",
            });
            return;
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setErrorModal({
                visible: true,
                message: "Veuillez saisir un montant valide",
            });
            return;
        }

        if (selectedParticipants.length === 0) {
            setErrorModal({
                visible: true,
                message: "Veuillez sélectionner au moins un participant",
            });
            return;
        }

        try {
            setIsAdding(true);

            // Trouver les noms des participants sélectionnés
            const participantNames = selectedParticipants
                .map((participantId) => {
                    const participant = members.find(
                        (m) => m.userId === participantId
                    );
                    return participant?.name || "Inconnu";
                })
                .filter((name) => name !== "Inconnu");

            // Trouver le nom de celui qui paie
            const payer = members.find((m) => m.userId === currentUserId);
            const payerName = payer?.name || "Utilisateur inconnu";

            const expense: Omit<ExpenseItem, "id" | "createdAt" | "updatedAt"> =
                {
                    tripId: "", // Sera rempli par addExpense
                    label: label.trim(),
                    amount: parsedAmount,
                    paidBy: currentUserId,
                    paidByName: payerName,
                    participants: selectedParticipants,
                    participantNames: participantNames,
                    date: new Date(),
                    createdBy: currentUserId,
                };

            await onAddExpense(expense);

            // Succès
            resetForm();
            setShowForm(false);
            setSuccessModal(true);
        } catch (error) {
            console.error("❌ Erreur ajout dépense:", error);
            setErrorModal({
                visible: true,
                message: "Impossible d'ajouter la dépense. Veuillez réessayer.",
            });
        } finally {
            setIsAdding(false);
        }
    };

    const toggleParticipant = (userId: string) => {
        setSelectedParticipants((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const selectAllParticipants = () => {
        setSelectedParticipants(members.map((m) => m.userId));
    };

    const clearAllParticipants = () => {
        setSelectedParticipants([]);
    };

    // Calcul du montant par personne
    const amountPerPerson =
        selectedParticipants.length > 0 && amount
            ? (parseFloat(amount) / selectedParticipants.length).toFixed(2)
            : "0.00";

    return (
        <>
            {/* 🚀 Bouton d'ouverture */}
            <View style={styles.container}>
                <TouchableOpacity
                    style={[
                        styles.addButton,
                        syncing && styles.addButtonDisabled,
                    ]}
                    onPress={() => setShowForm(true)}
                    disabled={syncing}
                    activeOpacity={0.8}
                >
                    <Text style={styles.addButtonIcon}>➕</Text>
                    <Text style={styles.addButtonText}>
                        {syncing ? "Synchronisation..." : "Ajouter une dépense"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 📱 Modal du formulaire */}
            <Modal
                visible={showForm}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowForm(false)}
            >
                <View style={styles.modalContainer}>
                    {/* Header du modal */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowForm(false)}
                        >
                            <Text style={styles.modalCloseText}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            ➕ Nouvelle dépense
                        </Text>
                        <View style={styles.modalHeaderSpacer} />
                    </View>

                    <ScrollView
                        style={styles.modalContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* 📝 Nom de la dépense */}
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>
                                📝 Nom de la dépense
                            </Text>
                            <TextInput
                                style={styles.formInput}
                                value={label}
                                onChangeText={setLabel}
                                placeholder="Ex: Restaurant, Hôtel, Essence..."
                                placeholderTextColor={Colors.text.muted}
                                maxLength={50}
                            />
                        </View>

                        {/* 💰 Montant */}
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>💰 Montant</Text>
                            <View style={styles.amountInputContainer}>
                                <TextInput
                                    style={styles.amountInput}
                                    value={amount}
                                    onChangeText={setAmount}
                                    placeholder="0.00"
                                    placeholderTextColor={Colors.text.muted}
                                    keyboardType="decimal-pad"
                                    maxLength={10}
                                />
                                <Text style={styles.currencySymbol}>€</Text>
                            </View>
                            {selectedParticipants.length > 0 && amount && (
                                <Text style={styles.amountPerPersonText}>
                                    {amountPerPerson}€ par personne
                                </Text>
                            )}
                        </View>

                        {/* 👥 Participants */}
                        <View style={styles.formGroup}>
                            <View style={styles.participantsHeader}>
                                <Text style={styles.formLabel}>
                                    👥 Participants (
                                    {selectedParticipants.length}/
                                    {members.length})
                                </Text>
                                <View style={styles.participantsActions}>
                                    <TouchableOpacity
                                        style={styles.participantsActionButton}
                                        onPress={selectAllParticipants}
                                    >
                                        <Text
                                            style={
                                                styles.participantsActionText
                                            }
                                        >
                                            Tous
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.participantsActionButton}
                                        onPress={clearAllParticipants}
                                    >
                                        <Text
                                            style={
                                                styles.participantsActionText
                                            }
                                        >
                                            Aucun
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.participantsList}>
                                {members.map((member) => {
                                    const isSelected =
                                        selectedParticipants.includes(
                                            member.userId
                                        );
                                    const isMe =
                                        member.userId === currentUserId;

                                    return (
                                        <TouchableOpacity
                                            key={member.userId}
                                            style={[
                                                styles.participantItem,
                                                isSelected &&
                                                    styles.participantItemSelected,
                                                isMe &&
                                                    styles.participantItemMe,
                                            ]}
                                            onPress={() =>
                                                toggleParticipant(member.userId)
                                            }
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                style={
                                                    styles.participantItemLeft
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.participantCheckbox
                                                    }
                                                >
                                                    {isSelected ? "✅" : "⬜"}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.participantName,
                                                        isSelected &&
                                                            styles.participantNameSelected,
                                                    ]}
                                                >
                                                    {member.name}
                                                    {isMe ? " (moi)" : ""}
                                                </Text>
                                            </View>
                                            {amount && isSelected && (
                                                <Text
                                                    style={
                                                        styles.participantAmount
                                                    }
                                                >
                                                    {amountPerPerson}€
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* 🚀 Bouton de validation */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!label.trim() ||
                                    !amount ||
                                    selectedParticipants.length === 0 ||
                                    isAdding) &&
                                    styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={
                                !label.trim() ||
                                !amount ||
                                selectedParticipants.length === 0 ||
                                isAdding
                            }
                            activeOpacity={0.8}
                        >
                            <Text style={styles.submitButtonText}>
                                {isAdding
                                    ? "⏳ Ajout en cours..."
                                    : "✅ Ajouter la dépense"}
                            </Text>
                        </TouchableOpacity>

                        {/* Espacement pour le clavier */}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>
            </Modal>

            {/* Modals de feedback */}
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

            <SpontyModal
                visible={successModal}
                type="success"
                title="Succès"
                message="Dépense ajoutée avec succès !"
                buttons={[
                    {
                        text: "Super !",
                        onPress: () => setSuccessModal(false),
                        style: "default",
                    },
                ]}
                autoCloseDelay={2000}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    // Bouton d'ajout principal
    addButton: {
        backgroundColor: Colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 16,
        shadowColor: Colors.buttonShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 6,
    },
    addButtonDisabled: {
        backgroundColor: Colors.disabled,
        shadowOpacity: 0,
        elevation: 0,
    },
    addButtonIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.white,
    },

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.backgroundColors.card,
    },
    modalCloseButton: {
        padding: 8,
        backgroundColor: Colors.backgroundColors.secondary,
        borderRadius: 20,
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.secondary,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text.primary,
    },
    modalHeaderSpacer: {
        width: 36,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },

    // Groupes de formulaire
    formGroup: {
        marginBottom: 24,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: Colors.backgroundColors.card,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        color: Colors.text.primary,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    // Champ montant
    amountInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.backgroundColors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingRight: 16,
    },
    amountInput: {
        flex: 1,
        padding: 16,
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text.primary,
        textAlign: "right",
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.primary,
    },
    amountPerPersonText: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginTop: 4,
        textAlign: "center",
        fontStyle: "italic",
    },

    // Participants
    participantsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    participantsActions: {
        flexDirection: "row",
        gap: 8,
    },
    participantsActionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.backgroundColors.secondary,
        borderRadius: 16,
    },
    participantsActionText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.text.secondary,
    },

    participantsList: {
        backgroundColor: Colors.backgroundColors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: "hidden",
    },
    participantItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    participantItemSelected: {
        backgroundColor: Colors.primary + "10",
    },
    participantItemMe: {
        backgroundColor: Colors.secondary + "10",
    },
    participantItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    participantCheckbox: {
        fontSize: 18,
        marginRight: 12,
    },
    participantName: {
        fontSize: 16,
        color: Colors.text.secondary,
        flex: 1,
    },
    participantNameSelected: {
        color: Colors.text.primary,
        fontWeight: "600",
    },
    participantAmount: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.primary,
    },

    // Bouton de validation
    submitButton: {
        backgroundColor: Colors.success,
        padding: 18,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 20,
        shadowColor: Colors.success + "50",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 6,
    },
    submitButtonDisabled: {
        backgroundColor: Colors.disabled,
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text.white,
    },
});
