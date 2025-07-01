import { useEffect, useRef, useState } from "react";
import { Platform, TextInput } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { TripActivity } from "../services/firebaseService";
import { activityTypes, priorities } from "../utils/activityConstants";
import { useModal } from "./useModal";

export interface UseAddActivityFormReturn {
    // États du formulaire
    activityName: string;
    setActivityName: (name: string) => void;
    selectedType: string;
    setSelectedType: (type: string) => void;
    location: string;
    setLocation: (location: string) => void;
    link: string;
    setLink: (link: string) => void;
    description: string;
    setDescription: (description: string) => void;
    selectedPriority: string;
    setSelectedPriority: (priority: string) => void;
    estimatedDuration: string;
    setEstimatedDuration: (duration: string) => void;
    estimatedCost: string;
    setEstimatedCost: (cost: string) => void;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    startTime: string;
    setStartTime: (time: string) => void;
    endTime: string;
    setEndTime: (time: string) => void;

    // États des modals et pickers
    isLoading: boolean;
    showTypeModal: boolean;
    setShowTypeModal: (show: boolean) => void;
    showDatePicker: boolean;
    setShowDatePicker: (show: boolean) => void;
    showStartTimePicker: boolean;
    setShowStartTimePicker: (show: boolean) => void;
    showEndTimePicker: boolean;
    setShowEndTimePicker: (show: boolean) => void;
    tempDate: Date;
    setTempDate: (date: Date) => void;
    tempTime: Date;
    setTempTime: (time: Date) => void;

    // Gestion des étapes
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    totalSteps: number;

    // Données calculées
    selectedTypeInfo: any;
    selectedPriorityInfo: any;
    isFormValid: boolean;

    // Handlers
    handleSave: () => Promise<void>;
    handleDateChange: (event: any, selectedDate?: Date) => void;
    handleStartTimeChange: (event: any, selectedTime?: Date) => void;
    handleEndTimeChange: (event: any, selectedTime?: Date) => void;
    resetForm: () => void;
    isValidUrl: (url: string) => boolean;
    formatDate: (date: Date) => string;

    // Refs et utilitaires
    activityNameInputRef: React.RefObject<TextInput | null>;
    modal: any;
    user: any;
    isEditing: boolean;
}

export const useAddActivityForm = (
    tripId: string,
    editActivity?: TripActivity,
    navigation?: any
): UseAddActivityFormReturn => {
    const modal = useModal();
    const { user } = useAuth();
    const isEditing = !!editActivity;
    const activityNameInputRef = useRef<TextInput | null>(null);

    // États du formulaire
    const [activityName, setActivityName] = useState(editActivity?.title || "");
    const [selectedType, setSelectedType] = useState<string>("tourist");
    const [location, setLocation] = useState(editActivity?.location || "");
    const [link, setLink] = useState(editActivity?.link || "");
    const [description, setDescription] = useState(
        editActivity?.description || ""
    );
    const [selectedPriority, setSelectedPriority] = useState<string>("medium");
    const [estimatedDuration, setEstimatedDuration] = useState("");
    const [estimatedCost, setEstimatedCost] = useState("");
    const [selectedDate, setSelectedDate] = useState(() => {
        if (editActivity?.date) {
            // Si c'est un Timestamp Firebase, le convertir en Date
            if (
                (editActivity.date as any).toDate &&
                typeof (editActivity.date as any).toDate === "function"
            ) {
                return (editActivity.date as any).toDate();
            }
            // Si c'est déjà un objet Date
            return editActivity.date instanceof Date
                ? editActivity.date
                : new Date(editActivity.date);
        }
        return new Date();
    });
    const [startTime, setStartTime] = useState(editActivity?.startTime || "");
    const [endTime, setEndTime] = useState(editActivity?.endTime || "");

    // États des modals et pickers
    const [isLoading, setIsLoading] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [tempTime, setTempTime] = useState(new Date());

    // Gestion des étapes
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    // Initialisation des valeurs temporaires
    useEffect(() => {
        if (showDatePicker) {
            setTempDate(selectedDate);
        }
    }, [showDatePicker, selectedDate]);

    useEffect(() => {
        if (showStartTimePicker && startTime) {
            const currentTime = new Date();
            const [hours, minutes] = startTime.split(":");
            currentTime.setHours(parseInt(hours), parseInt(minutes));
            setTempTime(currentTime);
        }
    }, [showStartTimePicker, startTime]);

    useEffect(() => {
        if (showEndTimePicker && endTime) {
            const currentTime = new Date();
            const [hours, minutes] = endTime.split(":");
            currentTime.setHours(parseInt(hours), parseInt(minutes));
            setTempTime(currentTime);
        }
    }, [showEndTimePicker, endTime]);

    // Fonction de validation pour les liens
    const isValidUrl = (url: string): boolean => {
        if (!url.trim()) return true; // Lien optionnel, vide = valide
        try {
            const urlPattern = /^https?:\/\/.+/i;
            return urlPattern.test(url.trim());
        } catch {
            return false;
        }
    };

    // Formatage des dates
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Données calculées
    const selectedTypeInfo = activityTypes.find(
        (type) => type.id === selectedType
    );
    const selectedPriorityInfo = priorities.find(
        (priority) => priority.id === selectedPriority
    );
    const isFormValid = activityName.trim().length > 0 && isValidUrl(link);

    // Handlers de date/time
    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setShowDatePicker(false);
            if (selectedDate) {
                setSelectedDate(selectedDate);
            }
        } else if (selectedDate) {
            setTempDate(selectedDate);
        }
    };

    const handleStartTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === "android") {
            setShowStartTimePicker(false);
            if (selectedTime) {
                const timeString = selectedTime.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                setStartTime(timeString);
            }
        } else if (selectedTime) {
            setTempTime(selectedTime);
        }
    };

    const handleEndTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === "android") {
            setShowEndTimePicker(false);
            if (selectedTime) {
                const timeString = selectedTime.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                setEndTime(timeString);
            }
        } else if (selectedTime) {
            setTempTime(selectedTime);
        }
    };

    // Reset du formulaire
    const resetForm = () => {
        setActivityName("");
        setSelectedType("tourist");
        setLocation("");
        setLink("");
        setDescription("");
        setSelectedPriority("medium");
        setEstimatedDuration("");
        setEstimatedCost("");
        setSelectedDate(new Date());
        setStartTime("");
        setEndTime("");
        setCurrentStep(1);
        // Focus sur le champ du nom
        if (activityNameInputRef.current) {
            activityNameInputRef.current.focus();
        }
    };

    // Logique de sauvegarde
    const handleSave = async () => {
        if (!activityName.trim()) {
            modal.showError("Erreur", "Veuillez entrer un nom pour l'activité");
            return;
        }

        if (!isValidUrl(link)) {
            modal.showError(
                "Erreur",
                "Le lien doit commencer par http:// ou https://"
            );
            return;
        }

        setIsLoading(true);

        try {
            // Préparer les données de l'activité
            const activityData: any = {
                id: isEditing ? editActivity.id : `activity_${Date.now()}`,
                title: activityName.trim(),
                date: selectedDate,
                createdBy: isEditing ? editActivity.createdBy : user?.uid || "",
                createdByName: isEditing
                    ? editActivity.createdByName
                    : user?.displayName || user?.email || "Utilisateur",
                createdAt: isEditing ? editActivity.createdAt : new Date(),
                votes: isEditing ? editActivity.votes : [], // Conserver les votes existants
                validated: isEditing ? editActivity.validated : false, // Conserver le statut de validation
            };

            // Ajouter seulement les champs non vides (éviter undefined)
            if (description.trim()) {
                activityData.description = description.trim();
            }
            if (startTime.trim()) {
                activityData.startTime = startTime.trim();
            }
            if (endTime.trim()) {
                activityData.endTime = endTime.trim();
            }
            if (location.trim()) {
                activityData.location = location.trim();
            }
            if (link.trim()) {
                activityData.link = link.trim();
            }

            // Ajouter la date de modification si on édite
            if (isEditing) {
                activityData.updatedAt = new Date();
                activityData.updatedBy = user?.uid || "";
            }

            const activity = activityData as TripActivity;

            // Sauvegarder dans Firebase
            const firebaseService = (
                await import("../services/firebaseService")
            ).default;

            // Récupérer les activités existantes
            const currentActivities = await firebaseService.getActivities(
                tripId
            );

            let updatedActivities;
            if (isEditing) {
                // Remplacer l'activité existante
                updatedActivities = currentActivities.map((a) =>
                    a.id === editActivity.id ? activity : a
                );
            } else {
                // Ajouter la nouvelle activité
                updatedActivities = [...currentActivities, activity];
            }

            await firebaseService.updateActivities(
                tripId,
                updatedActivities,
                user?.uid || ""
            );

            // Logger l'activité si c'est une nouvelle activité (pas une édition)
            if (!isEditing && user) {
                try {
                    // Utiliser retryLogActivity pour gérer les problèmes de permissions des nouveaux membres
                    await firebaseService.retryLogActivity(
                        tripId,
                        user.uid,
                        user.displayName || user.email || "Utilisateur",
                        "activity_add",
                        { title: activityName.trim() }
                    );
                } catch (logError) {
                    console.error("Erreur logging activité:", logError);
                }
            }

            // Modal intelligente avec actions contextuelles
            if (isEditing) {
                modal.showConfirm(
                    "✨ Activité modifiée !",
                    `"${activityName.trim()}" a été mise à jour avec succès.`,
                    () => {
                        // Retour simple au planning
                        navigation?.goBack();
                    },
                    () => {
                        // Retour simple
                        navigation?.goBack();
                    },
                    "Voir planning",
                    "Retour"
                );
            } else {
                modal.showConfirm(
                    "🎯 Activité ajoutée !",
                    `"${activityName.trim()}" a été ajoutée à votre voyage.`,
                    resetForm,
                    () => {
                        // Retour simple au planning
                        navigation?.goBack();
                    },
                    "Ajouter une autre",
                    "Voir planning"
                );
            }
        } catch (error) {
            console.error("Erreur sauvegarde activité:", error);
            modal.showError(
                "Erreur",
                isEditing
                    ? "Impossible de modifier l'activité"
                    : "Impossible d'ajouter l'activité"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // États du formulaire
        activityName,
        setActivityName,
        selectedType,
        setSelectedType,
        location,
        setLocation,
        link,
        setLink,
        description,
        setDescription,
        selectedPriority,
        setSelectedPriority,
        estimatedDuration,
        setEstimatedDuration,
        estimatedCost,
        setEstimatedCost,
        selectedDate,
        setSelectedDate,
        startTime,
        setStartTime,
        endTime,
        setEndTime,

        // États des modals et pickers
        isLoading,
        showTypeModal,
        setShowTypeModal,
        showDatePicker,
        setShowDatePicker,
        showStartTimePicker,
        setShowStartTimePicker,
        showEndTimePicker,
        setShowEndTimePicker,
        tempDate,
        setTempDate,
        tempTime,
        setTempTime,

        // Gestion des étapes
        currentStep,
        setCurrentStep,
        totalSteps,

        // Données calculées
        selectedTypeInfo,
        selectedPriorityInfo,
        isFormValid,

        // Handlers
        handleSave,
        handleDateChange,
        handleStartTimeChange,
        handleEndTimeChange,
        resetForm,
        isValidUrl,
        formatDate,

        // Refs et utilitaires
        activityNameInputRef,
        modal,
        user,
        isEditing,
    };
};
