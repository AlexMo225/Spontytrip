import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    RefreshControl,
    SafeAreaView,
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
import { Article, useTravelArticles as useRssArticles } from "../api/rss";
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
    const { articles, loading, error } = useRssArticles();
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
        });
    };

    const handleOpenArticle = async (url: string) => {
        try {
            await Linking.openURL(url);
        } catch (error) {
            console.error("Error opening URL:", error);
        }
    };

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

    const renderArticle = ({ item }: { item: Article }) => {
        const getCategoryIcon = (category?: string) => {
            switch (category) {
                case "destination":
                    return "🏝️";
                case "plage":
                    return "🏖️";
                case "roadtrip":
                    return "🚗";
                case "conseil":
                    return "💡";
                case "culture":
                    return "🎭";
                case "gastronomie":
                    return "🍜";
                case "aventure":
                    return "⛰️";
                case "actualité":
                    return "📰";
                default:
                    return "✈️";
            }
        };

        const getCategoryColor = (category?: string) => {
            switch (category) {
                case "destination":
                    return "#4DA1A9";
                case "plage":
                    return "#00BCD4";
                case "roadtrip":
                    return "#FF9500";
                case "conseil":
                    return "#7ED957";
                case "culture":
                    return "#9C27B0";
                case "gastronomie":
                    return "#FF5722";
                case "aventure":
                    return "#795548";
                case "actualité":
                    return "#607D8B";
                default:
                    return "#4DA1A9";
            }
        };

        return (
            <TouchableOpacity
                style={styles.articleCard}
                onPress={() => handleOpenArticle(item.link)}
            >
                {item.thumbnail && (
                    <Image
                        source={{ uri: item.thumbnail }}
                        style={styles.articleImage}
                        resizeMode="cover"
                    />
                )}
                <View style={styles.articleContent}>
                    <View style={styles.articleHeader}>
                        <View
                            style={[
                                styles.categoryBadge,
                                {
                                    backgroundColor:
                                        getCategoryColor(item.category) + "20",
                                },
                            ]}
                        >
                            <Text style={styles.categoryIcon}>
                                {getCategoryIcon(item.category)}
                            </Text>
                            <Text
                                style={[
                                    styles.categoryText,
                                    { color: getCategoryColor(item.category) },
                                ]}
                            >
                                {item.category?.toUpperCase() || "VOYAGE"}
                            </Text>
                        </View>
                        {item.readTime && (
                            <Text style={styles.readTime}>
                                📖 {item.readTime}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.articleTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={styles.articleSnippet} numberOfLines={3}>
                        {item.contentSnippet}
                    </Text>
                    <View style={styles.articleFooter}>
                        <View style={styles.articleMeta}>
                            <Text style={styles.articleDate}>
                                {formatDate(item.pubDate)}
                            </Text>
                            {item.author && (
                                <Text style={styles.articleAuthor}>
                                    par {item.author}
                                </Text>
                            )}
                        </View>
                        <View style={styles.readButton}>
                            <Text style={styles.readButtonText}>Lire</Text>
                            <Ionicons
                                name="arrow-forward"
                                size={14}
                                color="#4DA1A9"
                            />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
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

    const renderQuickAction = (
        icon: string,
        title: string,
        onPress: () => void,
        color: string
    ) => (
        <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: color + "15" }]}
            onPress={onPress}
        >
            <Ionicons name={icon as any} size={24} color={color} />
            <Text style={[styles.quickActionText, { color }]}>{title}</Text>
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

            <FlatList
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListHeaderComponent={
                    <View>
                        {/* Quick Actions */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                ⚡ Actions rapides
                            </Text>
                            <View style={styles.quickActionsContainer}>
                                {renderQuickAction(
                                    "card-outline",
                                    "Devises",
                                    () => setShowCurrencyModal(true),
                                    "#4DA1A9"
                                )}
                                {renderQuickAction(
                                    "airplane-outline",
                                    "Vols",
                                    () => {},
                                    "#7ED957"
                                )}
                                {renderQuickAction(
                                    "map-outline",
                                    "Destinations",
                                    () => {},
                                    "#FF9500"
                                )}
                                {renderQuickAction(
                                    "partly-sunny-outline",
                                    "Météo",
                                    () => {},
                                    "#FF6B6B"
                                )}
                            </View>
                        </View>

                        {/* Météo Temps Réel Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                🌡️ Météo temps réel
                            </Text>
                            {realWeatherLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#4DA1A9"
                                />
                            ) : (
                                <FlatList
                                    data={realWeatherData}
                                    renderItem={renderRealWeatherCard}
                                    keyExtractor={(item) =>
                                        `${item.city}-${item.country}`
                                    }
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={
                                        styles.weatherContainer
                                    }
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
                                    <Text style={styles.seeAllText}>
                                        Voir tout
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {destinationsApiLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#4DA1A9"
                                />
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
                                <ActivityIndicator
                                    size="small"
                                    color="#4DA1A9"
                                />
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
                                                                cat.id ===
                                                                category
                                                        )?.icon || "📍"}{" "}
                                                        {popularCategories.find(
                                                            (cat) =>
                                                                cat.id ===
                                                                category
                                                        )?.name || category}
                                                    </Text>
                                                    <FlatList
                                                        data={places.slice(
                                                            0,
                                                            3
                                                        )}
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

                        {/* Travel Articles Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                📰 Actualités voyage
                            </Text>
                            {loading && (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator
                                        size="small"
                                        color="#4DA1A9"
                                    />
                                    <Text style={styles.loadingText}>
                                        Chargement des articles...
                                    </Text>
                                </View>
                            )}
                            {error && articles.length === 0 && (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>
                                        Impossible de charger les articles
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                }
                data={articles}
                renderItem={renderArticle}
                keyExtractor={(item, index) => `article-${index}`}
                contentContainerStyle={styles.contentContainer}
            />

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
    // Quick Actions
    quickActionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    quickAction: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 8,
        marginHorizontal: 4,
        borderRadius: 12,
    },
    quickActionText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        marginTop: 8,
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

    // Articles Styles
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
    },
    errorContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    errorText: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#FF6B6B",
    },
    articleCard: {
        backgroundColor: Colors.backgroundColors.primary,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        overflow: "hidden",
    },
    articleImage: {
        width: "100%",
        height: 160,
        backgroundColor: "#f0f0f0",
    },
    articleContent: {
        padding: 16,
    },
    articleHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    categoryBadge: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    categoryIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    categoryText: {
        fontSize: 10,
        fontFamily: Fonts.body.family,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    readTime: {
        fontSize: 11,
        fontFamily: Fonts.body.family,
        color: "#637887",
        fontStyle: "italic",
    },
    articleTitle: {
        fontSize: 18,
        fontFamily: Fonts.heading.family,
        fontWeight: "700",
        color: Colors.text.primary,
        marginBottom: 8,
        lineHeight: 24,
    },
    articleSnippet: {
        fontSize: 14,
        fontFamily: Fonts.body.family,
        color: "#637887",
        lineHeight: 21,
        marginBottom: 16,
    },
    articleFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    articleMeta: {
        flex: 1,
    },
    articleDate: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        color: "#637887",
        marginBottom: 2,
    },
    articleAuthor: {
        fontSize: 11,
        fontFamily: Fonts.body.family,
        color: "#4DA1A9",
        fontStyle: "italic",
    },
    readButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4DA1A915",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#4DA1A930",
    },
    readButtonText: {
        fontSize: 12,
        fontFamily: Fonts.body.family,
        fontWeight: "600",
        color: "#4DA1A9",
        marginRight: 4,
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
