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
import { Colors } from "../constants";
import { useExploreStyles  } from "../styles/screens";
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

    const styles = useExploreStyles();

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

export default ExploreScreen;
