import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getPopularDestinations, PopularDestination } from "../api/countries";
import { getPopularCitiesWeather, LocationWeather } from "../api/openmeteo";
import {
    FormattedPlace,
    getNearbyPlaces,
    popularCategories,
} from "../api/places";

import CurrencyConverterModal from "../components/CurrencyConverterModal";
import { Colors } from "../constants/Colors";
import { Fonts } from "../constants/Fonts";
import { Spacing } from "../constants/Spacing";
import { MainTabParamList } from "../types";

type ExploreScreenNavigationProp = BottomTabNavigationProp<
    MainTabParamList,
    "Explore"
>;

interface Props {
    navigation: ExploreScreenNavigationProp;
}

const ExploreScreen: React.FC<Props> = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);

    // Nouvelles APIs
    const [realWeatherData, setRealWeatherData] = useState<LocationWeather[]>(
        []
    );
    const [popularDestinations, setPopularDestinations] = useState<
        PopularDestination[]
    >([]);
    const [nearbyPlaces, setNearbyPlaces] = useState<{
        [category: string]: FormattedPlace[];
    }>({});
    const [realWeatherLoading, setRealWeatherLoading] = useState(false);
    const [destinationsApiLoading, setDestinationsApiLoading] = useState(false);
    const [placesLoading, setPlacesLoading] = useState(false);

    // Charger les données des nouvelles APIs
    useEffect(() => {
        loadRealWeatherData();
        loadPopularDestinations();
        loadNearbyPlaces();
    }, []);

    const loadRealWeatherData = async () => {
        setRealWeatherLoading(true);
        try {
            const weather = await getPopularCitiesWeather();
            setRealWeatherData(weather);
        } catch (error) {
            console.error("Erreur lors du chargement de la météo:", error);
        } finally {
            setRealWeatherLoading(false);
        }
    };

    const loadPopularDestinations = async () => {
        setDestinationsApiLoading(true);
        try {
            const destinations = await getPopularDestinations();
            setPopularDestinations(destinations);
        } catch (error) {
            console.error("Erreur lors du chargement des destinations:", error);
        } finally {
            setDestinationsApiLoading(false);
        }
    };

    const loadNearbyPlaces = async () => {
        setPlacesLoading(true);
        try {
            // Paris par défaut pour l'exemple
            const places = await getNearbyPlaces(48.8566, 2.3522, [
                "accommodation",
                "catering.restaurant",
                "tourism.attraction",
            ]);
            setNearbyPlaces(places);
        } catch (error) {
            console.error("Erreur lors du chargement des lieux:", error);
        } finally {
            setPlacesLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            loadRealWeatherData(),
            loadPopularDestinations(),
            loadNearbyPlaces(),
        ]);
        setRefreshing(false);
    };

    // Nouveaux composants de rendu pour les APIs
    const renderRealWeatherCard = ({ item }: { item: LocationWeather }) => (
        <TouchableOpacity style={styles.realWeatherCard}>
            <View style={styles.realWeatherHeader}>
                <Text style={styles.realWeatherCity}>{item.city}</Text>
                <Text style={styles.realWeatherCountry}>{item.country}</Text>
            </View>
            <View style={styles.realWeatherMain}>
                <Text style={styles.realWeatherIcon}>{item.current.icon}</Text>
                <Text style={styles.realWeatherTemp}>
                    {item.current.temperature}°C
                </Text>
            </View>
            <Text style={styles.realWeatherCondition}>
                {item.current.condition}
            </Text>
            <View style={styles.realWeatherDetails}>
                <Text style={styles.realWeatherDetail}>
                    💧 {item.current.humidity}%
                </Text>
                <Text style={styles.realWeatherDetail}>
                    💨 {item.current.windSpeed} km/h
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderPopularDestination = ({
        item,
    }: {
        item: PopularDestination;
    }) => (
        <TouchableOpacity style={styles.popularDestCard}>
            <View style={styles.destHeader}>
                <Image source={{ uri: item.flag }} style={styles.countryFlag} />
                <View style={styles.destInfo}>
                    <Text style={styles.destCountry}>{item.country}</Text>
                    <Text style={styles.destCapital}>{item.capital}</Text>
                </View>
                <View style={styles.budgetBadge}>
                    <Text style={styles.budgetText}>{item.budget}</Text>
                </View>
            </View>
            <Text style={styles.destDescription}>{item.description}</Text>
            <View style={styles.destDetails}>
                <Text style={styles.destDetail}>💰 {item.currency}</Text>
                <Text style={styles.destDetail}>🗣️ {item.language}</Text>
                <Text style={styles.destDetail}>📅 {item.bestTime}</Text>
            </View>
            <View style={styles.attractionsContainer}>
                <Text style={styles.attractionsTitle}>À voir:</Text>
                <View style={styles.attractionsList}>
                    {item.attractions.slice(0, 3).map((attraction, index) => (
                        <Text key={index} style={styles.attractionItem}>
                            • {attraction}
                        </Text>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderNearbyPlace = ({ item }: { item: FormattedPlace }) => (
        <TouchableOpacity style={styles.placeCard}>
            <View style={styles.placeHeader}>
                <Text style={styles.placeName}>{item.name}</Text>
                {item.rating && (
                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingStar}>⭐</Text>
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.placeCategory}>{item.category}</Text>
            <Text style={styles.placeAddress}>{item.address}</Text>
            {item.distance && (
                <Text style={styles.placeDistance}>
                    📍 {Math.round(item.distance)}m
                </Text>
            )}
            <View style={styles.placeFacilities}>
                {item.hasWifi && <Text style={styles.facility}>📶 WiFi</Text>}
                {item.isAccessible && (
                    <Text style={styles.facility}>♿ Accessible</Text>
                )}
                {item.priceLevel && (
                    <Text style={styles.facility}>💶 {item.priceLevel}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Explorer</Text>
                <TouchableOpacity style={styles.searchButton}>
                    <Ionicons
                        name="search-outline"
                        size={24}
                        color={Colors.text.primary}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                contentContainerStyle={styles.contentContainer}
            >
                <View>
                    {/* Currency Converter Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            💱 Convertisseur de devises
                        </Text>
                        <TouchableOpacity
                            style={styles.currencyConverterCard}
                            onPress={() => setShowCurrencyModal(true)}
                        >
                            <View style={styles.currencyHeader}>
                                <View style={styles.currencyIconContainer}>
                                    <Ionicons
                                        name="card-outline"
                                        size={32}
                                        color="#4DA1A9"
                                    />
                                </View>
                                <View style={styles.currencyInfo}>
                                    <Text style={styles.currencyTitle}>
                                        Convertisseur de devises
                                    </Text>
                                    <Text style={styles.currencySubtitle}>
                                        Convertissez facilement entre
                                        différentes monnaies
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={24}
                                    color="#4DA1A9"
                                />
                            </View>
                            <View style={styles.currencyExample}>
                                <Text style={styles.currencyExampleText}>
                                    1 EUR = 1.09 USD • 1.32 CAD • 0.87 GBP
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Météo Temps Réel Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            🌡️ Météo temps réel
                        </Text>
                        {realWeatherLoading ? (
                            <ActivityIndicator size="small" color="#4DA1A9" />
                        ) : (
                            <FlatList
                                data={realWeatherData}
                                renderItem={renderRealWeatherCard}
                                keyExtractor={(item) =>
                                    `${item.city}-${item.country}`
                                }
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.weatherContainer}
                            />
                        )}
                    </View>

                    {/* Destinations Populaires (API Countries) */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                🌍 Destinations populaires
                            </Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>Voir tout</Text>
                            </TouchableOpacity>
                        </View>
                        {destinationsApiLoading ? (
                            <ActivityIndicator size="small" color="#4DA1A9" />
                        ) : (
                            <FlatList
                                data={popularDestinations}
                                renderItem={renderPopularDestination}
                                keyExtractor={(item) => item.country}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={
                                    styles.destinationsContainer
                                }
                            />
                        )}
                    </View>

                    {/* Lieux à Proximité Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            📍 Lieux d'intérêt
                        </Text>
                        {placesLoading ? (
                            <ActivityIndicator size="small" color="#4DA1A9" />
                        ) : (
                            <>
                                {Object.entries(nearbyPlaces).map(
                                    ([category, places]) =>
                                        places.length > 0 && (
                                            <View
                                                key={category}
                                                style={{ marginBottom: 16 }}
                                            >
                                                <Text
                                                    style={
                                                        styles.placeCategoryTitle
                                                    }
                                                >
                                                    {popularCategories.find(
                                                        (cat) =>
                                                            cat.id === category
                                                    )?.icon || "📍"}{" "}
                                                    {popularCategories.find(
                                                        (cat) =>
                                                            cat.id === category
                                                    )?.name || category}
                                                </Text>
                                                <FlatList
                                                    data={places.slice(0, 3)}
                                                    renderItem={
                                                        renderNearbyPlace
                                                    }
                                                    keyExtractor={(item) =>
                                                        item.id
                                                    }
                                                    horizontal
                                                    showsHorizontalScrollIndicator={
                                                        false
                                                    }
                                                    contentContainerStyle={
                                                        styles.placesContainer
                                                    }
                                                />
                                            </View>
                                        )
                                )}
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Currency Converter Modal */}
            <CurrencyConverterModal
                visible={showCurrencyModal}
                onClose={() => setShowCurrencyModal(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColors.primary,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: Spacing.medium,
        paddingVertical: Spacing.large,
        paddingTop: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: Colors.text.primary,
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0F8F0",
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        paddingBottom: 32,
    },
    section: {
        marginBottom: 32,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 16,
        fontFamily: Fonts.body.family,
        fontWeight: "500",
        color: "#4DA1A9",
    },
    // Currency Converter Styles
    currencyConverterCard: {
        backgroundColor: Colors.backgroundColors.primary,
        borderRadius: 16,
        padding: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#4DA1A915",
    },
    currencyHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    currencyIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#4DA1A915",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    currencyInfo: {
        flex: 1,
    },
    currencyTitle: {
        fontSize: 18,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 4,
    },
    currencySubtitle: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: Colors.text.secondary,
        lineHeight: 20,
    },
    currencyExample: {
        backgroundColor: "#F8F9FA",
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    currencyExampleText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#4DA1A9",
        fontWeight: "500",
        textAlign: "center",
    },
    // Weather Styles
    weatherContainer: {
        paddingRight: 16,
    },
    weatherCard: {
        backgroundColor: Colors.backgroundColors.primary,
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        width: 140,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    weatherHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    weatherCity: {
        fontSize: 14,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    weatherTemp: {
        fontSize: 24,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: "#4DA1A9",
        marginBottom: 4,
    },
    weatherDesc: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
    },
    // Destinations Styles
    destinationsContainer: {
        paddingRight: 16,
    },
    destinationCard: {
        backgroundColor: Colors.backgroundColors.primary,
        borderRadius: 12,
        marginRight: 16,
        width: 240,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: "hidden",
    },
    destinationImage: {
        width: "100%",
        height: 140,
    },
    destinationContent: {
        padding: 12,
    },
    destinationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    destinationName: {
        fontSize: 16,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        flex: 1,
    },
    trendingBadge: {
        backgroundColor: "#FF6B6B",
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    trendingText: {
        fontSize: 10,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    destinationCountry: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginBottom: 6,
    },
    destinationDesc: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
        lineHeight: 16,
        marginBottom: 8,
    },
    destinationFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    destinationPrice: {
        fontSize: 14,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: "#4DA1A9",
    },
    destinationTime: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
    },

    // Nouveaux styles pour les APIs
    // Real Weather Styles
    realWeatherCard: {
        backgroundColor: Colors.backgroundColors.primary,
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        width: 160,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    realWeatherHeader: {
        marginBottom: 8,
    },
    realWeatherCity: {
        fontSize: 16,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    realWeatherCountry: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
    },
    realWeatherMain: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    realWeatherIcon: {
        fontSize: 32,
        marginRight: 8,
    },
    realWeatherTemp: {
        fontSize: 24,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: "#4DA1A9",
    },
    realWeatherCondition: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: Colors.text.primary,
        marginBottom: 8,
    },
    realWeatherDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    realWeatherDetail: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
    },
    // Popular Destinations Styles
    popularDestCard: {
        backgroundColor: Colors.backgroundColors.primary,
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        width: 280,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    destHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    countryFlag: {
        width: 32,
        height: 24,
        borderRadius: 4,
        marginRight: 12,
    },
    destInfo: {
        flex: 1,
    },
    destCountry: {
        fontSize: 16,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    destCapital: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
    },
    budgetBadge: {
        backgroundColor: "#7ED95715",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    budgetText: {
        fontSize: 10,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#7ED957",
    },
    destDescription: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        lineHeight: 20,
        marginBottom: 12,
    },
    destDetails: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 12,
    },
    destDetail: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginRight: 12,
        marginBottom: 4,
    },
    attractionsContainer: {
        marginTop: 8,
    },
    attractionsTitle: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 4,
    },
    attractionsList: {
        marginLeft: 8,
    },
    attractionItem: {
        fontSize: 11,
        fontFamily: Fonts.body.family,
        color: "#637887",
        lineHeight: 16,
    },
    // Places Styles
    placeCategoryTitle: {
        fontSize: 16,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    placesContainer: {
        paddingRight: 16,
    },
    placeCard: {
        backgroundColor: Colors.backgroundColors.primary,
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        width: 200,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    placeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    placeName: {
        fontSize: 14,
        fontFamily: Fonts.heading.family,
        fontWeight: "600",
        color: Colors.text.primary,
        flex: 1,
        marginRight: 8,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingStar: {
        fontSize: 12,
        marginRight: 2,
    },
    ratingText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#FF9500",
    },
    placeCategory: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#4DA1A9",
        marginBottom: 4,
    },
    placeAddress: {
        fontSize: 11,
        fontFamily: Fonts.body.family,
        color: "#637887",
        lineHeight: 16,
        marginBottom: 8,
    },
    placeDistance: {
        fontSize: 11,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginBottom: 8,
    },
    placeFacilities: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    facility: {
        fontSize: 10,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginRight: 8,
        marginBottom: 2,
    },
});

export default ExploreScreen;
