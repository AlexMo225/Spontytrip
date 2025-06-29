import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
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
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
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
    icon: string;
    color: string;
}

const activityTypes: ActivityType[] = [
    {
        id: "sightseeing",
        name: "Visite touristique",
        icon: "camera",
        color: "#4DA1A9",
    },
    {
        id: "restaurant",
        name: "Restaurant",
        icon: "restaurant",
        color: "#FF9500",
    },
    { id: "adventure", name: "Aventure", icon: "mountain", color: "#7ED957" },
    { id: "culture", name: "Culture", icon: "library", color: "#9C27B0" },
    { id: "shopping", name: "Shopping", icon: "bag", color: "#FF6B6B" },
    { id: "relaxation", name: "Détente", icon: "flower", color: "#00BCD4" },
    { id: "transport", name: "Transport", icon: "car", color: "#607D8B" },
    {
        id: "other",
        name: "Autre",
        icon: "ellipsis-horizontal",
        color: "#795548",
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
                // Pour une modification : voir l'activité ou retourner au planning
                modal.showConfirm(
                    "✨ Activité modifiée !",
                    `"${activityName.trim()}" a été mise à jour avec succès.`,
                    () => {
                        // Remplacer cette page par le planning pour éviter les problèmes de pile
                        navigation.replace("Activities", { tripId });
                    },
                    () => {
                        // Retour simple
                        navigation.goBack();
                    },
                    "Voir planning",
                    "Retour"
                );
            } else {
                // Pour une nouvelle activité : ajouter une autre ou voir le planning
                modal.showConfirm(
                    "🎯 Activité ajoutée !",
                    `"${activityName.trim()}" a été ajoutée à votre voyage.`,
                    () => {
                        // Réinitialiser le formulaire pour ajouter une autre activité
                        setActivityName("");
                        setSelectedType("sightseeing");
                        setLocation("");
                        setLink("");
                        setDescription("");
                        setSelectedPriority("medium");
                        setEstimatedDuration("");
                        setEstimatedCost("");
                        setSelectedDate(new Date());
                        setStartTime("");
                        setEndTime("");
                    },
                    () => {
                        // Remplacer cette page par le planning pour éviter les problèmes de pile
                        navigation.replace("Activities", { tripId });
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

    const renderTypeOption = (type: ActivityType) => (
        <TouchableOpacity
            key={type.id}
            style={styles.typeOption}
            onPress={() => {
                setSelectedType(type.id);
                setShowTypeModal(false);
            }}
        >
            <View
                style={[
                    styles.typeIcon,
                    { backgroundColor: type.color + "20" },
                ]}
            >
                <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={type.color}
                />
            </View>
            <Text style={styles.typeText}>{type.name}</Text>
            {selectedType === type.id && (
                <Ionicons name="checkmark" size={20} color={type.color} />
            )}
        </TouchableOpacity>
    );

    const renderPriorityOption = (priority: (typeof priorities)[0]) => (
        <TouchableOpacity
            key={priority.id}
            style={[
                styles.priorityOption,
                selectedPriority === priority.id && {
                    backgroundColor: priority.color + "20",
                    borderColor: priority.color,
                },
            ]}
            onPress={() => setSelectedPriority(priority.id)}
        >
            <View
                style={[
                    styles.priorityDot,
                    { backgroundColor: priority.color },
                ]}
            />
            <Text
                style={[
                    styles.priorityText,
                    selectedPriority === priority.id && {
                        color: priority.color,
                        fontWeight: "600",
                    },
                ]}
            >
                {priority.name}
            </Text>
        </TouchableOpacity>
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

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#4DA1A9" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isEditing ? "Modifier l'activité" : "Nouvelle activité"}
                </Text>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        isLoading && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading ? "..." : "Sauver"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Nom de l'activité */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nom de l'activité *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Visite de la Tour Eiffel..."
                        value={activityName}
                        onChangeText={setActivityName}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* Type d'activité */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Type d'activité</Text>
                    <TouchableOpacity
                        style={styles.typeSelector}
                        onPress={() => setShowTypeModal(true)}
                    >
                        <View style={styles.typeSelectorContent}>
                            <View
                                style={[
                                    styles.typeIcon,
                                    {
                                        backgroundColor:
                                            selectedTypeInfo?.color + "20",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name={selectedTypeInfo?.icon as any}
                                    size={20}
                                    color={selectedTypeInfo?.color}
                                />
                            </View>
                            <Text style={styles.typeSelectorText}>
                                {selectedTypeInfo?.name}
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#9CA3AF"
                        />
                    </TouchableOpacity>
                </View>

                {/* Date et Heure */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Date et heure *</Text>

                    {/* Sélecteur de date */}
                    <TouchableOpacity
                        style={styles.dateTimeButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons
                            name="calendar-outline"
                            size={20}
                            color="#4DA1A9"
                        />
                        <Text style={styles.dateTimeText}>
                            {formatDate(selectedDate)}
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#9CA3AF"
                        />
                    </TouchableOpacity>

                    {/* Sélecteurs d'heure */}
                    <View style={styles.timeRow}>
                        <View style={styles.timeColumn}>
                            <Text style={styles.timeLabel}>Heure de début</Text>
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowStartTimePicker(true)}
                            >
                                <Ionicons
                                    name="time-outline"
                                    size={18}
                                    color="#4DA1A9"
                                />
                                <Text style={styles.timeText}>
                                    {startTime || "Non définie"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.timeColumn}>
                            <Text style={styles.timeLabel}>Heure de fin</Text>
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowEndTimePicker(true)}
                            >
                                <Ionicons
                                    name="time-outline"
                                    size={18}
                                    color="#4DA1A9"
                                />
                                <Text style={styles.timeText}>
                                    {endTime || "Non définie"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Lieu */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lieu</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: 5 Avenue Anatole France, Paris..."
                        value={location}
                        onChangeText={setLocation}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* Lien (optionnel) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lien (optionnel)</Text>
                    <TextInput
                        style={[
                            styles.input,
                            !isValidUrl(link) &&
                                link.trim() &&
                                styles.inputError,
                        ]}
                        placeholder="https://... (billetterie, site officiel, etc.)"
                        value={link}
                        onChangeText={setLink}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="url"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {!isValidUrl(link) && link.trim() && (
                        <Text style={styles.errorText}>
                            Le lien doit commencer par http:// ou https://
                        </Text>
                    )}
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Description (optionnelle)
                    </Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Décrivez l'activité, ajoutez des notes..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* Espacement en bas */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Modal de sélection de type */}
            <Modal
                visible={showTypeModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowTypeModal(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setShowTypeModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Annuler</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Type d'activité</Text>
                        <View style={styles.modalPlaceholder} />
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {activityTypes.map(renderTypeOption)}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Date Picker pour Android */}
            {Platform.OS === "android" && showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {/* Time Picker pour Android */}
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

            {/* Pickers pour iOS */}
            {renderIOSPicker(showDatePicker, "date", handleDateChange)}
            {renderIOSPicker(
                showStartTimePicker,
                "time",
                handleStartTimeChange
            )}
            {renderIOSPicker(showEndTimePicker, "time", handleEndTimeChange)}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
        fontFamily: "Inter_600SemiBold",
    },
    saveButton: {
        backgroundColor: "#4DA1A9",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonDisabled: {
        backgroundColor: "#9CA3AF",
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 12,
        fontFamily: "Inter_600SemiBold",
    },
    input: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: "#FFFFFF",
        color: "#1F2937",
        fontFamily: "Inter_400Regular",
    },
    inputError: {
        borderColor: "#EF4444",
        borderWidth: 2,
    },
    errorText: {
        fontSize: 14,
        color: "#EF4444",
        marginTop: 8,
        fontFamily: "Inter_400Regular",
    },
    textArea: {
        height: 100,
        paddingTop: 14,
        textAlignVertical: "top",
    },
    typeSelector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
    },
    typeSelectorContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    typeIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    typeSelectorText: {
        fontSize: 16,
        color: "#1F2937",
        fontFamily: "Inter_400Regular",
    },
    dateTimeButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        marginBottom: 16,
    },
    dateTimeText: {
        fontSize: 16,
        color: "#1F2937",
        marginLeft: 12,
        flex: 1,
        fontFamily: "Inter_400Regular",
    },
    timeRow: {
        flexDirection: "row",
        gap: 12,
    },
    timeColumn: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 8,
        fontFamily: "Inter_400Regular",
    },
    timeButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
    },
    timeText: {
        fontSize: 14,
        color: "#1F2937",
        marginLeft: 8,
        fontFamily: "Inter_400Regular",
    },
    bottomSpacing: {
        height: 40,
    },

    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        fontFamily: "Inter_600SemiBold",
    },
    modalCancelText: {
        fontSize: 16,
        color: "#4DA1A9",
        fontFamily: "Inter_400Regular",
    },
    modalPlaceholder: {
        width: 60,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    typeOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginVertical: 4,
        backgroundColor: "#F9FAFB",
    },
    typeText: {
        fontSize: 16,
        color: "#1F2937",
        marginLeft: 12,
        flex: 1,
        fontFamily: "Inter_400Regular",
    },
    prioritiesContainer: {
        flexDirection: "row",
        gap: Spacing.sm,
    },
    priorityOption: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.sm,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
    },
    priorityDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: Spacing.xs,
    },
    priorityText: {
        ...TextStyles.body2,
        color: Colors.text.primary,
        fontSize: 14,
    },
    row: {
        flexDirection: "row",
        gap: Spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
    bottomSection: {
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.white,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingBottom: Platform.OS === "ios" ? 34 : 0,
    },
    pickerHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        backgroundColor: "#F3F4F6",
    },
    cancelButton: {
        fontSize: 17,
        color: "#4DA1A9",
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    confirmButton: {
        fontSize: 17,
        color: "#4DA1A9",
        fontWeight: "600",
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    pickerContainer: {
        backgroundColor: "#FFFFFF",
        paddingTop: 8,
    },
    iosPicker: {
        height: 216,
        backgroundColor: "#FFFFFF",
    },
});

export default AddActivityScreen;
