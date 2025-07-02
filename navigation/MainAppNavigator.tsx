import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, View } from "react-native";

// Types
import { MainTabParamList, RootStackParamList } from "../types";

// Import all screens
import {
    AboutScreen,
    ActivitiesScreen,
    AddActivityScreen,
    AddChecklistItemScreen,
    ChecklistScreen,
    CreateTripScreen,
    DiscoverScreen,
    EditProfileScreen,
    EditTripScreen,
    ExpensesScreen,
    ExploreScreen,
    FeedDetailsScreen,
    HelpScreen,
    HomeScreen,
    JoinTripScreen,
    MyTripsScreen,
    NotesScreen,
    NotificationsScreen,
    PreferencesScreen,
    PrivacyScreen,
    ProfileScreen,
    TripDetailsScreen,
} from "../screens";

// Constants
import { Colors } from "../constants";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Navigator
function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string = "home-outline";

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
                        <Ionicons
                            name={iconName as any}
                            size={size + 2}
                            color={color}
                        />
                    );
                },
                tabBarActiveTintColor: "#7ED957",
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarStyle: {
                    height: Platform.OS === "ios" ? 88 : 80,
                    paddingBottom: Platform.OS === "ios" ? 30 : 16,
                    paddingTop: Platform.OS === "ios" ? 12 : 16,
                    backgroundColor: Colors.white,
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowColor: "transparent",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0,
                    shadowRadius: 0,
                    position: "relative",
                    overflow: "hidden",
                },
                tabBarBackground: () => (
                    <>
                        <LinearGradient
                            colors={["#9BE97F", "#7ED957"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                zIndex: 2,
                            }}
                        />
                        <View
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: Colors.white,
                                ...Platform.select({
                                    android: {
                                        elevation: 8,
                                    },
                                    ios: {
                                        shadowColor: Colors.cardShadow,
                                        shadowOffset: { width: 0, height: -2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                    },
                                }),
                            }}
                        />
                    </>
                ),
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                    marginTop: 4,
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
                    headerTintColor: Colors.textPrimary,
                    headerTitleStyle: {
                        fontWeight: "600",
                        fontSize: 18,
                    },
                    gestureEnabled: true,
                    headerBackTitle: " ",
                    headerLeft: () => null,
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
                    name="Expenses"
                    component={ExpensesScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="Notes"
                    component={NotesScreen}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="FeedDetails"
                    component={FeedDetailsScreen}
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

                {/* Settings Screens */}
                <Stack.Screen
                    name="About"
                    component={AboutScreen}
                    options={{
                        title: "À propos",
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerShadowVisible: false,
                        headerLeft: () => null,
                    }}
                />
                <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                    options={{
                        title: "Notifications",
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerShadowVisible: false,
                        headerLeft: () => null,
                    }}
                />
                <Stack.Screen
                    name="Privacy"
                    component={PrivacyScreen}
                    options={{
                        title: "Confidentialité",
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerShadowVisible: false,
                        headerLeft: () => null,
                    }}
                />
                <Stack.Screen
                    name="Preferences"
                    component={PreferencesScreen}
                    options={{
                        title: "Préférences",
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerShadowVisible: false,
                        headerLeft: () => null,
                    }}
                />
                <Stack.Screen
                    name="Help"
                    component={HelpScreen}
                    options={{
                        title: "Aide",
                        headerShown: true,
                        headerTitleAlign: "center",
                        headerShadowVisible: false,
                        headerLeft: () => null,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
