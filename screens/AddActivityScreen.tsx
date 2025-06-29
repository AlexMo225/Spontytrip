import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useModal, useQuickModals } from "../hooks/useModal";
import { TripActivity } from "../services/firebaseService";
import { RootStackParamList } from "../types";

type AddActivityScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "AddActivity"
>;

type AddActivityScreenRouteProp = RouteProp<RootStackParamList, "AddActivity">;

interface Props {
    navigation: AddActivityScreenNavigationProp;
    route: AddActivityScreenRouteProp;
}

interface ActivityType {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

const activityTypes: ActivityType[] = [
    {
        id: "tourist",
        name: "Visite touristique",
        icon: "camera-outline",
        color: "#4DA1A9",
    },
    {
        id: "restaurant",
        name: "Restaurant",
        icon: "restaurant-outline",
        color: "#F59E0B",
    },
    {
        id: "sport",
        name: "Sport",
        icon: "fitness-outline",
        color: "#10B981",
    },
    {
        id: "culture",
        name: "Culture",
        icon: "book-outline",
        color: "#8B5CF6",
    },
    {
        id: "shopping",
        name: "Shopping",
        icon: "cart-outline",
        color: "#EC4899",
    },
    {
        id: "nature",
        name: "Nature",
        icon: "leaf-outline",
        color: "#34D399",
    },
    {
        id: "nightlife",
        name: "Vie nocturne",
        icon: "moon-outline",
        color: "#6366F1",
    },
    {
        id: "other",
        name: "Autre",
        icon: "ellipsis-horizontal-outline",
        color: "#6B7280",
    },
];

const priorities = [
    { id: "low", name: "Faible", color: "#95A5A6" },
    { id: "medium", name: "Moyenne", color: "#F39C12" },
    { id: "high", name: "Élevée", color: "#E74C3C" },
];

const AddActivityScreen: React.FC<Props> = ({ navigation, route }) => {
    const modal = useModal();
    const quickModals = useQuickModals();
    const { user } = useAuth();
    const { tripId, editActivity } = route.params;
    const isEditing = !!editActivity;

    const activityNameInputRef = useRef<TextInput>(null);
    const [activityName, setActivityName] = useState(editActivity?.title || "");
    const [selectedType, setSelectedType] = useState<string>("sightseeing");
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
                editActivity.date.toDate &&
                typeof editActivity.date.toDate === "function"
            ) {
                return editActivity.date.toDate();
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
    const [isLoading, setIsLoading] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [tempTime, setTempTime] = useState(new Date());
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
                        navigation.goBack();
                    },
                    () => {
                        // Retour simple
                        navigation.goBack();
                    },
                    "Voir planning",
                    "Retour"
                );
            } else {
                modal.showConfirm(
                    "🎯 Activité ajoutée !",
                    `"${activityName.trim()}" a été ajoutée à votre voyage.`,
                    () => {
                        // Réinitialiser complètement le formulaire
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
                    },
                    () => {
                        // Retour simple au planning
                        navigation.goBack();
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

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const selectedTypeInfo = activityTypes.find(
        (type) => type.id === selectedType
    );
    const selectedPriorityInfo = priorities.find(
        (priority) => priority.id === selectedPriority
    );

    const renderIOSPicker = (
        show: boolean,
        mode: "date" | "time",
        onChange: (event: any, date?: Date) => void
    ) => {
        if (!show || Platform.OS !== "ios") return null;

        return (
            <Modal
                transparent={true}
                animationType="slide"
                visible={show}
                onRequestClose={() => {
                    if (mode === "date") setShowDatePicker(false);
                    else if (mode === "time") {
                        setShowStartTimePicker(false);
                        setShowEndTimePicker(false);
                    }
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.pickerHeader}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (mode === "date")
                                        setShowDatePicker(false);
                                    else if (mode === "time") {
                                        setShowStartTimePicker(false);
                                        setShowEndTimePicker(false);
                                    }
                                }}
                            >
                                <Text style={styles.cancelButton}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (mode === "date") {
                                        setSelectedDate(tempDate);
                                        setShowDatePicker(false);
                                    } else if (mode === "time") {
                                        const timeString =
                                            tempTime.toLocaleTimeString(
                                                "fr-FR",
                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }
                                            );
                                        if (showStartTimePicker) {
                                            setStartTime(timeString);
                                            setShowStartTimePicker(false);
                                        } else {
                                            setEndTime(timeString);
                                            setShowEndTimePicker(false);
                                        }
                                    }
                                }}
                            >
                                <Text style={styles.confirmButton}>OK</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.pickerContainer}>
                            <DateTimePicker
                                value={mode === "date" ? tempDate : tempTime}
                                mode={mode}
                                display="spinner"
                                onChange={onChange}
                                locale="fr-FR"
                                textColor="#000000"
                                style={styles.iosPicker}
                                minimumDate={
                                    mode === "date" ? new Date() : undefined
                                }
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderTypeModal = () => (
        <Modal
            visible={showTypeModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowTypeModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View
                    style={[
                        styles.modalContent,
                        { width: "90%", maxHeight: "70%" },
                    ]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Type d'activité</Text>
                        <TouchableOpacity
                            onPress={() => setShowTypeModal(false)}
                        >
                            <Ionicons
                                name="close-outline"
                                size={24}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.typeList}>
                        {activityTypes.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.typeOption,
                                    selectedType === type.id &&
                                        styles.typeOptionSelected,
                                ]}
                                onPress={() => {
                                    setSelectedType(type.id);
                                    setShowTypeModal(false);
                                }}
                            >
                                <View
                                    style={[
                                        styles.typeIcon,
                                        { backgroundColor: type.color },
                                    ]}
                                >
                                    <Ionicons
                                        name={type.icon as any}
                                        size={20}
                                        color="white"
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.typeText,
                                        selectedType === type.id &&
                                            styles.typeTextSelected,
                                    ]}
                                >
                                    {type.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderProgressBar = () => (
        <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.progressBar,
                        {
                            backgroundColor:
                                index + 1 <= currentStep
                                    ? "#4DA1A9"
                                    : "#E5E7EB",
                            width: `${100 / totalSteps}%`,
                        },
                    ]}
                />
            ))}
        </View>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>
                            Informations principales
                        </Text>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Nom de l'activité *
                            </Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="bookmark-outline"
                                    size={20}
                                    color="#4DA1A9"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    ref={activityNameInputRef}
                                    style={styles.inputWithIcon}
                                    placeholder="Ex: Visite de la Tour Eiffel..."
                                    value={activityName}
                                    onChangeText={setActivityName}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Type d'activité</Text>
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => setShowTypeModal(true)}
                            >
                                <View style={styles.selectContent}>
                                    <View
                                        style={[
                                            styles.typeIcon,
                                            {
                                                backgroundColor:
                                                    activityTypes.find(
                                                        (t) =>
                                                            t.id ===
                                                            selectedType
                                                    )?.color,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={
                                                activityTypes.find(
                                                    (t) => t.id === selectedType
                                                )?.icon
                                            }
                                            size={20}
                                            color="white"
                                        />
                                    </View>
                                    <Text style={styles.selectText}>
                                        {
                                            activityTypes.find(
                                                (t) => t.id === selectedType
                                            )?.name
                                        }
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chevron-down"
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Date et heure</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons
                                name="calendar"
                                size={20}
                                color="#4DA1A9"
                            />
                            <Text style={styles.dateText}>
                                {formatDate(selectedDate)}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>

                        <View style={styles.timeContainer}>
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowStartTimePicker(true)}
                            >
                                <Ionicons
                                    name="time"
                                    size={20}
                                    color="#4DA1A9"
                                />
                                <Text style={styles.timeText}>
                                    {startTime || "Début"}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.timeSeparator}>
                                <Ionicons
                                    name="arrow-forward"
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowEndTimePicker(true)}
                            >
                                <Ionicons
                                    name="time"
                                    size={20}
                                    color="#4DA1A9"
                                />
                                <Text style={styles.timeText}>
                                    {endTime || "Fin"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Localisation</Text>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Lieu</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="location-outline"
                                    size={20}
                                    color="#4DA1A9"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.inputWithIcon}
                                    placeholder="Ex: 5 Avenue Anatole France, Paris..."
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.label}>Lien</Text>
                                <Text style={styles.optionalText}>
                                    (optionnel)
                                </Text>
                            </View>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="link-outline"
                                    size={20}
                                    color="#4DA1A9"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[
                                        styles.inputWithIcon,
                                        !isValidUrl(link) &&
                                            link.trim() &&
                                            styles.inputError,
                                    ]}
                                    placeholder="https://... (billetterie, site officiel)"
                                    value={link}
                                    onChangeText={setLink}
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="url"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                {link.trim() && (
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={() => setLink("")}
                                    >
                                        <Ionicons
                                            name="close-circle"
                                            size={20}
                                            color="#9CA3AF"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {!isValidUrl(link) && link.trim() && (
                                <Text style={styles.errorText}>
                                    Le lien doit commencer par http:// ou
                                    https://
                                </Text>
                            )}
                        </View>
                    </View>
                );
            case 4:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Description</Text>
                        <View style={styles.formGroup}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.label}>Description</Text>
                                <Text style={styles.optionalText}>
                                    (optionnel)
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.inputContainer,
                                    styles.textAreaContainer,
                                ]}
                            >
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Description de l'activité..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#4DA1A9" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nouvelle activité</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        style={styles.saveButton}
                        disabled={!activityName.trim()}
                    >
                        <Text
                            style={[
                                styles.saveButtonText,
                                !activityName.trim() &&
                                    styles.saveButtonTextDisabled,
                            ]}
                        >
                            Sauver
                        </Text>
                    </TouchableOpacity>
                </View>

                {renderProgressBar()}

                <ScrollView
                    style={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollViewContent}
                >
                    {renderStepContent()}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.footerButton,
                            currentStep === 1 && styles.footerButtonDisabled,
                        ]}
                        onPress={() =>
                            setCurrentStep((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentStep === 1}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={20}
                            color={currentStep === 1 ? "#9CA3AF" : "#4DA1A9"}
                        />
                        <Text
                            style={[
                                styles.footerButtonText,
                                currentStep === 1 &&
                                    styles.footerButtonTextDisabled,
                            ]}
                        >
                            Précédent
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footerCenter}>
                        <Text style={styles.stepIndicator}>
                            {currentStep}/{totalSteps}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.footerButton,
                            currentStep === totalSteps &&
                                styles.footerButtonDisabled,
                        ]}
                        onPress={() =>
                            setCurrentStep((prev) =>
                                Math.min(totalSteps, prev + 1)
                            )
                        }
                        disabled={currentStep === totalSteps}
                    >
                        <Text
                            style={[
                                styles.footerButtonText,
                                currentStep === totalSteps &&
                                    styles.footerButtonTextDisabled,
                            ]}
                        >
                            Suivant
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={20}
                            color={
                                currentStep === totalSteps
                                    ? "#9CA3AF"
                                    : "#4DA1A9"
                            }
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Pickers iOS */}
            {renderIOSPicker(showDatePicker, "date", handleDateChange)}
            {renderIOSPicker(
                showStartTimePicker,
                "time",
                handleStartTimeChange
            )}
            {renderIOSPicker(showEndTimePicker, "time", handleEndTimeChange)}

            {/* Type Modal */}
            {renderTypeModal()}

            {/* Android Pickers */}
            {Platform.OS === "android" && showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}
            {Platform.OS === "android" && showStartTimePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display="default"
                    onChange={handleStartTimeChange}
                />
            )}
            {Platform.OS === "android" && showEndTimePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display="default"
                    onChange={handleEndTimeChange}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    backButton: {
        padding: 8,
    },
    saveButton: {
        backgroundColor: "#4DA1A9",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        color: "white",
        fontWeight: "600",
    },
    saveButtonTextDisabled: {
        opacity: 0.5,
    },
    progressContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "white",
    },
    progressBar: {
        height: 4,
        marginHorizontal: 2,
        borderRadius: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        padding: 16,
    },
    stepContainer: {
        marginBottom: 24,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    labelContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        color: "#374151",
    },
    optionalText: {
        fontSize: 14,
        color: "#6B7280",
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    inputWithIcon: {
        flex: 1,
        fontSize: 16,
        color: "#111827",
        paddingVertical: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#111827",
        paddingVertical: 12,
    },
    inputError: {
        borderColor: "#EF4444",
    },
    errorText: {
        fontSize: 14,
        color: "#EF4444",
        marginTop: 4,
    },
    textAreaContainer: {
        minHeight: 120,
    },
    textArea: {
        height: "auto",
        paddingTop: 12,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    footerButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
    },
    footerButtonDisabled: {
        opacity: 0.5,
    },
    footerButtonText: {
        fontSize: 16,
        color: "#4DA1A9",
        marginHorizontal: 8,
    },
    footerButtonTextDisabled: {
        color: "#9CA3AF",
    },
    footerCenter: {
        alignItems: "center",
    },
    stepIndicator: {
        fontSize: 14,
        color: "#6B7280",
    },
    typeOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
    },
    typeIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    typeText: {
        fontSize: 16,
        color: "#111827",
    },
    selectButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        padding: 12,
    },
    selectContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    selectText: {
        fontSize: 16,
        color: "#111827",
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
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
        paddingHorizontal: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        maxHeight: "80%",
    },
    pickerHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 8,
    },
    cancelButton: {
        fontSize: 16,
        fontWeight: "600",
        color: "#4DA1A9",
    },
    confirmButton: {
        fontSize: 16,
        fontWeight: "600",
        color: "#4DA1A9",
    },
    pickerContainer: {
        padding: 8,
    },
    iosPicker: {
        width: "100%",
        height: "100%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    typeList: {
        padding: 12,
    },
    typeOptionSelected: {
        backgroundColor: "#F0FDFB",
        borderColor: "#4DA1A9",
    },
    typeTextSelected: {
        color: "#4DA1A9",
        fontWeight: "500",
    },
    clearButton: {
        padding: 4,
    },
});

export default AddActivityScreen;
