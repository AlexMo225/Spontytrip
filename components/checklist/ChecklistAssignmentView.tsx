import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors, TaskAssignmentColors } from "../../constants/Colors";
import { TasksByMember } from "../../hooks/useChecklist";
import { ChecklistItem } from "../../types";

interface ChecklistAssignmentViewProps {
    tasksByMember: TasksByMember[];
    unassignedTasks: ChecklistItem[];
    onAutoAssign: () => void;
    onAssignTask: (taskId: string) => void;
    isCreator: boolean;
}

/**
 * 👥 Vue de répartition des tâches par membre
 */
export const ChecklistAssignmentView: React.FC<
    ChecklistAssignmentViewProps
> = ({
    tasksByMember,
    unassignedTasks,
    onAutoAssign,
    onAssignTask,
    isCreator,
}) => {
    const renderMemberSection = ({ item }: { item: TasksByMember }) => {
        const { member, tasks, completedTasks, progressPercentage, color } =
            item;

        return (
            <View style={styles.memberSection}>
                {/* En-tête du membre */}
                <View style={styles.memberHeader}>
                    <View
                        style={[
                            styles.avatarContainer,
                            { backgroundColor: color },
                        ]}
                    >
                        {member.avatar ? (
                            <Image
                                source={{ uri: member.avatar }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Text style={styles.avatarText}>
                                {member.name.charAt(0)}
                            </Text>
                        )}
                    </View>
                    <View style={styles.memberDetails}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberStats}>
                            {completedTasks}/{tasks.length} tâches terminées
                        </Text>
                    </View>
                    <Text style={styles.progressPercentage}>
                        {progressPercentage}%
                    </Text>
                </View>

                {/* Barre de progression */}
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${progressPercentage}%`,
                                backgroundColor: color,
                            },
                        ]}
                    />
                </View>

                {/* Liste des tâches du membre */}
                <View style={styles.tasksList}>
                    {tasks.length > 0 ? (
                        tasks.slice(0, 3).map((task) => (
                            <View key={task.id} style={styles.taskPreview}>
                                <Ionicons
                                    name={
                                        task.isCompleted
                                            ? "checkbox"
                                            : "square-outline"
                                    }
                                    size={16}
                                    color={
                                        task.isCompleted
                                            ? TaskAssignmentColors.taskStatus
                                                  .completed
                                            : Colors.text.muted
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
                        ))
                    ) : (
                        <Text style={styles.noTasksText}>
                            Aucune tâche assignée
                        </Text>
                    )}
                    {tasks.length > 3 && (
                        <Text style={styles.moreTasksText}>
                            +{tasks.length - 3} autres tâches...
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header avec bouton d'auto-assignation */}
            {isCreator && unassignedTasks.length > 0 && (
                <View style={styles.headerSection}>
                    <TouchableOpacity
                        style={styles.autoAssignButton}
                        onPress={onAutoAssign}
                    >
                        <Ionicons
                            name="shuffle-outline"
                            size={20}
                            color={Colors.white}
                        />
                        <Text style={styles.autoAssignText}>
                            Répartir automatiquement
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Liste des membres et leurs tâches */}
            <FlatList
                data={tasksByMember}
                renderItem={renderMemberSection}
                keyExtractor={(item) => item.member.userId}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />

            {/* Tâches non assignées */}
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
                                onPress={() => onAssignTask(task.id)}
                            >
                                <Ionicons
                                    name="person-add-outline"
                                    size={16}
                                    color={Colors.primary}
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    autoAssignButton: {
        backgroundColor: Colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    autoAssignText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    memberSection: {
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
        marginHorizontal: 16,
        marginBottom: 16,
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
});
