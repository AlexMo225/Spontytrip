import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { RootStackParamList } from "../types";

type CreateTripScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "CreateTrip"
>;
type CreateTripScreenRouteProp = RouteProp<RootStackParamList, "CreateTrip">;

interface Props {
    navigation: CreateTripScreenNavigationProp;
    route: CreateTripScreenRouteProp;
}

const CreateTripScreen: React.FC<Props> = ({ navigation, route }) => {
    const [tripName, setTripName] = useState("");
    const [dates, setDates] = useState("");
    const [destination, setDestination] = useState("");
    const [tripType, setTripType] = useState("");
    const [emails, setEmails] = useState("");

    // Récupérer la destination pré-remplie depuis DiscoverScreen (optionnel)
    useEffect(() => {
        if (route.params?.selectedDestination) {
            setDestination(route.params.selectedDestination);
        }
    }, [route.params]);

    const handleCreateTrip = () => {
        // Validation basique
        if (!tripName.trim()) {
            Alert.alert("Erreur", "Veuillez saisir un nom de séjour");
            return;
        }
        if (!destination.trim()) {
            Alert.alert("Erreur", "Veuillez choisir une destination");
            return;
        }

        // Créer un nouvel objet voyage avec des données mock
        const newTrip = {
            id: Date.now().toString(),
            title: tripName.trim(),
            destination: destination.trim(),
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
            description: `Voyage ${tripType} à ${destination}`,
            creatorId: "user-mock-id",
            members: [
                {
                    userId: "user-mock-id",
                    user: {
                        id: "user-mock-id",
                        firstName: "Vous",
                        lastName: "",
                        email: "vous@example.com",
                        createdAt: new Date(),
                    },
                    role: "creator" as const,
                    joinedAt: new Date(),
                },
            ],
            inviteCode: Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase(),
            coverImage: `https://images.unsplash.com/photo-${Math.floor(
                Math.random() * 9999999999
            )}?w=800&h=400&fit=crop`,
            createdAt: new Date(),
            updatedAt: new Date(),
            tripType: tripType,
            dates: dates.trim() || "À définir",
        };

        console.log("Voyage créé:", newTrip);

        // Navigation directe vers TripDetailsScreen
        navigation.navigate("TripDetails", {
            tripId: newTrip.id,
        });
    };

    const handleShowQRCode = () => {
        Alert.alert("QR Code", "Fonctionnalité QR Code à implémenter");
    };

    const handleDatePicker = () => {
        Alert.alert("Calendrier", "Sélecteur de dates à implémenter");
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={Colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nouveau séjour</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
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

                {/* Dates */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Dates</Text>
                    <View style={styles.dateInputContainer}>
                        <TextInput
                            style={styles.dateInput}
                            placeholder="Dates"
                            placeholderTextColor="#637887"
                            value={dates}
                            onChangeText={setDates}
                        />
                        <TouchableOpacity
                            style={styles.calendarButton}
                            onPress={handleDatePicker}
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={24}
                                color="#637887"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Destination */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Destination</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Où voulez-vous aller ?"
                        placeholderTextColor="#637887"
                        value={destination}
                        onChangeText={setDestination}
                    />
                </View>

                {/* Type de voyage */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Type de voyage</Text>
                    <View style={styles.tripTypeContainer}>
                        {["plage", "montagne", "citytrip", "campagne"].map(
                            (type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.tripTypeButton,
                                        tripType === type &&
                                            styles.tripTypeButtonSelected,
                                    ]}
                                    onPress={() => setTripType(type)}
                                >
                                    <Text
                                        style={[
                                            styles.tripTypeText,
                                            tripType === type &&
                                                styles.tripTypeTextSelected,
                                        ]}
                                    >
                                        {type.charAt(0).toUpperCase() +
                                            type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                </View>

                {/* Inviter des amis */}
                <View style={styles.inviteSection}>
                    <Text style={styles.inviteTitle}>Inviter des amis</Text>

                    {/* Emails */}
                    <View style={styles.emailsContainer}>
                        <Text style={styles.fieldLabel}>Emails</Text>
                        <TextInput
                            style={styles.emailsInput}
                            placeholder="Entrez les emails séparés par une virgule"
                            placeholderTextColor="#637887"
                            value={emails}
                            onChangeText={setEmails}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Bouton QR Code */}
                <View style={styles.qrCodeContainer}>
                    <TouchableOpacity
                        style={styles.qrCodeButton}
                        onPress={handleShowQRCode}
                    >
                        <Text style={styles.qrCodeButtonText}>
                            Afficher le QR code
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bouton Créer le séjour */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateTrip}
                >
                    <Text style={styles.createButtonText}>Créer le séjour</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 60, // Safe area
        backgroundColor: Colors.background,
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        flex: 1,
        textAlign: "center",
        marginRight: 48, // Pour compenser le bouton retour
    },
    headerSpacer: {
        width: 48,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    fieldContainer: {
        marginBottom: 32,
    },
    fieldLabel: {
        ...TextStyles.h3,
        color: Colors.textPrimary,
        marginBottom: 8,
        fontSize: 16,
    },
    textInput: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: "#DBE0E5",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        ...TextStyles.body1,
        color: Colors.textPrimary,
        height: 56,
    },
    dateInputContainer: {
        flexDirection: "row",
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: "#DBE0E5",
        borderRadius: 12,
        height: 56,
    },
    dateInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
        ...TextStyles.body1,
        color: Colors.textPrimary,
    },
    calendarButton: {
        width: 40,
        justifyContent: "center",
        alignItems: "center",
        borderLeftWidth: 1,
        borderLeftColor: "#DBE0E5",
    },

    tripTypeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    tripTypeButton: {
        backgroundColor: "#F0F2F5",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: "transparent",
        minWidth: 80,
        alignItems: "center",
    },
    tripTypeButtonSelected: {
        backgroundColor: "#4DA1A9",
        borderColor: "#4DA1A9",
    },
    tripTypeText: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
        fontWeight: "500",
    },
    tripTypeTextSelected: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    inviteSection: {
        marginBottom: 32,
    },
    inviteTitle: {
        ...TextStyles.h3,
        color: Colors.textPrimary,
        marginBottom: 20,
        fontSize: 18,
    },
    emailsContainer: {
        marginBottom: 0,
    },
    emailsInput: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: "#DBE0E5",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        ...TextStyles.body1,
        color: Colors.textPrimary,
        height: 144,
        textAlignVertical: "top",
    },
    qrCodeContainer: {
        marginBottom: 32,
    },
    qrCodeButton: {
        backgroundColor: "#F0F2F4",
        borderRadius: 12,
        paddingHorizontal: 16,
        alignSelf: "flex-start",
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },
    qrCodeButtonText: {
        ...TextStyles.button,
        color: Colors.textPrimary,
        fontWeight: "600",
    },
    bottomContainer: {
        padding: 16,
        backgroundColor: Colors.background,
    },
    createButton: {
        backgroundColor: "#4DA1A9",
        borderRadius: 12,
        alignItems: "center",
        height: 48,
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    createButtonText: {
        ...TextStyles.button,
        color: "#FFFFFF",
        fontWeight: "600",
    },
});

export default CreateTripScreen;
