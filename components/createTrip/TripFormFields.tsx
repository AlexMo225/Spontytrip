import React from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { TripType } from "../../hooks/useCreateTripForm";

interface TripFormFieldsProps {
    tripName: string;
    setTripName: (name: string) => void;
    destination: string;
    setDestination: (destination: string) => void;
    tripType: TripType;
    setTripType: (type: TripType) => void;
}

export const TripFormFields: React.FC<TripFormFieldsProps> = ({
    tripName,
    setTripName,
    destination,
    setDestination,
    tripType,
    setTripType,
}) => {
    const tripTypes: Array<{ id: TripType; label: string }> = [
        { id: "plage", label: "Plage" },
        { id: "montagne", label: "Montagne" },
        { id: "citytrip", label: "Citytrip" },
        { id: "campagne", label: "Campagne" },
    ];

    return (
        <>
            {/* Nom du séjour */}
            <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Nom du séjour</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Nom du séjour"
                    placeholderTextColor="#637887"
                    value={tripName}
                    onChangeText={setTripName}
                />
            </View>

            {/* Destination */}
            <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Destination</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Où allez-vous ?"
                    placeholderTextColor="#637887"
                    value={destination}
                    onChangeText={setDestination}
                />
            </View>

            {/* Type de voyage */}
            <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Type de voyage</Text>
                <View style={styles.tripTypesContainer}>
                    {tripTypes.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.tripTypeButton,
                                tripType === type.id &&
                                    styles.tripTypeButtonSelected,
                            ]}
                            onPress={() => setTripType(type.id)}
                        >
                            <Text
                                style={[
                                    styles.tripTypeText,
                                    tripType === type.id &&
                                        styles.tripTypeTextSelected,
                                ]}
                            >
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </>
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
    textInput: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DBE0E5",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#1A1A1A",
    },
    tripTypesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    tripTypeButton: {
        backgroundColor: "#F8F9FA",
        borderWidth: 1,
        borderColor: "#DBE0E5",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minWidth: 80,
        alignItems: "center",
    },
    tripTypeButtonSelected: {
        backgroundColor: "#4DA1A9",
        borderColor: "#4DA1A9",
    },
    tripTypeText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1A1A1A",
    },
    tripTypeTextSelected: {
        color: "#FFFFFF",
    },
});
