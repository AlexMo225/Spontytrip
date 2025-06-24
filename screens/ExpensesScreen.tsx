import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
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

// 🎨 PALETTE DE COULEURS FINTECH MODERNE
const FINTECH_COLORS = {
    // Couleurs principales
    primary_green: "#7ED957", // Vert clair principal (succès, solde positif)
    primary_turquoise: "#4DA1A9", // Turquoise (accent, boutons, tags)

    // Couleurs secondaires
    light_green_bg: "#F0FDF4", // Fond vert très clair
    light_turquoise_bg: "#F0FDFA", // Fond turquoise très clair
    soft_red: "#FEF2F2", // Rouge doux pour alertes
    soft_red_text: "#EF4444", // Rouge pour texte d'erreur

    // Couleurs neutres
    light_gray: "#F8FAFC", // Gris très clair
    medium_gray: "#64748B", // Gris moyen
    dark_gray: "#1E293B", // Gris foncé
    white: "#FFFFFF",

    // Couleurs d'ombre et bordures
    shadow: "rgba(0, 0, 0, 0.08)",
    border: "#E2E8F0",
    border_focus: "#4DA1A9",
};

const { width: screenWidth } = Dimensions.get("window");

const ExpensesScreen: React.FC<Props> = ({ navigation, route }) => {
    const { tripId } = route.params;
    const { user } = useAuth();
    const { trip, expenses, loading, error } = useTripSync(tripId);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(false);

    // 🎬 Animations pour les effets visuels
    const balanceAnimValue = useRef(new Animated.Value(1)).current;
    const cardAnimations = useRef<{ [key: string]: Animated.Value }>({});

    // États pour le formulaire d'ajout
    const [newExpense, setNewExpense] = useState({
        label: "",
        amount: "",
        paidBy: user?.uid || "",
        participants: [user?.uid || ""],
    });

    // 📊 Calcul du résumé avec memoization optimisée
    const summary = useMemo<ExpensesSummary | null>(() => {
        if (!expenses || !trip || !user) {
            return null;
        }

        try {
            const tripMembers = trip.members.map((member) => ({
                userId: member.userId,
                name: member.name,
            }));

            return firebaseService.calculateExpensesSummary(
                expenses.expenses || [],
                tripMembers,
                user.uid
            );
        } catch (error) {
            console.error("❌ Erreur calcul résumé dépenses:", error);
            return null;
        }
    }, [expenses?.expenses, trip?.members, user?.uid]);

    // 🎬 Animation du solde quand il change
    useEffect(() => {
        if (summary?.myBalance) {
            Animated.sequence([
                Animated.timing(balanceAnimValue, {
                    toValue: 1.05,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(balanceAnimValue, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 150,
                    friction: 8,
                }),
            ]).start();
        }
    }, [summary?.myBalance?.balance]);

    // 🎬 Créer une animation pour une nouvelle carte
    const createCardAnimation = (expenseId: string) => {
        if (!cardAnimations.current[expenseId]) {
            cardAnimations.current[expenseId] = new Animated.Value(0);

            Animated.spring(cardAnimations.current[expenseId], {
                toValue: 1,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
            }).start();
        }
    };

    // Réinitialiser le formulaire quand l'utilisateur change
    useEffect(() => {
        if (user?.uid) {
            setNewExpense((prev) => ({
                ...prev,
                paidBy: user.uid,
                participants: [user.uid],
            }));
        }
    }, [user?.uid]);

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

            const amount = parseFloat(newExpense.amount);
            if (isNaN(amount) || amount <= 0) {
                Alert.alert("Erreur", "Veuillez saisir un montant valide");
                return;
            }

            const expense: Omit<ExpenseItem, "id" | "createdAt" | "updatedAt"> =
                {
                    tripId,
                    label: newExpense.label.trim(),
                    amount,
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

            // Logger l'activité
            await firebaseService.retryLogActivity(
                tripId,
                user.uid,
                user.displayName || user.email || "Utilisateur",
                "expense_add",
                { label: expense.label, amount: expense.amount }
            );

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
                            // 🎬 Animation de suppression
                            const animValue =
                                cardAnimations.current[expense.id];
                            if (animValue) {
                                Animated.timing(animValue, {
                                    toValue: 0,
                                    duration: 300,
                                    useNativeDriver: true,
                                }).start();
                            }

                            await firebaseService.deleteExpense(
                                tripId,
                                expense.id,
                                user.uid
                            );

                            // Logger l'activité de suppression
                            try {
                                await firebaseService.retryLogActivity(
                                    tripId,
                                    user.uid,
                                    user.displayName ||
                                        user.email ||
                                        "Utilisateur",
                                    "expense_delete",
                                    {
                                        label: expense.label,
                                        amount: expense.amount,
                                    }
                                );
                            } catch (logError) {
                                console.error(
                                    "Erreur logging suppression dépense:",
                                    logError
                                );
                            }

                            Alert.alert("Succès", "Dépense supprimée");
                        } catch (error) {
                            console.error("Erreur suppression dépense:", error);
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

    // 🎨 COMPOSANT : Carte de résumé moderne avec animations
    const ModernSummaryCard = ({
        title,
        amount,
        type,
        icon,
    }: {
        title: string;
        amount: number;
        type: "total" | "positive" | "negative";
        icon: string;
    }) => {
        const getCardStyle = () => {
            switch (type) {
                case "positive":
                    return {
                        backgroundColor: FINTECH_COLORS.light_green_bg,
                        borderColor: FINTECH_COLORS.primary_green,
                    };
                case "negative":
                    return {
                        backgroundColor: FINTECH_COLORS.soft_red,
                        borderColor: FINTECH_COLORS.soft_red_text,
                    };
                default:
                    return {
                        backgroundColor: FINTECH_COLORS.light_turquoise_bg,
                        borderColor: FINTECH_COLORS.primary_turquoise,
                    };
            }
        };

        const getAmountColor = () => {
            switch (type) {
                case "positive":
                    return FINTECH_COLORS.primary_green;
                case "negative":
                    return FINTECH_COLORS.soft_red_text;
                default:
                    return FINTECH_COLORS.dark_gray;
            }
        };

        const getIconColor = () => {
            switch (type) {
                case "positive":
                    return FINTECH_COLORS.primary_green;
                case "negative":
                    return FINTECH_COLORS.soft_red_text;
                default:
                    return FINTECH_COLORS.primary_turquoise;
            }
        };

        return (
            <Animated.View
                style={[
                    styles.modernSummaryCard,
                    getCardStyle(),
                    type === "positive" || type === "negative"
                        ? { transform: [{ scale: balanceAnimValue }] }
                        : {},
                ]}
            >
                <View style={styles.summaryCardHeader}>
                    <View
                        style={[
                            styles.summaryIconContainer,
                            { backgroundColor: getIconColor() + "20" },
                        ]}
                    >
                        <Ionicons
                            name={icon as any}
                            size={20}
                            color={getIconColor()}
                        />
                    </View>
                    <Text style={styles.modernSummaryTitle}>{title}</Text>
                </View>
                <Text
                    style={[
                        styles.modernSummaryAmount,
                        { color: getAmountColor() },
                    ]}
                >
                    {type === "positive" && amount > 0 ? "+" : ""}
                    {amount.toFixed(2)}€
                </Text>
            </Animated.View>
        );
    };

    // 🎨 COMPOSANT : Carte de dépense moderne avec avatars
    const ModernExpenseCard = ({ item }: { item: ExpenseItem }) => {
        const canDelete =
            item.createdBy === user?.uid || trip?.creatorId === user?.uid;
        const amountPerPerson = item.amount / item.participants.length;

        // Créer l'animation pour cette carte
        createCardAnimation(item.id);
        const animValue =
            cardAnimations.current[item.id] || new Animated.Value(1);

        // 📅 Formatage de la date plus élégant
        const formattedDate = new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(item.date);

        return (
            <Animated.View
                style={[
                    styles.modernExpenseCard,
                    {
                        transform: [
                            { scale: animValue },
                            {
                                translateY: animValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0],
                                }),
                            },
                        ],
                        opacity: animValue,
                    },
                ]}
            >
                {/* Header avec titre et montant */}
                <View style={styles.modernExpenseHeader}>
                    <View style={styles.modernExpenseMainInfo}>
                        <Text style={styles.modernExpenseTitle}>
                            {item.label}
                        </Text>
                        <Text style={styles.modernExpenseAmount}>
                            {item.amount.toFixed(2)}€
                        </Text>
                    </View>

                    {/* Bouton supprimer moderne */}
                    {canDelete && (
                        <TouchableOpacity
                            style={styles.modernDeleteButton}
                            onPress={() => handleDeleteExpense(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={18}
                                color={FINTECH_COLORS.soft_red_text}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Informations détaillées */}
                <View style={styles.modernExpenseDetails}>
                    {/* Ligne payé par */}
                    <View style={styles.modernDetailRow}>
                        <View style={styles.modernDetailIcon}>
                            <Ionicons
                                name="person"
                                size={14}
                                color={FINTECH_COLORS.primary_turquoise}
                            />
                        </View>
                        <Text style={styles.modernDetailText}>
                            Payé par{" "}
                            <Text style={styles.modernDetailBold}>
                                {item.paidByName}
                            </Text>
                        </Text>
                    </View>

                    {/* Ligne montant par personne */}
                    <View style={styles.modernDetailRow}>
                        <View style={styles.modernDetailIcon}>
                            <Ionicons
                                name="calculator"
                                size={14}
                                color={FINTECH_COLORS.primary_turquoise}
                            />
                        </View>
                        <Text style={styles.modernDetailText}>
                            <Text style={styles.modernDetailBold}>
                                {amountPerPerson.toFixed(2)}€
                            </Text>{" "}
                            par personne
                        </Text>
                    </View>

                    {/* Participants avec avatars simulés */}
                    <View style={styles.modernDetailRow}>
                        <View style={styles.modernDetailIcon}>
                            <Ionicons
                                name="people"
                                size={14}
                                color={FINTECH_COLORS.primary_turquoise}
                            />
                        </View>
                        <View style={styles.participantsContainer}>
                            <Text style={styles.modernDetailText}>
                                {item.participantNames.slice(0, 2).join(", ")}
                                {item.participantNames.length > 2 &&
                                    ` +${
                                        item.participantNames.length - 2
                                    } autres`}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Footer avec date */}
                <View style={styles.modernExpenseFooter}>
                    <Text style={styles.modernExpenseDate}>
                        {formattedDate}
                    </Text>

                    {/* Badge remboursé/non remboursé (suggestion d'amélioration future) */}
                    <View style={[styles.statusBadge, styles.pendingBadge]}>
                        <Text style={styles.statusBadgeText}>En attente</Text>
                    </View>
                </View>
            </Animated.View>
        );
    };

    // 🎨 COMPOSANT : Bouton remboursements moderne
    const ModernReimbursementButton = () => (
        <TouchableOpacity
            style={styles.modernReimbursementButton}
            onPress={() => setShowBalanceModal(true)}
            activeOpacity={0.8}
        >
            <View style={styles.reimbursementButtonContent}>
                <Ionicons
                    name="swap-horizontal"
                    size={20}
                    color={FINTECH_COLORS.white}
                />
                <Text style={styles.modernReimbursementButtonText}>
                    Voir les remboursements
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderDebtItem = ({ item }: { item: DebtCalculation }) => (
        <View style={styles.modernDebtCard}>
            <View style={styles.debtIconContainer}>
                <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={FINTECH_COLORS.primary_turquoise}
                />
            </View>
            <View style={styles.debtContent}>
                <Text style={styles.modernDebtText}>
                    <Text style={styles.modernDebtName}>{item.fromName}</Text>{" "}
                    doit{" "}
                    <Text style={styles.modernDebtAmount}>
                        {item.amount.toFixed(2)}€
                    </Text>{" "}
                    à <Text style={styles.modernDebtName}>{item.toName}</Text>
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.modernLoadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={FINTECH_COLORS.primary_turquoise}
                />
                <Text style={styles.modernLoadingText}>
                    Chargement des dépenses...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.modernErrorContainer}>
                <View style={styles.errorIconContainer}>
                    <Ionicons
                        name="warning-outline"
                        size={48}
                        color={FINTECH_COLORS.soft_red_text}
                    />
                </View>
                <Text style={styles.modernErrorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.modernRetryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.modernRetryButtonText}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.modernContainer}>
            {/* 🎨 Header moderne centré */}
            <View style={styles.modernHeader}>
                <Text style={styles.modernHeaderTitle}>Dépenses</Text>
            </View>

            <ScrollView
                style={styles.modernScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modernScrollContent}
            >
                {/* 📊 Section résumé avec cartes modernes */}
                {summary && (
                    <View style={styles.modernSummarySection}>
                        {/* Total des dépenses */}
                        <ModernSummaryCard
                            title="Total des dépenses"
                            amount={summary.totalExpenses}
                            type="total"
                            icon="wallet"
                        />

                        {/* Mon solde avec animation */}
                        {summary.myBalance && (
                            <ModernSummaryCard
                                title="Mon solde"
                                amount={summary.myBalance.balance}
                                type={
                                    summary.myBalance.balance >= 0
                                        ? "positive"
                                        : "negative"
                                }
                                icon={
                                    summary.myBalance.balance >= 0
                                        ? "checkmark-circle"
                                        : "warning"
                                }
                            />
                        )}

                        {/* Bouton remboursements */}
                        <ModernReimbursementButton />
                    </View>
                )}

                {/* 💳 Liste des dépenses avec design moderne */}
                <View style={styles.modernExpensesSection}>
                    <Text style={styles.modernSectionTitle}>
                        Historique des dépenses
                    </Text>

                    {expenses?.expenses && expenses.expenses.length > 0 ? (
                        expenses.expenses.map((expense) => (
                            <ModernExpenseCard
                                key={expense.id}
                                item={expense}
                            />
                        ))
                    ) : (
                        <View style={styles.modernEmptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons
                                    name="wallet-outline"
                                    size={64}
                                    color={FINTECH_COLORS.medium_gray}
                                />
                            </View>
                            <Text style={styles.modernEmptyTitle}>
                                Aucune dépense pour le moment
                            </Text>
                            <Text style={styles.modernEmptySubtitle}>
                                Ajoutez votre première dépense pour commencer !
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* 📱 Modal d'ajout de dépense (structure existante conservée) */}
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
                                placeholder="Ex: Restaurant, Transport..."
                                placeholderTextColor={
                                    FINTECH_COLORS.medium_gray
                                }
                            />
                        </View>

                        {/* Montant */}
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
                                placeholderTextColor={
                                    FINTECH_COLORS.medium_gray
                                }
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Payé par */}
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
                                            color={
                                                FINTECH_COLORS.primary_turquoise
                                            }
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
                                            color={
                                                FINTECH_COLORS.primary_turquoise
                                            }
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* 💰 Modal des remboursements */}
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
                            <View style={styles.modernEmptyContainer}>
                                <View style={styles.emptyIconContainer}>
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={64}
                                        color={FINTECH_COLORS.primary_green}
                                    />
                                </View>
                                <Text style={styles.modernEmptyTitle}>
                                    Tout est équilibré !
                                </Text>
                                <Text style={styles.modernEmptySubtitle}>
                                    Aucun remboursement nécessaire
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* 🎯 Bouton flottant d'ajout de dépense */}
            <TouchableOpacity
                style={styles.floatingAddButton}
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color={FINTECH_COLORS.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // 🎨 STYLES MODERNES PRINCIPAUX
    modernContainer: {
        flex: 1,
        backgroundColor: FINTECH_COLORS.light_gray,
    },
    modernHeader: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: FINTECH_COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: FINTECH_COLORS.border,
        // Ombre légère pour profondeur
        shadowColor: FINTECH_COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    modernHeaderTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: FINTECH_COLORS.dark_gray,
    },
    // 📱 SCROLL ET SECTIONS
    modernScrollView: {
        flex: 1,
    },
    modernScrollContent: {
        paddingBottom: 20,
    },
    modernSummarySection: {
        padding: 20,
        gap: 16,
    },

    // 📊 CARTES DE RÉSUMÉ MODERNES
    modernSummaryCard: {
        backgroundColor: FINTECH_COLORS.white,
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        // Ombre moderne avec profondeur
        shadowColor: FINTECH_COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
    },
    summaryCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    summaryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    modernSummaryTitle: {
        fontSize: 16,
        color: FINTECH_COLORS.medium_gray,
        fontWeight: "600",
    },
    modernSummaryAmount: {
        fontSize: 28,
        fontWeight: "800",
        textAlign: "right",
    },
    // 💳 SECTION DÉPENSES
    modernExpensesSection: {
        paddingHorizontal: 20,
        paddingTop: 8,
        gap: 16,
    },
    modernSectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: FINTECH_COLORS.dark_gray,
        marginBottom: 16,
    },

    // 🎨 CARTES DE DÉPENSES MODERNES
    modernExpenseCard: {
        backgroundColor: FINTECH_COLORS.white,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: FINTECH_COLORS.border,
        marginBottom: 12,
        // Ombre élégante
        shadowColor: FINTECH_COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    modernExpenseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    modernExpenseMainInfo: {
        flex: 1,
    },
    modernExpenseTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: FINTECH_COLORS.dark_gray,
        marginBottom: 8,
    },
    modernExpenseAmount: {
        fontSize: 24,
        fontWeight: "800",
        color: FINTECH_COLORS.primary_turquoise,
    },
    modernDeleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: FINTECH_COLORS.soft_red,
        justifyContent: "center",
        alignItems: "center",
    },
    modernExpenseDetails: {
        gap: 12,
        marginBottom: 16,
    },
    // 📋 DÉTAILS DES DÉPENSES
    modernDetailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 4,
    },
    modernDetailIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: FINTECH_COLORS.light_turquoise_bg,
        justifyContent: "center",
        alignItems: "center",
    },
    modernDetailText: {
        fontSize: 15,
        color: FINTECH_COLORS.medium_gray,
        flex: 1,
    },
    modernDetailBold: {
        fontWeight: "700",
        color: FINTECH_COLORS.dark_gray,
    },
    participantsContainer: {
        flex: 1,
    },

    // 🏷️ FOOTER ET BADGES
    modernExpenseFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: FINTECH_COLORS.border + "40",
    },
    modernExpenseDate: {
        fontSize: 13,
        color: FINTECH_COLORS.medium_gray,
        fontWeight: "500",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pendingBadge: {
        backgroundColor: FINTECH_COLORS.primary_green + "20",
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: FINTECH_COLORS.primary_green,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    // 🎭 ÉTATS VIDES ET CHARGEMENT
    modernEmptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: FINTECH_COLORS.light_gray,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    modernEmptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: FINTECH_COLORS.medium_gray,
        textAlign: "center",
        marginBottom: 8,
    },
    modernEmptySubtitle: {
        fontSize: 16,
        color: FINTECH_COLORS.medium_gray,
        textAlign: "center",
        lineHeight: 24,
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
    // 💰 BOUTON REMBOURSEMENTS MODERNE
    modernReimbursementButton: {
        backgroundColor: FINTECH_COLORS.primary_turquoise,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: "center",
        // Ombre pour profondeur
        shadowColor: FINTECH_COLORS.primary_turquoise,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    reimbursementButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    modernReimbursementButtonText: {
        color: FINTECH_COLORS.white,
        fontWeight: "700",
        fontSize: 16,
    },
    // 💸 CARTES DE DETTES MODERNES
    modernDebtCard: {
        backgroundColor: FINTECH_COLORS.white,
        padding: 20,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: FINTECH_COLORS.border,
        // Ombre légère
        shadowColor: FINTECH_COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    debtIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: FINTECH_COLORS.light_turquoise_bg,
        justifyContent: "center",
        alignItems: "center",
    },
    debtContent: {
        flex: 1,
    },
    modernDebtText: {
        fontSize: 15,
        color: FINTECH_COLORS.dark_gray,
        lineHeight: 22,
    },
    modernDebtName: {
        fontWeight: "700",
        color: FINTECH_COLORS.dark_gray,
    },
    modernDebtAmount: {
        fontWeight: "800",
        color: FINTECH_COLORS.primary_turquoise,
        fontSize: 16,
    },

    // ⏳ ÉTATS DE CHARGEMENT ET ERREUR
    modernLoadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: FINTECH_COLORS.light_gray,
    },
    modernLoadingText: {
        marginTop: 20,
        fontSize: 18,
        color: FINTECH_COLORS.medium_gray,
    },
    modernErrorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        backgroundColor: FINTECH_COLORS.light_gray,
    },
    errorIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: FINTECH_COLORS.soft_red,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    modernErrorText: {
        fontSize: 18,
        color: FINTECH_COLORS.soft_red_text,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 26,
    },
    modernRetryButton: {
        backgroundColor: FINTECH_COLORS.primary_turquoise,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
        shadowColor: FINTECH_COLORS.primary_turquoise,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    modernRetryButtonText: {
        color: FINTECH_COLORS.white,
        fontWeight: "700",
        fontSize: 16,
    },

    // 🎯 BOUTON FLOTTANT D'AJOUT
    floatingAddButton: {
        position: "absolute",
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: FINTECH_COLORS.primary_turquoise,
        justifyContent: "center",
        alignItems: "center",
        // Ombre moderne pour effet flottant
        shadowColor: FINTECH_COLORS.primary_turquoise,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
        // Légère bordure pour plus de définition
        borderWidth: 2,
        borderColor: FINTECH_COLORS.white,
    },
});

export default ExpensesScreen;
