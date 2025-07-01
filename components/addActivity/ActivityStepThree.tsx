import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface ActivityStepThreeProps {
    link: string;
    setLink: (link: string) => void;
}

export const ActivityStepThree: React.FC<ActivityStepThreeProps> = ({
    link,
    setLink,
}) => {
    return (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Informations supplémentaires</Text>
            
            {/* Lien */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Lien (optionnel)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="https://exemple.com"
                    value={link}
                    onChangeText={setLink}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="url"
                    autoCapitalize="none"
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
});
