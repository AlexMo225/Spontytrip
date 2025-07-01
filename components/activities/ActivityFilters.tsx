import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../../constants/Fonts";
import { FilterType, ViewMode } from "../../hooks/useActivities";
import { TripActivity } from "../../services/firebaseService";

interface ActivityFiltersProps {
    localActivities: TripActivity[];
    filterType: FilterType;
    setFilterType: (filter: FilterType) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    user: any;
}

/**
 * 🎛️ Composant de filtres et contrôles pour les activités
 */
export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
    localActivities,
    filterType,
    setFilterType,
    viewMode,
    setViewMode,
    user,
}) => {
    // 📊 Calcul des statistiques
    const totalActivities = localActivities.length;
    const validatedActivities = localActivities.filter(
        (a) => a.validated
    ).length;
    const myVotes = localActivities.filter((a) =>
        a.votes?.includes(user?.uid || "")
    ).length;
    const inProgressActivities = localActivities.filter(
        (a) => a.status === "in_progress"
    ).length;

    const renderPlanningStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{totalActivities}</Text>
                <Text style={styles.statLabel}>Activités</Text>
            </View>

            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{validatedActivities}</Text>
                <Text style={styles.statLabel}>Validées</Text>
            </View>

            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{myVotes}</Text>
                <Text style={styles.statLabel}>Mes votes</Text>
            </View>

            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{inProgressActivities}</Text>
                <Text style={styles.statLabel}>En cours</Text>
            </View>
        </View>
    );

    const renderFilterButtons = () => (
        <View style={styles.filtersContainer}>
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filterType === "all" && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilterType("all")}
                >
                    <Ionicons
                        name="grid-outline"
                        size={16}
                        color={filterType === "all" ? "#FFFFFF" : "#4DA1A9"}
                    />
                    <Text
                        style={[
                            styles.filterButtonText,
                            filterType === "all" &&
                                styles.filterButtonTextActive,
                        ]}
                    >
                        Toutes
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filterType === "validated" && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilterType("validated")}
                >
                    <Ionicons
                        name="checkmark-circle-outline"
                        size={16}
                        color={
                            filterType === "validated" ? "#FFFFFF" : "#4DA1A9"
                        }
                    />
                    <Text
                        style={[
                            styles.filterButtonText,
                            filterType === "validated" &&
                                styles.filterButtonTextActive,
                        ]}
                    >
                        Validées
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filterType === "pending" && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilterType("pending")}
                >
                    <Ionicons
                        name="time-outline"
                        size={16}
                        color={filterType === "pending" ? "#FFFFFF" : "#4DA1A9"}
                    />
                    <Text
                        style={[
                            styles.filterButtonText,
                            filterType === "pending" &&
                                styles.filterButtonTextActive,
                        ]}
                    >
                        En attente
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filterType === "past" && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilterType("past")}
                >
                    <Ionicons
                        name="archive-outline"
                        size={16}
                        color={filterType === "past" ? "#FFFFFF" : "#4DA1A9"}
                    />
                    <Text
                        style={[
                            styles.filterButtonText,
                            filterType === "past" &&
                                styles.filterButtonTextActive,
                        ]}
                    >
                        Passées
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderViewModeToggle = () => (
        <View style={styles.viewModeContainer}>
            <Text style={styles.viewModeLabel}>Affichage :</Text>
            <View style={styles.viewModeToggle}>
                <TouchableOpacity
                    style={[
                        styles.viewModeButton,
                        styles.viewModeButtonLeft,
                        viewMode === "timeline" && styles.viewModeButtonActive,
                    ]}
                    onPress={() => setViewMode("timeline")}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={viewMode === "timeline" ? "#FFFFFF" : "#4DA1A9"}
                    />
                    <Text
                        style={[
                            styles.viewModeButtonText,
                            viewMode === "timeline" &&
                                styles.viewModeButtonTextActive,
                        ]}
                    >
                        Timeline
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.viewModeButton,
                        styles.viewModeButtonRight,
                        viewMode === "list" && styles.viewModeButtonActive,
                    ]}
                    onPress={() => setViewMode("list")}
                >
                    <Ionicons
                        name="list-outline"
                        size={16}
                        color={viewMode === "list" ? "#FFFFFF" : "#4DA1A9"}
                    />
                    <Text
                        style={[
                            styles.viewModeButtonText,
                            viewMode === "list" &&
                                styles.viewModeButtonTextActive,
                        ]}
                    >
                        Liste
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <>
            {/* Statistiques */}
            {renderPlanningStats()}

            {/* Filtres */}
            {renderFilterButtons()}

            {/* Toggle de vue */}
            {renderViewModeToggle()}
        </>
    );
};

const styles = StyleSheet.create({
    // 📊 Styles des statistiques
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 0.5,
        borderColor: "#E2E8F0",
    },
    statNumber: {
        fontSize: 24,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: "#4DA1A9",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: "#64748B",
        textAlign: "center",
    },

    // 🎛️ Styles des filtres
    filtersContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#4DA1A9",
        flex: 1,
        justifyContent: "center",
        gap: 6,
    },
    filterButtonActive: {
        backgroundColor: "#4DA1A9",
        borderColor: "#4DA1A9",
    },
    filterButtonText: {
        fontSize: 13,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },
    filterButtonTextActive: {
        color: "#FFFFFF",
    },

    // 👁️ Styles du toggle de vue
    viewModeContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    viewModeLabel: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#1F2937",
    },
    viewModeToggle: {
        flexDirection: "row",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#4DA1A9",
    },
    viewModeButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#FFFFFF",
        gap: 8,
    },
    viewModeButtonLeft: {
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    viewModeButtonRight: {
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderLeftWidth: 1,
        borderLeftColor: "#4DA1A9",
    },
    viewModeButtonActive: {
        backgroundColor: "#4DA1A9",
    },
    viewModeButtonText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },
    viewModeButtonTextActive: {
        color: "#FFFFFF",
    },
});
