// Types principaux pour SpontyTrip

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    createdAt: Date;
}

export interface Trip {
    id: string;
    title: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    creatorId: string;
    members: TripMember[];
    inviteCode: string;
    coverImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TripMember {
    userId: string;
    user: User;
    role: "creator" | "member";
    joinedAt: Date;
}

export interface ChecklistItem {
    id: string;
    tripId: string;
    title: string;
    description?: string;
    category: string;
    assignedTo?: string;
    isCompleted: boolean;
    completedBy?: string;
    completedAt?: Date;
    createdBy: string;
    createdAt: Date;
}

// Types pour les activités
export interface Activity {
    id: string;
    tripId: string;
    title: string;
    description?: string;
    date: Date;
    startTime?: string;
    endTime?: string;
    location?: string;
    address?: string;
    price?: number;
    currency?: string;
    category:
        | "visite"
        | "restaurant"
        | "transport"
        | "hébergement"
        | "activité"
        | "autre";
    status: "planifiée" | "confirmée" | "annulée" | "terminée";
    createdBy: string;
    assignedTo?: string[];
    notes?: string;
    attachments?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatMessage {
    id: string;
    tripId: string;
    userId: string;
    user: User;
    content: string;
    type: "text" | "image" | "system";
    createdAt: Date;
}

export interface Gallery {
    id: string;
    tripId: string;
    userId: string;
    user: User;
    imageUrl: string;
    caption?: string;
    createdAt: Date;
}

export interface CityDestination {
    id: string;
    name: string;
    country: string;
    imageUrl: string;
    description: string;
    popularActivities: string[];
    averageTemperature: number;
    bestTimeToVisit: string;
}

// Types pour la navigation
export type RootStackParamList = {
    // Onboarding
    Onboarding: undefined;

    // Auth
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;

    // Main App
    MainApp:
        | {
              screen?: keyof MainTabParamList;
              params?: any;
          }
        | undefined;

    // Trip Management
    CreateTrip: { selectedDestination?: string } | undefined;
    JoinTrip: undefined;
    TripDetails: { tripId: string };
    EditTrip: { tripId: string };

    // Trip Features
    Checklist: { tripId: string };
    Chat: { tripId: string };
    Gallery: { tripId: string };
    Activities: { tripId: string };
    Expenses: { tripId: string };
    Notes: { tripId: string };

    // Activity Management - À implémenter avec les maquettes
    AddActivity: { tripId: string };
    EditActivity: { tripId: string; activityId: string };

    // Checklist Item Management - À implémenter avec les maquettes
    AddChecklistItem: { tripId: string };
    EditChecklistItem: { tripId: string; itemId: string };

    // Profile
    Profile: undefined;
    EditProfile: undefined;
};

export type MainTabParamList = {
    Home: { refreshTrips?: boolean } | undefined;
    MyTrips: undefined;
    Discover: { fromCreateTrip?: boolean } | undefined;
    Explore: undefined;
    Profile: undefined;
};

// Types pour les props des écrans
export interface ScreenProps {
    navigation: any;
    route: any;
}

// Types pour les API responses
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}
