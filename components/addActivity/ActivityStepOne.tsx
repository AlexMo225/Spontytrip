import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface ActivityStepOneProps {
    activityName: string;
    setActivityName: (name: string) => void;
    location: string;
    setLocation: (location: string) => void;
    selectedTypeInfo: any;
    onTypeModalOpen: () => void;
    activityNameInputRef: React.RefObject<TextInput | null>;
}

export const ActivityStepOne: React.FC<ActivityStepOneProps> = ({
    activityName,
    setActivityName,
    location,
    setLocation,
    selectedTypeInfo,
    onTypeModalOpen,
    activityNameInputRef,
}) => {
    return (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Informations de base</Text>

            {/* Nom de l'activité */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Nom de l'activité *</Text>
                <TextInput
                    ref={activityNameInputRef}
                    style={styles.input}
                    placeholder="Ex: Visite du Louvre"
                    value={activityName}
                    onChangeText={setActivityName}
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            {/* Type d'activité */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Type d'activité</Text>
                <TouchableOpacity
                    style={styles.selectButton}
                    onPress={onTypeModalOpen}
                >
                    <View style={styles.selectContent}>
                        {selectedTypeInfo && (
                            <View
                                style={[
                                    styles.typeIcon,
                                    { backgroundColor: selectedTypeInfo.color },
                                ]}
                            >
                                <Ionicons
                                    name={selectedTypeInfo.icon}
                                    size={16}
                                    color="white"
                                />
                            </View>
                        )}
                        <Text style={styles.selectText}>
                            {selectedTypeInfo?.name || "Sélectionner"}
                        </Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9CA3AF"
                    />
                </TouchableOpacity>
            </View>

            {/* Lieu */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Lieu</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: 75001 Paris"
                    value={location}
                    onChangeText={setLocation}
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
    selectButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        padding: 12,
    },
    selectContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    selectText: {
        fontSize: 16,
        color: "#111827",
        marginLeft: 12,
    },
    typeIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
});
