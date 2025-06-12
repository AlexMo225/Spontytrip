import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { RootStackParamList } from "../types";

const { width: screenWidth } = Dimensions.get("window");

type CreateTripScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "CreateTrip"
>;
type CreateTripScreenRouteProp = RouteProp<RootStackParamList, "CreateTrip">;

interface Props {
    navigation: CreateTripScreenNavigationProp;
    route: CreateTripScreenRouteProp;
}

interface SelectedDates {
    startDate: string | null;
    endDate: string | null;
}

// Configuration française pour les calendriers
LocaleConfig.locales["fr"] = {
    monthNames: [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
    ],
    monthNamesShort: [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Jun",
        "Jul",
        "Aoû",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
    ],
    dayNames: [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
    ],
    dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = "fr";

const CreateTripScreen: React.FC<Props> = ({ navigation, route }) => {
    const [tripName, setTripName] = useState("");
    const [selectedDates, setSelectedDates] = useState<SelectedDates>({
        startDate: null,
        endDate: null,
    });
    const [destination, setDestination] = useState("");
    const [tripType, setTripType] = useState("");
    const [emails, setEmails] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectionStep, setSelectionStep] = useState<"start" | "end">(
        "start"
    );
    const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

    // Récupérer la destination pré-remplie depuis DiscoverScreen (optionnel)
    useEffect(() => {
        if (route.params?.selectedDestination) {
            setDestination(route.params.selectedDestination);
        }
    }, [route.params]);

    const getCurrentDate = () => {
        const now = new Date();
        now.setMonth(now.getMonth() + currentMonthOffset);
        return now;
    };

    const getNextMonthDate = () => {
        const now = new Date();
        now.setMonth(now.getMonth() + currentMonthOffset + 1);
        return now;
    };

    const canGoPrevious = () => currentMonthOffset > 0;
    const canGoNext = () => currentMonthOffset < 22; // Limite à 2 ans dans le futur

    const handlePreviousMonths = () => {
        if (canGoPrevious()) {
            setCurrentMonthOffset(currentMonthOffset - 2);
        }
    };

    const handleNextMonths = () => {
        if (canGoNext()) {
            setCurrentMonthOffset(currentMonthOffset + 2);
        }
    };

    const formatDateDisplay = (
        startDate: string | null,
        endDate: string | null
    ): string => {
        if (!startDate) return "Choisir les dates du voyage";

        const start = new Date(startDate);
        const startFormatted = start.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        if (!endDate) return `Du ${startFormatted}`;

        const end = new Date(endDate);
        const endFormatted = end.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        // Si même mois et année, format condensé
        if (
            start.getMonth() === end.getMonth() &&
            start.getFullYear() === end.getFullYear()
        ) {
            const startDay = start.getDate();
            const endDay = end.getDate();
            const monthYear = start.toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
            });
            return `Du ${startDay} au ${endDay} ${monthYear}`;
        }

        return `Du ${startFormatted} au ${endFormatted}`;
    };

    const getMarkedDates = () => {
        const marked: any = {};

        if (selectedDates.startDate && !selectedDates.endDate) {
            // Seulement date de début sélectionnée
            marked[selectedDates.startDate] = {
                selected: true,
                selectedColor: "#4CAF50",
                selectedTextColor: "#FFFFFF",
            };
        } else if (selectedDates.startDate && selectedDates.endDate) {
            // Période complète sélectionnée
            const start = new Date(selectedDates.startDate);
            const end = new Date(selectedDates.endDate);

            // Date de début
            marked[selectedDates.startDate] = {
                startingDay: true,
                color: "#4CAF50",
                textColor: "#FFFFFF",
            };

            // Date de fin
            marked[selectedDates.endDate] = {
                endingDay: true,
                color: "#4CAF50",
                textColor: "#FFFFFF",
            };

            // Jours entre les deux dates
            const current = new Date(start);
            current.setDate(current.getDate() + 1);

            while (current < end) {
                const dateString = current.toISOString().split("T")[0];
                marked[dateString] = {
                    color: "#E8F5E8",
                    textColor: "#333",
                };
                current.setDate(current.getDate() + 1);
            }
        }

        return marked;
    };

    const getDaysDifference = (start: string, end: string): number => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const timeDiff = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };

    const handleDateSelect = (day: any) => {
        const selectedDate = day.dateString;

        if (selectionStep === "start" || !selectedDates.startDate) {
            // Sélection de la date de début
            setSelectedDates({
                startDate: selectedDate,
                endDate: null,
            });
            setSelectionStep("end");
        } else if (selectionStep === "end") {
            // Sélection de la date de fin
            const startDate = new Date(selectedDates.startDate!);
            const endDate = new Date(selectedDate);

            if (endDate < startDate) {
                // Si la date de fin est avant la date de début, on inverse
                setSelectedDates({
                    startDate: selectedDate,
                    endDate: selectedDates.startDate,
                });
            } else if (endDate.getTime() === startDate.getTime()) {
                // Même date = voyage d'une journée
                setSelectedDates({
                    startDate: selectedDate,
                    endDate: selectedDate,
                });
            } else {
                setSelectedDates({
                    ...selectedDates,
                    endDate: selectedDate,
                });
            }
            setSelectionStep("start");
        }
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
        if (!selectedDates.startDate) {
            Alert.alert(
                "Erreur",
                "Veuillez sélectionner au moins une date de début"
            );
            return;
        }

        // Créer un nouvel objet voyage avec des données mock
        const newTrip = {
            id: Date.now().toString(),
            title: tripName.trim(),
            destination: destination.trim(),
            startDate: new Date(selectedDates.startDate),
            endDate: selectedDates.endDate
                ? new Date(selectedDates.endDate)
                : new Date(selectedDates.startDate),
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
            dates: formatDateDisplay(
                selectedDates.startDate,
                selectedDates.endDate
            ),
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
        setShowCalendar(true);
        setSelectionStep("start");
    };

    const handleClearDates = () => {
        setSelectedDates({
            startDate: null,
            endDate: null,
        });
        setSelectionStep("start");
    };

    const handleConfirmDates = () => {
        if (selectedDates.startDate) {
            setShowCalendar(false);
        }
    };

    const resetSelection = () => {
        setSelectedDates({
            startDate: null,
            endDate: null,
        });
        setSelectionStep("start");
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
                                color={
                                    selectedDates.startDate
                                        ? "#2E7D8A"
                                        : "#637887"
                                }
                            />
                            <View style={styles.dateTextContainer}>
                                <Text
                                    style={[
                                        styles.dateDisplayText,
                                        !selectedDates.startDate &&
                                            styles.placeholderText,
                                    ]}
                                >
                                    {formatDateDisplay(
                                        selectedDates.startDate,
                                        selectedDates.endDate
                                    )}
                                </Text>
                                {selectedDates.startDate &&
                                    selectedDates.endDate && (
                                        <Text style={styles.durationText}>
                                            {getDaysDifference(
                                                selectedDates.startDate,
                                                selectedDates.endDate
                                            ) + 1}{" "}
                                            jour
                                            {getDaysDifference(
                                                selectedDates.startDate,
                                                selectedDates.endDate
                                            ) !== 0
                                                ? "s"
                                                : ""}
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
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#999"
                            />
                        </View>
                    </TouchableOpacity>
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

            {/* Modal Calendrier Simplifié */}
            <Modal
                visible={showCalendar}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setShowCalendar(false)}
            >
                <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
                <View style={styles.calendarModal}>
                    {/* Header Simplifié */}
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity
                            style={styles.calendarCloseButton}
                            onPress={() => setShowCalendar(false)}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.calendarHeaderTitle}>
                            Sélectionner la date
                        </Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Calendriers - 2 Mois Contrôlés */}
                    <ScrollView
                        style={styles.calendarContainer}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        <Calendar
                            key={`${currentMonthOffset}-current`}
                            onDayPress={handleDateSelect}
                            markedDates={getMarkedDates()}
                            markingType="period"
                            minDate={new Date().toISOString().split("T")[0]}
                            current={
                                getCurrentDate().toISOString().split("T")[0]
                            }
                            theme={{
                                backgroundColor: "#FFFFFF",
                                calendarBackground: "#FFFFFF",
                                textSectionTitleColor: "#1A1A1A",
                                selectedDayBackgroundColor: "#4CAF50",
                                selectedDayTextColor: "#FFFFFF",
                                todayTextColor: "#4CAF50",
                                dayTextColor: "#1A1A1A",
                                textDisabledColor: "#C0C0C0",
                                arrowColor: "#1A1A1A",
                                disabledArrowColor: "#C0C0C0",
                                monthTextColor: "#1A1A1A",
                                textDayFontSize: 16,
                                textMonthFontSize: 18,
                                textDayHeaderFontSize: 13,
                                textDayFontWeight: "600",
                                textMonthFontWeight: "700",
                                textDayHeaderFontWeight: "600",
                            }}
                            style={[styles.calendar, { marginTop: 12 }]}
                            hideExtraDays={true}
                            firstDay={1}
                            disableArrowLeft={!canGoPrevious()}
                            disableArrowRight={!canGoNext()}
                            onPressArrowLeft={handlePreviousMonths}
                            onPressArrowRight={handleNextMonths}
                        />

                        <Calendar
                            key={`${currentMonthOffset}-next`}
                            onDayPress={handleDateSelect}
                            markedDates={getMarkedDates()}
                            markingType="period"
                            minDate={new Date().toISOString().split("T")[0]}
                            current={
                                getNextMonthDate().toISOString().split("T")[0]
                            }
                            theme={{
                                backgroundColor: "#FFFFFF",
                                calendarBackground: "#FFFFFF",
                                textSectionTitleColor: "#1A1A1A",
                                selectedDayBackgroundColor: "#4CAF50",
                                selectedDayTextColor: "#FFFFFF",
                                todayTextColor: "#4CAF50",
                                dayTextColor: "#1A1A1A",
                                textDisabledColor: "#C0C0C0",
                                arrowColor: "#1A1A1A",
                                disabledArrowColor: "#C0C0C0",
                                monthTextColor: "#1A1A1A",
                                textDayFontSize: 16,
                                textMonthFontSize: 18,
                                textDayHeaderFontSize: 13,
                                textDayFontWeight: "600",
                                textMonthFontWeight: "700",
                                textDayHeaderFontWeight: "600",
                            }}
                            style={[styles.calendar, { marginTop: 12 }]}
                            hideExtraDays={true}
                            firstDay={1}
                            hideArrows={true}
                        />
                    </ScrollView>

                    {/* Footer Simple avec Actions */}
                    <View style={styles.calendarFooter}>
                        <View style={styles.calendarActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowCalendar(false)}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Annuler
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    !selectedDates.startDate &&
                                        styles.confirmButtonDisabled,
                                ]}
                                onPress={handleConfirmDates}
                                disabled={!selectedDates.startDate}
                            >
                                <Text
                                    style={[
                                        styles.confirmButtonText,
                                        !selectedDates.startDate &&
                                            styles.confirmButtonTextDisabled,
                                    ]}
                                >
                                    Confirmer
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    dateSelector: {
        flexDirection: "row",
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: "#DBE0E5",
        borderRadius: 12,
        height: 56,
    },
    dateSelectorLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    dateTextContainer: {
        flexDirection: "column",
        paddingHorizontal: 16,
    },
    dateDisplayText: {
        ...TextStyles.body1,
        color: Colors.textPrimary,
    },
    placeholderText: {
        color: "#637887",
    },
    dateSelectorRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    clearDatesButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
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
    calendarModal: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    calendarHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    calendarCloseButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 22,
    },
    calendarHeaderTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: "700",
        color: "#1A1A1A",
        textAlign: "center",
        letterSpacing: -0.5,
    },
    headerSpacer: {
        width: 44,
    },
    calendarContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
    },
    calendar: {
        backgroundColor: "#FFFFFF",
        borderRadius: 0,
        paddingBottom: 8,
    },
    calendarFooter: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        paddingBottom: 40,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    calendarActions: {
        flexDirection: "row",
        gap: 16,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E5E5E5",
    },
    cancelButtonText: {
        fontSize: 16,
        color: "#1A1A1A",
        fontWeight: "600",
    },
    confirmButton: {
        flex: 2,
        backgroundColor: "#4CAF50",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmButtonDisabled: {
        backgroundColor: "#E5E5E5",
        shadowOpacity: 0,
        elevation: 0,
    },
    confirmButtonText: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    confirmButtonTextDisabled: {
        color: "#999",
    },
    durationText: {
        fontSize: 12,
        color: "#2E7D8A",
        fontWeight: "500",
        marginTop: 2,
    },
    // Styles pour cercles parfaits
    dateCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
    },
    dateText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});

export default CreateTripScreen;
