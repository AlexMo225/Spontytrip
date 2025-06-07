// SpontyTrip Navigation - React Navigation Stack & Tab Navigator
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

// Types
import { MainTabParamList, RootStackParamList } from "../types";

// Import all screens from index
import {
    ActivitiesScreen,
    ChatScreen,
    ChecklistScreen,
    // Trip Management Screens
    CreateTripScreen,
    DiscoverScreen,
    // Profile Screens
    EditProfileScreen,
    EditTripScreen,
    ExploreScreen,
    ForgotPasswordScreen,
    GalleryScreen,
    // Main Tab Screens
    HomeScreen,
    JoinTripScreen,
    // Auth Screens
    LoginScreen,
    MyTripsScreen,
    OnboardingScreen,
    ProfileScreen,
    RegisterScreen,
    TripDetailsScreen,
} from "../screens";

// Constants
import { Colors } from "../constants/Colors";
import { Spacing } from "../constants/Spacing";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Navigator
function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    switch (route.name) {
                        case "Home":
                            iconName = focused ? "home" : "home-outline";
                            break;
                        case "MyTrips":
                            iconName = focused
                                ? "airplane"
                                : "airplane-outline";
                            break;
                        case "Discover":
                            iconName = focused ? "globe" : "globe-outline";
                            break;
                        case "Explore":
                            iconName = focused ? "compass" : "compass-outline";
                            break;
                        case "Profile":
                            iconName = focused ? "person" : "person-outline";
                            break;
                        default:
                            iconName = "home-outline";
                    }

                    return (
                        <Ionicons name={iconName} size={size} color={color} />
                    );
                },
                tabBarActiveTintColor: "#7ED957",
                tabBarInactiveTintColor: Colors.text.muted,
                tabBarStyle: {
                    height: Spacing.tabBarHeight,
                    paddingBottom: 10,
                    paddingTop: 10,
                    backgroundColor: Colors.white,
                    borderTopWidth: 1,
                    borderTopColor: Colors.border,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: "Accueil" }}
            />
            <Tab.Screen
                name="MyTrips"
                component={MyTripsScreen}
                options={{ title: "Mes voyages" }}
            />
            <Tab.Screen
                name="Discover"
                component={DiscoverScreen}
                options={{ title: "Découvrir" }}
            />
            <Tab.Screen
                name="Explore"
                component={ExploreScreen}
                options={{ title: "Explorer" }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: "Profil" }}
            />
        </Tab.Navigator>
    );
}

// Main Stack Navigator
export default function StackNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Onboarding"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: Colors.white,
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.border,
                    },
                    headerTintColor: Colors.text.primary,
                    headerTitleStyle: {
                        fontWeight: "600",
                        fontSize: 18,
                    },
                    gestureEnabled: true,
                }}
            >
                {/* Onboarding */}
                <Stack.Screen
                    name="Onboarding"
                    component={OnboardingScreen}
                    options={{ headerShown: false }}
                />

                {/* Auth Screens */}
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{
                        title: "Créer un compte",
                        headerShown: true,
                    }}
                />
                <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPasswordScreen}
                    options={{
                        title: "Mot de passe oublié",
                        headerShown: true,
                    }}
                />

                {/* Main App */}
                <Stack.Screen
                    name="MainApp"
                    component={MainTabNavigator}
                    options={{ headerShown: false }}
                />

                {/* Trip Management */}
                <Stack.Screen
                    name="CreateTrip"
                    component={CreateTripScreen}
                    options={{
                        headerShown: false,
                        presentation: "modal",
                    }}
                />
                <Stack.Screen
                    name="JoinTrip"
                    component={JoinTripScreen}
                    options={{
                        title: "Rejoindre un voyage",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="TripDetails"
                    component={TripDetailsScreen}
                    options={{
                        title: "Détails du voyage",
                    }}
                />
                <Stack.Screen
                    name="EditTrip"
                    component={EditTripScreen}
                    options={{
                        title: "Modifier le voyage",
                    }}
                />

                {/* Trip Features */}
                <Stack.Screen
                    name="Activities"
                    component={ActivitiesScreen}
                    options={{
                        title: "Activités",
                    }}
                />
                <Stack.Screen
                    name="Checklist"
                    component={ChecklistScreen}
                    options={{
                        title: "Liste de tâches",
                    }}
                />
                <Stack.Screen
                    name="Chat"
                    component={ChatScreen}
                    options={{
                        title: "Discussion",
                    }}
                />
                <Stack.Screen
                    name="Gallery"
                    component={GalleryScreen}
                    options={{
                        title: "Galerie",
                    }}
                />

                {/* Profile */}
                <Stack.Screen
                    name="EditProfile"
                    component={EditProfileScreen}
                    options={{
                        title: "Modifier le profil",
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
