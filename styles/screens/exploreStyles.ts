import { Dimensions, Platform, StyleSheet } from "react-native";
import { Colors } from "../../constants";

const screenWidth = Dimensions.get("window").width;

export const useExploreStyles = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.lightGray,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: Colors.white,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: "700",
            color: Colors.text.primary,
        },
        contentContainer: {
            paddingVertical: 16,
        },
        section: {
            marginBottom: 24,
            paddingHorizontal: 20,
        },
        sectionTitle: {
            fontSize: 22,
            fontWeight: "700",
            color: Colors.text.primary,
            marginBottom: 16,
            letterSpacing: -0.5,
        },
        // Currency Converter Styles
        currencyConverterCard: {
            backgroundColor: Colors.white,
            borderRadius: 16,
            padding: 24,
            width: screenWidth - 40, // 20px padding on each side
            alignSelf: "center",
            ...Platform.select({
                ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                },
                android: {
                    elevation: 8,
                },
            }),
        },
        currencyHeader: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
        },
        currencyIconContainer: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#E5F6F8",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
        },
        currencyInfo: {
            flex: 1,
        },
        currencyTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: Colors.text.primary,
            marginBottom: 6,
            letterSpacing: -0.5,
        },
        currencySubtitle: {
            fontSize: 15,
            color: Colors.text.secondary,
            lineHeight: 20,
        },
        // Weather Styles
        weatherList: {
            paddingRight: 20,
        },
        realWeatherCard: {
            backgroundColor: Colors.white,
            borderRadius: 16,
            padding: 16,
            marginLeft: 16,
            width: screenWidth * 0.7,
            ...Platform.select({
                ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 4,
                },
            }),
        },
        realWeatherHeader: {
            marginBottom: 12,
        },
        realWeatherCity: {
            fontSize: 18,
            fontWeight: "700",
            color: Colors.text.primary,
            marginBottom: 4,
        },
        realWeatherCountry: {
            fontSize: 14,
            color: Colors.text.secondary,
        },
        realWeatherMain: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
        },
        realWeatherIcon: {
            fontSize: 36,
        },
        realWeatherTemp: {
            fontSize: 32,
            fontWeight: "700",
            color: Colors.text.primary,
        },
        realWeatherCondition: {
            fontSize: 16,
            color: Colors.text.primary,
            marginBottom: 12,
        },
        realWeatherDetails: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
        realWeatherDetail: {
            fontSize: 14,
            color: Colors.text.secondary,
        },
        loader: {
            marginVertical: 20,
        },
    });
};
