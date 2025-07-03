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
                <View style={styles.tabContent}>
                    <Text style={styles.tabIcon}>📋</Text>
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "list" && styles.activeTabText,
                        ]}
                    >
                        Liste
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === "assignment" && styles.activeTab,
                ]}
                onPress={() => onTabChange("assignment")}
            >
                <View style={styles.tabContent}>
                    <Text style={styles.tabIcon}>👥</Text>
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "assignment" && styles.activeTabText,
                        ]}
                    >
                        Répartition
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === "myTasks" && styles.activeTab,
                ]}
                onPress={() => onTabChange("myTasks")}
            >
                <View style={styles.tabContent}>
                    <Text style={styles.tabIcon}>👤</Text>
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "myTasks" && styles.activeTabText,
                        ]}
                    >
                        Mes Tâches
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: "row",
        backgroundColor: Colors.backgroundColors.secondary,
        borderRadius: 16,
        padding: 6,
        marginHorizontal: 16,
        marginBottom: 16,
        marginTop: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    activeTab: {
        backgroundColor: Colors.checklistGreen,
        shadowColor: Colors.checklistGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    tabContent: {
        alignItems: "center",
        justifyContent: "center",
    },
    tabIcon: {
        fontSize: 18,
        marginBottom: 4,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text.secondary,
        textAlign: "center",
    },
    activeTabText: {
        color: Colors.white,
        fontWeight: "700",
    },
});
