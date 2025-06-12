import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

// Types
import { MainTabParamList, RootStackParamList } from "../types";

// Import all screens
import {
    ActivitiesScreen,
    AddActivityScreen,
    AddChecklistItemScreen,
    ChatScreen,
    ChecklistScreen,
    CreateTripScreen,
    DiscoverScreen,
    EditProfileScreen,
    EditTripScreen,
    ExploreScreen,
    GalleryScreen,
    HomeScreen,
    JoinTripScreen,
    MyTripsScreen,
    ProfileScreen,
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

// Main App Navigator - Pour les utilisateurs connectés
export default function MainAppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="MainApp"
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
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="EditTrip"
                    component={EditTripScreen}
                    options={{
                        headerShown: false,
                    }}
                />

                {/* Trip Features */}
                <Stack.Screen
                    name="Activities"
                    component={ActivitiesScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="AddActivity"
                    component={AddActivityScreen}
                    options={{
                        headerShown: false,
                        presentation: "modal",
                    }}
                />
                <Stack.Screen
                    name="Checklist"
                    component={ChecklistScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="AddChecklistItem"
                    component={AddChecklistItemScreen}
                    options={{
                        headerShown: false,
                        presentation: "modal",
                    }}
                />
                <Stack.Screen
                    name="Chat"
                    component={ChatScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Gallery"
                    component={GalleryScreen}
                    options={{
                        headerShown: false,
                    }}
                />

                {/* Profile */}
                <Stack.Screen
                    name="EditProfile"
                    component={EditProfileScreen}
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
