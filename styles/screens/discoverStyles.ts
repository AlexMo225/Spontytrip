import { Dimensions, Platform, StyleSheet } from "react-native";
import { Colors } from "../../constants";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_PADDING = 16;
const CARD_GAP = 12;
const cardWidth = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

export const useDiscoverScreenStyle = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.lightGray,
        },
        header: {
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
            backgroundColor: Colors.white,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        headerTitle: {
            fontSize: 32,
            fontWeight: "700",
            color: "#1F2937",
            textAlign: "center",
            letterSpacing: -0.8,
        },
        filtersSection: {
            backgroundColor: "#FFFFFF",
            paddingBottom: 20,
        },
        filtersContainer: {
            paddingHorizontal: 16,
        },
        filterSeparator: {
            width: 10,
        },
        categoryButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: "#F8FAFC",
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            minHeight: 34,
            justifyContent: "center",
            alignItems: "center",
        },
        categoryButtonActive: {
            backgroundColor: "#7ED957",
            borderColor: "#7ED957",
        },
        categoryText: {
            fontSize: 13,
            fontWeight: "600",
            color: "#64748B",
            textAlign: "center",
        },
        categoryTextActive: {
            color: "#FFFFFF",
            fontWeight: "700",
        },
        gridList: {
            flex: 1,
            backgroundColor: Colors.lightGray,
        },
        gridContainer: {
            paddingHorizontal: CARD_PADDING,
            paddingTop: 4,
            paddingBottom: 40,
        },
        gridRow: {
            justifyContent: "space-between",
            marginBottom: 20,
        },
        cardWrapper: {
            width: cardWidth,
        },
        destinationCard: {
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            overflow: "hidden",
            // Ombres cross-platform
            ...Platform.select({
                ios: {
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                },
                android: {
                    elevation: 6,
                },
            }),
        },
        imageContainer: {
            width: "100%",
            height: 200,
            backgroundColor: "#F1F5F9",
        },
        destinationImage: {
            width: "100%",
            height: "100%",
        },
        cardContent: {
            padding: 16,
            backgroundColor: "#FFFFFF",
        },
        destinationName: {
            fontSize: 18,
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: 4,
            lineHeight: 22,
        },
        destinationCountry: {
            fontSize: 14,
            fontWeight: "500",
            color: "#6B7280",
            lineHeight: 18,
        },
    });
};
