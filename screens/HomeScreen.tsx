import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    HomeActionButtons,
    HomeHeader,
    HomeTripsList,
} from "../components/home";
import { useHome } from "../hooks/useHome";
import { useHomeStyles  } from "../styles/screens";
import { FirestoreTrip } from "../services/firebaseService";
import { RootStackParamList } from "../types";

type HomeScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "MainApp"
>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const {
        // Données utilisateur et voyages
        user,
        trips,
        loading,
        error,
        refreshTrips,

        // État local
        refreshing,
        currentQuote,

        // Animations
        fadeAnim,
        slideAnim,
        scaleAnim,
        actionButtonsAnim,

        // Handlers
        onRefresh,
        animateButtonPress,

        // Utilitaires
        formatDateRange,
        getTripStatus,
        getTypeEmoji,

        // Citations
        inspirationalQuotes,
    } = useHome();

    const styles = useHomeStyles();

    // Navigation handlers
    const handleCreateTrip = () => {
        navigation.navigate("CreateTrip");
    };

    const handleJoinTrip = () => {
        navigation.navigate("JoinTrip");
    };

    const handleTripPress = (trip: FirestoreTrip) => {
        navigation.navigate("TripDetails", { tripId: trip.id });
    };

    const handleSeeAllTrips = () => {
        navigation.navigate("MainApp", { screen: "MyTrips" });
    };

    return (
        <SafeAreaView style={styles.modernContainer} edges={["left", "right"]}>
            <ScrollView
                style={styles.modernScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#7ED957"]}
                        tintColor="#7ED957"
                        progressBackgroundColor="#FFFFFF"
                    />
                }
            >
                {/* 🏠 Header moderne */}
                <HomeHeader
                    user={user}
                    currentQuote={currentQuote}
                    inspirationalQuotes={inspirationalQuotes}
                    fadeAnim={fadeAnim}
                    slideAnim={slideAnim}
                />

                {/* 🎯 Boutons d'action modernes */}
                <HomeActionButtons
                    actionButtonsAnim={actionButtonsAnim}
                    animateButtonPress={animateButtonPress}
                    onCreateTrip={handleCreateTrip}
                    onJoinTrip={handleJoinTrip}
                />

                {/* 🗂️ Section des voyages */}
                <HomeTripsList
                    trips={trips}
                    loading={loading}
                    error={error}
                    refreshTrips={refreshTrips}
                    formatDateRange={formatDateRange}
                    getTripStatus={getTripStatus}
                    getTypeEmoji={getTypeEmoji}
                    currentUserId={user?.uid}
                    fadeAnim={fadeAnim}
                    scaleAnim={scaleAnim}
                    onTripPress={handleTripPress}
                    onCreateTrip={handleCreateTrip}
                    onJoinTrip={handleJoinTrip}
                    onSeeAllTrips={handleSeeAllTrips}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;
