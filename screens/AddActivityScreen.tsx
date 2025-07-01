import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    ActivityStepFour,
    ActivityStepOne,
    ActivityStepThree,
    ActivityStepTwo,
    ActivityTypeModal,
    AddActivityHeader,
    AddActivityProgressBar,
} from "../components/addActivity";
import { useAddActivityForm } from "../hooks";
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

const AddActivityScreen: React.FC<Props> = ({ navigation, route }) => {
    const { tripId, editActivity } = route.params;

    const {
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
        selectedDate,
        setSelectedDate,
        startTime,
        setStartTime,
        endTime,
        setEndTime,

        // États des modals et pickers
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

        // Handlers
        handleSave,
        handleDateChange,
        handleStartTimeChange,
        handleEndTimeChange,
        formatDate,

        // Refs et utilitaires
        activityNameInputRef,
        isEditing,
    } = useAddActivityForm(tripId, editActivity, navigation);

    // Navigation entre étapes
    const handlePrevious = () => {
        setCurrentStep((prev: number) => Math.max(1, prev - 1));
    };

    const handleNext = () => {
        setCurrentStep((prev: number) => Math.min(totalSteps, prev + 1));
    };

    // Render du contenu des étapes
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ActivityStepOne
                        activityName={activityName}
                        setActivityName={setActivityName}
                        location={location}
                        setLocation={setLocation}
                        selectedTypeInfo={selectedTypeInfo}
                        onTypeModalOpen={() => setShowTypeModal(true)}
                        activityNameInputRef={activityNameInputRef}
                    />
                );
            case 2:
                return (
                    <ActivityStepTwo
                        selectedDate={selectedDate}
                        startTime={startTime}
                        endTime={endTime}
                        formatDate={formatDate}
                        onDatePickerOpen={() => setShowDatePicker(true)}
                        onStartTimePickerOpen={() =>
                            setShowStartTimePicker(true)
                        }
                        onEndTimePickerOpen={() => setShowEndTimePicker(true)}
                    />
                );
            case 3:
                return <ActivityStepThree link={link} setLink={setLink} />;
            case 4:
                return (
                    <ActivityStepFour
                        description={description}
                        setDescription={setDescription}
                    />
                );
            default:
                return null;
        }
    };

    // Render du picker iOS
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
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                {/* Header */}
                <AddActivityHeader
                    onBackPress={() => navigation.goBack()}
                    onSavePress={handleSave}
                    activityName={activityName}
                    isEditing={isEditing}
                />

                {/* Progress Bar */}
                <AddActivityProgressBar
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                />

                {/* Contenu des étapes */}
                <ScrollView
                    style={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollViewContent}
                >
                    {renderStepContent()}
                </ScrollView>

                {/* Footer avec navigation */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.footerButton,
                            currentStep === 1 && styles.footerButtonDisabled,
                        ]}
                        onPress={handlePrevious}
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
                        onPress={handleNext}
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

            {/* Modals */}
            <ActivityTypeModal
                visible={showTypeModal}
                selectedType={selectedType}
                onClose={() => setShowTypeModal(false)}
                onSelectType={setSelectedType}
            />

            {/* Pickers iOS */}
            {renderIOSPicker(showDatePicker, "date", handleDateChange)}
            {renderIOSPicker(
                showStartTimePicker,
                "time",
                handleStartTimeChange
            )}
            {renderIOSPicker(showEndTimePicker, "time", handleEndTimeChange)}

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
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        padding: 20,
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
    // Modal styles
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
        height: 200,
    },
});

export default AddActivityScreen;
