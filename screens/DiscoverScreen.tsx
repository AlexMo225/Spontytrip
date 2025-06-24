import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MainTabParamList, RootStackParamList } from "../types";

type DiscoverScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, "Discover">,
    StackNavigationProp<RootStackParamList>
>;

interface Props {
    navigation: DiscoverScreenNavigationProp;
}

interface Destination {
    name: string;
    country: string;
    type: string[];
    image: string;
    distance: number | null;
}

const destinations: Destination[] = [
    {
        name: "Barcelone",
        country: "Espagne",
        type: ["plage", "ville", "culture"],
        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Rome",
        country: "Italie",
        type: ["ville", "culture", "romantique"],
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Amsterdam",
        country: "Pays-Bas",
        type: ["ville", "romantique", "culture"],
        image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Lisbonne",
        country: "Portugal",
        type: ["ville", "plage", "culture"],
        image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Berlin",
        country: "Allemagne",
        type: ["ville", "culture", "festive"],
        image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Prague",
        country: "République Tchèque",
        type: ["ville", "romantique", "culture"],
        image: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Vienne",
        country: "Autriche",
        type: ["ville", "culture", "romantique"],
        image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Athènes",
        country: "Grèce",
        type: ["ville", "plage", "culture"],
        image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Copenhague",
        country: "Danemark",
        type: ["ville", "culture", "nature"],
        image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Oslo",
        country: "Norvège",
        type: ["ville", "nature", "montagne"],
        image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Stockholm",
        country: "Suède",
        type: ["ville", "nature", "culture"],
        image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Dubrovnik",
        country: "Croatie",
        type: ["plage", "ville", "culture"],
        image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Bruxelles",
        country: "Belgique",
        type: ["ville", "culture", "gastronomie"],
        image: "https://images.unsplash.com/photo-1559113202-c916b8e44373?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Édimbourg",
        country: "Royaume-Uni",
        type: ["ville", "montagne", "culture"],
        image: "https://images.unsplash.com/photo-1583225214464-9296029427aa?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Munich",
        country: "Allemagne",
        type: ["ville", "culture", "nature"],
        image: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
    {
        name: "Florence",
        country: "Italie",
        type: ["ville", "culture", "romantique"],
        image: "https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?w=400&h=500&fit=crop&auto=format&q=80",
        distance: null,
    },
];

const categories = [
    { id: "plage", label: "Plage", key: "plage" },
    { id: "nature", label: "Nature", key: "nature" },
    { id: "ville", label: "Ville", key: "ville" },
    { id: "culture", label: "Culture", key: "culture" },
];

const { width } = Dimensions.get("window");
const CARD_MARGIN = 12;
const CARD_PADDING = 16;
const cardWidth = (width - CARD_PADDING * 2 - CARD_MARGIN) / 2;

const DiscoverScreen: React.FC<Props> = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );

    const filteredDestinations = selectedCategory
        ? destinations.filter((dest) => dest.type.includes(selectedCategory))
        : destinations;

    const renderCategoryFilter = ({
        item,
    }: {
        item: (typeof categories)[0];
    }) => (
        <TouchableOpacity
            style={[
                styles.categoryButton,
                selectedCategory === item.key && styles.categoryButtonActive,
            ]}
            onPress={() =>
                setSelectedCategory(
                    selectedCategory === item.key ? null : item.key
                )
            }
        >
            <Text
                style={[
                    styles.categoryText,
                    selectedCategory === item.key && styles.categoryTextActive,
                ]}
            >
                {item.label}
            </Text>
        </TouchableOpacity>
    );

    const renderDestination = ({ item }: { item: Destination }) => (
        <View style={styles.cardWrapper}>
            <TouchableOpacity
                style={styles.destinationCard}
                onPress={() => {
                    navigation.navigate("CreateTrip", {
                        selectedDestination: item.name,
                    });
                }}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.destinationImage}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.destinationName}>{item.name}</Text>
                    <Text style={styles.destinationCountry}>
                        {item.country}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Destinations</Text>
            </View>

            {/* Filters */}
            <View style={styles.filtersSection}>
                <FlatList
                    data={categories}
                    renderItem={renderCategoryFilter}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                    ItemSeparatorComponent={() => (
                        <View style={styles.filterSeparator} />
                    )}
                />
            </View>

            {/* Destinations Grid */}
            <FlatList
                data={filteredDestinations}
                renderItem={renderDestination}
                keyExtractor={(item) => item.name}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.gridContainer}
                columnWrapperStyle={styles.gridRow}
                style={styles.gridList}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
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
        backgroundColor: "#FFFFFF",
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

export default DiscoverScreen;
