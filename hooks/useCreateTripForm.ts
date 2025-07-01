import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Share } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useModal, useQuickModals } from "./useModal";
import { useCreateTrip } from "./useTripSync";

export interface SelectedDates {
    startDate: string | null;
    endDate: string | null;
}

export type TripType = "plage" | "montagne" | "citytrip" | "campagne";
export type SelectionStep = "start" | "end";

export interface UseCreateTripFormReturn {
    // États principaux
    tripName: string;
    setTripName: (name: string) => void;
    selectedDates: SelectedDates;
    setSelectedDates: (dates: SelectedDates) => void;
    destination: string;
    setDestination: (destination: string) => void;
    tripType: TripType;
    setTripType: (type: TripType) => void;
    coverImage: string | null;
    setCoverImage: (image: string | null) => void;

    // États modaux
    showCalendar: boolean;
    setShowCalendar: (show: boolean) => void;
    showInvitationModal: boolean;
    setShowInvitationModal: (show: boolean) => void;
    selectionStep: SelectionStep;
    setSelectionStep: (step: SelectionStep) => void;
    currentMonthOffset: number;
    setCurrentMonthOffset: (offset: number) => void;

    // États invitation
    invitationCode: string;
    setInvitationCode: (code: string) => void;
    createdTripId: string | null;
    setCreatedTripId: (id: string | null) => void;

    // Données calculées
    isFormValid: boolean;
    formattedDateDisplay: string;
    daysDuration: number;
    markedDates: any;

    // Handlers dates
    handleDatePicker: () => void;
    handleClearDates: () => void;
    handleConfirmDates: () => void;
    handleDateSelect: (day: any) => void;
    resetSelection: () => void;
    getCurrentDate: () => Date;
    getNextMonthDate: () => Date;
    canGoPrevious: () => boolean;
    canGoNext: () => boolean;
    handlePreviousMonths: () => void;
    handleNextMonths: () => void;

    // Handlers image
    handleSelectCoverImage: () => Promise<void>;
    handleRemoveCoverImage: () => void;

    // Handlers création/invitation
    handleCreateTrip: () => Promise<void>;
    handleCopyCode: () => Promise<void>;
    handleShareInvitation: () => Promise<void>;
    handleCloseInvitationModal: () => void;
    generateInvitationCode: () => string;

    // Hooks externes
    createTrip: any;
    loading: boolean;
    error: string | null;
    user: any;
    modal: any;
    quickModals: any;
}

export const useCreateTripForm = (
    navigation: any,
    route: any
): UseCreateTripFormReturn => {
    const modal = useModal();
    const quickModals = useQuickModals();
    const { user } = useAuth();
    const { createTrip, loading, error } = useCreateTrip();

    // États principaux
    const [tripName, setTripName] = useState("");
    const [selectedDates, setSelectedDates] = useState<SelectedDates>({
        startDate: null,
        endDate: null,
    });
    const [destination, setDestination] = useState("");
    const [tripType, setTripType] = useState<TripType>("citytrip");
    const [coverImage, setCoverImage] = useState<string | null>(null);

    // États modaux
    const [showCalendar, setShowCalendar] = useState(false);
    const [showInvitationModal, setShowInvitationModal] = useState(false);
    const [selectionStep, setSelectionStep] = useState<SelectionStep>("start");
    const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

    // États invitation
    const [invitationCode, setInvitationCode] = useState("");
    const [createdTripId, setCreatedTripId] = useState<string | null>(null);

    // Initialisation depuis les paramètres de route
    useEffect(() => {
        if (route.params?.selectedDestination) {
            setDestination(route.params.selectedDestination);
        }
    }, [route.params]);

    // Utilitaires dates
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
    const canGoNext = () => currentMonthOffset < 22;

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

    // Formatage des dates
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

    // Calcul des jours marqués pour le calendrier
    const getMarkedDates = () => {
        const marked: any = {};

        if (selectedDates.startDate && !selectedDates.endDate) {
            marked[selectedDates.startDate] = {
                selected: true,
                selectedColor: "#4CAF50",
                selectedTextColor: "#FFFFFF",
            };
        } else if (selectedDates.startDate && selectedDates.endDate) {
            const start = new Date(selectedDates.startDate);
            const end = new Date(selectedDates.endDate);
            const currentDate = new Date(start);

            while (currentDate <= end) {
                const dateString = currentDate.toISOString().split("T")[0];

                if (dateString === selectedDates.startDate) {
                    marked[dateString] = {
                        startingDay: true,
                        color: "#4CAF50",
                        textColor: "#FFFFFF",
                    };
                } else if (dateString === selectedDates.endDate) {
                    marked[dateString] = {
                        endingDay: true,
                        color: "#4CAF50",
                        textColor: "#FFFFFF",
                    };
                } else {
                    marked[dateString] = {
                        color: "#E8F5E8",
                        textColor: "#4CAF50",
                    };
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        return marked;
    };

    // Calcul durée
    const getDaysDifference = (start: string, end: string): number => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Handlers dates
    const handleDateSelect = (day: any) => {
        const selectedDateString = day.dateString;

        if (selectionStep === "start") {
            setSelectedDates({
                startDate: selectedDateString,
                endDate: null,
            });
            setSelectionStep("end");
        } else {
            if (selectedDates.startDate) {
                const startDate = new Date(selectedDates.startDate);
                const endDate = new Date(selectedDateString);

                if (endDate < startDate) {
                    setSelectedDates({
                        startDate: selectedDateString,
                        endDate: null,
                    });
                    setSelectionStep("end");
                } else {
                    setSelectedDates({
                        ...selectedDates,
                        endDate: selectedDateString,
                    });
                }
            }
        }
    };

    const handleDatePicker = () => {
        setShowCalendar(true);
    };

    const handleClearDates = () => {
        setSelectedDates({ startDate: null, endDate: null });
        setSelectionStep("start");
    };

    const handleConfirmDates = () => {
        setShowCalendar(false);
    };

    const resetSelection = () => {
        setSelectedDates({ startDate: null, endDate: null });
        setSelectionStep("start");
        setCurrentMonthOffset(0);
    };

    // Handlers image
    const handleSelectCoverImage = async () => {
        try {
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
            console.error("Erreur sélection image:", error);
            modal.showError("Erreur", "Impossible de sélectionner l'image");
        }
    };

    const handleRemoveCoverImage = () => {
        setCoverImage(null);
    };

    // Génération code invitation
    const generateInvitationCode = (): string => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    // Handler création voyage
    const handleCreateTrip = async () => {
        if (!isFormValid) {
            modal.showError(
                "Formulaire incomplet",
                "Veuillez remplir tous les champs obligatoires"
            );
            return;
        }

        try {
            const tripData = {
                title: tripName.trim(),
                destination: destination.trim(),
                startDate: selectedDates.startDate
                    ? new Date(selectedDates.startDate)
                    : new Date(),
                endDate: selectedDates.endDate
                    ? new Date(selectedDates.endDate)
                    : new Date(),
                type: tripType,
                coverImage: coverImage || undefined,
            };

            const result = await createTrip(tripData);

            if (result && typeof result === "string") {
                setCreatedTripId(result);
                const code = generateInvitationCode();
                setInvitationCode(code);
                setShowInvitationModal(true);
            } else {
                throw new Error("Erreur lors de la création");
            }
        } catch (error: any) {
            console.error("Erreur création voyage:", error);
            modal.showError(
                "Erreur",
                error.message || "Impossible de créer le voyage"
            );
        }
    };

    // Handlers invitation
    const handleCopyCode = async () => {
        try {
            quickModals.success("Code copié !");
        } catch (error) {
            console.error("Erreur copie:", error);
            modal.showError("Erreur", "Impossible de copier le code");
        }
    };

    const handleShareInvitation = async () => {
        try {
            const message = `🌍 Rejoignez-moi pour "${tripName}" !\n\n📅 ${formatDateDisplay(
                selectedDates.startDate,
                selectedDates.endDate
            )}\n📍 ${destination}\n\n🔑 Code d'invitation: ${invitationCode}\n\nTéléchargez SpontyTrip et utilisez ce code pour nous rejoindre !`;

            const result = await Share.share({
                message,
                title: `Invitation - ${tripName}`,
            });

            if (result.action === Share.sharedAction) {
                quickModals.success("Invitation partagée !");
            }
        } catch (error) {
            console.error("Erreur partage:", error);
            modal.showError("Erreur", "Impossible de partager l'invitation");
        }
    };

    const handleCloseInvitationModal = () => {
        setShowInvitationModal(false);
        navigation.reset({
            index: 0,
            routes: [
                { name: "MainApp" },
                {
                    name: "TripDetails",
                    params: { tripId: createdTripId },
                },
            ],
        });
    };

    // Données calculées
    const isFormValid = !!(
        tripName.trim() &&
        destination.trim() &&
        selectedDates.startDate &&
        selectedDates.endDate
    );

    const formattedDateDisplay = formatDateDisplay(
        selectedDates.startDate,
        selectedDates.endDate
    );

    const daysDuration =
        selectedDates.startDate && selectedDates.endDate
            ? getDaysDifference(selectedDates.startDate, selectedDates.endDate)
            : 0;

    const markedDates = getMarkedDates();

    return {
        // États principaux
        tripName,
        setTripName,
        selectedDates,
        setSelectedDates,
        destination,
        setDestination,
        tripType,
        setTripType,
        coverImage,
        setCoverImage,

        // États modaux
        showCalendar,
        setShowCalendar,
        showInvitationModal,
        setShowInvitationModal,
        selectionStep,
        setSelectionStep,
        currentMonthOffset,
        setCurrentMonthOffset,

        // États invitation
        invitationCode,
        setInvitationCode,
        createdTripId,
        setCreatedTripId,

        // Données calculées
        isFormValid,
        formattedDateDisplay,
        daysDuration,
        markedDates,

        // Handlers dates
        handleDatePicker,
        handleClearDates,
        handleConfirmDates,
        handleDateSelect,
        resetSelection,
        getCurrentDate,
        getNextMonthDate,
        canGoPrevious,
        canGoNext,
        handlePreviousMonths,
        handleNextMonths,

        // Handlers image
        handleSelectCoverImage,
        handleRemoveCoverImage,

        // Handlers création/invitation
        handleCreateTrip,
        handleCopyCode,
        handleShareInvitation,
        handleCloseInvitationModal,
        generateInvitationCode,

        // Hooks externes
        createTrip,
        loading,
        error,
        user,
        modal,
        quickModals,
    };
};
