import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Fonts } from "../../constants/Fonts";
import { DayGroup } from "../../hooks/useActivities";
import { TripActivity } from "../../services/firebaseService";
import { ActivityCard } from "./ActivityCard";

interface ActivityTimelineProps {
    groupedActivities: DayGroup[];
    trip: any;
    user: any;
    topActivity: TripActivity | null;
    animatedValues: React.MutableRefObject<{ [key: string]: any }>;
    voteAnimations: React.MutableRefObject<{ [key: string]: any }>;
    onActivityPress: (activity: TripActivity) => void;
    onVote: (activityId: string, currentlyVoted: boolean) => void;
    onValidate: (activityId: string, validated: boolean) => void;
    onEdit?: (activity: TripActivity) => void;
    onDelete?: (activityId: string) => void;
    getStatusColor: (status?: string) => string;
}

/**
 * 📅 Composant timeline d'activités groupées par jour
 */
export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
    groupedActivities,
    trip,
    user,
    topActivity,
    animatedValues,
    voteAnimations,
    onActivityPress,
    onVote,
    onValidate,
    onEdit,
    onDelete,
    getStatusColor,
}) => {
    const renderDayGroup = (group: DayGroup) => (
        <View key={group.dateObj.getTime()} style={styles.dayGroup}>
            {/* Header du jour */}
            <View
                style={[
                    styles.dayHeader,
                    group.isToday && styles.dayHeaderToday,
                    group.isPast && styles.dayHeaderPast,
                ]}
            >
                <View style={styles.dayHeaderContent}>
                    {/* Badge de jour */}
                    <View
                        style={[
                            styles.dayBadge,
                            group.isToday && styles.dayBadgeToday,
                            group.isPast && styles.dayBadgePast,
                        ]}
                    >
                        <Ionicons
                            name={
                                group.isToday
                                    ? "today-outline"
                                    : group.isPast
                                    ? "checkmark-circle-outline"
                                    : "calendar-outline"
                            }
                            size={18}
                            color="#FFFFFF"
                        />
                    </View>

                    {/* Titre du jour */}
                    <View style={styles.dayInfo}>
                        <Text
                            style={[
                                styles.dayTitle,
                                group.isToday && styles.dayTitleToday,
                                group.isPast && styles.dayTitlePast,
                            ]}
                        >
                            {group.isToday ? "Aujourd'hui" : group.date}
                        </Text>
                        <Text style={styles.daySubtitle}>
                            {group.activities.length} activité
                            {group.activities.length > 1 ? "s" : ""}
                        </Text>
                    </View>
                </View>

                {/* Statistiques du jour */}
                <View style={styles.dayStats}>
                    <View style={styles.dayStat}>
                        <Ionicons
                            name="heart"
                            size={14}
                            color={group.isToday ? "#4DA1A9" : "#64748B"}
                        />
                        <Text
                            style={[
                                styles.dayStatText,
                                group.isToday && styles.dayStatTextToday,
                            ]}
                        >
                            {group.activities.reduce(
                                (total, activity) =>
                                    total + (activity.votes?.length || 0),
                                0
                            )}
                        </Text>
                    </View>
                    <View style={styles.dayStat}>
                        <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color={group.isToday ? "#4DA1A9" : "#64748B"}
                        />
                        <Text
                            style={[
                                styles.dayStatText,
                                group.isToday && styles.dayStatTextToday,
                            ]}
                        >
                            {group.activities.filter((a) => a.validated).length}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Liste des activités du jour */}
            <View style={styles.dayActivities}>
                {group.activities.map((activity) => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        trip={trip}
                        user={user}
                        topActivity={topActivity}
                        animatedValues={animatedValues}
                        voteAnimations={voteAnimations}
                        onPress={onActivityPress}
                        onVote={onVote}
                        onValidate={onValidate}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        getStatusColor={getStatusColor}
                    />
                ))}
            </View>
        </View>
    );

    return (
        <View style={styles.timelineContainer}>
            {groupedActivities.map(renderDayGroup)}
        </View>
    );
};

const styles = StyleSheet.create({
    timelineContainer: {
        paddingBottom: 20,
    },
    dayGroup: {
        marginBottom: 32,
    },
    dayHeader: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    dayHeaderToday: {
        borderColor: "#4DA1A9",
        borderWidth: 2,
        shadowColor: "#4DA1A9",
        shadowOpacity: 0.15,
    },
    dayHeaderPast: {
        backgroundColor: "#F8FAFC",
        opacity: 0.9,
    },
    dayHeaderContent: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    dayBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#94A3B8",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    dayBadgeToday: {
        backgroundColor: "#4DA1A9",
        shadowColor: "#4DA1A9",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    dayBadgePast: {
        backgroundColor: "#94A3B8",
    },
    dayInfo: {
        flex: 1,
    },
    dayTitle: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
        textTransform: "capitalize",
    },
    dayTitleToday: {
        color: "#4DA1A9",
    },
    dayTitlePast: {
        color: "#64748B",
    },
    daySubtitle: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: "#64748B",
    },
    dayStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    dayStat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dayStatText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#64748B",
    },
    dayStatTextToday: {
        color: "#4DA1A9",
    },
    dayActivities: {
        gap: 0, // Les ActivityCard ont déjà leur margin
    },
});
