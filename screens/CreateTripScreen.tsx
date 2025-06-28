import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Clipboard,
    Dimensions,
    Image,
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
import { useAuth } from "../contexts/AuthContext";
import { useModal, useQuickModals } from "../hooks/useModal";
import { useCreateTrip } from "../hooks/useTripSync";
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
    const modal = useModal();
    const quickModals = useQuickModals();
    const { user } = useAuth();
    const { createTrip, loading, error } = useCreateTrip();

    const [tripName, setTripName] = useState("");
    const [selectedDates, setSelectedDates] = useState<SelectedDates>({
        startDate: null,
        endDate: null,
    });
    const [destination, setDestination] = useState("");
    const [tripType, setTripType] = useState<
        "plage" | "montagne" | "citytrip" | "campagne"
    >("citytrip");
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectionStep, setSelectionStep] = useState<"start" | "end">(
        "start"
    );
    const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

    // États pour la popup d'invitation
    const [showInvitationModal, setShowInvitationModal] = useState(false);
    const [invitationCode, setInvitationCode] = useState("");
    const [createdTripId, setCreatedTripId] = useState<string | null>(null);

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

            // Dates intermédiaires
            const currentDate = new Date(start);
            currentDate.setDate(currentDate.getDate() + 1);

            while (currentDate < end) {
                const dateString = currentDate.toISOString().split("T")[0];
                marked[dateString] = {
                    color: "#4CAF50",
                    textColor: "#FFFFFF",
                };
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        return marked;
    };

    const getDaysDifference = (start: string, end: string): number => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleDateSelect = (day: any) => {
        const selectedDate = day.dateString;

        if (selectionStep === "start" || !selectedDates.startDate) {
            // Première sélection ou reset
            setSelectedDates({
                startDate: selectedDate,
                endDate: null,
            });
            setSelectionStep("end");
        } else if (selectionStep === "end") {
            const startDate = new Date(selectedDates.startDate!);
            const endDate = new Date(selectedDate);

            if (endDate >= startDate) {
                // Date de fin valide
                setSelectedDates({
                    startDate: selectedDates.startDate,
                    endDate: selectedDate,
                });
            } else {
                // Nouvelle sélection si date antérieure
                setSelectedDates({
                    startDate: selectedDate,
                    endDate: null,
                });
                setSelectionStep("end");
            }
        }
    };

    // Génère un code d'invitation unique
    const generateInvitationCode = (): string => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const handleCreateTrip = async () => {
        // Validations renforcées
        const trimmedTripName = tripName.trim();
        const trimmedDestination = destination.trim();

        if (!trimmedTripName) {
            quickModals.formError("saisir un nom de séjour");
            return;
        }

        if (trimmedTripName.length < 3) {
            modal.showError(
                "Erreur",
                "Le nom du séjour doit contenir au moins 3 caractères"
            );
            return;
        }

        if (!trimmedDestination) {
            quickModals.formError("choisir une destination");
            return;
        }

        if (!selectedDates.startDate) {
            quickModals.formError("sélectionner au moins une date de début");
            return;
        }

        // Validation des dates
        const startDate = new Date(selectedDates.startDate);
        const endDate = selectedDates.endDate
            ? new Date(selectedDates.endDate)
            : new Date(selectedDates.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for date comparison

        if (startDate < today) {
            modal.showError(
                "Erreur",
                "La date de début ne peut pas être dans le passé"
            );
            return;
        }

        if (endDate < startDate) {
            modal.showError(
                "Erreur",
                "La date de fin ne peut pas être antérieure à la date de début"
            );
            return;
        }

        // Validation du type de voyage
        if (!tripType) {
            quickModals.formError("choisir un type de voyage");
            return;
        }

        // Validation utilisateur
        if (!user) {
            modal.showError(
                "Erreur",
                "Vous devez être connecté pour créer un voyage"
            );
            return;
        }

        try {
            // Créer le voyage avec Firebase
            const tripData = {
                title: trimmedTripName,
                destination: trimmedDestination,
                startDate,
                endDate,
                type: tripType,
                coverImage: coverImage || undefined,
            };

            const tripId = await createTrip(tripData);

            if (!tripId) {
                throw new Error("Échec de la création du voyage");
            }

            setCreatedTripId(tripId);

            // Récupérer le voyage créé pour obtenir le vrai code d'invitation
            try {
                const firebaseService = (
                    await import("../services/firebaseService")
                ).default;
                const createdTrip = await firebaseService.getTripById(tripId);

                if (createdTrip && createdTrip.inviteCode) {
                    setInvitationCode(createdTrip.inviteCode);
                    // Afficher la popup d'invitation
                    setShowInvitationModal(true);
                } else {
                    // Fallback avec code généré
                    const fallbackCode = `TRIP${Date.now()
                        .toString()
                        .slice(-6)}`;
                    setInvitationCode(fallbackCode);
                    setShowInvitationModal(true);
                }
            } catch (fetchError) {
                console.error("Erreur récupération voyage créé:", fetchError);
                // Navigation directe en cas d'erreur de récupération
                modal.showConfirm(
                    "Succès",
                    "Voyage créé avec succès !",
                    () => {
                        navigation.reset({
                            index: 1,
                            routes: [
                                { name: "MainApp" },
                                { name: "TripDetails", params: { tripId } },
                            ],
                        });
                    },
                    undefined,
                    "OK"
                );
            }
        } catch (err) {
            console.error("Erreur création voyage:", err);
            const errorMessage =
                error ||
                (err instanceof Error
                    ? err.message
                    : "Impossible de créer le voyage");

            modal.showError("Erreur", `${errorMessage}. Veuillez réessayer.`);
        }
    };

    const handleCopyCode = async () => {
        try {
            await Clipboard.setString(invitationCode);
            modal.showConfirm(
                "Code copié ! 📋",
                "Le code d'invitation a été copié dans le presse-papier. Voulez-vous le partager maintenant ?",
                handleShareInvitation,
                () => {}, // Juste fermer si non
                "Partager",
                "Plus tard"
            );
        } catch (error) {
            modal.showError("Erreur", "Impossible de copier le code");
        }
    };

    const handleShareInvitation = async () => {
        try {
            const shareMessage = `🎉 Rejoins-moi sur SpontyTrip !

📍 Voyage : ${tripName}
${destination ? `🗺️ Destination : ${destination}` : ""}
${
    selectedDates.startDate && selectedDates.endDate
        ? `📅 Dates : ${formatDateDisplay(
              selectedDates.startDate,
              selectedDates.endDate
          )}`
        : ""
}

🔑 Code d'invitation : ${invitationCode}

💫 Télécharge SpontyTrip et utilise ce code pour rejoindre l'aventure !`;

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(shareMessage, {
                    mimeType: "text/plain",
                    dialogTitle: "Partager l'invitation SpontyTrip",
                });
            } else {
                // Fallback pour copier dans le presse-papier si Sharing n'est pas disponible
                await Clipboard.setString(shareMessage);
                modal.showSuccess(
                    "Message préparé !",
                    "Le message d'invitation a été copié. Collez-le dans l'app de votre choix."
                );
            }
        } catch (error) {
            console.error("Erreur lors du partage:", error);
            modal.showError("Erreur", "Impossible de partager l'invitation");
        }
    };

    const handleCloseInvitationModal = () => {
        setShowInvitationModal(false);

        // Navigation vers TripDetails avec reset de la pile de navigation
        if (createdTripId) {
            setTimeout(() => {
                // Reset de la pile de navigation pour empêcher le retour vers CreateTrip
                navigation.reset({
                    index: 1,
                    routes: [
                        { name: "MainApp" },
                        {
                            name: "TripDetails",
                            params: { tripId: createdTripId },
                        },
                    ],
                });
            }, 300);
        } else {
            // Fallback vers Home avec reset
            navigation.reset({
                index: 0,
                routes: [{ name: "MainApp" }],
            });
        }
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

    // Fonction pour sélectionner une photo de couverture
    const handleSelectCoverImage = async () => {
        try {
            // Demander les permissions
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                modal.showInfo(
                    "Permission requise",
                    "Nous avons besoin d'accéder à vos photos pour sélectionner une image de couverture."
                );
                return;
            }

            // Ouvrir la galerie photo
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setCoverImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Erreur lors de la sélection d'image:", error);
            modal.showError("Erreur", "Impossible de sélectionner l'image");
        }
    };

    const handleRemoveCoverImage = () => {
        setCoverImage(null);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[
                        styles.backButton,
                        showInvitationModal && styles.backButtonDisabled,
                    ]}
                    onPress={() => navigation.goBack()}
                    disabled={showInvitationModal}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={
                            showInvitationModal ? "#CCCCCC" : Colors.textPrimary
                        }
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
                        {(
                            [
                                "plage",
                                "montagne",
                                "citytrip",
                                "campagne",
                            ] as const
                        ).map((type) => (
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
                        ))}
                    </View>
                </View>

                {/* Photo de couverture */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Photo de couverture</Text>

                    {coverImage ? (
                        <View style={styles.coverImageContainer}>
                            <Image
                                source={{ uri: coverImage }}
                                style={styles.coverImagePreview}
                            />
                            <View style={styles.coverImageOverlay}>
                                <TouchableOpacity
                                    style={styles.changeCoverButton}
                                    onPress={handleSelectCoverImage}
                                >
                                    <Ionicons
                                        name="camera"
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.changeCoverButtonText}>
                                        Changer
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.removeCoverButton}
                                    onPress={handleRemoveCoverImage}
                                >
                                    <Ionicons
                                        name="trash"
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.coverImageSelector}
                            onPress={handleSelectCoverImage}
                        >
                            <Ionicons name="camera" size={32} color="#7ED957" />
                            <View
                                style={styles.coverImageSelectorTextContainer}
                            >
                                <Text style={styles.coverImageSelectorText}>
                                    Ajouter une photo de couverture
                                </Text>
                                <Text style={styles.coverImageSelectorSubtext}>
                                    Optionnel - Rendra votre voyage plus
                                    attrayant
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* Bouton Créer le séjour */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[
                        styles.createButton,
                        loading && styles.createButtonDisabled,
                    ]}
                    onPress={handleCreateTrip}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={styles.createButtonLoading}>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.createButtonText}>
                                Création...
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.createButtonText}>
                            Créer le séjour
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modal d'invitation */}
            <Modal
                visible={showInvitationModal}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCloseInvitationModal}
            >
                <View style={styles.invitationModalOverlay}>
                    <View style={styles.invitationModalContainer}>
                        <View style={styles.invitationModalHeader}>
                            <Text style={styles.invitationModalTitle}>
                                🎉 Voyage créé !
                            </Text>
                            <TouchableOpacity
                                style={styles.invitationModalCloseButton}
                                onPress={handleCloseInvitationModal}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.invitationModalSubtitle}>
                            Partagez ce code pour inviter vos amis
                        </Text>

                        {/* Code d'invitation */}
                        <View style={styles.invitationCodeContainer}>
                            <Text style={styles.invitationCodeLabel}>
                                Code d'invitation
                            </Text>
                            <View style={styles.invitationCodeBox}>
                                <Text style={styles.invitationCodeText}>
                                    {invitationCode}
                                </Text>
                                <TouchableOpacity
                                    style={styles.copyButton}
                                    onPress={handleCopyCode}
                                >
                                    <Ionicons
                                        name="copy"
                                        size={20}
                                        color="#7ED957"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* QR Code placeholder */}
                        <View style={styles.qrCodeContainer}>
                            <Text style={styles.qrCodeLabel}>QR Code</Text>
                            <View style={styles.qrCodePlaceholder}>
                                <Ionicons
                                    name="qr-code-outline"
                                    size={80}
                                    color="#999"
                                />
                                <Text style={styles.qrCodePlaceholderText}>
                                    QR Code généré
                                </Text>
                            </View>
                        </View>

                        {/* Boutons d'action */}
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity
                                style={styles.shareButton}
                                onPress={handleShareInvitation}
                            >
                                <Ionicons
                                    name="share-outline"
                                    size={20}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.shareButtonText}>
                                    Partager
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.continueButton}
                                onPress={handleCloseInvitationModal}
                            >
                                <Text style={styles.continueButtonText}>
                                    Continuer
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal Calendrier */}
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
    backButtonDisabled: {
        opacity: 0.5,
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
    tripTypesContainer: {
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
    createButtonDisabled: {
        backgroundColor: "#E5E5E5",
        shadowOpacity: 0,
        elevation: 0,
    },
    createButtonLoading: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    createButtonText: {
        ...TextStyles.button,
        color: "#FFFFFF",
        fontWeight: "600",
    },
    invitationModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    invitationModalContainer: {
        backgroundColor: "#FFFFFF",
        padding: 24,
        borderRadius: 12,
        width: "80%",
        maxWidth: 400,
    },
    invitationModalHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    invitationModalTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: "700",
        color: "#1A1A1A",
        textAlign: "center",
        letterSpacing: -0.5,
    },
    invitationModalCloseButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 22,
    },
    invitationModalSubtitle: {
        fontSize: 16,
        color: "#1A1A1A",
        textAlign: "center",
        marginBottom: 20,
    },
    invitationCodeContainer: {
        marginBottom: 20,
    },
    invitationCodeLabel: {
        fontSize: 16,
        color: "#1A1A1A",
        marginBottom: 8,
    },
    invitationCodeBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#DBE0E5",
        borderRadius: 12,
        padding: 12,
    },
    invitationCodeText: {
        flex: 1,
        fontSize: 16,
        color: "#1A1A1A",
    },
    copyButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    qrCodeContainer: {
        marginBottom: 20,
    },
    qrCodeLabel: {
        fontSize: 16,
        color: "#1A1A1A",
        marginBottom: 8,
    },
    qrCodePlaceholder: {
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 40,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
    },
    qrCodePlaceholderText: {
        fontSize: 14,
        color: "#999",
        marginTop: 8,
        textAlign: "center",
    },
    continueButton: {
        backgroundColor: "#4DA1A9",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    continueButtonText: {
        fontSize: 16,
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
    coverImageContainer: {
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
    },
    coverImagePreview: {
        width: "100%",
        height: 200,
        borderRadius: 12,
    },
    coverImageOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    changeCoverButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },
    changeCoverButtonText: {
        fontSize: 16,
        color: "#FFFFFF",
        marginLeft: 8,
    },
    removeCoverButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    coverImageSelector: {
        backgroundColor: "#F8F9FA",
        borderWidth: 2,
        borderColor: "#DBE0E5",
        borderStyle: "dashed",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120,
    },
    coverImageSelectorTextContainer: {
        alignItems: "center",
        marginTop: 12,
    },
    coverImageSelectorText: {
        fontSize: 16,
        color: "#1A1A1A",
        fontWeight: "600",
        textAlign: "center",
    },
    coverImageSelectorSubtext: {
        fontSize: 14,
        color: "#637887",
        marginTop: 4,
        textAlign: "center",
    },
    modalButtonsContainer: {
        flexDirection: "row",
        gap: 16,
    },
    shareButton: {
        flex: 1,
        backgroundColor: "#4DA1A9",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    shareButtonText: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "600",
    },
});

export default CreateTripScreen;
