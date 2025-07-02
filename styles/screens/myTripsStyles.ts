import { Dimensions, Platform, StyleSheet } from "react-native";
import { Colors, Spacing, TextStyles } from "../../constants";

const screenWidth = Dimensions.get("window").width;

export const useMyTripsScreenStyle = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.lightGray,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: Spacing.large,
            paddingVertical: Spacing.medium,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
            backgroundColor: Colors.white,
        },
        headerTitle: {
            fontSize: 24,
            fontFamily: TextStyles.heading.family,
            fontWeight: "600",
            color: Colors.textPrimary,
        },
        addButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.secondary + "10",
            justifyContent: "center",
            alignItems: "center",
        },
        tabsContainer: {
            flexDirection: "row",
            paddingHorizontal: Spacing.large,
            paddingVertical: Spacing.medium,
            backgroundColor: Colors.white,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        tab: {
            flex: 1,
            paddingVertical: Spacing.small,
            alignItems: "center",
            borderBottomWidth: 2,
            borderBottomColor: "transparent",
        },
        activeTab: {
            borderBottomColor: Colors.primary,
        },
        tabText: {
            fontSize: 16,
            color: Colors.textSecondary,
            fontWeight: "500",
        },
        activeTabText: {
            color: Colors.primary,
            fontWeight: "600",
        },
        tripsContainer: {
            flex: 1,
        },
        tripsContentContainer: {
            alignItems: "center",
            paddingTop: Spacing.medium,
            paddingBottom: Spacing.large,
        },
        tripCard: {
            flexDirection: "row",
            backgroundColor: Colors.white,
            borderRadius: 16,
            marginBottom: Spacing.medium,
            padding: Spacing.medium,
            width: screenWidth * 0.8,
            borderWidth: 2,
            borderColor: "#7FBDC3",
            ...Platform.select({
                ios: {
                    shadowColor: Colors.cardShadow,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 4,
                },
            }),
        },
        tripInfo: {
            flex: 1,
            marginRight: Spacing.medium,
        },
        tripTitle: {
            fontSize: 18,
            fontFamily: TextStyles.heading.family,
            fontWeight: "600",
            color: Colors.textPrimary,
            marginBottom: Spacing.xsmall,
        },
        tripDestination: {
            fontSize: 14,
            color: Colors.textSecondary,
            marginBottom: Spacing.xsmall,
        },
        tripDates: {
            fontSize: 14,
            color: Colors.textSecondary,
            marginBottom: Spacing.small,
        },
        tripMetaContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        membersContainer: {
            flexDirection: "row",
            alignItems: "center",
        },
        membersText: {
            fontSize: 12,
            color: Colors.textSecondary,
            marginLeft: Spacing.xsmall,
        },
        statusBadge: {
            backgroundColor: Colors.primary + "20",
            paddingHorizontal: Spacing.small,
            paddingVertical: 4,
            borderRadius: 12,
        },
        statusText: {
            fontSize: 12,
            color: Colors.primary,
            fontWeight: "600",
        },
        tripImageContainer: {
            width: 80,
            height: 80,
            borderRadius: 12,
            overflow: "hidden",
        },
        tripImage: {
            width: "100%",
            height: "100%",
        },
        defaultImage: {
            backgroundColor: Colors.backgroundLight,
            justifyContent: "center",
            alignItems: "center",
        },
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        loadingText: {
            fontSize: 16,
            color: Colors.textSecondary,
            marginTop: Spacing.medium,
        },
        errorContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: Spacing.xlarge,
        },
        errorTitle: {
            fontSize: 20,
            fontFamily: TextStyles.heading.family,
            fontWeight: "600",
            color: Colors.textPrimary,
            marginTop: Spacing.medium,
            marginBottom: Spacing.small,
        },
        errorText: {
            fontSize: 16,
            color: Colors.textSecondary,
            textAlign: "center",
            marginBottom: Spacing.large,
        },
        retryButton: {
            backgroundColor: Colors.primary,
            paddingHorizontal: Spacing.large,
            paddingVertical: Spacing.medium,
            borderRadius: 12,
        },
        retryButtonText: {
            fontSize: 16,
            color: Colors.white,
            fontWeight: "600",
        },
        emptyContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: Spacing.xlarge,
        },
        emptyTitle: {
            fontSize: 20,
            fontFamily: TextStyles.heading.family,
            fontWeight: "600",
            color: Colors.textPrimary,
            marginTop: Spacing.medium,
            marginBottom: Spacing.small,
            textAlign: "center",
        },
        emptyText: {
            fontSize: 16,
            color: Colors.textSecondary,
            textAlign: "center",
            marginBottom: Spacing.large,
        },
        createButton: {
            backgroundColor: Colors.primary,
            paddingHorizontal: Spacing.large,
            paddingVertical: Spacing.medium,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
        },
        createButtonText: {
            fontSize: 16,
            color: Colors.white,
            fontWeight: "600",
            marginLeft: Spacing.small,
        },
    });
};
