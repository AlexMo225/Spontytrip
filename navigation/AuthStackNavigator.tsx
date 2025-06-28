import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

// Types
import { RootStackParamList } from "../types";

// Import auth screens
import {
    ForgotPasswordScreen,
    LoginScreen,
    OnboardingScreen,
    RegisterScreen,
} from "../screens";

// Constants
import { Colors } from "../constants/Colors";

const Stack = createStackNavigator<RootStackParamList>();

// Auth Stack Navigator - Seulement les écrans d'authentification
export default function AuthStackNavigator() {
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
                        headerShown: false,
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
            </Stack.Navigator>
        </NavigationContainer>
    );
}
