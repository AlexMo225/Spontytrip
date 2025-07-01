import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import firebaseService, { TripMember } from "../services/firebaseService";
import { ChecklistItem } from "../types";

export type TabType = "list" | "assignment" | "myTasks";

export interface AssignmentStats {
    totalTasks: number;
    assignedTasks: number;
    unassignedTasks: number;
    completedTasks: number;
    progressPercentage: number;
}

export interface TasksByMember {
    member: TripMember;
    tasks: ChecklistItem[];
    completedTasks: number;
    progressPercentage: number;
    color: string;
}

export interface UseChecklistReturn {
    // États
    localItems: ChecklistItem[];
    activeTab: TabType;
    assignModalVisible: boolean;
    selectedItemId: string | null;
    showCelebration: boolean;
    wasCompleted: boolean;

    // Setters
    setActiveTab: (tab: TabType) => void;
    setAssignModalVisible: (visible: boolean) => void;
    setSelectedItemId: (id: string | null) => void;
    setShowCelebration: (show: boolean) => void;

    // Actions
    handleToggleItem: (itemId: string) => Promise<void>;
    handleAssignToMember: (memberId: string | null) => Promise<void>;
    handleDeleteItem: (itemId: string) => Promise<void>;
    autoAssignTasks: () => Promise<void>;

    // Computed values
    itemsByCategory: Record<string, ChecklistItem[]>;
    tasksByMember: TasksByMember[];
    myTasks: ChecklistItem[];
    assignmentStats: AssignmentStats;
    progress: { completed: number; total: number; percentage: number };
    unassignedTasks: ChecklistItem[];
}

/**
 * 📋 Hook personnalisé pour la gestion complète de la checklist
 */
export const useChecklist = (
    tripId: string,
    trip: any,
    checklist: any,
    taskAssignmentColors: readonly string[]
): UseChecklistReturn => {
    const { user } = useAuth();

    // États locaux
    const [localItems, setLocalItems] = useState<ChecklistItem[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("list");
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [wasCompleted, setWasCompleted] = useState(false);

    // Synchronisation avec les données Firebase
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

    // 🎯 Obtenir la couleur d'un membre
    const getMemberColor = useCallback(
        (memberId: string) => {
            if (!trip?.members) return taskAssignmentColors[0];
            const memberIndex = trip.members.findIndex(
                (m: TripMember) => m.userId === memberId
            );
            return taskAssignmentColors[
                memberIndex % taskAssignmentColors.length
            ];
        },
        [trip?.members, taskAssignmentColors]
    );

    // 🔄 Toggle d'un item
    const handleToggleItem = useCallback(
        async (itemId: string) => {
            if (!user) return;

            const itemToToggle = localItems.find((item) => item.id === itemId);
            if (!itemToToggle) return;

            const newCompletedState = !itemToToggle.isCompleted;
            const updatedItems = localItems.map((item) =>
                item.id === itemId
                    ? {
                          ...item,
                          isCompleted: newCompletedState,
                          completedBy: newCompletedState ? user.uid : undefined,
                          completedAt: newCompletedState
                              ? new Date()
                              : undefined,
                      }
                    : item
            );

            // Mise à jour optimiste
            setLocalItems(updatedItems);

            try {
                await firebaseService.updateChecklist(
                    tripId,
                    updatedItems,
                    user.uid
                );

                // 🔥 LOG POUR LE FEED LIVE
                await firebaseService.logActivity(
                    tripId,
                    user.uid,
                    user.displayName || user.email || "Utilisateur",
                    newCompletedState ? "checklist_complete" : "checklist_add",
                    {
                        title: itemToToggle.title,
                        category: itemToToggle.category,
                        action: newCompletedState ? "completed" : "uncompleted",
                    }
                );
            } catch (error) {
                console.error("Erreur toggle item:", error);
                // Rollback en cas d'erreur
                setLocalItems(localItems);
            }
        },
        [localItems, user, tripId]
    );

    // 👤 Assigner une tâche à un membre
    const handleAssignToMember = useCallback(
        async (memberId: string | null) => {
            if (!selectedItemId || !user) return;

            const updatedItems = localItems.map((item) =>
                item.id === selectedItemId
                    ? { ...item, assignedTo: memberId || undefined }
                    : item
            );

            // Mise à jour optimiste
            setLocalItems(updatedItems);
            setAssignModalVisible(false);
            setSelectedItemId(null);

            try {
                await firebaseService.updateChecklist(
                    tripId,
                    updatedItems,
                    user.uid
                );

                const assignedMember = trip?.members?.find(
                    (m: TripMember) => m.userId === memberId
                );
                const taskItem = localItems.find(
                    (item) => item.id === selectedItemId
                );

                // 🔥 LOG POUR LE FEED LIVE
                await firebaseService.logActivity(
                    tripId,
                    user.uid,
                    user.displayName || user.email || "Utilisateur",
                    "checklist_add",
                    {
                        title: taskItem?.title || "Tâche",
                        action: memberId ? "assigned" : "unassigned",
                        assignedTo: assignedMember?.name || "Non assigné",
                    }
                );
            } catch (error) {
                console.error("Erreur assignation:", error);
                // Rollback en cas d'erreur
                setLocalItems(localItems);
            }
        },
        [selectedItemId, localItems, user, tripId, trip?.members]
    );

    // 🗑️ Supprimer un item
    const handleDeleteItem = useCallback(
        async (itemId: string) => {
            if (!user) return;

            const itemToDelete = localItems.find((item) => item.id === itemId);
            if (!itemToDelete) return;

            const updatedItems = localItems.filter(
                (item) => item.id !== itemId
            );

            // Mise à jour optimiste
            setLocalItems(updatedItems);

            try {
                await firebaseService.updateChecklist(
                    tripId,
                    updatedItems,
                    user.uid
                );

                // 🔥 LOG POUR LE FEED LIVE
                await firebaseService.logActivity(
                    tripId,
                    user.uid,
                    user.displayName || user.email || "Utilisateur",
                    "checklist_delete",
                    {
                        title: itemToDelete.title,
                        category: itemToDelete.category,
                        action: "deleted",
                    }
                );
            } catch (error) {
                console.error("Erreur suppression:", error);
                // Rollback en cas d'erreur
                setLocalItems(localItems);
            }
        },
        [localItems, user, tripId]
    );

    // 🎲 Auto-assignation des tâches
    const autoAssignTasks = useCallback(async () => {
        if (!trip?.members || trip.members.length === 0 || !user) return;

        const unassignedTasks = localItems.filter((item) => !item.assignedTo);
        if (unassignedTasks.length === 0) return;

        try {
            const members = trip.members;
            const tasksPerMember = Math.floor(
                unassignedTasks.length / members.length
            );
            const extraTasks = unassignedTasks.length % members.length;

            let taskIndex = 0;
            const updatedItems = [...localItems];

            members.forEach((member: TripMember, memberIndex: number) => {
                const tasksToAssign =
                    tasksPerMember + (memberIndex < extraTasks ? 1 : 0);

                for (
                    let i = 0;
                    i < tasksToAssign && taskIndex < unassignedTasks.length;
                    i++
                ) {
                    const taskToUpdate = updatedItems.find(
                        (item) => item.id === unassignedTasks[taskIndex].id
                    );
                    if (taskToUpdate) {
                        taskToUpdate.assignedTo = member.userId;
                    }
                    taskIndex++;
                }
            });

            // Mise à jour optimiste
            setLocalItems(updatedItems);

            await firebaseService.updateChecklist(
                tripId,
                updatedItems,
                user.uid
            );

            // 🔥 LOG POUR LE FEED LIVE - Auto-assignation
            await firebaseService.logActivity(
                tripId,
                user.uid,
                user.displayName || user.email || "Utilisateur",
                "checklist_add",
                {
                    title: `Répartition automatique de ${unassignedTasks.length} tâches`,
                    action: "auto_assigned",
                    tasksCount: unassignedTasks.length,
                    membersCount: members.length,
                }
            );
        } catch (error) {
            console.error("Erreur auto-assignation:", error);
            // Rollback en cas d'erreur
            setLocalItems(localItems);
        }
    }, [trip?.members, localItems, user, tripId]);

    // 📊 Calculs dérivés avec useMemo pour les performances
    const itemsByCategory = useMemo(() => {
        const categories: Record<string, ChecklistItem[]> = {};
        localItems.forEach((item) => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });
        return categories;
    }, [localItems]);

    const tasksByMember = useMemo((): TasksByMember[] => {
        if (!trip?.members) return [];

        return trip.members.map((member: TripMember) => {
            const memberTasks = localItems.filter(
                (item) => item.assignedTo === member.userId
            );
            const completedTasks = memberTasks.filter(
                (task) => task.isCompleted
            ).length;
            const progressPercentage =
                memberTasks.length > 0
                    ? Math.round((completedTasks / memberTasks.length) * 100)
                    : 0;

            return {
                member,
                tasks: memberTasks,
                completedTasks,
                progressPercentage,
                color: getMemberColor(member.userId),
            };
        });
    }, [trip?.members, localItems, getMemberColor]);

    const myTasks = useMemo(() => {
        if (!user) return [];
        return localItems.filter((item) => item.assignedTo === user.uid);
    }, [localItems, user]);

    const assignmentStats = useMemo((): AssignmentStats => {
        const totalTasks = localItems.length;
        const assignedTasks = localItems.filter(
            (item) => item.assignedTo
        ).length;
        const unassignedTasks = totalTasks - assignedTasks;
        const completedTasks = localItems.filter(
            (item) => item.isCompleted
        ).length;
        const progressPercentage =
            totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0;

        return {
            totalTasks,
            assignedTasks,
            unassignedTasks,
            completedTasks,
            progressPercentage,
        };
    }, [localItems]);

    const progress = useMemo(() => {
        const completed = localItems.filter((item) => item.isCompleted).length;
        const total = localItems.length;
        const percentage =
            total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    }, [localItems]);

    const unassignedTasks = useMemo(() => {
        return localItems.filter((item) => !item.assignedTo);
    }, [localItems]);

    return {
        // États
        localItems,
        activeTab,
        assignModalVisible,
        selectedItemId,
        showCelebration,
        wasCompleted,

        // Setters
        setActiveTab,
        setAssignModalVisible,
        setSelectedItemId,
        setShowCelebration,

        // Actions
        handleToggleItem,
        handleAssignToMember,
        handleDeleteItem,
        autoAssignTasks,

        // Computed values
        itemsByCategory,
        tasksByMember,
        myTasks,
        assignmentStats,
        progress,
        unassignedTasks,
    };
};
