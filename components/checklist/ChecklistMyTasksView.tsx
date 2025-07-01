import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors, TaskAssignmentColors } from "../../constants/Colors";
import { ChecklistItem } from "../../types";

interface ChecklistMyTasksViewProps {
    myTasks: ChecklistItem[];
    onToggleTask: (taskId: string) => void;
}

/**
 * 🙋‍♂️ Vue des tâches personnelles de l'utilisateur
 */
export const ChecklistMyTasksView: React.FC<ChecklistMyTasksViewProps> = ({
    myTasks,
    onToggleTask,
}) => {
    const completedTasks = myTasks.filter((task) => task.isCompleted);
    const pendingTasks = myTasks.filter((task) => !task.isCompleted);

    const renderMyTask = ({ item }: { item: ChecklistItem }) => (
        <TouchableOpacity
            style={[
                styles.myTaskItem,
                item.isCompleted && styles.completedTaskItem,
            ]}
            onPress={() => onToggleTask(item.id)}
        >
            <Ionicons
                name={item.isCompleted ? "checkbox" : "square-outline"}
                size={24}
                color={
                    item.isCompleted
                        ? TaskAssignmentColors.taskStatus.completed
                        : Colors.text.muted
                }
            />
            <Text
                style={[
                    styles.myTaskText,
                    item.isCompleted && {
                        textDecorationLine: "line-through",
                        color: Colors.text.muted,
                    },
                ]}
            >
                {item.title}
            </Text>
        </TouchableOpacity>
    );

    if (myTasks.length === 0) {
        return (
            <View style={styles.noMyTasksContainer}>
                <Text style={styles.noMyTasksTitle}>
                    🤷‍♂️ Aucune tâche assignée
                </Text>
                <Text style={styles.noMyTasksSubtitle}>
                    Aucune tâche ne vous est assignée pour le moment.{"\n"}
                    Demandez au créateur du voyage de vous en assigner !
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.myTasksContainer}>
            {/* Header avec statistiques */}
            <View style={styles.myTasksHeader}>
                <Text style={styles.myTasksTitle}>
                    🙋‍♂️ Mes tâches ({myTasks.length})
                </Text>
                <Text style={styles.myTasksStats}>
                    {completedTasks.length} terminées • {pendingTasks.length} en
                    cours
                </Text>
            </View>

            {/* Liste des tâches */}
            <FlatList
                data={myTasks}
                renderItem={renderMyTask}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    myTasksContainer: {
        flex: 1,
    },
    myTasksHeader: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
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
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
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
});
