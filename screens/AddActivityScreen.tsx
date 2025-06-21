import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    Alert,
    Modal,
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
    const { user } = useAuth();
    const { tripId } = route.params;

    const [activityName, setActivityName] = useState("");
    const [selectedType, setSelectedType] = useState<string>("sightseeing");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [selectedPriority, setSelectedPriority] = useState<string>("medium");
    const [estimatedDuration, setEstimatedDuration] = useState("");
    const [estimatedCost, setEstimatedCost] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);

    const handleSave = async () => {
        if (!activityName.trim()) {
            Alert.alert("Erreur", "Veuillez entrer un nom pour l'activité");
            return;
        }

        setIsLoading(true);

        try {
            // Créer l'activité
            const newActivity: TripActivity = {
                id: `activity_${Date.now()}`,
                title: activityName.trim(),
                description: description.trim() || undefined,
                date: selectedDate,
                startTime: startTime || undefined,
                endTime: endTime || undefined,
                location: location.trim() || undefined,
                createdBy: user?.uid || "",
                createdByName:
                    user?.displayName || user?.email || "Utilisateur",
                createdAt: new Date(),
            };

            // Sauvegarder dans Firebase
            const firebaseService = (
                await import("../services/firebaseService")
            ).default;

            // Récupérer les activités existantes
            const currentActivities = await firebaseService.getActivities(
                tripId
            );

            // Ajouter la nouvelle activité
            const updatedActivities = [...currentActivities, newActivity];

            await firebaseService.updateActivities(
                tripId,
                updatedActivities,
                user?.uid || ""
            );

            Alert.alert("Succès", "Activité ajoutée au voyage", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error("Erreur création activité:", error);
            Alert.alert("Erreur", "Impossible d'ajouter l'activité");
        } finally {
            setIsLoading(false);
        }
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

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={Colors.text.primary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nouvelle activité</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Activity Name Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nom de l'activité</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Ex: Visite de la Tour Eiffel..."
                        value={activityName}
                        onChangeText={setActivityName}
                        maxLength={100}
                    />
                </View>

                {/* Type Section */}
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
                                    size={24}
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
                            color={Colors.text.secondary}
                        />
                    </TouchableOpacity>
                </View>

                {/* Location Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lieu</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Ex: 5 Avenue Anatole France, Paris..."
                        value={location}
                        onChangeText={setLocation}
                        maxLength={200}
                    />
                </View>

                {/* Priority Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Priorité</Text>
                    <View style={styles.prioritiesContainer}>
                        {priorities.map(renderPriorityOption)}
                    </View>
                </View>

                {/* Duration and Cost Section */}
                <View style={styles.row}>
                    <View style={[styles.section, styles.halfWidth]}>
                        <Text style={styles.sectionTitle}>Durée estimée</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: 2h"
                            value={estimatedDuration}
                            onChangeText={setEstimatedDuration}
                            maxLength={20}
                        />
                    </View>
                    <View style={[styles.section, styles.halfWidth]}>
                        <Text style={styles.sectionTitle}>Coût estimé</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: 25€"
                            value={estimatedCost}
                            onChangeText={setEstimatedCost}
                            keyboardType="numeric"
                            maxLength={20}
                        />
                    </View>
                </View>

                {/* Description Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Description (optionnel)
                    </Text>
                    <TextInput
                        style={[styles.textInput, styles.descriptionInput]}
                        placeholder="Décrivez l'activité, ajoutez des notes..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                        textAlignVertical="top"
                    />
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.bottomSection}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (!activityName.trim() || isLoading) &&
                            styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!activityName.trim() || isLoading}
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading ? "Ajout en cours..." : "Ajouter l'activité"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Type Selection Modal */}
            <Modal
                visible={showTypeModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowTypeModal(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Type d'activité</Text>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowTypeModal(false)}
                        >
                            <Ionicons
                                name="close"
                                size={24}
                                color={Colors.text.primary}
                            />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalContent}>
                        {activityTypes.map(renderTypeOption)}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
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
        justifyContent: "space-between",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        ...TextStyles.h3,
        color: Colors.text.primary,
        fontWeight: "600",
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.md,
    },
    section: {
        marginTop: Spacing.lg,
    },
    sectionTitle: {
        ...TextStyles.h4,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
        fontWeight: "600",
    },
    textInput: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: 16,
        backgroundColor: Colors.white,
        color: Colors.text.primary,
    },
    descriptionInput: {
        height: 100,
        paddingTop: Spacing.sm,
    },
    typeSelector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.white,
    },
    typeSelectorContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    typeSelectorText: {
        ...TextStyles.body1,
        color: Colors.text.primary,
        fontSize: 16,
        marginLeft: Spacing.sm,
    },
    typeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
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
    saveButton: {
        backgroundColor: "rgba(126, 217, 87, 0.91)",
        borderRadius: 12,
        paddingVertical: Spacing.md,
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonDisabled: {
        backgroundColor: Colors.lightGray,
    },
    saveButtonText: {
        ...TextStyles.button,
        color: Colors.white,
        fontWeight: "600",
        fontSize: 16,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        ...TextStyles.h3,
        color: Colors.text.primary,
        fontWeight: "600",
    },
    modalCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: Spacing.md,
    },
    typeOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.md,
        borderRadius: 12,
        marginTop: Spacing.sm,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    typeText: {
        ...TextStyles.body1,
        color: Colors.text.primary,
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: 16,
    },
});

export default AddActivityScreen;
