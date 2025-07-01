import { Ionicons } from "@expo/vector-icons";

export interface ActivityType {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

export interface Priority {
    id: string;
    name: string;
    color: string;
}

export const activityTypes: ActivityType[] = [
    {
        id: "tourist",
        name: "Visite touristique",
        icon: "camera-outline",
        color: "#4DA1A9",
    },
    {
        id: "restaurant",
        name: "Restaurant",
        icon: "restaurant-outline",
        color: "#F59E0B",
    },
    {
        id: "sport",
        name: "Sport",
        icon: "fitness-outline",
        color: "#10B981",
    },
    {
        id: "culture",
        name: "Culture",
        icon: "book-outline",
        color: "#8B5CF6",
    },
    {
        id: "shopping",
        name: "Shopping",
        icon: "cart-outline",
        color: "#EC4899",
    },
    {
        id: "nature",
        name: "Nature",
        icon: "leaf-outline",
        color: "#34D399",
    },
    {
        id: "nightlife",
        name: "Vie nocturne",
        icon: "moon-outline",
        color: "#6366F1",
    },
    {
        id: "other",
        name: "Autre",
        icon: "ellipsis-horizontal-outline",
        color: "#6B7280",
    },
];

export const priorities: Priority[] = [
    { id: "low", name: "Faible", color: "#95A5A6" },
    { id: "medium", name: "Moyenne", color: "#F39C12" },
    { id: "high", name: "Élevée", color: "#E74C3C" },
];
