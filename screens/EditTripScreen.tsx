import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    TripCalendarModal,
    TripCoverImagePicker,
    TripDateSelector,
    TripFormFields,
} from "../components/createTrip";
import { useEditTrip } from "../hooks/useEditTrip";
import { useEditTripStyles } from "../styles/screens/editTripStyles";
import { RootStackParamList } from "../types";

type EditTripScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "EditTrip"
>;
type EditTripScreenRouteProp = RouteProp<RootStackParamList, "EditTrip">;

interface Props {
    navigation: EditTripScreenNavigationProp;
    route: EditTripScreenRouteProp;
}

const EditTripScreen: React.FC<Props> = ({ navigation, route }) => {
    const { tripId } = route.params;
    const styles = useEditTripStyles();

    const {
        // États principaux
        tripName,
        setTripName,
        selectedDates,
        destination,
        setDestination,
        description,
        setDescription,
        tripType,
        setTripType,
        coverImage,

        // États modaux
        showCalendar,
        setShowCalendar,
        selectionStep,
        currentMonthOffset,

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

        // Handlers
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
        handleSelectCoverImage,
        handleRemoveCoverImage,
        handleSaveTrip,
        handleDiscardChanges,
    } = useEditTrip(tripId, navigation);

    // Handlers navigation
    const handleBackPress = () => {
        if (hasChanges) {
            Alert.alert(
                "Modifications non sauvegardées",
                "Vous avez des modifications non sauvegardées. Que souhaitez-vous faire ?",
                [
                    {
                        text: "Annuler",
                        style: "cancel",
                    },
                    {
                        text: "Abandonner",
                        style: "destructive",
                        onPress: () => navigation.goBack(),
                    },
                    {
                        text: "Sauvegarder",
                        onPress: async () => {
                            await handleSaveTrip();
                            navigation.goBack();
                        },
                    },
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    // États de chargement et d'erreur
    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4DA1A9" />
                <Text style={styles.loadingText}>Chargement du voyage...</Text>
            </SafeAreaView>
        );
    }

    if (error || !trip) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons
                    name="alert-circle-outline"
                    size={64}
                    color="#FF6B6B"
                />
                <Text style={styles.errorTitle}>Erreur</Text>
                <Text style={styles.errorText}>
                    {error || "Impossible de charger le voyage"}
                </Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryButtonText}>Retour</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleBackPress}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#2D3748" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Modifier le voyage</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Contenu principal */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Image de couverture */}
                    <TripCoverImagePicker
                        coverImage={coverImage}
                        handleSelectCoverImage={handleSelectCoverImage}
                        handleRemoveCoverImage={handleRemoveCoverImage}
                    />

                    <View style={styles.formContainer}>
                        {/* Champs de base */}
                        <TripFormFields
                            tripName={tripName}
                            setTripName={setTripName}
                            destination={destination}
                            setDestination={setDestination}
                            tripType={tripType}
                            setTripType={setTripType}
                        />

                        {/* Description */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>
                                Description (optionnel)
                            </Text>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    styles.descriptionInput,
                                ]}
                                placeholder="Décrivez votre voyage..."
                                placeholderTextColor="#637887"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                maxLength={500}
                            />
                            <Text style={styles.characterCount}>
                                {description.length}/500
                            </Text>
                        </View>

                        {/* Sélecteur de dates */}
                        <TripDateSelector
                            selectedDates={selectedDates}
                            formattedDateDisplay={formattedDateDisplay}
                            daysDuration={daysDuration}
                            handleDatePicker={handleDatePicker}
                            handleClearDates={handleClearDates}
                        />
                    </View>
                </ScrollView>

                {/* Boutons d'action */}
                <View style={styles.actionsContainer}>
                    {hasChanges && (
                        <TouchableOpacity
                            onPress={handleDiscardChanges}
                            style={styles.discardButton}
                        >
                            <Text style={styles.discardButtonText}>
                                Annuler les modifications
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={handleSaveTrip}
                        style={[
                            styles.saveButton,
                            (!isFormValid || !hasChanges) &&
                                styles.saveButtonDisabled,
                        ]}
                        disabled={!isFormValid || !hasChanges || saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons
                                    name="save"
                                    size={20}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.saveButtonText}>
                                    Sauvegarder les modifications
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Modal de calendrier */}
                <TripCalendarModal
                    showCalendar={showCalendar}
                    setShowCalendar={setShowCalendar}
                    selectedDates={selectedDates}
                    handleDateSelect={handleDateSelect}
                    handleConfirmDates={handleConfirmDates}
                    selectionStep={selectionStep}
                    currentMonthOffset={currentMonthOffset}
                    resetSelection={resetSelection}
                    getCurrentDate={getCurrentDate}
                    getNextMonthDate={getNextMonthDate}
                    canGoPrevious={canGoPrevious}
                    canGoNext={canGoNext}
                    handlePreviousMonths={handlePreviousMonths}
                    handleNextMonths={handleNextMonths}
                    markedDates={markedDates}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditTripScreen;
