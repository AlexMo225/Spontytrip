import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChecklistCelebration from "../components/ChecklistCelebration";
import {
    ChecklistAssignmentView,
    ChecklistCategorySection,
    ChecklistMyTasksView,
    ChecklistTabBar,
} from "../components/checklist";
import { Colors, TaskAssignmentColors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { useChecklist } from "../hooks/useChecklist";
import { useModal, useQuickModals } from "../hooks/useModal";
import { useTripSync } from "../hooks/useTripSync";
import { useChecklistStyles } from "../styles/screens";
import { RootStackParamList } from "../types";

type ChecklistScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Checklist"
>;
type ChecklistScreenRouteProp = RouteProp<RootStackParamList, "Checklist">;

interface Props {
    navigation: ChecklistScreenNavigationProp;
    route: ChecklistScreenRouteProp;
}

const ChecklistScreen: React.FC<Props> = ({ navigation, route }) => {
    const modal = useModal();
    const quickModals = useQuickModals();
    const { user } = useAuth();
    const { tripId } = route.params;
    const { trip, checklist, loading, error } = useTripSync(tripId);
    const styles = useChecklistStyles();

    // 🎯 Utilisation du hook useChecklist pour toute la logique
    const checklistLogic = useChecklist(
        tripId,
        trip,
        checklist,
        TaskAssignmentColors.memberAvatars
    );

    // Déstructuration du hook pour un code plus propre
    const {
        localItems,
        activeTab,
        assignModalVisible,
        selectedItemId,
        showCelebration,
        setActiveTab,
        setAssignModalVisible,
        setSelectedItemId,
        setShowCelebration,
        handleToggleItem,
        handleAssignToMember,
        handleDeleteItem,
        autoAssignTasks,
        itemsByCategory,
        tasksByMember,
        myTasks,
        assignmentStats,
        progress,
        unassignedTasks,
    } = checklistLogic;

    // Gestion de la navigation en cas d'erreur
    useEffect(() => {
        if (
            (error === "Voyage introuvable" ||
                error === "Accès non autorisé à ce voyage" ||
                error === "Voyage supprimé") &&
            !loading
        ) {
            const timer = setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "MainApp" }],
                });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [error, navigation, loading]);

    const isCreator = trip?.creatorId === user?.uid;

    // 🎲 Wrapper pour l'auto-assignation avec modales
    const handleAutoAssignWithModal = async () => {
        if (!trip?.members || trip.members.length === 0) {
            modal.showError("Erreur", "Aucun membre dans ce voyage");
            return;
        }

        if (unassignedTasks.length === 0) {
            modal.showConfirm(
                "Déjà organisé ! 🎉",
                "Toutes les tâches sont déjà assignées. Voulez-vous voir la répartition par membre ?",
                () => setActiveTab("assignment"),
                () => {},
                "Voir répartition",
                "OK"
            );
            return;
        }

        modal.showConfirm(
            "🎲 Répartition automatique",
            `Répartir ${unassignedTasks.length} tâches entre ${trip.members.length} membres ?`,
            async () => {
                try {
                    await autoAssignTasks();
                    quickModals.success(
                        `🎉 ${unassignedTasks.length} tâches réparties automatiquement entre ${trip.members.length} membres !`
                    );
                } catch (error) {
                    console.error("Erreur auto-assignation:", error);
                    modal.showError(
                        "Erreur",
                        "Impossible de répartir les tâches automatiquement"
                    );
                }
            }
        );
    };

    // 👤 Wrapper pour l'assignation avec vérifications de permissions
    const handleToggleWithPermissions = async (itemId: string) => {
        const item = localItems.find((i) => i.id === itemId);
        if (!item) return;

        const canToggle =
            isCreator || !item.assignedTo || item.assignedTo === user?.uid;
        if (!canToggle) {
            const assignedMember = trip?.members?.find(
                (m) => m.userId === item.assignedTo
            );
            const assignedName = assignedMember?.name || "quelqu'un d'autre";
            modal.showConfirm(
                "Permission refusée 🔒",
                `Cette tâche est assignée à ${assignedName}. Voulez-vous voir toutes vos tâches ?`,
                () => setActiveTab("myTasks"),
                () => {},
                "Mes tâches",
                "Compris"
            );
            return;
        }

        await handleToggleItem(itemId);
    };

    // 🗑️ Wrapper pour la suppression avec confirmation
    const handleDeleteWithConfirmation = async (itemId: string) => {
        const item = localItems.find((i) => i.id === itemId);
        if (!item) return;

        modal.showConfirm(
            "Supprimer la tâche ?",
            `Êtes-vous sûr de vouloir supprimer "${item.title}" ?`,
            async () => {
                try {
                    await handleDeleteItem(itemId);
                    quickModals.success("✅ Tâche supprimée avec succès");
                } catch (error) {
                    modal.showError(
                        "Erreur",
                        "Impossible de supprimer la tâche"
                    );
                }
            },
            () => {},
            "Supprimer",
            "Annuler"
        );
    };

    // 👤 Wrapper pour l'assignation avec modal de sélection des membres
    const handleAssignWithModal = (itemId: string) => {
        setSelectedItemId(itemId);
        setAssignModalVisible(true);
    };

    // 📊 Rendu des onglets selon l'onglet actif
    const renderActiveTab = () => {
        switch (activeTab) {
            case "assignment":
                return (
                    <ChecklistAssignmentView
                        tasksByMember={tasksByMember}
                        unassignedTasks={unassignedTasks}
                        onAutoAssign={handleAutoAssignWithModal}
                        onAssignTask={handleAssignWithModal}
                        isCreator={isCreator}
                    />
                );
            case "myTasks":
                return (
                    <ChecklistMyTasksView
                        myTasks={myTasks}
                        onToggleTask={handleToggleWithPermissions}
                    />
                );
            default:
                return (
                    <ScrollView
                        style={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <FlatList
                            data={Object.keys(itemsByCategory)}
                            renderItem={({ item: category }) => (
                                <ChecklistCategorySection
                                    category={category}
                                    items={itemsByCategory[category]}
                                    members={trip?.members || []}
                                    currentUserId={user?.uid || ""}
                                    isCreator={isCreator}
                                    onToggleItem={handleToggleWithPermissions}
                                    onAssignItem={handleAssignWithModal}
                                    onDeleteItem={handleDeleteWithConfirmation}
                                    getMemberColor={(memberId: string) => {
                                        if (!trip?.members)
                                            return TaskAssignmentColors
                                                .memberAvatars[0];
                                        const memberIndex =
                                            trip.members.findIndex(
                                                (m) => m.userId === memberId
                                            );
                                        return TaskAssignmentColors
                                            .memberAvatars[
                                            memberIndex %
                                                TaskAssignmentColors
                                                    .memberAvatars.length
                                        ];
                                    }}
                                />
                            )}
                            keyExtractor={(item) => item}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                    </ScrollView>
                );
        }
    };

    // 🚫 États de chargement et d'erreur
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>
                        Chargement de la checklist...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>❌ Erreur</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.retryText}>← Retour</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!trip) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>🔍 Voyage introuvable</Text>
                    <Text style={styles.errorText}>
                        Ce voyage n'existe pas ou vous n'y avez pas accès.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header avec progression */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Checklist</Text>
                    <Text style={styles.headerSubtitle}>
                        {progress.completed}/{progress.total} tâches (
                        {progress.percentage}%)
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() =>
                        navigation.navigate("AddChecklistItem", { tripId })
                    }
                >
                    <Ionicons
                        name="add-circle"
                        size={28}
                        color={Colors.white}
                    />
                </TouchableOpacity>
            </View>

            {/* Barre de progression */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progress.percentage}%` },
                        ]}
                    />
                </View>
            </View>

            {/* Navigation par onglets */}
            <ChecklistTabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                assignmentStats={assignmentStats}
                myTasksCount={myTasks.length}
            />

            {/* Contenu selon l'onglet actif */}
            {renderActiveTab()}

            {/* Modal d'assignation */}
            <Modal
                visible={assignModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAssignModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Assigner à un membre
                        </Text>
                        <FlatList
                            data={trip?.members || []}
                            renderItem={({ item: member }) => (
                                <TouchableOpacity
                                    style={styles.memberOption}
                                    onPress={() =>
                                        handleAssignToMember(member.userId)
                                    }
                                >
                                    <View style={styles.memberInfo}>
                                        <View
                                            style={[
                                                styles.memberAvatar,
                                                {
                                                    backgroundColor:
                                                        TaskAssignmentColors
                                                            .memberAvatars[
                                                            (trip?.members?.findIndex(
                                                                (m) =>
                                                                    m.userId ===
                                                                    member.userId
                                                            ) || 0) %
                                                                TaskAssignmentColors
                                                                    .memberAvatars
                                                                    .length
                                                        ],
                                                },
                                            ]}
                                        >
                                            {member.avatar ? (
                                                <Image
                                                    source={{
                                                        uri: member.avatar,
                                                    }}
                                                    style={
                                                        styles.memberAvatarImage
                                                    }
                                                />
                                            ) : (
                                                <Text
                                                    style={
                                                        styles.memberAvatarText
                                                    }
                                                >
                                                    {member.name.charAt(0)}
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={styles.memberName}>
                                            {member.name}
                                        </Text>
                                    </View>
                                    {selectedItemId &&
                                        localItems.find(
                                            (item) => item.id === selectedItemId
                                        )?.assignedTo === member.userId && (
                                            <Ionicons
                                                name="checkmark"
                                                size={20}
                                                color={Colors.success}
                                            />
                                        )}
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.userId}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.unassignButton}
                                onPress={() => handleAssignToMember(null)}
                            >
                                <Text style={styles.unassignText}>
                                    Retirer l'assignation
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setAssignModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Animation de célébration */}
            <ChecklistCelebration
                visible={showCelebration}
                onHide={() => setShowCelebration(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text.primary,
    },

    addButton: {
        backgroundColor: Colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },

    listContainer: {
        flex: 1,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.text.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.error,
        marginBottom: 8,
        textAlign: "center",
    },
    errorText: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 24,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: "70%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 20,
        textAlign: "center",
    },
    memberOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: Colors.backgroundColors.secondary,
    },
    memberInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    memberAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    memberAvatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: 16,
    },
    memberAvatarText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.white,
    },
    memberName: {
        fontSize: 16,
        color: Colors.text.primary,
        fontWeight: "500",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        gap: 12,
    },
    unassignButton: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.secondary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    unassignText: {
        color: Colors.text.secondary,
        fontSize: 16,
        fontWeight: "500",
    },
    cancelButton: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
});

export default ChecklistScreen;
