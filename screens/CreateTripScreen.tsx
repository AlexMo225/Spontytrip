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
    const [emails, setEmails] = useState("");

    // Récupérer la destination pré-remplie depuis DiscoverScreen
    useEffect(() => {
        if (route.params?.selectedDestination) {
            setDestination(route.params.selectedDestination);
        }
    }, [route.params]);

    const handleChooseDestination = () => {
        // Navigation vers DiscoverScreen avec paramètre pour revenir ici
        navigation.navigate("MainApp", {
            screen: "Discover",
            params: { fromCreateTrip: true },
        });
    };

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

        // Navigation vers TripDetailsScreen (à créer)
        console.log("Création du séjour:", {
            tripName,
            dates,
            destination,
            emails,
        });

        // Temporaire : afficher un alert
        Alert.alert("Succès", "Séjour créé avec succès !");
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
                    <TouchableOpacity
                        style={styles.destinationButton}
                        onPress={handleChooseDestination}
                    >
                        <Text
                            style={[
                                styles.destinationText,
                                destination
                                    ? styles.destinationSelected
                                    : styles.destinationPlaceholder,
                            ]}
                        >
                            {destination || "Destination"}
                        </Text>
                    </TouchableOpacity>
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
    destinationButton: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: "#DBE0E5",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        height: 56,
        justifyContent: "center",
    },
    destinationText: {
        ...TextStyles.body1,
    },
    destinationPlaceholder: {
        color: "#637887",
    },
    destinationSelected: {
        color: Colors.textPrimary,
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
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignSelf: "flex-start",
        height: 40,
        justifyContent: "center",
    },
    qrCodeButtonText: {
        ...TextStyles.body2,
        color: Colors.textPrimary,
        fontSize: 14,
    },
    bottomContainer: {
        padding: 16,
        backgroundColor: Colors.background,
    },
    createButton: {
        backgroundColor: "#4DA1A9",
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: "center",
        height: 48,
        justifyContent: "center",
    },
    createButtonText: {
        ...TextStyles.h3,
        color: Colors.background,
        fontSize: 16,
    },
});

export default CreateTripScreen;
