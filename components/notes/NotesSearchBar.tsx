import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../../constants/Fonts";

interface NotesSearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    notesCount: number;
}

export const NotesSearchBar: React.FC<NotesSearchBarProps> = ({
    searchQuery,
    onSearchChange,
    notesCount,
}) => {
    if (notesCount === 0) return null;

    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher dans les notes..."
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholderTextColor="#9CA3AF"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => onSearchChange("")}>
                        <Ionicons name="close" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#F9FAFB",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#374151",
        fontFamily: Fonts.body.family,
    },
});
