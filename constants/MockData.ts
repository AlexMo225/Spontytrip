// Données mock pour SpontyTrip

import { CityDestination, Trip, User } from "../types";

export const mockCities: CityDestination[] = [
    {
        id: "1",
        name: "Paris",
        country: "France",
        imageUrl:
            "https://images.unsplash.com/photo-1502602898536-47ad22581b52",
        description: "La ville lumière avec ses monuments emblématiques",
        popularActivities: [
            "Tour Eiffel",
            "Louvre",
            "Champs-Élysées",
            "Montmartre",
        ],
        averageTemperature: 15,
        bestTimeToVisit: "Avril - Octobre",
    },
    {
        id: "2",
        name: "Tokyo",
        country: "Japon",
        imageUrl:
            "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
        description: "Métropole moderne mêlant tradition et innovation",
        popularActivities: ["Shibuya", "Temples", "Sushi", "Harajuku"],
        averageTemperature: 16,
        bestTimeToVisit: "Mars - Mai, Septembre - Novembre",
    },
    {
        id: "3",
        name: "New York",
        country: "États-Unis",
        imageUrl:
            "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
        description: "La ville qui ne dort jamais",
        popularActivities: [
            "Central Park",
            "Times Square",
            "Statue de la Liberté",
            "Broadway",
        ],
        averageTemperature: 13,
        bestTimeToVisit: "Avril - Juin, Septembre - Novembre",
    },
    {
        id: "4",
        name: "Barcelone",
        country: "Espagne",
        imageUrl:
            "https://images.unsplash.com/photo-1539037116277-4db20889f2d4",
        description: "Architecture unique et plages méditerranéennes",
        popularActivities: [
            "Sagrada Familia",
            "Park Güell",
            "Las Ramblas",
            "Plages",
        ],
        averageTemperature: 18,
        bestTimeToVisit: "Mai - Septembre",
    },
    {
        id: "5",
        name: "Amsterdam",
        country: "Pays-Bas",
        imageUrl:
            "https://images.unsplash.com/photo-1534351590666-13e3e96b5017",
        description: "Canaux pittoresques et culture vibrante",
        popularActivities: ["Canaux", "Musées", "Vélo", "Quartier Rouge"],
        averageTemperature: 10,
        bestTimeToVisit: "Avril - Octobre",
    },
];

export const mockUser: User = {
    id: "1",
    email: "user@spontytrip.com",
    firstName: "Alex",
    lastName: "Martin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    createdAt: new Date("2024-01-01"),
};

export const mockTrips: Trip[] = [
    {
        id: "1",
        title: "Week-end à Paris",
        destination: "Paris, France",
        startDate: new Date("2024-07-15"),
        endDate: new Date("2024-07-17"),
        description: "Un week-end romantique dans la ville lumière",
        creatorId: "1",
        members: [
            {
                userId: "1",
                user: mockUser,
                role: "creator",
                joinedAt: new Date("2024-06-01"),
            },
        ],
        inviteCode: "PARIS2024",
        coverImage:
            "https://images.unsplash.com/photo-1502602898536-47ad22581b52",
        createdAt: new Date("2024-06-01"),
        updatedAt: new Date("2024-06-01"),
    },
    {
        id: "2",
        title: "Aventure à Tokyo",
        destination: "Tokyo, Japon",
        startDate: new Date("2024-09-10"),
        endDate: new Date("2024-09-20"),
        description: "Découverte de la culture japonaise",
        creatorId: "1",
        members: [
            {
                userId: "1",
                user: mockUser,
                role: "creator",
                joinedAt: new Date("2024-06-15"),
            },
        ],
        inviteCode: "TOKYO2024",
        coverImage:
            "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
        createdAt: new Date("2024-06-15"),
        updatedAt: new Date("2024-06-15"),
    },
];

export const checklistCategories = [
    { id: "transport", name: "Transport", icon: "airplane", color: "#6B73FF" },
    { id: "accommodation", name: "Hébergement", icon: "bed", color: "#9FE2BF" },
    { id: "activities", name: "Activités", icon: "camera", color: "#FF6B9D" },
    { id: "food", name: "Nourriture", icon: "restaurant", color: "#FFFFBA" },
    { id: "shopping", name: "Shopping", icon: "bag", color: "#E2CCFF" },
    {
        id: "documents",
        name: "Documents",
        icon: "document-text",
        color: "#BAE1FF",
    },
    {
        id: "other",
        name: "Autre",
        icon: "ellipsis-horizontal",
        color: "#BAFFC9",
    },
];

export const mockChecklistItems = [
    {
        id: "1",
        tripId: "1",
        title: "Réserver les billets de train",
        description: "TGV Paris-Lyon",
        category: "transport",
        assignedTo: "1",
        isCompleted: false,
        createdBy: "1",
        createdAt: new Date("2024-06-01"),
    },
    {
        id: "2",
        tripId: "1",
        title: "Réserver l'hôtel",
        description: "Hôtel près du centre-ville",
        category: "accommodation",
        assignedTo: "1",
        isCompleted: true,
        createdBy: "1",
        createdAt: new Date("2024-06-01"),
    },
];
