import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import FirebaseServiceInstance, {
    FirestoreTrip,
} from "../services/firebaseService";
import { useModal, useQuickModals } from "./useModal";

export interface SelectedDates {
    startDate: string | null;
    endDate: string | null;
}

export type TripType = "plage" | "montagne" | "citytrip" | "campagne";
export type SelectionStep = "start" | "end";

export interface UseEditTripReturn {
    // États principaux
    tripName: string;
    setTripName: (name: string) => void;
    selectedDates: SelectedDates;
    setSelectedDates: (dates: SelectedDates) => void;
    destination: string;
    setDestination: (destination: string) => void;
    description: string;
    setDescription: (description: string) => void;
    tripType: TripType;
    setTripType: (type: TripType) => void;
    coverImage: string | null;
    setCoverImage: (image: string | null) => void;

    // États modaux et calendrier
    showCalendar: boolean;
    setShowCalendar: (show: boolean) => void;
    selectionStep: SelectionStep;
    setSelectionStep: (step: SelectionStep) => void;
    currentMonthOffset: number;
    setCurrentMonthOffset: (offset: number) => void;

    // États de chargement
    loading: boolean;
    saving: boolean;
    error: string | null;
    trip: FirestoreTrip | null;

    // Données calculées
    isFormValid: boolean;
    hasChanges: boolean;
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

    // Handlers sauvegarde
    handleSaveTrip: () => Promise<void>;
    handleDiscardChanges: () => void;

    // Hooks externes
    user: any;
    modal: any;
    quickModals: any;
}

export const useEditTrip = (
    tripId: string,
    navigation: any
): UseEditTripReturn => {
    const modal = useModal();
    const quickModals = useQuickModals();
    const { user } = useAuth();

    // États principaux
    const [tripName, setTripName] = useState("");
    const [selectedDates, setSelectedDates] = useState<SelectedDates>({
        startDate: null,
        endDate: null,
    });
    const [destination, setDestination] = useState("");
    const [description, setDescription] = useState("");
    const [tripType, setTripType] = useState<TripType>("citytrip");
    const [coverImage, setCoverImage] = useState<string | null>(null);

    // États modaux
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectionStep, setSelectionStep] = useState<SelectionStep>("start");
    const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

    // États de chargement
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trip, setTrip] = useState<FirestoreTrip | null>(null);

    // États de référence pour détecter les changements
    const [originalData, setOriginalData] = useState<{
        tripName: string;
        destination: string;
        description: string;
        tripType: TripType;
        selectedDates: SelectedDates;
        coverImage: string | null;
    } | null>(null);

    // Charger les données du voyage au montage
    useEffect(() => {
        loadTripData();
    }, [tripId]);

    const loadTripData = async () => {
        try {
            setLoading(true);
            setError(null);

            const tripData = await FirebaseServiceInstance.getTripById(tripId);
            if (!tripData) {
                throw new Error("Voyage introuvable");
            }

            // Vérifier les permissions
            if (tripData.creatorId !== user?.uid) {
                throw new Error(
                    "Vous n'avez pas l'autorisation de modifier ce voyage"
                );
            }

            setTrip(tripData);

            // Pré-remplir les formulaires
            const formattedStartDate = tripData.startDate
                .toISOString()
                .split("T")[0];
            const formattedEndDate = tripData.endDate
                .toISOString()
                .split("T")[0];

            const initialData = {
                tripName: tripData.title,
                destination: tripData.destination,
                description: tripData.description || "",
                tripType: tripData.type,
                selectedDates: {
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                },
                coverImage: tripData.coverImage || null,
            };

            setTripName(initialData.tripName);
            setDestination(initialData.destination);
            setDescription(initialData.description);
            setTripType(initialData.tripType);
            setSelectedDates(initialData.selectedDates);
            setCoverImage(initialData.coverImage);

            // Sauvegarder les données originales pour détecter les changements
            setOriginalData(initialData);
        } catch (error: any) {
            console.error("Erreur chargement voyage:", error);
            setError(error.message || "Erreur lors du chargement du voyage");
        } finally {
            setLoading(false);
        }
    };

    // Utilitaires dates (réutilisés depuis useCreateTripForm)
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

                if (currentDate.getTime() === start.getTime()) {
                    marked[dateString] = {
                        startingDay: true,
                        selected: true,
                        selectedColor: "#4CAF50",
                        selectedTextColor: "#FFFFFF",
                    };
                } else if (currentDate.getTime() === end.getTime()) {
                    marked[dateString] = {
                        endingDay: true,
                        selected: true,
                        selectedColor: "#4CAF50",
                        selectedTextColor: "#FFFFFF",
                    };
                } else {
                    marked[dateString] = {
                        selected: true,
                        selectedColor: "#E8F5E8",
                        selectedTextColor: "#4CAF50",
                    };
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        return marked;
    };

    // Données calculées
    const formattedDateDisplay = formatDateDisplay(
        selectedDates.startDate,
        selectedDates.endDate
    );

    const daysDuration =
        selectedDates.startDate && selectedDates.endDate
            ? Math.ceil(
                  (new Date(selectedDates.endDate).getTime() -
                      new Date(selectedDates.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
              ) + 1
            : 0;

    const markedDates = getMarkedDates();

    const isFormValid =
        tripName.trim().length > 0 &&
        destination.trim().length > 0 &&
        selectedDates.startDate &&
        selectedDates.endDate;

    // Détecter s'il y a des changements
    const hasChanges = originalData
        ? tripName !== originalData.tripName ||
          destination !== originalData.destination ||
          description !== originalData.description ||
          tripType !== originalData.tripType ||
          selectedDates.startDate !== originalData.selectedDates.startDate ||
          selectedDates.endDate !== originalData.selectedDates.endDate ||
          coverImage !== originalData.coverImage
        : false;

    // Handlers dates
    const handleDateSelect = (day: any) => {
        const dateString = day.dateString;

        if (selectionStep === "start") {
            setSelectedDates({
                startDate: dateString,
                endDate: null,
            });
            setSelectionStep("end");
        } else {
            if (
                selectedDates.startDate &&
                new Date(dateString) < new Date(selectedDates.startDate)
            ) {
                setSelectedDates({
                    startDate: dateString,
                    endDate: null,
                });
                setSelectionStep("end");
            } else {
                setSelectedDates({
                    ...selectedDates,
                    endDate: dateString,
                });
                setShowCalendar(false);
                setSelectionStep("start");
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
            quickModals.showError("Erreur lors de la sélection de l'image");
        }
    };

    const handleRemoveCoverImage = () => {
        setCoverImage(null);
    };

    // Handlers sauvegarde
    const handleSaveTrip = async () => {
        if (!isFormValid || !trip || !user) {
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const updates: any = {};

            // Préparer les mises à jour seulement pour les champs modifiés
            if (tripName !== originalData?.tripName) {
                updates.title = tripName.trim();
            }
            if (destination !== originalData?.destination) {
                updates.destination = destination.trim();
            }
            if (description !== originalData?.description) {
                updates.description = description.trim();
            }
            if (tripType !== originalData?.tripType) {
                updates.type = tripType;
            }
            if (
                selectedDates.startDate !==
                originalData?.selectedDates.startDate
            ) {
                updates.startDate = new Date(selectedDates.startDate!);
            }
            if (selectedDates.endDate !== originalData?.selectedDates.endDate) {
                updates.endDate = new Date(selectedDates.endDate!);
            }
            if (coverImage !== originalData?.coverImage) {
                updates.coverImage = coverImage;
            }

            if (Object.keys(updates).length === 0) {
                quickModals.showInfo("Aucune modification à sauvegarder");
                return;
            }

            await FirebaseServiceInstance.updateTrip(
                tripId,
                updates,
                user.uid,
                user.displayName || "Utilisateur"
            );

            quickModals.saveSuccess();

            // Mettre à jour les données de référence
            setOriginalData({
                tripName,
                destination,
                description,
                tripType,
                selectedDates,
                coverImage,
            });

            // Recharger les données
            await loadTripData();
        } catch (error: any) {
            console.error("Erreur sauvegarde:", error);
            setError(error.message || "Erreur lors de la sauvegarde");
            quickModals.showError("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    const handleDiscardChanges = () => {
        if (!originalData) return;

        modal.showConfirm(
            "Annuler les modifications",
            "Êtes-vous sûr de vouloir annuler vos modifications ? Tous les changements non sauvegardés seront perdus.",
            () => {
                // Restaurer les données originales
                setTripName(originalData.tripName);
                setDestination(originalData.destination);
                setDescription(originalData.description);
                setTripType(originalData.tripType);
                setSelectedDates(originalData.selectedDates);
                setCoverImage(originalData.coverImage);
            }
        );
    };

    return {
        // États principaux
        tripName,
        setTripName,
        selectedDates,
        setSelectedDates,
        destination,
        setDestination,
        description,
        setDescription,
        tripType,
        setTripType,
        coverImage,
        setCoverImage,

        // États modaux
        showCalendar,
        setShowCalendar,
        selectionStep,
        setSelectionStep,
        currentMonthOffset,
        setCurrentMonthOffset,

        // États de chargement
        loading,
        saving,
        error,
        trip,

        // Données calculées
        isFormValid,
        hasChanges,
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

        // Handlers sauvegarde
        handleSaveTrip,
        handleDiscardChanges,

        // Hooks externes
        user,
        modal,
        quickModals,
    };
};
