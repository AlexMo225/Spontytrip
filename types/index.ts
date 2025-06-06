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
    createdBy: string;
    createdAt: Date;
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
    CitySuggestions: undefined;
    DateSelection: { destination: string };

    // Trip Features
    Checklist: { tripId: string };
    Chat: { tripId: string };
    Gallery: { tripId: string };
    InviteMembers: { tripId: string };

    // Profile
    Profile: undefined;
    EditProfile: undefined;
    Settings: undefined;
};

export type MainTabParamList = {
    Home: undefined;
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
