import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { AssignmentStats } from "../../hooks/useChecklist";

interface ChecklistStatsHeaderProps {
    assignmentStats: AssignmentStats;
    myTasksCount: number;
}

export const ChecklistStatsHeader: React.FC<ChecklistStatsHeaderProps> = ({
    assignmentStats,
    myTasksCount,
}) => {
    return (
        <View style={styles.container}>
            {/* Cartes statistiques */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {assignmentStats.progressPercentage}%
                    </Text>
                    <Text style={styles.statLabel}>Terminé</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {myTasksCount}
                    </Text>
                    <Text style={styles.statLabel}>Mes tâches</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {assignmentStats.assignedTasks}
                    </Text>
                    <Text style={styles.statLabel}>Assignées</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {assignmentStats.unassignedTasks}
                    </Text>
                    <Text style={styles.statLabel}>Libres</Text>
                </View>
            </View>

            {/* Ligne de progression */}
            <View style={styles.progressSection}>
                <Text style={styles.progressText}>
                    {assignmentStats.progressPercentage}% terminé 💪
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundColors.primary,
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 32,
        fontWeight: "800",
        color: Colors.text.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text.secondary,
        textAlign: "center",
    },
    progressSection: {
        alignItems: "center",
        marginBottom: 8,
    },
    progressText: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text.secondary,
        textAlign: "center",
    },
});
