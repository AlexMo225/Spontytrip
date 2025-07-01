import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ActivityStepTwoProps {
    selectedDate: Date;
    startTime: string;
    endTime: string;
    formatDate: (date: Date) => string;
    onDatePickerOpen: () => void;
    onStartTimePickerOpen: () => void;
    onEndTimePickerOpen: () => void;
}

export const ActivityStepTwo: React.FC<ActivityStepTwoProps> = ({
    selectedDate,
    startTime,
    endTime,
    formatDate,
    onDatePickerOpen,
    onStartTimePickerOpen,
    onEndTimePickerOpen,
}) => {
    return (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Date et horaires</Text>

            {/* Date */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={onDatePickerOpen}
                >
                    <Ionicons name="calendar" size={20} color="#4DA1A9" />
                    <Text style={styles.dateText}>
                        {formatDate(selectedDate)}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Horaires */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Horaires (optionnel)</Text>
                <View style={styles.timeContainer}>
                    <TouchableOpacity
                        style={styles.timeButton}
                        onPress={onStartTimePickerOpen}
                    >
                        <Ionicons name="time" size={20} color="#4DA1A9" />
                        <Text style={styles.timeText}>
                            {startTime || "Début"}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.timeSeparator}>→</Text>

                    <TouchableOpacity
                        style={styles.timeButton}
                        onPress={onEndTimePickerOpen}
                    >
                        <Ionicons name="time" size={20} color="#4DA1A9" />
                        <Text style={styles.timeText}>{endTime || "Fin"}</Text>
                    </TouchableOpacity>
                </View>
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
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        padding: 12,
    },
    dateText: {
        flex: 1,
        fontSize: 16,
        color: "#111827",
        marginLeft: 12,
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    timeButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        padding: 12,
    },
    timeText: {
        fontSize: 16,
        color: "#111827",
        marginLeft: 12,
    },
    timeSeparator: {
        fontSize: 16,
        color: "#9CA3AF",
    },
});
