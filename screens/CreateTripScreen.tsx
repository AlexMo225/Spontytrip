import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    TripCalendarModal,
    TripCoverImagePicker,
    TripDateSelector,
    TripFormFields,
    TripInvitationModal,
} from "../components/createTrip";
import { useCreateTripForm } from "../hooks/useCreateTripForm";
import { useCreateTripStyles  } from "../styles/screens";
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
    const styles = useCreateTripStyles();

    const {
        // États principaux
        tripName,
        setTripName,
        selectedDates,
        destination,
        setDestination,
        tripType,
        setTripType,
        coverImage,

        // États modaux
        showCalendar,
        setShowCalendar,
        showInvitationModal,
        selectionStep,
        currentMonthOffset,

        // États invitation
        invitationCode,

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

        // Hooks externes
        loading,
    } = useCreateTripForm(navigation, route);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Nouveau séjour</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Champs du formulaire */}
                <TripFormFields
                    tripName={tripName}
                    setTripName={setTripName}
                    destination={destination}
                    setDestination={setDestination}
                    tripType={tripType}
                    setTripType={setTripType}
                />

                {/* Sélecteur de dates */}
                <TripDateSelector
                    selectedDates={selectedDates}
                    formattedDateDisplay={formattedDateDisplay}
                    daysDuration={daysDuration}
                    handleDatePicker={handleDatePicker}
                    handleClearDates={handleClearDates}
                />

                {/* Sélecteur d'image de couverture */}
                <TripCoverImagePicker
                    coverImage={coverImage}
                    handleSelectCoverImage={handleSelectCoverImage}
                    handleRemoveCoverImage={handleRemoveCoverImage}
                />
            </ScrollView>

            {/* Bouton Créer le séjour */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[
                        styles.createButton,
                        (!isFormValid || loading) &&
                            styles.createButtonDisabled,
                    ]}
                    onPress={handleCreateTrip}
                    disabled={!isFormValid || loading}
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
            <TripInvitationModal
                showInvitationModal={showInvitationModal}
                invitationCode={invitationCode}
                tripName={tripName}
                handleCopyCode={handleCopyCode}
                handleShareInvitation={handleShareInvitation}
                handleCloseInvitationModal={handleCloseInvitationModal}
            />

            {/* Modal Calendrier */}
            <TripCalendarModal
                showCalendar={showCalendar}
                setShowCalendar={setShowCalendar}
                selectedDates={selectedDates}
                selectionStep={selectionStep}
                markedDates={markedDates}
                currentMonthOffset={currentMonthOffset}
                handleDateSelect={handleDateSelect}
                handleConfirmDates={handleConfirmDates}
                resetSelection={resetSelection}
                getCurrentDate={getCurrentDate}
                getNextMonthDate={getNextMonthDate}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                handlePreviousMonths={handlePreviousMonths}
                handleNextMonths={handleNextMonths}
            />
        </View>
    );
};

export default CreateTripScreen;
