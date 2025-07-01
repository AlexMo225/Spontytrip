import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Fonts } from "../../constants/Fonts";

interface NotesHeaderProps {
    title: string;
    notesCount: number;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({
    title,
    notesCount,
}) => {
    return (
        <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Notes</Text>
                <Text style={styles.headerSubtitle}>
                    {title}  {notesCount} note{notesCount > 1 ? "s" : ""}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitleContainer: {
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
        fontFamily: Fonts.heading.family,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
        fontFamily: Fonts.body.family,
    },
});
