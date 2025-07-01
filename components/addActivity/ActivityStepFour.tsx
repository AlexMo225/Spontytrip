import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface ActivityStepFourProps {
    description: string;
    setDescription: (description: string) => void;
}

export const ActivityStepFour: React.FC<ActivityStepFourProps> = ({
    description,
    setDescription,
}) => {
    return (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Description</Text>
            
            {/* Description */}
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Text style={styles.label}>Description (optionnel)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description de l'activité..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor="#9CA3AF"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    stepContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    textAreaContainer: {
        minHeight: 120,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#111827",
    },
    textArea: {
        height: 100,
        paddingTop: 12,
        textAlignVertical: "top",
    },
});
