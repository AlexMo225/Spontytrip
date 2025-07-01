import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../../constants/Fonts";

interface NotesEmptyStateProps {
    onCreateNote: () => void;
}

export const NotesEmptyState: React.FC<NotesEmptyStateProps> = ({
    onCreateNote,
}) => {
    return (
        <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}></Text>
            <Text style={styles.emptyTitle}>Aucune note pour ce voyage</Text>
            <Text style={styles.emptySubtitle}>Ajoute la premiere !</Text>
            <Text style={styles.emptyDescription}>
                Partagez vos idees, informations importantes et souvenirs avec votre groupe.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={onCreateNote}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Ajouter une note</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingTop: 100,
    },
    emptyEmoji: {
        fontSize: 80,
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 8,
        textAlign: "center",
        fontFamily: Fonts.heading.family,
    },
    emptySubtitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#10B981",
        marginBottom: 16,
        textAlign: "center",
        fontFamily: Fonts.heading.family,
    },
    emptyDescription: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
        fontFamily: Fonts.body.family,
    },
    emptyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#10B981",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: Fonts.body.family,
        marginLeft: 8,
    },
});
