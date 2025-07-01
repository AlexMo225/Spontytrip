import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../../constants/Fonts";
import { TripNote } from "../../services/firebaseService";

interface NoteCardProps {
    note: TripNote;
    user: any;
    canEditNote: (note: TripNote) => boolean;
    formatDate: (date: Date) => string;
    getAuthorInitials: (name: string) => string;
    onEdit: (note: TripNote) => void;
    onDelete: (note: TripNote) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
    note,
    user,
    canEditNote,
    formatDate,
    getAuthorInitials,
    onEdit,
    onDelete,
}) => {
    const isOwner = note.createdBy === user?.uid;
    const hasPermissions = canEditNote(note);

    return (
        <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
                <View style={styles.authorInfo}>
                    <View
                        style={[
                            styles.authorAvatar,
                            {
                                backgroundColor: isOwner
                                    ? "#10B981"
                                    : "#6366F1",
                            },
                        ]}
                    >
                        <Text style={styles.authorInitials}>
                            {getAuthorInitials(note.createdByName)}
                        </Text>
                    </View>
                    <View style={styles.authorDetails}>
                        <Text style={styles.authorName}>
                            {isOwner ? "Créé par toi" : note.createdByName}
                        </Text>
                        <Text style={styles.noteDate}>
                            {note.updatedAt.getTime() !==
                            note.createdAt.getTime()
                                ? `Modifié ${formatDate(note.updatedAt)}`
                                : `Créé ${formatDate(note.createdAt)}`}
                        </Text>
                    </View>
                </View>

                <View style={styles.noteActions}>
                    {note.isImportant && (
                        <View style={styles.importantBadge}>
                            <Text style={styles.importantStar}>⭐</Text>
                        </View>
                    )}
                    {hasPermissions && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => onEdit(note)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.editIcon}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => onDelete(note)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.deleteIcon}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.noteContentContainer}>
                <Text style={styles.noteContent}>{note.content}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    noteCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    noteHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    authorInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    authorInitials: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
        fontFamily: Fonts.body.family,
    },
    authorDetails: {
        flex: 1,
    },
    authorName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        fontFamily: Fonts.body.family,
    },
    noteDate: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 2,
        fontFamily: Fonts.body.family,
    },
    noteActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    importantBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#F59E0B",
        justifyContent: "center",
        alignItems: "center",
    },
    importantStar: {
        fontSize: 14,
        color: "#FFFFFF",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 4,
    },
    editButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
    },
    editIcon: {
        fontSize: 14,
    },
    deleteIcon: {
        fontSize: 14,
    },
    noteContentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    noteContent: {
        fontSize: 16,
        lineHeight: 24,
        color: "#374151",
        fontFamily: Fonts.body.family,
    },
});
