import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SelectedDates } from "../../hooks/useCreateTripForm";

interface TripDateSelectorProps {
    selectedDates: SelectedDates;
    formattedDateDisplay: string;
    daysDuration: number;
    handleDatePicker: () => void;
    handleClearDates: () => void;
}

export const TripDateSelector: React.FC<TripDateSelectorProps> = ({
    selectedDates,
    formattedDateDisplay,
    daysDuration,
    handleDatePicker,
    handleClearDates,
}) => {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Dates du voyage</Text>
            <TouchableOpacity
                style={styles.dateSelector}
                onPress={handleDatePicker}
                activeOpacity={0.7}
            >
                <View style={styles.dateSelectorLeft}>
                    <Ionicons
                        name="calendar"
                        size={24}
                        color={selectedDates.startDate ? "#2E7D8A" : "#637887"}
                    />
                    <View style={styles.dateTextContainer}>
                        <Text
                            style={[
                                styles.dateDisplayText,
                                !selectedDates.startDate &&
                                    styles.placeholderText,
                            ]}
                        >
                            {formattedDateDisplay}
                        </Text>
                        {selectedDates.startDate && selectedDates.endDate && (
                            <Text style={styles.durationText}>
                                {daysDuration + 1} jour
                                {daysDuration !== 0 ? "s" : ""}
                            </Text>
                        )}
                    </View>
                </View>
                <View style={styles.dateSelectorRight}>
                    {selectedDates.startDate && (
                        <TouchableOpacity
                            style={styles.clearDatesButton}
                            onPress={handleClearDates}
                            hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10,
                            }}
                        >
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color="#999"
                            />
                        </TouchableOpacity>
                    )}
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    fieldContainer: {
        marginBottom: 24,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 8,
    },
    dateSelector: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DBE0E5",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dateSelectorLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    dateTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    dateDisplayText: {
        fontSize: 16,
        color: "#1A1A1A",
        fontWeight: "500",
    },
    placeholderText: {
        color: "#637887",
        fontWeight: "400",
    },
    durationText: {
        fontSize: 12,
        color: "#2E7D8A",
        fontWeight: "500",
        marginTop: 2,
    },
    dateSelectorRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    clearDatesButton: {
        padding: 4,
    },
});
