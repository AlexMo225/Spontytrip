import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Fonts } from "../../constants/Fonts";
import { TripActivity } from "../../services/firebaseService";

interface ActivityCardProps {
    activity: TripActivity;
    trip: any;
    user: any;
    topActivity: TripActivity | null;
    animatedValues: React.MutableRefObject<{ [key: string]: Animated.Value }>;
    voteAnimations: React.MutableRefObject<{ [key: string]: Animated.Value }>;
    onPress: (activity: TripActivity) => void;
    onVote: (activityId: string, currentlyVoted: boolean) => void;
    onValidate: (activityId: string, validated: boolean) => void;
    onEdit?: (activity: TripActivity) => void;
    onDelete?: (activityId: string) => void;
    getStatusColor: (status?: string) => string;
}

/**
 * 🎯 Composant carte d'activité moderne avec animations
 */
export const ActivityCard: React.FC<ActivityCardProps> = ({
    activity,
    trip,
    user,
    topActivity,
    animatedValues,
    voteAnimations,
    onPress,
    onVote,
    onValidate,
    onEdit,
    onDelete,
    getStatusColor,
}) => {
    // 🎨 Calculs visuels
    const animValue = animatedValues.current[activity.id];
    const canEdit =
        activity.createdBy === user?.uid || trip?.creatorId === user?.uid;
    const votes = activity.votes || [];
    const hasVoted = votes.includes(user?.uid || "");
    const voteCount = votes.length;
    const memberCount = trip?.members.length || 1;
    const votePercentage = (voteCount / memberCount) * 100;
    const isTopActivity = topActivity?.id === activity.id && voteCount > 0;
    const isCreator = trip?.creatorId === user?.uid;
    const voteAnim =
        voteAnimations.current[activity.id] || new Animated.Value(1);

    return (
        <TouchableOpacity
            key={activity.id}
            onPress={() => onPress(activity)}
            activeOpacity={0.8}
            style={styles.modernCardContainer}
        >
            <Animated.View
                style={[
                    styles.modernActivityCard,
                    {
                        transform: animValue ? [{ scale: animValue }] : [],
                        opacity: animValue || 1,
                    },
                ]}
            >
                {/* Header avec titre et badges */}
                <View style={styles.modernCardHeader}>
                    <View style={styles.modernTitleContainer}>
                        <Text
                            style={styles.modernActivityTitle}
                            numberOfLines={2}
                        >
                            {activity.title}
                        </Text>

                        {/* Badges */}
                        <View style={styles.modernBadgesContainer}>
                            {activity.status === "past" && (
                                <View
                                    style={[
                                        styles.modernStatusBadge,
                                        styles.pastBadge,
                                    ]}
                                >
                                    <Ionicons
                                        name="time-outline"
                                        size={10}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.modernBadgeText}>
                                        Passée
                                    </Text>
                                </View>
                            )}

                            {activity.validated && (
                                <View
                                    style={[
                                        styles.modernStatusBadge,
                                        styles.validatedBadge,
                                    ]}
                                >
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={10}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.modernBadgeText}>
                                        Validée
                                    </Text>
                                </View>
                            )}

                            {isTopActivity && (
                                <View style={styles.modernTopBadge}>
                                    <Ionicons
                                        name="star"
                                        size={12}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.modernTopBadgeText}>
                                        Top activité
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Informations */}
                    <View style={styles.modernInfoRow}>
                        {activity.startTime && (
                            <View style={styles.modernInfoItem}>
                                <Ionicons
                                    name="time-outline"
                                    size={14}
                                    color="#4DA1A9"
                                />
                                <Text style={styles.modernInfoText}>
                                    {activity.startTime}
                                    {activity.endTime &&
                                        ` - ${activity.endTime}`}
                                </Text>
                            </View>
                        )}

                        {activity.location && (
                            <View style={styles.modernInfoItem}>
                                <Ionicons
                                    name="location-outline"
                                    size={14}
                                    color="#4DA1A9"
                                />
                                <Text
                                    style={styles.modernInfoText}
                                    numberOfLines={1}
                                >
                                    {activity.location}
                                </Text>
                            </View>
                        )}

                        {activity.link && (
                            <View style={styles.modernInfoItem}>
                                <Ionicons
                                    name="link-outline"
                                    size={14}
                                    color="#4DA1A9"
                                />
                                <Text style={styles.modernInfoText}>
                                    Lien disponible
                                </Text>
                            </View>
                        )}
                    </View>

                    {activity.description && (
                        <Text
                            style={styles.modernDescription}
                            numberOfLines={2}
                        >
                            {activity.description}
                        </Text>
                    )}
                </View>

                {/* Section vote */}
                <View style={styles.modernVoteSection}>
                    <View style={styles.modernProgressContainer}>
                        <View style={styles.modernProgressBar}>
                            <Animated.View
                                style={[
                                    styles.modernProgressFill,
                                    {
                                        width: `${Math.min(
                                            votePercentage,
                                            100
                                        )}%`,
                                        transform: [{ scaleY: voteAnim }],
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.modernProgressText}>
                            {voteCount}/{memberCount} votes
                        </Text>
                    </View>

                    {/* Boutons d'action */}
                    <View style={styles.modernActionRow}>
                        <TouchableOpacity
                            style={[
                                styles.modernVoteButton,
                                hasVoted && styles.modernVoteButtonActive,
                            ]}
                            onPress={() => onVote(activity.id, hasVoted)}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={hasVoted ? "heart" : "heart-outline"}
                                size={16}
                                color={hasVoted ? "#FFFFFF" : "#4DA1A9"}
                            />
                            <Text
                                style={[
                                    styles.modernVoteButtonText,
                                    hasVoted &&
                                        styles.modernVoteButtonTextActive,
                                ]}
                            >
                                {hasVoted ? "Voté" : "Voter"}
                            </Text>
                        </TouchableOpacity>

                        {isCreator && (
                            <TouchableOpacity
                                style={[
                                    styles.modernValidateButton,
                                    activity.validated &&
                                        styles.modernValidateButtonActive,
                                ]}
                                onPress={() =>
                                    onValidate(activity.id, !activity.validated)
                                }
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={
                                        activity.validated
                                            ? "checkmark-circle"
                                            : "checkmark-circle-outline"
                                    }
                                    size={16}
                                    color={
                                        activity.validated
                                            ? "#FFFFFF"
                                            : "#7ED957"
                                    }
                                />
                                <Text
                                    style={[
                                        styles.modernValidateButtonText,
                                        activity.validated &&
                                            styles.modernValidateButtonTextActive,
                                    ]}
                                >
                                    {activity.validated ? "Validée" : "Valider"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.modernCardFooter}>
                    <Text style={styles.modernAuthorText}>
                        Par {activity.createdByName || "Inconnu"}
                    </Text>

                    {canEdit && (
                        <View style={styles.modernEditActions}>
                            <TouchableOpacity
                                style={styles.modernEditButton}
                                onPress={() => onEdit?.(activity)}
                            >
                                <Ionicons
                                    name="pencil-outline"
                                    size={16}
                                    color="#4DA1A9"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modernDeleteButton}
                                onPress={() => onDelete?.(activity.id)}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={16}
                                    color="#EF4444"
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    modernCardContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    modernActivityCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 0.5,
        borderColor: "#E2E8F0",
    },
    modernCardHeader: {
        marginBottom: 16,
    },
    modernTitleContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    modernActivityTitle: {
        fontSize: 18,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: "#1F2937",
        flex: 1,
        marginRight: 16,
        lineHeight: 24,
    },
    modernBadgesContainer: {
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6,
    },
    modernStatusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    pastBadge: {
        backgroundColor: "#94A3B8",
    },
    validatedBadge: {
        backgroundColor: "#7ED957",
    },
    modernBadgeText: {
        fontSize: 10,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#FFFFFF",
        textTransform: "uppercase",
    },
    modernTopBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "#FFD93D",
        gap: 4,
        shadowColor: "#FFD93D",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    modernTopBadgeText: {
        fontSize: 11,
        fontFamily: Fonts.body.family,
        fontWeight: "700",
        color: "#FFFFFF",
        textTransform: "uppercase",
    },
    modernInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 8,
    },
    modernInfoItem: {
        flexDirection: "row",
        alignItems: "center",
        flex: 0,
        minWidth: 0,
    },
    modernInfoText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: "#64748B",
        marginLeft: 8,
        flexShrink: 1,
    },
    modernDescription: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#64748B",
        lineHeight: 20,
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    modernVoteSection: {
        marginBottom: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    modernProgressContainer: {
        marginBottom: 16,
    },
    modernProgressBar: {
        height: 12,
        borderRadius: 6,
        backgroundColor: "#F1F5F9",
        overflow: "hidden",
        marginBottom: 8,
    },
    modernProgressFill: {
        height: "100%",
        backgroundColor: "#4DA1A9",
        borderRadius: 6,
        minWidth: 6,
    },
    modernProgressText: {
        fontSize: 13,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#64748B",
        textAlign: "center",
    },
    modernActionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    modernVoteButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#4DA1A9",
        minWidth: 100,
    },
    modernVoteButtonActive: {
        backgroundColor: "#4DA1A9",
    },
    modernVoteButtonText: {
        fontSize: 15,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
        marginLeft: 8,
    },
    modernVoteButtonTextActive: {
        color: "#FFFFFF",
    },
    modernValidateButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#7ED957",
        minWidth: 100,
    },
    modernValidateButtonActive: {
        backgroundColor: "#7ED957",
    },
    modernValidateButtonText: {
        fontSize: 15,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#7ED957",
        marginLeft: 8,
    },
    modernValidateButtonTextActive: {
        color: "#FFFFFF",
    },
    modernCardFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    modernAuthorText: {
        fontSize: 13,
        fontFamily: Fonts.body.family,
        color: "#94A3B8",
        fontStyle: "italic",
    },
    modernEditActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    modernEditButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#4DA1A9",
    },
    modernDeleteButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#EF4444",
    },
});
