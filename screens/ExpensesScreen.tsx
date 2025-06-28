import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
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
import { useModal, useQuickModals } from "../hooks/useModal";
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
    const modal = useModal();
    const quickModals = useQuickModals();
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

    // Redirection automatique silencieuse si le voyage est supprimé
    React.useEffect(() => {
        if (
            (error === "Voyage introuvable" ||
                error === "Accès non autorisé à ce voyage" ||
                error === "Voyage supprimé") &&
            !loading
        ) {
            console.log(
                "🚨 ExpensesScreen - Redirection automatique - voyage supprimé"
            );

            const timer = setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "MainApp" }],
                });
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [error, navigation, loading]);

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
            quickModals.formError("remplir tous les champs");
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
                quickModals.formError("saisir un montant valide");
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

            modal.showSuccess("Succès", "Dépense ajoutée avec succès");
        } catch (error) {
            console.error("Erreur ajout dépense:", error);
            modal.showError("Erreur", "Impossible d'ajouter la dépense");
        }
    };

    const handleDeleteExpense = (expense: ExpenseItem) => {
        if (!user || !trip) return;

        const canDelete =
            expense.createdBy === user.uid || trip.creatorId === user.uid;

        if (!canDelete) {
            modal.showError(
                "Erreur",
                "Vous ne pouvez supprimer que vos propres dépenses"
            );
            return;
        }

        modal.showDelete(
            "Supprimer la dépense",
            `Êtes-vous sûr de vouloir supprimer "${expense.label}" ?`,
            async () => {
                try {
                    // 🎬 Animation de suppression
                    const animValue = cardAnimations.current[expense.id];
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
                            user.displayName || user.email || "Utilisateur",
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

                    modal.showSuccess("Succès", "Dépense supprimée");
                } catch (error) {
                    console.error("Erreur suppression dépense:", error);
                    modal.showError(
                        "Erreur",
                        "Impossible de supprimer la dépense"
                    );
                }
            }
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

    // 🎨 COMPOSANT : Carte de remboursement moderne avec animations
    // 🎨 COMPOSANT SÉPARÉ : Carte de remboursement moderne avec animations
    const DebtItemCard: React.FC<{ item: DebtCalculation; index: number }> =
        React.memo(({ item, index }) => {
            const slideAnim = useRef(new Animated.Value(50)).current;
            const fadeAnim = useRef(new Animated.Value(0)).current;
            const scaleAnim = useRef(new Animated.Value(0.9)).current;

            React.useEffect(() => {
                // Animation d'entrée avec délai progressif
                const delay = index * 150;

                Animated.parallel([
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 600,
                        delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 800,
                        delay,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        delay: delay + 200,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, [index, slideAnim, fadeAnim, scaleAnim]);

            // Obtenir les initiales pour les avatars
            const getInitials = (name: string) => {
                return name
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join("");
            };

            // Couleurs d'avatar basées sur le nom
            const getAvatarColor = (name: string) => {
                const colors = [
                    "#FF6B6B",
                    "#4ECDC4",
                    "#45B7D1",
                    "#96CEB4",
                    "#FFEAA7",
                    "#DDA0DD",
                    "#98D8C8",
                    "#F7DC6F",
                ];
                const colorIndex = name.length % colors.length;
                return colors[colorIndex];
            };

            return (
                <Animated.View
                    style={[
                        styles.modernDebtCard,
                        {
                            transform: [
                                { translateY: slideAnim },
                                { scale: scaleAnim },
                            ],
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    {/* Avatar de celui qui doit */}
                    <View
                        style={[
                            styles.debtAvatar,
                            { backgroundColor: getAvatarColor(item.fromName) },
                        ]}
                    >
                        <Text style={styles.avatarText}>
                            {getInitials(item.fromName)}
                        </Text>
                    </View>

                    {/* Flèche animée */}
                    <View style={styles.arrowContainer}>
                        <Ionicons
                            name="arrow-forward"
                            size={20}
                            color="#7ED957"
                        />
                    </View>

                    {/* Contenu principal */}
                    <View style={styles.debtMainContent}>
                        <View style={styles.debtAmountContainer}>
                            <Text style={styles.debtAmountText}>
                                {item.amount.toFixed(2)}€
                            </Text>
                            <View style={styles.debtAmountBadge}>
                                <Ionicons
                                    name="cash"
                                    size={12}
                                    color="#FFFFFF"
                                />
                            </View>
                        </View>

                        <Text style={styles.debtDescriptionText}>
                            <Text style={styles.debtFromName}>
                                {item.fromName}
                            </Text>
                            {" → "}
                            <Text style={styles.debtToName}>{item.toName}</Text>
                        </Text>
                    </View>

                    {/* Avatar de celui qui reçoit */}
                    <View
                        style={[
                            styles.debtAvatar,
                            { backgroundColor: getAvatarColor(item.toName) },
                        ]}
                    >
                        <Text style={styles.avatarText}>
                            {getInitials(item.toName)}
                        </Text>
                    </View>

                    {/* Indicateur de statut */}
                    <View style={styles.statusIndicator}>
                        <View style={styles.statusDot} />
                    </View>
                </Animated.View>
            );
        });

    const renderDebtItem = ({
        item,
        index,
    }: {
        item: DebtCalculation;
        index: number;
    }) => <DebtItemCard item={item} index={index} />;

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

            {/* 💰 Modal des remboursements moderne */}
            <Modal
                visible={showBalanceModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modernReimbursementModalContainer}>
                    {/* Header moderne avec dégradé */}
                    <View style={styles.modernReimbursementModalHeader}>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowBalanceModal(false)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View style={styles.modernModalTitleContainer}>
                            <View style={styles.modalTitleIconContainer}>
                                <Ionicons
                                    name="cash-outline"
                                    size={24}
                                    color="#FFFFFF"
                                />
                            </View>
                            <Text style={styles.modernModalTitle}>
                                Remboursements
                            </Text>
                        </View>

                        {/* Espace pour équilibrer */}
                        <View style={styles.modalHeaderSpacer} />
                    </View>

                    <ScrollView
                        style={styles.modernReimbursementScrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={
                            styles.reimbursementScrollContent
                        }
                    >
                        {summary?.debtsToSettle &&
                        summary.debtsToSettle.length > 0 ? (
                            <>
                                {/* Header avec stats */}
                                <View style={styles.reimbursementHeader}>
                                    <View style={styles.reimbursementStatsCard}>
                                        <View
                                            style={
                                                styles.reimbursementIconContainer
                                            }
                                        >
                                            <Ionicons
                                                name="swap-horizontal"
                                                size={24}
                                                color="#7ED957"
                                            />
                                        </View>
                                        <View
                                            style={
                                                styles.reimbursementStatsContent
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.reimbursementStatsTitle
                                                }
                                            >
                                                {summary.debtsToSettle.length}{" "}
                                                remboursement
                                                {summary.debtsToSettle.length >
                                                1
                                                    ? "s"
                                                    : ""}
                                            </Text>
                                            <Text
                                                style={
                                                    styles.reimbursementStatsSubtitle
                                                }
                                            >
                                                Total :{" "}
                                                {summary.debtsToSettle
                                                    .reduce(
                                                        (sum, debt) =>
                                                            sum + debt.amount,
                                                        0
                                                    )
                                                    .toFixed(2)}
                                                €
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Liste des remboursements */}
                                <View style={styles.reimbursementListContainer}>
                                    <FlatList
                                        data={summary.debtsToSettle}
                                        renderItem={({ item, index }) =>
                                            renderDebtItem({ item, index })
                                        }
                                        keyExtractor={(item, index) =>
                                            `${item.from}-${item.to}-${index}`
                                        }
                                        scrollEnabled={false}
                                        showsVerticalScrollIndicator={false}
                                    />
                                </View>
                            </>
                        ) : (
                            <View
                                style={styles.modernEmptyReimbursementContainer}
                            >
                                <View
                                    style={
                                        styles.emptyReimbursementIconContainer
                                    }
                                >
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={80}
                                        color="#7ED957"
                                    />
                                </View>
                                <Text
                                    style={styles.modernEmptyReimbursementTitle}
                                >
                                    Tout est équilibré ! 🎉
                                </Text>
                                <Text
                                    style={
                                        styles.modernEmptyReimbursementSubtitle
                                    }
                                >
                                    Aucun remboursement nécessaire entre les
                                    membres
                                </Text>
                                <View
                                    style={
                                        styles.emptyReimbursementDecorationContainer
                                    }
                                >
                                    <View
                                        style={
                                            styles.emptyReimbursementDecoration
                                        }
                                    />
                                    <View
                                        style={[
                                            styles.emptyReimbursementDecoration,
                                            styles.emptyReimbursementDecoration2,
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.emptyReimbursementDecoration,
                                            styles.emptyReimbursementDecoration3,
                                        ]}
                                    />
                                </View>
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
        flexDirection: "row",
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
    // 💸 CARTES DE DETTES MODERNES AVEC ANIMATIONS
    modernDebtCard: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: "#F0F9FF",
        // Ombre moderne profonde
        shadowColor: "#4DA1A9",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    // 👤 AVATARS COLORÉS
    debtAvatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#FFFFFF",
        // Ombre d'avatar
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    // 🎯 FLÈCHE MODERNE
    arrowContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#F0F9F0",
        justifyContent: "center",
        alignItems: "center",
    },
    // 💰 CONTENU PRINCIPAL
    debtMainContent: {
        flex: 1,
        alignItems: "center",
    },
    debtAmountContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    debtAmountText: {
        fontSize: 20,
        fontWeight: "900",
        color: "#7ED957",
    },
    debtAmountBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#7ED957",
        justifyContent: "center",
        alignItems: "center",
    },
    debtDescriptionText: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
    },
    debtFromName: {
        fontWeight: "700",
        color: "#334155",
    },
    debtToName: {
        fontWeight: "700",
        color: "#334155",
    },
    // 🔴 INDICATEUR DE STATUT
    statusIndicator: {
        position: "absolute",
        top: 8,
        right: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#F59E0B",
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

    // 🎨 MODAL DE REMBOURSEMENTS MODERNE
    modernReimbursementModalContainer: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    modernReimbursementModalHeader: {
        backgroundColor: "#4DA1A9",
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        // Dégradé simulé avec ombre
        shadowColor: "#4DA1A9",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },

    modernModalTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    modalTitleIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    modernModalTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#FFFFFF",
    },

    modalHeaderDecoration: {
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        overflow: "hidden",
    },
    modalFloatingElement: {
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(255,255,255,0.1)",
        top: -20,
        right: 60,
    },
    modalFloatingElement2: {
        width: 40,
        height: 40,
        borderRadius: 20,
        top: 40,
        right: 20,
    },

    // 🎨 SCROLL VIEW MODERNE
    modernReimbursementScrollView: {
        flex: 1,
    },
    reimbursementScrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    // 📊 HEADER AVEC STATS
    reimbursementHeader: {
        marginBottom: 24,
    },
    reimbursementStatsCard: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        borderWidth: 2,
        borderColor: "#E5F9E5",
        // Ombre verte
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    reimbursementIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#F0F9F0",
        justifyContent: "center",
        alignItems: "center",
    },
    reimbursementStatsContent: {
        flex: 1,
    },
    reimbursementStatsTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1E293B",
        marginBottom: 4,
    },
    reimbursementStatsSubtitle: {
        fontSize: 14,
        color: "#64748B",
        fontWeight: "600",
    },

    // 📋 CONTENEUR DE LISTE
    reimbursementListContainer: {
        gap: 8,
    },

    // 🎉 ÉTAT VIDE MODERNE
    modernEmptyReimbursementContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyReimbursementIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#F0F9F0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        // Ombre verte douce
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    modernEmptyReimbursementTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1E293B",
        marginBottom: 8,
        textAlign: "center",
    },
    modernEmptyReimbursementSubtitle: {
        fontSize: 16,
        color: "#64748B",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 24,
    },
    // 🌟 DÉCORATIONS ÉTAT VIDE
    emptyReimbursementDecorationContainer: {
        flexDirection: "row",
        gap: 8,
    },
    emptyReimbursementDecoration: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#7ED957",
    },
    emptyReimbursementDecoration2: {
        backgroundColor: "#4DA1A9",
    },
    emptyReimbursementDecoration3: {
        backgroundColor: "#F59E0B",
    },

    // 🎨 Modal styles
    modalCloseButton: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalHeaderSpacer: {
        flex: 1,
    },
});

export default ExpensesScreen;
