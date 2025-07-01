import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TripStats } from "../../hooks/useTripDetails";
import { TripNote } from "../../services/firebaseService";

interface TripDetailsStatsProps {
    tripStats: TripStats;
    tripNotes: TripNote[];
    onNavigateToFeature: (feature: string) => void;
}

export const TripDetailsStats: React.FC<TripDetailsStatsProps> = ({
    tripStats,
    tripNotes,
    onNavigateToFeature,
}) => {
    return (
        <View style={styles.statsContainer}>
            {/* Countdown Card */}
            <View style={styles.countdownCard}>
                <LinearGradient
                    colors={["#7ED957", "#4DA1A9"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.countdownGradient}
                >
                    <Text style={styles.countdownNumber}>
                        {tripStats.daysUntilTrip}
                    </Text>
                    <Text style={styles.countdownLabel}>jours restants</Text>
                    <Ionicons
                        name="time"
                        size={24}
                        color="#FFFFFF"
                        style={styles.countdownIcon}
                    />
                </LinearGradient>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                {/* Checklist Card */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Ionicons name="checkbox" size={20} color="#7ED957" />
                        <Text style={styles.statTitle}>Checklist</Text>
                    </View>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${tripStats.checklistProgress}%`,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {tripStats.checklistProgress}% terminé
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.quickActionButton,
                            styles.checklistButton,
                        ]}
                        onPress={() => onNavigateToFeature("Checklist")}
                    >
                        <Text style={styles.quickActionButtonText}>
                            Voir les tâches
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={14}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>

                {/* Expenses Card */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Ionicons name="wallet" size={20} color="#4DA1A9" />
                        <Text style={styles.statTitle}>Dépenses</Text>
                    </View>
                    <Text style={styles.statNumber}>
                        {tripStats.totalExpenses}€
                    </Text>
                    <Text style={styles.statSubtext}>
                        Mes dépenses: {tripStats.myExpenses}€
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.quickActionButton,
                            styles.expensesButton,
                        ]}
                        onPress={() => onNavigateToFeature("Expenses")}
                    >
                        <Text style={styles.quickActionButtonText}>
                            Gérer budget
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={14}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.statsGrid}>
                {/* Activities Card */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Ionicons name="calendar" size={20} color="#FF6B6B" />
                        <Text style={styles.statTitle}>Activités</Text>
                    </View>
                    <Text style={styles.statNumber}>
                        {tripStats.activitiesCount}
                    </Text>
                    <Text style={styles.statSubtext}>Planifiées</Text>
                    <TouchableOpacity
                        style={[
                            styles.quickActionButton,
                            styles.activitiesButton,
                        ]}
                        onPress={() => onNavigateToFeature("Activities")}
                    >
                        <Text style={styles.quickActionButtonText}>
                            Voir planning
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={14}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>

                {/* Notes Card */}
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Ionicons
                            name="document-text"
                            size={20}
                            color="#FFD93D"
                        />
                        <Text style={styles.statTitle}>Notes</Text>
                    </View>
                    {tripNotes && tripNotes.length > 0 ? (
                        <>
                            <Text style={styles.statNumber}>
                                {tripNotes.length}
                            </Text>
                            <Text style={styles.statSubtext}>
                                Mis à jour {tripStats.notesUpdated}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.statLabel}>Aucune note</Text>
                            <Text style={styles.statSubtext}>
                                Commencez à noter !
                            </Text>
                        </>
                    )}
                    <TouchableOpacity
                        style={[styles.quickActionButton, styles.notesButton]}
                        onPress={() => onNavigateToFeature("Notes")}
                    >
                        <Text style={styles.notesButtonText}>
                            {tripNotes && tripNotes.length > 0
                                ? "Modifier"
                                : "Créer"}
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={14}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    statsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 16,
    },

    // Countdown Card
    countdownCard: {
        borderRadius: 20,
        overflow: "hidden",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    countdownGradient: {
        padding: 24,
        alignItems: "center",
        position: "relative",
    },
    countdownNumber: {
        fontSize: 48,
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    countdownLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "rgba(255,255,255,0.9)",
    },
    countdownIcon: {
        position: "absolute",
        top: 16,
        right: 16,
    },

    // Stats Grid
    statsGrid: {
        flexDirection: "row",
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    statHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    statTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2D3748",
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "700",
        color: "#2D3748",
        marginBottom: 4,
    },
    statSubtext: {
        fontSize: 12,
        color: "#64748B",
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#94A3B8",
        marginBottom: 4,
    },

    // Progress Bar
    progressContainer: {
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: "#E2E8F0",
        borderRadius: 3,
        overflow: "hidden",
        marginBottom: 6,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#7ED957",
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#7ED957",
    },

    // Quick Action Buttons
    quickActionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        gap: 4,
    },
    quickActionButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    checklistButton: {
        backgroundColor: "#7ED957",
    },
    expensesButton: {
        backgroundColor: "#4DA1A9",
    },
    activitiesButton: {
        backgroundColor: "#FF6B6B",
    },
    notesButton: {
        backgroundColor: "#FFD93D",
    },
    notesButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
