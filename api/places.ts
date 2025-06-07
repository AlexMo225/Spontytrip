export interface Place {
    type: string;
    properties: {
        name?: string;
        street?: string;
        housenumber?: string;
        postcode?: string;
        city?: string;
        country?: string;
        country_code?: string;
        formatted?: string;
        address_line1?: string;
        address_line2?: string;
        categories: string[];
        datasource: {
            sourcename: string;
            attribution: string;
            license: string;
        };
        distance?: number;
        place_id: string;
        lat: number;
        lon: number;
        details?: string[];
        facilities?: string[];
        contact?: {
            phone?: string;
            website?: string;
            email?: string;
        };
        opening_hours?: string;
        rating?: number;
        wheelchair?: string;
        internet_access?: string;
        smoking?: string;
        price_level?: string;
        cuisine?: string;
    };
    geometry: {
        type: string;
        coordinates: [number, number];
    };
}

export interface SearchResult {
    type: string;
    features: Place[];
}

export interface FormattedPlace {
    id: string;
    name: string;
    category: string;
    address: string;
    distance?: number;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    contact?: {
        phone?: string;
        website?: string;
    };
    rating?: number;
    facilities?: string[];
    priceLevel?: string;
    cuisine?: string;
    isAccessible?: boolean;
    hasWifi?: boolean;
}

export interface PlaceCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
}

// Catégories de lieux populaires pour les voyageurs
export const popularCategories: PlaceCategory[] = [
    {
        id: "accommodation",
        name: "Hébergements",
        icon: "🏨",
        description: "Hôtels, auberges, B&B",
    },
    {
        id: "catering.restaurant",
        name: "Restaurants",
        icon: "🍽️",
        description: "Restaurants et cuisine locale",
    },
    {
        id: "catering.cafe",
        name: "Cafés",
        icon: "☕",
        description: "Cafés et coffee shops",
    },
    {
        id: "catering.bar",
        name: "Bars",
        icon: "🍺",
        description: "Bars et pubs",
    },
    {
        id: "tourism.attraction",
        name: "Attractions",
        icon: "🎭",
        description: "Sites touristiques et monuments",
    },
    {
        id: "tourism.sights",
        name: "Sites historiques",
        icon: "🏛️",
        description: "Musées et patrimoine",
    },
    {
        id: "entertainment.museum",
        name: "Musées",
        icon: "🖼️",
        description: "Musées et galeries",
    },
    {
        id: "leisure.park",
        name: "Parcs",
        icon: "🌳",
        description: "Parcs et espaces verts",
    },
    {
        id: "commercial.supermarket",
        name: "Supermarchés",
        icon: "🛒",
        description: "Courses et shopping",
    },
    {
        id: "public_transport",
        name: "Transport",
        icon: "🚇",
        description: "Stations et arrêts",
    },
    {
        id: "healthcare.pharmacy",
        name: "Pharmacies",
        icon: "💊",
        description: "Pharmacies et soins",
    },
    {
        id: "service.bank",
        name: "Banques",
        icon: "🏦",
        description: "Banques et ATM",
    },
];

// Pour les tests sans clé API, utilisons des données mockées
const mockPlaces: { [key: string]: FormattedPlace[] } = {
    accommodation: [
        {
            id: "hotel_1",
            name: "Hôtel Le Marais",
            category: "Hôtel",
            address: "15 Rue des Rosiers, 75004 Paris",
            distance: 250,
            coordinates: { latitude: 48.8566, longitude: 2.3522 },
            contact: { phone: "+33 1 42 77 23 45" },
            rating: 4.5,
            facilities: ["wifi", "breakfast", "parking"],
            priceLevel: "Moyen",
            isAccessible: true,
            hasWifi: true,
        },
        {
            id: "hostel_1",
            name: "Auberge de Jeunesse International",
            category: "Auberge",
            address: "10 Rue Jean-Jacques Rousseau, 75001 Paris",
            distance: 400,
            coordinates: { latitude: 48.8606, longitude: 2.3376 },
            contact: { phone: "+33 1 45 08 02 10" },
            rating: 4.2,
            facilities: ["wifi", "breakfast", "luggage_storage"],
            priceLevel: "Économique",
            isAccessible: false,
            hasWifi: true,
        },
    ],
    "catering.restaurant": [
        {
            id: "restaurant_1",
            name: "Le Comptoir du Relais",
            category: "Restaurant français",
            address: "9 Carrefour de l'Odéon, 75006 Paris",
            distance: 150,
            coordinates: { latitude: 48.8513, longitude: 2.3389 },
            contact: { phone: "+33 1 44 27 07 97" },
            rating: 4.6,
            cuisine: "Française",
            priceLevel: "Élevé",
            isAccessible: true,
            hasWifi: false,
        },
        {
            id: "restaurant_2",
            name: "Breizh Café",
            category: "Crêperie",
            address: "109 Rue Vieille du Temple, 75003 Paris",
            distance: 300,
            coordinates: { latitude: 48.8606, longitude: 2.3622 },
            contact: { phone: "+33 1 42 72 13 77" },
            rating: 4.4,
            cuisine: "Bretonne",
            priceLevel: "Moyen",
            isAccessible: true,
            hasWifi: true,
        },
    ],
    "tourism.attraction": [
        {
            id: "attraction_1",
            name: "Notre-Dame de Paris",
            category: "Monument historique",
            address: "6 Parvis Notre-Dame, 75004 Paris",
            distance: 200,
            coordinates: { latitude: 48.853, longitude: 2.3499 },
            rating: 4.8,
            facilities: ["guided_tours", "audio_guide"],
            isAccessible: false,
            hasWifi: false,
        },
        {
            id: "attraction_2",
            name: "Sainte-Chapelle",
            category: "Monument historique",
            address: "8 Boulevard du Palais, 75001 Paris",
            distance: 350,
            coordinates: { latitude: 48.8554, longitude: 2.345 },
            rating: 4.7,
            facilities: ["guided_tours", "gift_shop"],
            priceLevel: "Moyen",
            isAccessible: true,
            hasWifi: false,
        },
    ],
};

// Clé API Geoapify
const GEOAPIFY_API_KEY = "609b9f1c98b94101a3c81a02022a77e5";
const USE_MOCK_DATA = false; // Utilisation de vraies données avec la clé API

const formatPlace = (place: Place): FormattedPlace => {
    return {
        id: place.properties.place_id,
        name:
            place.properties.name ||
            place.properties.formatted ||
            "Lieu sans nom",
        category: getCategoryName(place.properties.categories[0] || ""),
        address:
            place.properties.formatted ||
            `${place.properties.street || ""} ${
                place.properties.city || ""
            }`.trim(),
        distance: place.properties.distance,
        coordinates: {
            latitude: place.properties.lat,
            longitude: place.properties.lon,
        },
        contact: place.properties.contact,
        rating: place.properties.rating,
        facilities: place.properties.facilities || [],
        priceLevel: place.properties.price_level,
        cuisine: place.properties.cuisine,
        isAccessible: place.properties.wheelchair === "yes",
        hasWifi:
            place.properties.internet_access === "wlan" ||
            place.properties.internet_access === "yes",
    };
};

const getCategoryName = (categoryId: string): string => {
    const categoryMap: { [key: string]: string } = {
        "accommodation.hotel": "Hôtel",
        "accommodation.hostel": "Auberge",
        "catering.restaurant": "Restaurant",
        "catering.cafe": "Café",
        "catering.bar": "Bar",
        "tourism.attraction": "Attraction",
        "tourism.sights": "Site historique",
        "entertainment.museum": "Musée",
        "leisure.park": "Parc",
        "commercial.supermarket": "Supermarché",
        "public_transport.train": "Gare",
        "public_transport.bus": "Arrêt de bus",
        "healthcare.pharmacy": "Pharmacie",
        "service.bank": "Banque",
    };

    return (
        categoryMap[categoryId] ||
        categoryId.split(".").pop()?.replace("_", " ") ||
        "Lieu"
    );
};

export const searchPlacesByCategory = async (
    category: string,
    latitude: number,
    longitude: number,
    radius: number = 2000,
    limit: number = 20
): Promise<FormattedPlace[]> => {
    if (USE_MOCK_DATA) {
        // Retourner des données mockées pour les tests
        return mockPlaces[category] || [];
    }

    try {
        const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${longitude},${latitude},${radius}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur API Geoapify: ${response.status}`);
        }

        const data: SearchResult = await response.json();

        return data.features.map(formatPlace);
    } catch (error) {
        console.error("Erreur lors de la recherche de lieux:", error);
        return [];
    }
};

export const searchPlacesByText = async (
    query: string,
    latitude?: number,
    longitude?: number,
    radius: number = 5000,
    limit: number = 20
): Promise<FormattedPlace[]> => {
    if (USE_MOCK_DATA) {
        // Recherche simple dans les données mockées
        const allPlaces = Object.values(mockPlaces).flat();
        return allPlaces
            .filter(
                (place) =>
                    place.name.toLowerCase().includes(query.toLowerCase()) ||
                    place.category.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, limit);
    }

    try {
        let url = `https://api.geoapify.com/v2/places?text=${encodeURIComponent(
            query
        )}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;

        if (latitude && longitude) {
            url += `&filter=circle:${longitude},${latitude},${radius}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur API Geoapify: ${response.status}`);
        }

        const data: SearchResult = await response.json();

        return data.features.map(formatPlace);
    } catch (error) {
        console.error("Erreur lors de la recherche textuelle:", error);
        return [];
    }
};

export const getNearbyPlaces = async (
    latitude: number,
    longitude: number,
    categories: string[] = ["accommodation", "catering", "tourism"],
    radius: number = 1000,
    limit: number = 50
): Promise<{ [category: string]: FormattedPlace[] }> => {
    const results: { [category: string]: FormattedPlace[] } = {};

    if (USE_MOCK_DATA) {
        // Retourner toutes les catégories mockées
        categories.forEach((category) => {
            results[category] = mockPlaces[category] || [];
        });
        return results;
    }

    try {
        const promises = categories.map(async (category) => {
            const places = await searchPlacesByCategory(
                category,
                latitude,
                longitude,
                radius,
                limit
            );
            return { category, places };
        });

        const categoryResults = await Promise.all(promises);

        categoryResults.forEach(({ category, places }) => {
            results[category] = places;
        });

        return results;
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des lieux à proximité:",
            error
        );
        return {};
    }
};

export const getPlaceDetails = async (
    placeId: string
): Promise<FormattedPlace | null> => {
    if (USE_MOCK_DATA) {
        // Rechercher dans les données mockées
        const allPlaces = Object.values(mockPlaces).flat();
        return allPlaces.find((place) => place.id === placeId) || null;
    }

    try {
        const response = await fetch(
            `https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${GEOAPIFY_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`Erreur API Geoapify: ${response.status}`);
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
            return formatPlace(data.features[0]);
        }

        return null;
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des détails du lieu:",
            error
        );
        return null;
    }
};

export const getPopularPlacesByCity = async (
    cityName: string
): Promise<{ [category: string]: FormattedPlace[] }> => {
    // Pour l'instant, retourner des données mockées par ville
    const cityData: {
        [city: string]: { [category: string]: FormattedPlace[] };
    } = {
        Paris: mockPlaces,
        London: {
            accommodation: [
                {
                    id: "hotel_london_1",
                    name: "The Zetter Townhouse",
                    category: "Hôtel boutique",
                    address: "49-50 Seymour Street, London W1H 7JH",
                    coordinates: { latitude: 51.5074, longitude: -0.1278 },
                    rating: 4.6,
                    priceLevel: "Élevé",
                    isAccessible: true,
                    hasWifi: true,
                },
            ],
            "tourism.attraction": [
                {
                    id: "attraction_london_1",
                    name: "Tower of London",
                    category: "Monument historique",
                    address: "St Katharine's & Wapping, London EC3N 4AB",
                    coordinates: { latitude: 51.5081, longitude: -0.0759 },
                    rating: 4.7,
                    priceLevel: "Moyen",
                    isAccessible: true,
                    hasWifi: false,
                },
            ],
        },
    };

    return cityData[cityName] || {};
};
