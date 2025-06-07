import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Fonts";
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
const cardWidth = (width - 44) / 2; // 16px margin + 12px gap between cards

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
        <TouchableOpacity
            style={styles.destinationCard}
            onPress={() => {
                // Navigation vers CreateTripScreen avec destination pré-remplie
                navigation.navigate("CreateTrip", {
                    selectedDestination: item.name,
                });
            }}
        >
            <View style={styles.destinationImage}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.destinationImageStyle}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.destinationInfo}>
                <Text style={styles.destinationName}>{item.name}</Text>
                <Text style={styles.destinationCountry}>{item.country}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={Colors.textPrimary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Destinations</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Filtres par catégorie */}
                <View style={styles.filtersContainer}>
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryFilter}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersContent}
                        ItemSeparatorComponent={() => (
                            <View style={{ width: 12 }} />
                        )}
                    />
                </View>

                {/* Grille des destinations */}
                <View style={styles.destinationsContainer}>
                    <FlatList
                        data={filteredDestinations}
                        renderItem={renderDestination}
                        keyExtractor={(item) => item.name}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.destinationsContent}
                        columnWrapperStyle={styles.destinationRow}
                        ItemSeparatorComponent={() => (
                            <View style={{ height: 12 }} />
                        )}
                        scrollEnabled={false}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 60, // Pour la safe area
        backgroundColor: Colors.background,
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        ...TextStyles.h2,
        color: Colors.textPrimary,
        flex: 1,
        textAlign: "center",
        marginRight: 48, // Pour compenser le bouton retour
    },
    headerSpacer: {
        width: 48,
    },
    content: {
        flex: 1,
    },
    filtersContainer: {
        paddingVertical: 12,
    },
    filtersContent: {
        paddingHorizontal: 12,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: "#F0F2F4",
        borderRadius: 16,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    categoryButtonActive: {
        backgroundColor: "#7ED957",
    },
    categoryText: {
        ...TextStyles.body2,
        color: Colors.textPrimary,
        fontSize: 14,
    },
    categoryTextActive: {
        color: Colors.background,
    },
    destinationsContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    destinationsContent: {
        paddingBottom: 20,
    },
    destinationRow: {
        justifyContent: "space-between",
    },
    destinationCard: {
        width: cardWidth,
        backgroundColor: Colors.background,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    destinationImage: {
        width: "100%",
        height: 231,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 12,
    },
    imagePlaceholder: {
        flex: 1,
        backgroundColor: "#F0F2F4",
        justifyContent: "center",
        alignItems: "center",
    },
    destinationImageStyle: {
        width: "100%",
        height: "100%",
    },
    destinationInfo: {
        paddingHorizontal: 0,
    },
    destinationName: {
        ...TextStyles.h3,
        color: Colors.textPrimary,
        fontSize: 16,
        marginBottom: 2,
    },
    destinationCountry: {
        ...TextStyles.body2,
        color: Colors.textSecondary,
        fontSize: 12,
    },
});

export default DiscoverScreen;
