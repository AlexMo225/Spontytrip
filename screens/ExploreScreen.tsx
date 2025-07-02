import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getPopularCitiesWeather, LocationWeather } from "../api/openmeteo";
import CurrencyConverterModal from "../components/CurrencyConverterModal";
import { Colors } from "../constants";
import { useExploreStyles } from "../styles/screens";
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
    const [realWeatherData, setRealWeatherData] = useState<LocationWeather[]>(
        []
    );
    const [realWeatherLoading, setRealWeatherLoading] = useState(false);

    const styles = useExploreStyles();

    useEffect(() => {
        loadRealWeatherData();
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

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRealWeatherData();
        setRefreshing(false);
    };

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

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Explorer</Text>
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
                                    Convertir des devises
                                </Text>
                                <Text style={styles.currencySubtitle}>
                                    Taux de change en temps réel
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Weather Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        🌤️ Météo dans le monde
                    </Text>
                    {realWeatherLoading ? (
                        <ActivityIndicator
                            size="large"
                            color={Colors.primary}
                            style={styles.loader}
                        />
                    ) : (
                        <FlatList
                            data={realWeatherData}
                            renderItem={renderRealWeatherCard}
                            keyExtractor={(item) => item.city}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.weatherList}
                        />
                    )}
                </View>
            </ScrollView>

            <CurrencyConverterModal
                visible={showCurrencyModal}
                onClose={() => setShowCurrencyModal(false)}
            />
        </SafeAreaView>
    );
};
export default ExploreScreen;
