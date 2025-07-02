// Types principaux pour SpontyTrip

export interface User {
    id: string;
    email: string;
    displayName: string;
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
    type: "plage" | "montagne" | "citytrip" | "campagne";
    coverImage?: string;
    creatorId: string;
    creatorName: string;
    inviteCode: string;
    members: TripMember[];
    memberIds?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TripMember {
    userId: string;
    name: string;
    email: string;
    avatar?: string;
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

// Types pour les dépenses collaboratives
export interface ExpenseItem {
    id: string;
    tripId: string;
    label: string;
    amount: number;
    paidBy: string;
    paidByName: string;
    participants: string[];
    participantNames: string[];
    date: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface TripExpenses {
    tripId: string;
    expenses: ExpenseItem[];
    updatedAt: Date;
    updatedBy: string;
}

// Types pour les calculs de remboursements
export interface MemberBalance {
    userId: string;
    userName: string;
    totalPaid: number;
    totalOwed: number;
    balance: number;
}

export interface DebtCalculation {
    from: string;
    fromName: string;
    to: string;
    toName: string;
    amount: number;
}

export interface ExpensesSummary {
    totalExpenses: number;
    memberBalances: MemberBalance[];
    debtsToSettle: DebtCalculation[];
    myBalance: MemberBalance | null;
}

// Types pour les notes collaboratives
export interface TripNote {
    id: string;
    tripId: string;
    content: string;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    updatedAt: Date;
    authorAvatar?: string;
    isImportant?: boolean;
}

export interface TripNotesCollection {
    tripId: string;
    notes: TripNote[];
    totalNotes: number;
    lastUpdated: Date;
}

// Types pour les activités
export interface Activity {
    id: string;
    tripId?: string;
    title: string;
    description?: string;
    location?: string;
    link?: string;
    date: Date;
    startTime?: string;
    endTime?: string;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    votes: string[];
    validated?: boolean;
    status?: "pending" | "validated" | "in_progress" | "completed" | "past";
    address?: string;
    price?: number;
    currency?: string;
    category?:
        | "visite"
        | "restaurant"
        | "transport"
        | "hébergement"
        | "activité"
        | "autre";
    assignedTo?: string[];
    notes?: string;
    attachments?: string[];
    updatedAt?: Date;
}

// Types pour la navigation
export type RootStackParamList = {
    // Onboarding
    Onboarding: undefined;

    // Auth
    Auth: undefined;
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
    Activities: { tripId: string };
    Expenses: { tripId: string };
    Notes: { tripId: string };
    FeedDetails: { tripId: string };

    // Activity Management
    AddActivity: { tripId: string; editActivity?: any };
    EditActivity: { tripId: string; activityId: string };

    // Checklist Item Management
    AddChecklistItem: { tripId: string };
    EditChecklistItem: { tripId: string; itemId: string };

    // Profile
    Profile: undefined;
    EditProfile: undefined;
    Preferences: undefined;

    // About
    About: undefined;
    Notifications: undefined;
    Privacy: undefined;
    Help: undefined;
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
    displayName: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ActivityLogEntry {
    id: string;
    tripId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    action: ActivityActionType;
    actionData: any;
    timestamp: Date;
    description: string;
    icon: string;
    color: string;
}

export type ActivityActionType =
    | "checklist_add"
    | "checklist_complete"
    | "checklist_delete"
    | "expense_add"
    | "expense_update"
    | "expense_delete"
    | "note_add"
    | "note_update"
    | "note_delete"
    | "activity_add"
    | "activity_vote"
    | "activity_validate"
    | "activity_delete"
    | "trip_join"
    | "trip_update";

export interface TripActivityFeed {
    tripId: string;
    activities: ActivityLogEntry[];
    lastUpdated: Date;
}

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    bio?: string;
    location?: string;
    createdAt: Date;
}
