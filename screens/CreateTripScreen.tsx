import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
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
import { TextStyles } from "../constants/Fonts";
import { useCreateTripForm } from "../hooks/useCreateTripForm";
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    headerTitle: {
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    bottomContainer: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        paddingBottom: 40,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    createButton: {
        backgroundColor: "#4DA1A9",
        borderRadius: 12,
        alignItems: "center",
        height: 48,
        justifyContent: "center",
        paddingHorizontal: 16,
        shadowColor: "#4DA1A9",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
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
        gap: 8,
    },
    createButtonText: {
        ...TextStyles.button,
        color: "#FFFFFF",
        fontWeight: "600",
    },
});

export default CreateTripScreen;
