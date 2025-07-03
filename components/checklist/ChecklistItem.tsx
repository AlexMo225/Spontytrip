import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/Colors";
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

    // Animation refs
    const progressAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [hasAnimated, setHasAnimated] = useState(false);

    // Initialiser la progression selon l'état
    useEffect(() => {
        if (item.isCompleted && !hasAnimated) {
            // Déclencher l'animation seulement si pas encore animé
            setHasAnimated(true);

            // Feedback haptique pour la validation
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Animation de scale + progression
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.02,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(progressAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: false,
                    }),
                ]),
            ]).start();
        } else if (!item.isCompleted && hasAnimated) {
            // Réinitialiser si l'item est décoché
            setHasAnimated(false);
            Animated.timing(progressAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start();
        } else if (item.isCompleted && hasAnimated) {
            // Si déjà complété et animé, juste définir la valeur
            progressAnim.setValue(1);
        }
    }, [item.isCompleted, hasAnimated]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    const handleToggle = () => {
        // Feedback haptique léger au touch
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle(item.id);
    };

    return (
        <Animated.View
            style={[styles.item, { transform: [{ scale: scaleAnim }] }]}
        >
            {/* ✅ Checkbox */}
            <TouchableOpacity
                style={styles.itemCheckbox}
                onPress={handleToggle}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons
                    name={item.isCompleted ? "checkbox" : "square-outline"}
                    size={24}
                    color={
                        item.isCompleted
                            ? Colors.checklistGreen
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
                                color={Colors.checklistGreen}
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

            {/* Barre de progression animée - maintenant en bas */}
            <View style={styles.progressContainer}>
                <Animated.View
                    style={[
                        styles.progressBar,
                        {
                            width: progressWidth,
                            backgroundColor: Colors.checklistGreen,
                        },
                    ]}
                />
            </View>
        </Animated.View>
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
        position: "relative",
        overflow: "hidden",
    },
    progressContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: "transparent",
    },
    progressBar: {
        height: "100%",
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
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
        borderColor: Colors.checklistGreen,
        borderStyle: "dashed",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    unassignedText: {
        fontSize: 12,
        color: Colors.checklistGreen,
        fontWeight: "500",
        marginLeft: 4,
    },
    deleteButton: {
        marginLeft: 12,
        padding: 4,
    },
});
