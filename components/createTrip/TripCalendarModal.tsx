import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { SelectedDates, SelectionStep } from "../../hooks/useCreateTripForm";

// Configuration française pour les calendriers
LocaleConfig.locales["fr"] = {
    monthNames: [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
    ],
    monthNamesShort: [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Jun",
        "Jul",
        "Aoû",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
    ],
    dayNames: [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
    ],
    dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = "fr";

interface TripCalendarModalProps {
    showCalendar: boolean;
    setShowCalendar: (show: boolean) => void;
    selectedDates: SelectedDates;
    selectionStep: SelectionStep;
    markedDates: any;
    currentMonthOffset: number;
    handleDateSelect: (day: any) => void;
    handleConfirmDates: () => void;
    resetSelection: () => void;
    getCurrentDate: () => Date;
    getNextMonthDate: () => Date;
    canGoPrevious: () => boolean;
    canGoNext: () => boolean;
    handlePreviousMonths: () => void;
    handleNextMonths: () => void;
}

export const TripCalendarModal: React.FC<TripCalendarModalProps> = ({
    showCalendar,
    setShowCalendar,
    selectedDates,
    selectionStep,
    markedDates,
    currentMonthOffset,
    handleDateSelect,
    handleConfirmDates,
    resetSelection,
    getCurrentDate,
    getNextMonthDate,
    canGoPrevious,
    canGoNext,
    handlePreviousMonths,
    handleNextMonths,
}) => {
    const getStepText = () => {
        if (selectionStep === "start") {
            return "Sélectionnez la date de début";
        }
        if (selectedDates.startDate && !selectedDates.endDate) {
            return "Sélectionnez la date de fin";
        }
        return "Dates sélectionnées";
    };

    return (
        <Modal
            visible={showCalendar}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={() => setShowCalendar(false)}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
            <View style={styles.calendarModal}>
                {/* Header */}
                <View style={styles.calendarHeader}>
                    <TouchableOpacity
                        style={styles.calendarCloseButton}
                        onPress={() => setShowCalendar(false)}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.calendarHeaderTitle}>
                        {getStepText()}
                    </Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Navigation des mois */}
                <View style={styles.monthNavigation}>
                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            !canGoPrevious() && styles.navButtonDisabled,
                        ]}
                        onPress={handlePreviousMonths}
                        disabled={!canGoPrevious()}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={24}
                            color={canGoPrevious() ? "#4DA1A9" : "#C0C0C0"}
                        />
                        <Text
                            style={[
                                styles.navButtonText,
                                !canGoPrevious() &&
                                    styles.navButtonTextDisabled,
                            ]}
                        >
                            Précédent
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            !canGoNext() && styles.navButtonDisabled,
                        ]}
                        onPress={handleNextMonths}
                        disabled={!canGoNext()}
                    >
                        <Text
                            style={[
                                styles.navButtonText,
                                !canGoNext() && styles.navButtonTextDisabled,
                            ]}
                        >
                            Suivant
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color={canGoNext() ? "#4DA1A9" : "#C0C0C0"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Calendriers */}
                <ScrollView
                    style={styles.calendarContainer}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* Premier calendrier */}
                    <Calendar
                        key={`${currentMonthOffset}-current`}
                        onDayPress={handleDateSelect}
                        markedDates={markedDates}
                        markingType="period"
                        minDate={new Date().toISOString().split("T")[0]}
                        current={getCurrentDate().toISOString().split("T")[0]}
                        theme={calendarTheme}
                        style={[styles.calendar, { marginTop: 12 }]}
                        hideExtraDays={true}
                        firstDay={1}
                        hideDayNames={false}
                        enableSwipeMonths={false}
                        disableMonthChange={true}
                    />

                    {/* Deuxième calendrier */}
                    <Calendar
                        key={`${currentMonthOffset}-next`}
                        onDayPress={handleDateSelect}
                        markedDates={markedDates}
                        markingType="period"
                        minDate={new Date().toISOString().split("T")[0]}
                        current={getNextMonthDate().toISOString().split("T")[0]}
                        theme={calendarTheme}
                        style={[styles.calendar, { marginTop: 16 }]}
                        hideExtraDays={true}
                        firstDay={1}
                        hideDayNames={false}
                        enableSwipeMonths={false}
                        disableMonthChange={true}
                    />

                    <View style={styles.bottomPadding} />
                </ScrollView>

                {/* Footer avec actions */}
                <View style={styles.calendarFooter}>
                    <View style={styles.calendarActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={resetSelection}
                        >
                            <Text style={styles.cancelButtonText}>
                                Réinitialiser
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                (!selectedDates.startDate ||
                                    !selectedDates.endDate) &&
                                    styles.confirmButtonDisabled,
                            ]}
                            onPress={handleConfirmDates}
                            disabled={
                                !selectedDates.startDate ||
                                !selectedDates.endDate
                            }
                        >
                            <Text
                                style={[
                                    styles.confirmButtonText,
                                    (!selectedDates.startDate ||
                                        !selectedDates.endDate) &&
                                        styles.confirmButtonTextDisabled,
                                ]}
                            >
                                Confirmer
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const calendarTheme = {
    backgroundColor: "#FFFFFF",
    calendarBackground: "#FFFFFF",
    textSectionTitleColor: "#1A1A1A",
    selectedDayBackgroundColor: "#4CAF50",
    selectedDayTextColor: "#FFFFFF",
    todayTextColor: "#4CAF50",
    dayTextColor: "#1A1A1A",
    textDisabledColor: "#C0C0C0",
    arrowColor: "#1A1A1A",
    disabledArrowColor: "#C0C0C0",
    monthTextColor: "#1A1A1A",
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 13,
    textDayFontWeight: 600 as const,
    textMonthFontWeight: 700 as const,
    textDayHeaderFontWeight: 600 as const,
};

const styles = StyleSheet.create({
    calendarModal: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    calendarHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    calendarCloseButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: 22,
    },
    calendarHeaderTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "600",
        color: "#1A1A1A",
        textAlign: "center",
    },
    headerSpacer: {
        width: 44,
    },
    monthNavigation: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: "#F8F9FA",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    navButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DBE0E5",
    },
    navButtonDisabled: {
        backgroundColor: "#F8F9FA",
        borderColor: "#E5E5E5",
    },
    navButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#4DA1A9",
    },
    navButtonTextDisabled: {
        color: "#C0C0C0",
    },
    calendarContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
    },
    calendar: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingBottom: 8,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    bottomPadding: {
        height: 20,
    },
    calendarFooter: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        paddingBottom: 40,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    calendarActions: {
        flexDirection: "row",
        gap: 16,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E5E5E5",
    },
    cancelButtonText: {
        fontSize: 16,
        color: "#1A1A1A",
        fontWeight: "600",
    },
    confirmButton: {
        flex: 2,
        backgroundColor: "#4CAF50",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmButtonDisabled: {
        backgroundColor: "#E5E5E5",
        shadowOpacity: 0,
        elevation: 0,
    },
    confirmButtonText: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    confirmButtonTextDisabled: {
        color: "#999",
    },
});
