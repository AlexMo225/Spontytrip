import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AddActivityHeaderProps {
    onBackPress: () => void;
    onSavePress: () => void;
    activityName: string;
    isEditing: boolean;
}

export const AddActivityHeader: React.FC<AddActivityHeaderProps> = ({
    onBackPress,
    onSavePress,
    activityName,
    isEditing,
}) => {
    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>
                {isEditing ? "Modifier activité" : "Nouvelle activité"}
            </Text>
            <TouchableOpacity
                onPress={onSavePress}
                style={styles.saveButton}
                disabled={!activityName.trim()}
            >
                <Text
                    style={[
                        styles.saveButtonText,
                        !activityName.trim() && styles.saveButtonTextDisabled,
                    ]}
                >
                    Sauver
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    backButton: {
        padding: 8,
    },
    saveButton: {
        backgroundColor: "#4DA1A9",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    saveButtonTextDisabled: {
        color: "#9CA3AF",
    },
});
