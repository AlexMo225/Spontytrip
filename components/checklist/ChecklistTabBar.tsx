import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { AssignmentStats, TabType } from "../../hooks/useChecklist";

interface ChecklistTabBarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    assignmentStats: AssignmentStats;
    myTasksCount: number;
}

/**
 * 📋 Barre d'onglets pour la checklist
 */
export const ChecklistTabBar: React.FC<ChecklistTabBarProps> = ({
    activeTab,
    onTabChange,
    assignmentStats,
    myTasksCount,
}) => {
    return (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tab, activeTab === "list" && styles.activeTab]}
                onPress={() => onTabChange("list")}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "list" && styles.activeTabText,
                    ]}
                >
                    📋 Liste
                </Text>
                {assignmentStats.totalTasks > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {assignmentStats.completedTasks}/
                            {assignmentStats.totalTasks}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === "assignment" && styles.activeTab,
                ]}
                onPress={() => onTabChange("assignment")}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "assignment" && styles.activeTabText,
                    ]}
                >
                    👥 Répartition
                </Text>
                {assignmentStats.unassignedTasks > 0 && (
                    <View style={[styles.badge, styles.warningBadge]}>
                        <Text style={styles.badgeText}>
                            {assignmentStats.unassignedTasks}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === "myTasks" && styles.activeTab,
                ]}
                onPress={() => onTabChange("myTasks")}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "myTasks" && styles.activeTabText,
                    ]}
                >
                    🙋‍♂️ Mes tâches
                </Text>
                {myTasksCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{myTasksCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: "row",
        backgroundColor: Colors.backgroundColors.secondary,
        borderRadius: 12,
        padding: 4,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    activeTab: {
        backgroundColor: Colors.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text.secondary,
        textAlign: "center",
    },
    activeTabText: {
        color: Colors.text.primary,
    },
    badge: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 6,
        minWidth: 20,
        alignItems: "center",
    },
    warningBadge: {
        backgroundColor: Colors.warning,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.white,
    },
});
