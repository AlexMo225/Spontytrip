import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, TaskAssignmentColors } from "../../constants/Colors";
import { TripMember } from "../../services/firebaseService";
import { ChecklistItem as ChecklistItemType } from "../../types";

interface ChecklistItemProps {
    item: ChecklistItemType;
    members: TripMember[];
    currentUserId: string;
    isCreator: boolean;
    onToggle: (itemId: string) => void;
    onAssign: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    getMemberColor: (memberId: string) => string;
}

/**
 * ✅ Composant pour un item de checklist individuel
 */
export const ChecklistItem: React.FC<ChecklistItemProps> = ({
    item,
    members,
    currentUserId,
    isCreator,
    onToggle,
    onAssign,
    onDelete,
    getMemberColor,
}) => {
    const assignedMember = members.find((m) => m.userId === item.assignedTo);
    const canDelete = isCreator || item.createdBy === currentUserId;

    return (
        <View style={styles.item}>
            {/* ✅ Checkbox */}
            <TouchableOpacity
                style={styles.itemCheckbox}
                onPress={() => onToggle(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
            </TouchableOpacity>

            {/* 📝 Contenu de la tâche */}
            <View style={styles.itemContent}>
                <Text
                    style={[
                        styles.itemTitle,
                        item.isCompleted && styles.itemTitleChecked,
                    ]}
                >
                    {item.title}
                </Text>

                {/* 👤 Section d'assignation */}
                <View style={styles.assignmentSection}>
                    {item.assignedTo ? (
                        <TouchableOpacity
                            style={styles.assignedContainer}
                            onPress={() => onAssign(item.id)}
                        >
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
                                {assignedMember?.avatar ? (
                                    <Image
                                        source={{ uri: assignedMember.avatar }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <Text style={styles.avatarText}>
                                        {assignedMember?.name?.charAt(0) || "?"}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.assignedText}>
                                {assignedMember?.name || "Utilisateur inconnu"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.unassignedButton}
                            onPress={() => onAssign(item.id)}
                        >
                            <Ionicons
                                name="person-add-outline"
                                size={16}
                                color={Colors.primary}
                            />
                            <Text style={styles.unassignedText}>Assigner</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* 🗑️ Bouton de suppression */}
            {canDelete && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name="trash-outline"
                        size={20}
                        color={Colors.error}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
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
        backgroundColor: Colors.backgroundColors.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    avatarContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 6,
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },
    avatarText: {
        fontSize: 10,
        fontWeight: "600",
        color: Colors.white,
    },
    assignedText: {
        fontSize: 12,
        color: Colors.text.primary,
        fontWeight: "500",
    },
    unassignedButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.backgroundColors.primary,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderStyle: "dashed",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    unassignedText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: "500",
        marginLeft: 4,
    },
    deleteButton: {
        marginLeft: 12,
        padding: 4,
    },
});
