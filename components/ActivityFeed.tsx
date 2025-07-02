import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import type { ActivityLogEntry } from "../types";

interface ActivityFeedProps {
    activities: ActivityLogEntry[];
    maxItems?: number;
    showHeader?: boolean;
    tripId?: string; // Ajout du tripId pour la navigation
    onSeeAll?: () => void; // Callback pour la navigation
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
    activities,
    maxItems = 10,
    showHeader = true,
    tripId,
    onSeeAll,
}) => {
    // Formater le temps relatif (il y a X heures)
    const formatTimeAgo = (timestamp: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - timestamp.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) {
            return "À l'instant";
        } else if (diffMinutes < 60) {
            return `il y a ${diffMinutes} min`;
        } else if (diffHours < 24) {
            return `il y a ${diffHours}h`;
        } else if (diffDays === 1) {
            return "Hier";
        } else {
            return `il y a ${diffDays} jours`;
        }
    };

    const renderActivityItem = (activity: ActivityLogEntry, index: number) => (
        <View key={activity.id} style={styles.activityItem}>
            <View style={styles.timelineContainer}>
                <View
                    style={[
                        styles.activityIcon,
                        { backgroundColor: activity.color },
                    ]}
                >
                    <Ionicons
                        name={activity.icon as any}
                        size={16}
                        color="#FFFFFF"
                    />
                </View>
                {index < Math.min(activities.length, maxItems) - 1 && (
                    <View style={styles.connectionLine} />
                )}
            </View>

            <View style={styles.activityContent}>
                <Text style={styles.activityDescription} numberOfLines={2}>
                    {activity.description}
                </Text>
                <Text style={styles.activityTime}>
                    {formatTimeAgo(activity.timestamp)}
                </Text>
            </View>
        </View>
    );

    const displayedActivities = activities.slice(0, maxItems);

    if (displayedActivities.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>🔥 Feed Live</Text>
                <View style={styles.emptyState}>
                    <Ionicons name="time-outline" size={32} color="#94A3B8" />
                    <Text style={styles.emptyText}>
                        Aucune activité récente
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>🔥 Feed Live</Text>
            </View>

            <ScrollView
                style={styles.feedContainer}
                contentContainerStyle={styles.feedContentContainer}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
            >
                {displayedActivities.map(renderActivityItem)}
            </ScrollView>

            {activities.length > maxItems && onSeeAll && (
                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={onSeeAll}
                    activeOpacity={0.7}
                >
                    <Text style={styles.moreText}>
                        Voir {activities.length - maxItems} autres activités
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text.primary,
        letterSpacing: -0.5,
    },
    feedContainer: {
        maxHeight: 320,
    },
    feedContentContainer: {
        paddingRight: 8,
    },
    activityItem: {
        flexDirection: "row",
        marginBottom: 16,
    },
    timelineContainer: {
        width: 32,
        alignItems: "center",
        marginRight: 12,
    },
    activityIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    activityContent: {
        flex: 1,
        paddingTop: 4,
        backgroundColor: Colors.white,
    },
    activityDescription: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.text.primary,
        lineHeight: 20,
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
        fontWeight: "400",
        color: "#94A3B8",
    },
    connectionLine: {
        position: "absolute",
        width: 2,
        top: 32,
        bottom: -16,
        backgroundColor: "#E2E8F0",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#94A3B8",
        marginTop: 12,
        textAlign: "center",
    },
    moreButton: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    moreText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4DA1A9",
        textAlign: "center",
    },
});

export default ActivityFeed;
