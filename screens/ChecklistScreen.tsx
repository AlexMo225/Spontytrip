import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
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
import { Colors, TaskAssignmentColors } from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { useModal, useQuickModals } from "../hooks/useModal";
import { useTripSync } from "../hooks/useTripSync";
import { TripMember } from "../services/firebaseService";
import { ChecklistItem, RootStackParamList } from "../types";

type ChecklistScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Checklist"
>;
type ChecklistScreenRouteProp = RouteProp<RootStackParamList, "Checklist">;

interface Props {
    navigation: ChecklistScreenNavigationProp;
    route: ChecklistScreenRouteProp;
}

type TabType = "list" | "assignment" | "myTasks";

const ChecklistScreen: React.FC<Props> = ({ navigation, route }) => {
    const modal = useModal();
    const quickModals = useQuickModals();
    const { user } = useAuth();
    const { tripId } = route.params;
    const { trip, checklist, loading, error } = useTripSync(tripId);
    const [localItems, setLocalItems] = useState<ChecklistItem[]>([]);
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("list");
    const [showCelebration, setShowCelebration] = useState(false);
    const [wasCompleted, setWasCompleted] = useState(false);

    useEffect(() => {
        if (checklist?.items) {
            setLocalItems(checklist.items);
        }
    }, [checklist]);

    // 🎉 Détection de la complétion à 100% pour déclencher l'animation
    useEffect(() => {
        if (localItems.length > 0) {
            const completedItems = localItems.filter(
                (item) => item.isCompleted
            );
            const isNowCompleted = completedItems.length === localItems.length;

            // Si on passe de pas complété à complété, déclencher l'animation
            if (isNowCompleted && !wasCompleted) {
                setShowCelebration(true);

                // 🔥 LOG POUR LE FEED LIVE - Checklist terminée !
                if (user) {
                    const logCelebration = async () => {
                        try {
                            const firebaseService = (
                                await import("../services/firebaseService")
                            ).default;
                            await firebaseService.logActivity(
                                tripId,
                                user.uid,
                                user.displayName || user.email || "Utilisateur",
                                "checklist_complete",
                                {
                                    title: "🎉 CHECKLIST TERMINÉE ! Toutes les tâches sont cochées !",
                                    action: "all_completed",
                                    totalTasks: localItems.length,
                                }
                            );
                        } catch (error) {
                            console.error("Erreur log célébration:", error);
                        }
                    };
                    logCelebration();
                }
            }

            setWasCompleted(isNowCompleted);
        }
    }, [localItems, wasCompleted, user, tripId]);

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

    const getMemberColor = (memberId: string) => {
        if (!trip?.members) return TaskAssignmentColors.memberAvatars[0];
        const memberIndex = trip.members.findIndex(
            (m) => m.userId === memberId
        );
        return TaskAssignmentColors.memberAvatars[
            memberIndex % TaskAssignmentColors.memberAvatars.length
        ];
    };

    const autoAssignTasks = async () => {
        if (!trip?.members || trip.members.length === 0) {
            modal.showError("Erreur", "Aucun membre dans ce voyage");
            return;
        }

        const unassignedTasks = localItems.filter((item) => !item.assignedTo);
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
                    const members = trip.members;
                    const tasksPerMember = Math.floor(
                        unassignedTasks.length / members.length
                    );
                    const extraTasks = unassignedTasks.length % members.length;

                    let taskIndex = 0;
                    const updatedItems = [...localItems];

                    members.forEach((member, memberIndex) => {
                        const tasksToAssign =
                            tasksPerMember + (memberIndex < extraTasks ? 1 : 0);

                        for (
                            let i = 0;
                            i < tasksToAssign &&
                            taskIndex < unassignedTasks.length;
                            i++
                        ) {
                            const taskToUpdate = updatedItems.find(
                                (item) =>
                                    item.id === unassignedTasks[taskIndex].id
                            );
                            if (taskToUpdate) {
                                taskToUpdate.assignedTo = member.userId;
                            }
                            taskIndex++;
                        }
                    });

                    const firebaseService = (
                        await import("../services/firebaseService")
                    ).default;
                    await firebaseService.updateChecklist(
                        tripId,
                        updatedItems,
                        user?.uid || ""
                    );

                    // 🔥 LOG POUR LE FEED LIVE - Auto-assignation
                    if (user) {
                        await firebaseService.logActivity(
                            tripId,
                            user.uid,
                            user.displayName || user.email || "Utilisateur",
                            "checklist_add",
                            {
                                title: `Répartition automatique de ${unassignedTasks.length} tâches`,
                                action: "auto_assigned",
                                taskCount: unassignedTasks.length,
                                memberCount: trip.members.length,
                            }
                        );
                    }

                    modal.showConfirm(
                        "🎉 Répartition terminée !",
                        "Tâches réparties équitablement entre tous les membres ! Voulez-vous voir la répartition ?",
                        () => setActiveTab("assignment"),
                        () => {},
                        "Voir répartition",
                        "Parfait"
                    );
                } catch (error) {
                    modal.showError(
                        "Erreur",
                        "Impossible de répartir les tâches"
                    );
                }
            },
            () => {}, // onCancel - ne rien faire si annulé
            "🚀 Go !",
            "Annuler"
        );
    };

    const getTasksByMember = () => {
        if (!trip?.members) return [];

        return trip.members.map((member) => {
            const memberTasks = localItems.filter(
                (item) => item.assignedTo === member.userId
            );
            const completedTasks = memberTasks.filter(
                (item) => item.isCompleted
            );
            const progressPercentage =
                memberTasks.length > 0
                    ? (completedTasks.length / memberTasks.length) * 100
                    : 0;

            return {
                member,
                tasks: memberTasks,
                completedTasks: completedTasks.length,
                totalTasks: memberTasks.length,
                progressPercentage,
                color: getMemberColor(member.userId),
            };
        });
    };

    const handleToggleItem = async (itemId: string) => {
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

        const newCompletedState = !item.isCompleted;

        setLocalItems((prev) =>
            prev.map((i) =>
                i.id === itemId
                    ? {
                          ...i,
                          isCompleted: newCompletedState,
                          completedBy: newCompletedState
                              ? user?.uid
                              : undefined,
                          completedAt: newCompletedState
                              ? new Date()
                              : undefined,
                      }
                    : i
            )
        );

        try {
            const firebaseService = (
                await import("../services/firebaseService")
            ).default;
            const updatedItems = localItems.map((i) => {
                if (i.id === itemId) {
                    const updatedItem: any = {
                        ...i,
                        isCompleted: newCompletedState,
                    };
                    if (newCompletedState) {
                        updatedItem.completedBy = user?.uid;
                        updatedItem.completedAt = new Date();
                    } else {
                        delete updatedItem.completedBy;
                        delete updatedItem.completedAt;
                    }
                    return updatedItem;
                }
                return i;
            });

            await firebaseService.updateChecklist(
                tripId,
                updatedItems,
                user?.uid || ""
            );

            // 🔥 LOG POUR LE FEED LIVE - Complétion/Décomplétion de tâche
            if (newCompletedState && user) {
                await firebaseService.logActivity(
                    tripId,
                    user.uid,
                    user.displayName || user.email || "Utilisateur",
                    "checklist_complete",
                    { title: item.title }
                );
            }
        } catch (error) {
            if (checklist?.items) {
                setLocalItems(checklist.items);
            }
        }
    };

    const handleAssignToMember = async (memberId: string | null) => {
        if (!selectedItemId) return;

        try {
            setLocalItems((prev) =>
                prev.map((i) =>
                    i.id === selectedItemId
                        ? { ...i, assignedTo: memberId || undefined }
                        : i
                )
            );

            const firebaseService = (
                await import("../services/firebaseService")
            ).default;
            const updatedItems = localItems.map((i) => {
                if (i.id === selectedItemId) {
                    const updatedItem: any = { ...i };
                    if (memberId) {
                        updatedItem.assignedTo = memberId;
                    } else {
                        delete updatedItem.assignedTo;
                    }
                    return updatedItem;
                }
                return i;
            });

            await firebaseService.updateChecklist(
                tripId,
                updatedItems,
                user?.uid || ""
            );

            // 🔥 LOG POUR LE FEED LIVE - Assignation/Désassignation de tâche
            if (user) {
                const item = localItems.find((i) => i.id === selectedItemId);
                if (item) {
                    if (memberId) {
                        // Assignation
                        const assignedMember = trip?.members.find(
                            (m) => m.userId === memberId
                        );
                        const assignedName = assignedMember?.name || "Membre";
                        await firebaseService.logActivity(
                            tripId,
                            user.uid,
                            user.displayName || user.email || "Utilisateur",
                            "checklist_add", // On utilise checklist_add pour l'assignation
                            {
                                title: item.title,
                                assignedTo: assignedName,
                                action: "assigned",
                            }
                        );
                    } else {
                        // Désassignation
                        await firebaseService.logActivity(
                            tripId,
                            user.uid,
                            user.displayName || user.email || "Utilisateur",
                            "checklist_add", // On utilise checklist_add pour la désassignation
                            {
                                title: item.title,
                                action: "unassigned",
                            }
                        );
                    }
                }
            }

            setAssignModalVisible(false);
            setSelectedItemId(null);
        } catch (error) {
            modal.showError("Erreur", "Impossible d'assigner l'élément");
            if (checklist?.items) {
                setLocalItems(checklist.items);
            }
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        modal.showDelete(
            "Supprimer l'élément",
            "Êtes-vous sûr de vouloir supprimer cet élément ?",
            async () => {
                try {
                    const itemToDelete = localItems.find(
                        (item) => item.id === itemId
                    );
                    const updatedItems = localItems.filter(
                        (item) => item.id !== itemId
                    );
                    setLocalItems(updatedItems);

                    const firebaseService = (
                        await import("../services/firebaseService")
                    ).default;
                    await firebaseService.updateChecklist(
                        tripId,
                        updatedItems,
                        user?.uid || ""
                    );

                    // 🔥 LOG POUR LE FEED LIVE - Suppression de tâche
                    if (user && itemToDelete) {
                        await firebaseService.logActivity(
                            tripId,
                            user.uid,
                            user.displayName || user.email || "Utilisateur",
                            "checklist_delete",
                            { title: itemToDelete.title }
                        );
                    }
                } catch (error) {
                    if (checklist?.items) {
                        setLocalItems(checklist.items);
                    }
                }
            }
        );
    };

    const getItemsByCategory = () => {
        const categories = [
            { id: "transport", name: "🚗 Transport", color: "#6B73FF" },
            { id: "accommodation", name: "🏨 Hébergement", color: "#9FE2BF" },
            { id: "activities", name: "🎯 Activités", color: "#FF6B9D" },
            { id: "food", name: "🍽️ Nourriture", color: "#FFFFBA" },
            { id: "shopping", name: "🛍️ Shopping", color: "#E2CCFF" },
            { id: "documents", name: "📄 Documents", color: "#BAE1FF" },
            { id: "other", name: "📦 Autre", color: "#BAFFC9" },
        ];

        return categories
            .map((category) => ({
                ...category,
                items: localItems.filter(
                    (item) => item.category === category.id
                ),
            }))
            .filter((category) => category.items.length > 0);
    };

    const calculateProgress = () => {
        if (localItems.length === 0) return 0;
        const completed = localItems.filter((item) => item.isCompleted).length;
        return Math.round((completed / localItems.length) * 100);
    };

    const getMyTasks = () => {
        return localItems.filter((item) => item.assignedTo === user?.uid);
    };

    const getAssignmentStats = () => {
        const assigned = localItems.filter((item) => item.assignedTo).length;
        const unassigned = localItems.length - assigned;
        return { assigned, unassigned };
    };

    // Composants de rendu
    const TabBar = () => (
        <View style={styles.tabBar}>
            <TouchableOpacity
                style={[styles.tab, activeTab === "list" && styles.activeTab]}
                onPress={() => setActiveTab("list")}
            >
                <Ionicons
                    name="list"
                    size={18}
                    color={
                        activeTab === "list"
                            ? Colors.white
                            : Colors.text.secondary
                    }
                />
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "list" && styles.activeTabText,
                    ]}
                >
                    Liste
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === "assignment" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("assignment")}
            >
                <Ionicons
                    name="people"
                    size={18}
                    color={
                        activeTab === "assignment"
                            ? Colors.white
                            : Colors.text.secondary
                    }
                />
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "assignment" && styles.activeTabText,
                    ]}
                >
                    Répartition
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === "myTasks" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("myTasks")}
            >
                <Ionicons
                    name="person"
                    size={18}
                    color={
                        activeTab === "myTasks"
                            ? Colors.white
                            : Colors.text.secondary
                    }
                />
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "myTasks" && styles.activeTabText,
                    ]}
                >
                    Mes Tâches
                </Text>
            </TouchableOpacity>
        </View>
    );

    const AssignmentView = () => {
        const tasksByMember = getTasksByMember();
        const unassignedTasks = localItems.filter((item) => !item.assignedTo);

        return (
            <ScrollView
                style={styles.assignmentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.assignmentHeader}>
                    <Text style={styles.assignmentTitle}>
                        🎯 Répartition des Tâches
                    </Text>
                    {isCreator && (
                        <TouchableOpacity
                            style={styles.autoAssignButton}
                            onPress={autoAssignTasks}
                        >
                            <Ionicons
                                name="shuffle"
                                size={16}
                                color={Colors.white}
                            />
                            <Text style={styles.autoAssignText}>Auto</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {tasksByMember.map((item) => (
                    <View
                        key={item.member.userId}
                        style={[
                            styles.memberCard,
                            { borderLeftColor: item.color },
                        ]}
                    >
                        <View style={styles.memberHeader}>
                            <View
                                style={[
                                    styles.avatarContainer,
                                    { backgroundColor: item.color },
                                ]}
                            >
                                {item.member.avatar ? (
                                    <Image
                                        source={{ uri: item.member.avatar }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <Text style={styles.avatarText}>
                                        {item.member.name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.memberDetails}>
                                <Text style={styles.memberName}>
                                    {item.member.name}
                                </Text>
                                <Text style={styles.memberStats}>
                                    {item.completedTasks}/{item.totalTasks}{" "}
                                    tâches
                                </Text>
                            </View>
                            <Text style={styles.progressPercentage}>
                                {Math.round(item.progressPercentage)}%
                            </Text>
                        </View>

                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${item.progressPercentage}%`,
                                        backgroundColor:
                                            item.progressPercentage === 100
                                                ? TaskAssignmentColors.progress
                                                      .complete
                                                : item.progressPercentage >= 75
                                                ? TaskAssignmentColors.progress
                                                      .high
                                                : item.progressPercentage >= 50
                                                ? TaskAssignmentColors.progress
                                                      .medium
                                                : TaskAssignmentColors.progress
                                                      .low,
                                    },
                                ]}
                            />
                        </View>

                        {item.tasks.length > 0 && (
                            <View style={styles.tasksList}>
                                {item.tasks.slice(0, 3).map((task) => (
                                    <View
                                        key={task.id}
                                        style={styles.taskPreview}
                                    >
                                        <Ionicons
                                            name={
                                                task.isCompleted
                                                    ? "checkmark-circle"
                                                    : "ellipse-outline"
                                            }
                                            size={16}
                                            color={
                                                task.isCompleted
                                                    ? TaskAssignmentColors
                                                          .taskStatus.completed
                                                    : TaskAssignmentColors
                                                          .taskStatus.pending
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.taskPreviewText,
                                                task.isCompleted &&
                                                    styles.completedTaskText,
                                            ]}
                                        >
                                            {task.title}
                                        </Text>
                                    </View>
                                ))}
                                {item.tasks.length > 3 && (
                                    <Text style={styles.moreTasksText}>
                                        +{item.tasks.length - 3} autres
                                    </Text>
                                )}
                            </View>
                        )}

                        {item.tasks.length === 0 && (
                            <Text style={styles.noTasksText}>
                                Aucune tâche assignée
                            </Text>
                        )}
                    </View>
                ))}

                {unassignedTasks.length > 0 && (
                    <View style={styles.unassignedContainer}>
                        <Text style={styles.unassignedTitle}>
                            📋 Tâches non assignées ({unassignedTasks.length})
                        </Text>
                        {unassignedTasks.map((task) => (
                            <View key={task.id} style={styles.unassignedTask}>
                                <Text style={styles.unassignedTaskText}>
                                    {task.title}
                                </Text>
                                <TouchableOpacity
                                    style={styles.assignButton}
                                    onPress={() => {
                                        setSelectedItemId(task.id);
                                        setAssignModalVisible(true);
                                    }}
                                >
                                    <Ionicons
                                        name="person-add"
                                        size={16}
                                        color={Colors.primary}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        );
    };

    const MyTasksView = () => {
        const myTasks = getMyTasks();
        const completedTasks = myTasks.filter((item) => item.isCompleted);
        const progressPercentage =
            myTasks.length > 0
                ? (completedTasks.length / myTasks.length) * 100
                : 0;

        return (
            <View style={styles.myTasksContainer}>
                <View style={styles.myTasksHeader}>
                    <Text style={styles.myTasksTitle}>🎯 Mes Tâches</Text>
                    <Text style={styles.myTasksStats}>
                        {completedTasks.length}/{myTasks.length} terminées (
                        {Math.round(progressPercentage)}%)
                    </Text>
                </View>

                {myTasks.length === 0 ? (
                    <View style={styles.noMyTasksContainer}>
                        <Ionicons
                            name="checkmark-done-circle-outline"
                            size={80}
                            color={Colors.text.muted}
                        />
                        <Text style={styles.noMyTasksTitle}>
                            Aucune tâche assignée
                        </Text>
                        <Text style={styles.noMyTasksSubtitle}>
                            Demandez au créateur du voyage de vous en assigner !
                            😊
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={myTasks}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.myTaskItem,
                                    item.isCompleted &&
                                        styles.completedTaskItem,
                                ]}
                                onPress={() => handleToggleItem(item.id)}
                            >
                                <Ionicons
                                    name={
                                        item.isCompleted
                                            ? "checkmark-circle"
                                            : "ellipse-outline"
                                    }
                                    size={24}
                                    color={
                                        item.isCompleted
                                            ? TaskAssignmentColors.taskStatus
                                                  .completed
                                            : TaskAssignmentColors.taskStatus
                                                  .pending
                                    }
                                />
                                <Text
                                    style={[
                                        styles.myTaskText,
                                        item.isCompleted &&
                                            styles.completedTaskText,
                                    ]}
                                >
                                    {item.title}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        );
    };

    const renderItem = ({ item }: { item: ChecklistItem }) => (
        <View style={styles.item}>
            <TouchableOpacity
                style={styles.itemCheckbox}
                onPress={() => handleToggleItem(item.id)}
            >
                <Ionicons
                    name={
                        item.isCompleted
                            ? "checkmark-circle"
                            : "ellipse-outline"
                    }
                    size={24}
                    color={item.isCompleted ? "#10B981" : "#D1D5DB"}
                />
            </TouchableOpacity>

            <View style={styles.itemContent}>
                <Text
                    style={[
                        styles.itemTitle,
                        item.isCompleted && styles.itemTitleChecked,
                    ]}
                >
                    {item.title}
                </Text>

                <View style={styles.assignmentSection}>
                    {item.assignedTo ? (
                        <View style={styles.assignedContainer}>
                            <View
                                style={[
                                    styles.avatarContainer,
                                    {
                                        backgroundColor: getMemberColor(
                                            item.assignedTo
                                        ),
                                    },
                                ]}
                            >
                                {trip?.members.find(
                                    (m) => m.userId === item.assignedTo
                                )?.avatar ? (
                                    <Image
                                        source={{
                                            uri: trip?.members.find(
                                                (m) =>
                                                    m.userId === item.assignedTo
                                            )?.avatar,
                                        }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <Text style={styles.avatarText}>
                                        {trip?.members
                                            .find(
                                                (m) =>
                                                    m.userId === item.assignedTo
                                            )
                                            ?.name?.charAt(0)
                                            .toUpperCase() || "?"}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.assignedText}>
                                {item.assignedTo === user?.uid
                                    ? "Vous"
                                    : trip?.members.find(
                                          (m) => m.userId === item.assignedTo
                                      )?.name || "Membre"}
                            </Text>
                            {(isCreator || item.assignedTo === user?.uid) && (
                                <TouchableOpacity
                                    style={styles.unassignButton}
                                    onPress={() => {
                                        setSelectedItemId(item.id);
                                        setAssignModalVisible(true);
                                    }}
                                >
                                    <Ionicons
                                        name="create-outline"
                                        size={16}
                                        color="#EF4444"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.assignButtonInline}
                            onPress={() => {
                                setSelectedItemId(item.id);
                                setAssignModalVisible(true);
                            }}
                        >
                            <Ionicons
                                name="person-add-outline"
                                size={16}
                                color="#7ED957"
                            />
                            <Text style={styles.assignButtonText}>
                                Assigner
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.itemActions}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item.id)}
                >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderCategorySection = ({ item: category }: any) => (
        <View style={styles.categorySection}>
            <View
                style={[
                    styles.categoryHeader,
                    { backgroundColor: category.color + "20" },
                ]}
            >
                <Text style={[styles.categoryTitle, { color: category.color }]}>
                    {category.name}
                </Text>
                <Text style={styles.categoryCount}>
                    {category.items.length} élément
                    {category.items.length > 1 ? "s" : ""}
                </Text>
            </View>
            <FlatList
                data={category.items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
            />
        </View>
    );

    const renderActiveTab = () => {
        switch (activeTab) {
            case "assignment":
                return <AssignmentView />;
            case "myTasks":
                return <MyTasksView />;
            case "list":
            default:
                const categorizedItems = getItemsByCategory();
                return categorizedItems.length > 0 ? (
                    <FlatList
                        data={categorizedItems}
                        renderItem={renderCategorySection}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="checkbox-outline"
                            size={64}
                            color="#E5E5E5"
                        />
                        <Text style={styles.emptyTitle}>Aucun élément</Text>
                        <Text style={styles.emptyText}>
                            Commencez par ajouter des éléments à votre checklist
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() =>
                                navigation.navigate("AddChecklistItem", {
                                    tripId,
                                })
                            }
                        >
                            <Text style={styles.emptyButtonText}>
                                Ajouter un élément
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
        }
    };

    const progress = calculateProgress();
    const myTasks = getMyTasks();
    const assignmentStats = getAssignmentStats();

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerSpacer} />
                <Text style={styles.headerTitle}>✅ Checklist</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() =>
                        navigation.navigate("AddChecklistItem", { tripId })
                    }
                >
                    <Ionicons name="add" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{progress}%</Text>
                    <Text style={styles.statLabel}>Terminé</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{myTasks.length}</Text>
                    <Text style={styles.statLabel}>Mes tâches</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {assignmentStats.assigned}
                    </Text>
                    <Text style={styles.statLabel}>Assignées</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {assignmentStats.unassigned}
                    </Text>
                    <Text style={styles.statLabel}>Libres</Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressFillMain,
                            { width: `${progress}%` },
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {progress}% terminé {progress === 100 ? "🎉" : "💪"}
                </Text>
            </View>

            <TabBar />

            <View style={styles.tabContent}>{renderActiveTab()}</View>

            <Modal
                visible={assignModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setAssignModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Assigner l'élément
                            </Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setAssignModalVisible(false)}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.membersList}>
                            <TouchableOpacity
                                style={styles.memberOption}
                                onPress={() => handleAssignToMember(null)}
                            >
                                <Ionicons
                                    name="person-remove-outline"
                                    size={20}
                                    color="#6B7280"
                                />
                                <Text style={styles.unassignText}>
                                    Personne (désassigner)
                                </Text>
                            </TouchableOpacity>

                            {trip?.members.map((member: TripMember) => (
                                <TouchableOpacity
                                    key={member.userId}
                                    style={styles.memberOption}
                                    onPress={() =>
                                        handleAssignToMember(member.userId)
                                    }
                                >
                                    <View
                                        style={[
                                            styles.avatarContainer,
                                            {
                                                backgroundColor: getMemberColor(
                                                    member.userId
                                                ),
                                            },
                                        ]}
                                    >
                                        {member.avatar ? (
                                            <Image
                                                source={{ uri: member.avatar }}
                                                style={styles.avatarImage}
                                            />
                                        ) : (
                                            <Text style={styles.avatarText}>
                                                {member.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.memberInfo}>
                                        <Text style={styles.memberName}>
                                            {member.userId === user?.uid
                                                ? "Vous"
                                                : member.name}
                                        </Text>
                                        <Text style={styles.memberEmail}>
                                            {member.email}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 🎉 Animation de célébration synchronisée */}
            <ChecklistCelebration
                visible={showCelebration}
                onHide={() => setShowCelebration(false)}
                tripTitle={trip?.title}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerSpacer: {
        width: 32, // Même largeur que le bouton add pour équilibrer
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    addButton: {
        padding: 8,
    },
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.text.secondary,
        textAlign: "center",
    },
    progressContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: Colors.backgroundColors.secondary,
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressFillMain: {
        height: "100%",
        backgroundColor: Colors.primary,
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text.secondary,
        textAlign: "center",
    },
    tabBar: {
        flexDirection: "row",
        backgroundColor: Colors.white,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: Colors.primary,
    },
    tabText: {
        fontSize: 13,
        fontWeight: "500",
        marginLeft: 6,
        color: Colors.text.secondary,
    },
    activeTabText: {
        color: Colors.white,
        fontWeight: "600",
    },
    tabContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    assignmentContainer: {
        flex: 1,
    },
    assignmentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    assignmentTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text.primary,
    },
    autoAssignButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    autoAssignText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    memberCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    memberHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: 20,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    memberDetails: {
        flex: 1,
        marginLeft: 12,
    },
    memberName: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 2,
    },
    memberStats: {
        fontSize: 13,
        color: Colors.text.secondary,
    },
    progressPercentage: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.text.primary,
    },
    progressBar: {
        height: 6,
        backgroundColor: Colors.backgroundColors.secondary,
        borderRadius: 3,
        overflow: "hidden",
        marginBottom: 12,
    },
    progressFill: {
        height: "100%",
        borderRadius: 3,
    },
    tasksList: {
        gap: 4,
    },
    taskPreview: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: Colors.backgroundColors.secondary,
        borderRadius: 6,
    },
    taskPreviewText: {
        fontSize: 13,
        color: Colors.text.primary,
        marginLeft: 8,
        flex: 1,
    },
    completedTaskText: {
        textDecorationLine: "line-through",
        color: Colors.text.muted,
    },
    moreTasksText: {
        fontSize: 12,
        color: Colors.text.muted,
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 4,
    },
    noTasksText: {
        fontSize: 13,
        color: Colors.text.muted,
        fontStyle: "italic",
        textAlign: "center",
        paddingVertical: 8,
    },
    unassignedContainer: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderLeftWidth: 4,
        borderLeftColor: TaskAssignmentColors.taskStatus.pending,
    },
    unassignedTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 12,
    },
    unassignedTask: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: Colors.backgroundColors.secondary,
        borderRadius: 8,
        marginBottom: 8,
    },
    unassignedTaskText: {
        fontSize: 14,
        color: Colors.text.primary,
        flex: 1,
        marginRight: 12,
    },
    assignButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: Colors.backgroundColors.primary,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    myTasksContainer: {
        flex: 1,
    },
    myTasksHeader: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    myTasksTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text.primary,
        marginBottom: 4,
    },
    myTasksStats: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    noMyTasksContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    noMyTasksTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.text.primary,
        marginTop: 20,
        marginBottom: 8,
        textAlign: "center",
    },
    noMyTasksSubtitle: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: "center",
        lineHeight: 20,
    },
    myTaskItem: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        borderLeftWidth: 4,
        borderLeftColor: TaskAssignmentColors.taskStatus.pending,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    completedTaskItem: {
        borderLeftColor: TaskAssignmentColors.taskStatus.completed,
        backgroundColor: Colors.backgroundColors.secondary,
    },
    myTaskText: {
        fontSize: 15,
        color: Colors.text.primary,
        marginLeft: 12,
        flex: 1,
        fontWeight: "500",
    },
    listContainer: {
        paddingBottom: 20,
    },
    categorySection: {
        marginBottom: 20,
    },
    categoryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    categoryCount: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
    item: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    itemCheckbox: {
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.text.primary,
        marginBottom: 4,
    },
    itemTitleChecked: {
        textDecorationLine: "line-through",
        color: Colors.text.muted,
    },
    assignmentSection: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    assignedContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    assignedText: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginLeft: 8,
    },
    unassignButton: {
        marginLeft: 8,
        padding: 4,
        borderRadius: 4,
    },
    assignButtonInline: {
        flexDirection: "row",
        alignItems: "center",
        padding: 6,
        borderWidth: 1,
        borderColor: "#7ED957",
        borderRadius: 6,
        backgroundColor: "#F0FDF4",
    },
    assignButtonText: {
        color: "#7ED957",
        fontSize: 12,
        fontWeight: "500",
        marginLeft: 4,
    },
    itemActions: {
        marginLeft: 8,
    },
    deleteButton: {
        padding: 8,
        borderRadius: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.text.secondary,
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 14,
        color: Colors.text.muted,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: Colors.white,
        padding: 20,
        borderRadius: 16,
        width: "85%",
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    modalCloseButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: Colors.backgroundColors.secondary,
    },
    membersList: {
        gap: 8,
    },
    memberOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        backgroundColor: Colors.backgroundColors.primary,
    },
    unassignText: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.text.secondary,
        marginLeft: 12,
    },
    memberInfo: {
        flex: 1,
        marginLeft: 12,
    },
    memberEmail: {
        fontSize: 13,
        color: Colors.text.secondary,
    },
});

export default ChecklistScreen;
