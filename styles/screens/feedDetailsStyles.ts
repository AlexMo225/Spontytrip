import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "../../constants";
import { TextStyles } from "../../constants";

const { width, height } = Dimensions.get("window");

export const useFeedDetailsScreenStyle = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.white,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        header: {
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: Colors.white,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
            flexDirection: "row",
            alignItems: "center",
        },
        headerTitle: {
            fontSize: 20,
            fontFamily: TextStyles.heading.family,
            fontWeight: "600",
            color: Colors.textPrimary,
            marginLeft: 12,
        },
        activityList: {
            flex: 1,
            paddingHorizontal: 20,
        },
        activityItem: {
            flexDirection: "row",
            marginBottom: 24,
        },
        timelineContainer: {
            alignItems: "center",
            width: 40,
        },
        timelineIcon: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 8,
        },
        timelineLine: {
            width: 2,
            flex: 1,
            backgroundColor: Colors.border,
            marginTop: -8,
        },
        activityContent: {
            flex: 1,
            marginLeft: 12,
            backgroundColor: Colors.backgroundLight,
            borderRadius: 12,
            padding: 16,
        },
        activityDescription: {
            fontSize: 14,
            color: Colors.textPrimary,
            marginBottom: 8,
            lineHeight: 20,
        },
        activityMeta: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        activityTime: {
            fontSize: 12,
            color: Colors.textSecondary,
        },
        actionBadge: {
            backgroundColor: Colors.primary + "20",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        actionBadgeText: {
            fontSize: 10,
            color: Colors.primary,
            fontWeight: "600",
        },
        emptyState: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
        },
        emptyIconContainer: {
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: Colors.backgroundLight,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
        },
        emptyTitle: {
            fontSize: 20,
            fontFamily: TextStyles.heading.family,
            fontWeight: "600",
            color: Colors.textPrimary,
            marginBottom: 8,
            textAlign: "center",
        },
        emptySubtitle: {
            fontSize: 14,
            color: Colors.textSecondary,
            textAlign: "center",
            lineHeight: 20,
        },
    });
};
